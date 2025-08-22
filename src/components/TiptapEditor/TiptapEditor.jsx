/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Heading from "@tiptap/extension-heading";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Link from "@tiptap/extension-link";
import { SketchPicker, ChromePicker } from "react-color";
import { Box, IconButton, Tooltip } from "@mui/material";
import FormatSizeIcon from "@mui/icons-material/FormatSize";
import ResizeImage from "tiptap-extension-resize-image";
import { FaHeading } from "react-icons/fa6";
import AdSnippet from "./AdSnippet";
import Embed from "./Embed";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import BorderAllIcon from "@mui/icons-material/BorderAll";
import ImageIcon from "@mui/icons-material/Image";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import HighlightIcon from "@mui/icons-material/Highlight";
import FontDownloadIcon from "@mui/icons-material/FontDownload";
import LinkIcon from "@mui/icons-material/Link";
import CodeIcon from "@mui/icons-material/Code";
import { IoCloseCircle } from "react-icons/io5";
import { API_BASE_URL } from "../../config";
import { useTheme } from "@mui/material/styles";

import { Extension } from "@tiptap/core";
const FontSize = Extension.create({
  name: "fontSize",
  addOptions: {
    types: ["textStyle"]
  },
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace("px", ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return {
                style: `font-size: ${attributes.fontSize}px`
              };
            }
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run()
    };
  }
});

export default function TiptapEditor({ onChange, initialContent }) {
  const inputImageRef = useRef();

  // Refs for pickers and their buttons
  const colorPickerRef = useRef(null);
  const highlightPickerRef = useRef(null);
  const colorButtonRef = useRef(null);
  const highlightButtonRef = useRef(null);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");

  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [currentHighlightColor, setCurrentHighlightColor] = useState("#ffcc00");

  // Table grid state
  const [showTableGrid, setShowTableGrid] = useState(false);
  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(2);
  const [hoverRows, setHoverRows] = useState(0);
  const [hoverCols, setHoverCols] = useState(0);

  const tableGridRef = useRef(null);
  const tableButtonRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      ResizeImage,
      TextStyle,
      Color,
      Highlight,
      FontFamily,
      FontSize,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6]
      }),
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: true
      }),
      AdSnippet,
      Embed,
    ],
    content: initialContent || "",
    editorProps: {
      handlePaste: (view, event) => {
        // Try image file from clipboard
        const items = event.clipboardData?.items || [];
        const imageItem = Array.from(items).find((it) => it.type?.startsWith("image/"));
        if (imageItem) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (file) {
            // Async upload and insert image without blocking
            uploadImageToS3(file).then((imageUrl) => {
              if (imageUrl) {
                editor?.chain().focus().setImage({ src: imageUrl }).run();
              }
            });
          }
          return true; // handled
        }

        // Detect plain URL for embed providers
        const text = event.clipboardData?.getData("text/plain")?.trim();
        if (text && isEmbeddableUrl(text)) {
          event.preventDefault();
          const embedAttrs = toEmbedAttrs(text);
          if (embedAttrs) {
            editor?.chain().focus().insertContent({ type: "embed", attrs: embedAttrs }).run();
            return true;
          }
        }

        return false; // let Tiptap handle normal paste
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    }
  });

  // Close grid on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (!event) return; // Defensive: event must exist
      if (
        tableGridRef.current &&
        !tableGridRef.current.contains(event.target) &&
        tableButtonRef.current &&
        !tableButtonRef.current.contains(event.target)
      ) {
        setShowTableGrid(false);
      }
    }
    if (showTableGrid) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTableGrid]);


  const uploadImageToS3 = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/api/s3/upload`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      return result.url; // assuming your backend returns { url: "https://..." }
    } catch (error) {
      console.error("Image upload error:", error);
      return null;
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    const imageUrl = await uploadImageToS3(file);
    console.log("Image URL:", imageUrl);
    if (imageUrl) {
      editor?.commands.setImage({ src: imageUrl });
    }
  };


  // Single handler for outside click for both pickers
  useEffect(() => {
    function handleClickOutside(event) {
      if (!event) return; // Defensive: event must exist
      // If click inside color picker or button, do nothing
      if (
        (colorPickerRef.current &&
          colorPickerRef.current.contains(event.target)) ||
        (colorButtonRef.current &&
          colorButtonRef.current.contains(event.target))
      ) {
        return;
      }

      // If click inside highlight picker or button, do nothing
      if (
        (highlightPickerRef.current &&
          highlightPickerRef.current.contains(event.target)) ||
        (highlightButtonRef.current &&
          highlightButtonRef.current.contains(event.target))
      ) {
        return;
      }

      // Else close both
      setShowColorPicker(false);
      setShowHighlightPicker(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper: detect supported providers
  const isEmbeddableUrl = (url) => {
    try {
      const u = new URL(url);
      const h = u.hostname.replace(/^www\./, "");
      return (
        h.includes("youtube.com") ||
        h.includes("youtu.be") ||
        h.includes("instagram.com") ||
        h.includes("facebook.com") ||
        h.includes("fb.watch")
      );
    } catch (e) {
      return false;
    }
  };

  // Map input URL -> attrs for our Embed node
  const toEmbedAttrs = (url) => {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");

      // YouTube
      if (host.includes("youtube.com") || host.includes("youtu.be")) {
        let videoId = "";
        if (host.includes("youtu.be")) {
          videoId = u.pathname.slice(1);
        } else if (u.searchParams.get("v")) {
          videoId = u.searchParams.get("v");
        } else if (u.pathname.includes("/shorts/")) {
          videoId = u.pathname.split("/shorts/")[1];
        }
        if (!videoId) return null;
        const src = `https://www.youtube.com/embed/${videoId}`;
        return { src, provider: "youtube", title: "YouTube video" };
      }

      // Instagram: store the original permalink and let the node view build the embed via script
      if (host.includes("instagram.com")) {
        // Normalize to a clean permalink (origin + pathname with trailing slash)
        const permalink = `${u.origin}${u.pathname.endsWith('/') ? u.pathname : u.pathname + '/'}`;
        return { url: permalink, provider: "instagram", title: "Instagram post" };
      }

      // Facebook: use /plugins/video.php?href=<encoded>
      if (host.includes("facebook.com") || host.includes("fb.watch")) {
        const href = encodeURIComponent(url);
        const src = `https://www.facebook.com/plugins/video.php?href=${href}&show_text=false`; // works for video/reel URLs
        return { src, provider: "facebook", title: "Facebook video" };
      }

      return null;
    } catch (e) {
      return null;
    }
  };

  return (
    <Box
      sx={{
        border: "1px solid #800000",
        borderRadius: 2,
        background: "#fffaf5",
        padding: 2,
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1
      }}
    >
      {/* Sticky toolbar */}
      <Box
        className="tiptap-toolbar"
        mb={0}
        display="flex"
        gap={1}
        flexWrap="wrap"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          background: "#fffaf5",
          borderBottom: "1px solid #e6c8c8",
          paddingBottom: 1,
          marginBottom: 1
        }}
      >
        <Tooltip title="Bold">
          <IconButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            color={editor?.isActive('bold') ? 'primary' : 'default'}
          >
            <FormatBoldIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic">
          <IconButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            color={editor?.isActive('italic') ? 'primary' : 'default'}
          >
            <FormatItalicIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Bullet List">
          <IconButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            color={editor?.isActive('bulletList') ? 'primary' : 'default'}
          >
            <FormatListBulletedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Numbered List">
          <IconButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            color={editor?.isActive('orderedList') ? 'primary' : 'default'}
          >
            <FormatListNumberedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Insert Table">
          <span ref={tableButtonRef}>
            <IconButton onClick={() => setShowTableGrid((prev) => !prev)}>
              <BorderAllIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Insert Image">
          <IconButton onClick={() => inputImageRef.current.click()}>
            <ImageIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Text Color">
          <IconButton
            ref={colorButtonRef}
            onClick={() => {
              setShowColorPicker((prev) => !prev);
              setShowHighlightPicker(false); // close highlight picker when color opens
            }}
            sx={{ color: currentColor }}
          >
            <FormatColorTextIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Highlight">
          <IconButton
            ref={highlightButtonRef}
            onClick={() => {
              setShowHighlightPicker((prev) => !prev);
              setShowColorPicker(false); // close color picker when highlight opens
            }}
            sx={{ color: currentHighlightColor }}
          >
            <HighlightIcon />
          </IconButton>
        </Tooltip>
        {/* Heading Dropdown */}
        <Tooltip title="Heading">
          <span style={{ display: "flex", alignItems: "center" }}>
            <FaHeading sx={{ color: "#800000", marginRight: 1 }} />
            <select
              style={{
                height: 40,
                borderRadius: 4,
                border: "none",
                color: "#800000",
                padding: "8px 8px",
                fontSize: "16px",
                marginRight: 8,
                background: "#fffaf5",
                "& focus": {
                  outline: "none",
                  borderColor: "#800000"
                }
              }}
              value={
                editor?.isActive("heading", { level: 1 })
                  ? "1"
                  : editor?.isActive("heading", { level: 2 })
                  ? "2"
                  : editor?.isActive("heading", { level: 3 })
                  ? "3"
                  : editor?.isActive("heading", { level: 4 })
                  ? "4"
                  : editor?.isActive("heading", { level: 5 })
                  ? "5"
                  : editor?.isActive("heading", { level: 6 })
                  ? "6"
                  : "paragraph"
              }
              onChange={(e) => {
                const level = e.target.value;
                if (level === "paragraph") {
                  editor?.chain().focus().setParagraph().run();
                } else {
                  editor
                    ?.chain()
                    .focus()
                    .toggleHeading({ level: Number(level) })
                    .run();
                }
              }}
            >
              <option value="paragraph">Normal</option>
              <option value="1">H1</option>
              <option value="2">H2</option>
              <option value="3">H3</option>
              <option value="4">H4</option>
              <option value="5">H5</option>
              <option value="6">H6</option>
            </select>
          </span>
        </Tooltip>
        <Tooltip title="Font Family">
          <span style={{ display: "flex", alignItems: "center" }}>
            <FontDownloadIcon sx={{ color: "#800000", marginRight: 1 }} />
            <select
              style={{
                height: 36,
                borderRadius: 4,
                border: "none",
                color: "#800000",
                padding: "4px 8px",
                fontSize: "16px",
                background: "#fffaf5",
                marginRight: 8
              }}
              value={editor?.getAttributes("textStyle").fontFamily || ""}
              onChange={(e) => {
                const family = e.target.value;
                if (family === "") {
                  editor?.chain().focus().unsetFontFamily().run();
                } else {
                  editor?.chain().focus().setFontFamily(family).run();
                }
              }}
            >
              <option value="sans-sarif">Arimo</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Times New Roman, Times, serif">
                Times New Roman
              </option>
              <option value="Courier New, Courier, monospace">
                Courier New
              </option>
              <option value="Verdana, Geneva, sans-serif">Verdana</option>
              <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
              <option value="Trebuchet MS, Helvetica, sans-serif">
                Trebuchet MS
              </option>
              <option value="Impact, Charcoal, sans-serif">Impact</option>
              <option value="Comic Sans MS, cursive, sans-serif">
                Comic Sans MS
              </option>
            </select>
          </span>
        </Tooltip>
        <Tooltip title="Insert Link">
          <IconButton
            onClick={() => {
              const url = prompt("Enter URL");
              if (url) {
                // Try to embed known providers first
                const trimmed = url.trim();
                if (isEmbeddableUrl(trimmed)) {
                  const attrs = toEmbedAttrs(trimmed);
                  if (attrs) {
                    editor?.chain().focus().insertContent({ type: "embed", attrs }).run();
                    return;
                  }
                }
                // Fallback to normal link
                editor
                  ?.chain()
                  .focus()
                  .extendMarkRange("link")
                  .setLink({ href: trimmed })
                  .run();
              }
            }}
            disabled={!editor}
          >
            <LinkIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Font Size">
          <span style={{ display: "flex", alignItems: "center" }}>
            <FormatSizeIcon sx={{ color: "#800000", marginRight: 1 }} />
            <select
              style={{
                height: 36,
                borderRadius: 4,
                border: "none",
                color: "#800000",
                padding: "4px 8px",
                fontSize: "16px",
                background: "#fffaf5",
                marginRight: 8
              }}
              value={editor?.getAttributes("textStyle").fontSize || ""}
              onChange={(e) => {
                const size = e.target.value;
                if (size === "") {
                  editor?.chain().focus().unsetFontSize().run();
                } else {
                  editor?.chain().focus().setFontSize(size).run();
                }
              }}
            >
              <option value="">Default</option>
              <option value="8">8</option>
              <option value="10">10</option>
              <option value="12">12</option>
              <option value="14">14</option>
              <option value="16">16</option>
              <option value="18">18</option>
              <option value="24">24</option>
              <option value="36">36</option>
              <option value="48">48</option>
              <option value="72">72</option>
            </select>
          </span>
        </Tooltip>
        <Tooltip title="Insert Code Block">
          <IconButton
            onClick={() => {
              editor?.chain().focus().toggleCodeBlock().run();
            }}
            color={editor?.isActive('codeBlock') ? 'primary' : 'default'}
            disabled={!editor}
          >
            <CodeIcon />
          </IconButton>
        </Tooltip>
        {/* <Tooltip title="Insert Google Ad Snippet">
          <IconButton
            onClick={() => {
              const code = prompt("Paste your Google Ad code here:");
              if (code) {
                editor
                  ?.chain()
                  .focus()
                  .insertContent({
                    type: "adSnippet",
                    attrs: { code }
                  })
                  .run();
              }
            }}
            disabled={!editor}
          >
            <AdUnitsIcon />
          </IconButton>
        </Tooltip> */}
      </Box>

      {showColorPicker && (
        <Box
          position="absolute"
          zIndex={10}
          ref={colorPickerRef}
          sx={{ top: "56px", left: "180px" }}
        >
          <SketchPicker
            color={currentColor}
            onChangeComplete={(color) => {
              setCurrentColor(color.hex);
              editor?.chain().focus().setColor(color.hex).run();
              3;
            }}
          />
        </Box>
      )}

      {showHighlightPicker && (
        <Box
          position="absolute"
          zIndex={10}
          ref={highlightPickerRef}
          sx={{ top: "56px", left: "240px" }}
        >
          <ChromePicker
            color={currentHighlightColor}
            onChangeComplete={(color) => {
              setCurrentHighlightColor(color.hex);
              editor?.chain().focus().setHighlight({ color: color.hex }).run();
              3;
              3;
            }}
          />
        </Box>
      )}

      {/* Table grid dropdown */}
      {showTableGrid && (
        <Box
          ref={tableGridRef}
          sx={{
            position: "absolute",
            zIndex: 20,
            top: 70,
            left: 220,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 2,
            p: 2,
            boxShadow: 3
          }}
        >
          <Box>
            {/* Resize the table rows and columns from here */}
            {[...Array(15)].map((_, rowIdx) => (
              <Box key={rowIdx} display="flex">
                {[...Array(8)].map((_, colIdx) => (
                  <Box
                    key={colIdx}
                    onMouseEnter={() => {
                      setHoverRows(rowIdx + 1);
                      setHoverCols(colIdx + 1);
                    }}
                    onClick={() => {
                      editor?.commands.insertTable({
                        rows: rowIdx + 1,
                        cols: colIdx + 1,
                        withHeaderRow: true
                      });
                      setShowTableGrid(false);
                      setHoverRows(0);
                      setHoverCols(0);
                    }}
                    sx={{
                      width: 24,
                      height: 24,
                      border: "1px solid #800000",
                      background:
                        rowIdx < hoverRows && colIdx < hoverCols
                          ? "#ffe0e0"
                          : "#fff",
                      cursor: "pointer",
                      margin: "1px"
                    }}
                  />
                ))}
              </Box>
            ))}
          </Box>
          <Box mt={1} fontSize={14} color="#800000" textAlign="center">
            {hoverRows > 0 && hoverCols > 0
              ? `${hoverRows} x ${hoverCols} Table`
              : "Select size"}
          </Box>
        </Box>
      )}

      {/* Scrollable content area */}
      <Box
        sx={{
          maxHeight: "60vh",
          overflowY: "auto",
          "& .ProseMirror": {
            padding: "10px",
            minHeight: "400px",
            border: "1px solid #800000",
            borderRadius: "4px",
            backgroundColor: "#fff",
            "&:focus": {
              outline: "none",
              borderColor: "#800000"
            }
          }
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {editor?.isActive("image") && (
        <Box
          sx={{
            position: "absolute",
            top:
              editor.view.dom.querySelector("img.ProseMirror-selectednode")
                ?.offsetTop || 60,
            left:
              (editor.view.dom.querySelector("img.ProseMirror-selectednode")
                ?.offsetLeft || 60) + 40,
            zIndex: 30,
            background: "#fff",
            border: "1px solid #800000",
            borderRadius: "50%",
            p: 0.5,
            cursor: "pointer",
            boxShadow: 2
          }}
          onClick={() => editor.commands.deleteSelection()}
        >
          <IoCloseCircle />
        </Box>
      )}
      <input
        type="file"
        accept="image/*"
        ref={inputImageRef}
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />
    </Box>
  );
}
