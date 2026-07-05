/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
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
import {
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Menu,
  MenuItem,
  Collapse,
  Checkbox,
} from "@mui/material";
import FormatSizeIcon from "@mui/icons-material/FormatSize";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ResizeImage from "tiptap-extension-resize-image";
import { FaHeading } from "react-icons/fa6";
import AdSnippet from "./AdSnippet";
import Embed from "./Embed";
import HtmlBlock from "./HtmlBlock";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";

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
import EditIcon from "@mui/icons-material/Edit";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
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

const isUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const CustomLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      target: {
        default: null,
        parseHTML: (element) => element.getAttribute("target"),
        renderHTML: (attributes) => {
          if (!attributes.target) {
            return {};
          }
          return {
            target: attributes.target,
          };
        }
      },
      rel: {
        default: null,
        parseHTML: (element) => element.getAttribute("rel"),
        renderHTML: (attributes) => {
          if (!attributes.rel) {
            return {};
          }
          return {
            rel: attributes.rel,
          };
        }
      },
      showAd: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-show-ad") === "true",
        renderHTML: (attributes) => {
          if (!attributes.showAd) {
            return {};
          }
          return {
            "data-show-ad": "true",
            class: "ad-enabled-link"
          };
        }
      }
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

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkInputUrl, setLinkInputUrl] = useState("");
  const [linkInputText, setLinkInputText] = useState("");
  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(false);
  const [linkNofollow, setLinkNofollow] = useState(false);
  const [linkSponsored, setLinkSponsored] = useState(false);
  const [linkShowAd, setLinkShowAd] = useState(false);
  const [linkIsPaste, setLinkIsPaste] = useState(false);
  const [linkAdvancedOpen, setLinkAdvancedOpen] = useState(false);

  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [codeDialogPos, setCodeDialogPos] = useState(null);
  const [inputHtml, setInputHtml] = useState("");
  const [inputCss, setInputCss] = useState("");
  const [inputJs, setInputJs] = useState("");
  const [codeActiveTab, setCodeActiveTab] = useState("html");

  const [fontSizeInput, setFontSizeInput] = useState("14");
  const [fontSizeAnchorEl, setFontSizeAnchorEl] = useState(null);

  useEffect(() => {
    const handleEditHtmlBlock = (e) => {
      const { pos, html, css, js } = e.detail;
      setCodeDialogPos(pos);
      setInputHtml(html || "");
      setInputCss(css || "");
      setInputJs(js || "");
      setCodeActiveTab("html");
      setCodeDialogOpen(true);
    };

    window.addEventListener("edit-html-block", handleEditHtmlBlock);
    return () => {
      window.removeEventListener("edit-html-block", handleEditHtmlBlock);
    };
  }, []);

  const handleSaveCode = () => {
    if (codeDialogPos !== null && codeDialogPos !== undefined) {
      editor.view.dispatch(
        editor.state.tr.setNodeMarkup(codeDialogPos, null, {
          html: inputHtml,
          css: inputCss,
          js: inputJs
        })
      );
    } else {
      editor?.chain().focus().insertHtmlBlock({
        html: inputHtml,
        css: inputCss,
        js: inputJs
      }).run();
    }
    setCodeDialogOpen(false);
    setCodeDialogPos(null);
    setInputHtml("");
    setInputCss("");
    setInputJs("");
  };

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
      Highlight.configure({
        multicolor: true,
      }),
      FontFamily,
      FontSize,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6]
      }),
      CustomLink.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: true
      }),
      AdSnippet,
      Embed,
      HtmlBlock,
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

        // Detect plain URL for embed providers or normal links (to ask about ads)
        const text = event.clipboardData?.getData("text/plain")?.trim();
        if (text && isUrl(text)) {
          if (isEmbeddableUrl(text)) {
            event.preventDefault();
            const embedAttrs = toEmbedAttrs(text);
            if (embedAttrs) {
              editor?.chain().focus().insertContent({ type: "embed", attrs: embedAttrs }).run();
              return true;
            }
          } else {
            // It's a regular URL, prompt for ad configuration
            event.preventDefault();
            setLinkInputUrl(text);
            setLinkShowAd(false);
            setLinkIsPaste(true);
            setLinkDialogOpen(true);
            return true;
          }
        }

        return false; // let Tiptap handle normal paste
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      console.log("DEBUG [TiptapEditor onUpdate] json content:", json);
      onChange(json);
    }
  });

  // Sync input field text with editor's current font-size selection
  useEffect(() => {
    if (!editor) return;
    const updateInput = () => {
      const size = editor.getAttributes("textStyle").fontSize || "14";
      setFontSizeInput(String(size));
    };
    editor.on("selectionUpdate", updateInput);
    editor.on("transaction", updateInput);
    updateInput();
    return () => {
      editor.off("selectionUpdate", updateInput);
      editor.off("transaction", updateInput);
    };
  }, [editor]);

  const getCurrentFontSize = () => {
    const size = editor?.getAttributes("textStyle").fontSize;
    if (!size) return 14;
    const parsed = parseInt(size, 10);
    return isNaN(parsed) ? 14 : parsed;
  };

  const applyFontSize = (val) => {
    if (!editor) return;
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      editor.chain().focus().setFontSize(String(parsed)).run();
      setFontSizeInput(String(parsed));
    } else {
      const size = editor.getAttributes("textStyle").fontSize || "14";
      setFontSizeInput(String(size));
    }
  };

  const handleDecrement = () => {
    const current = getCurrentFontSize();
    const next = Math.max(1, current - 1);
    applyFontSize(String(next));
  };

  const handleIncrement = () => {
    const current = getCurrentFontSize();
    const next = current + 1;
    applyFontSize(String(next));
  };

  const handleInputChange = (e) => {
    setFontSizeInput(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      applyFontSize(fontSizeInput);
      editor?.chain().focus().run();
    }
  };

  const handleInputBlur = () => {
    applyFontSize(fontSizeInput);
  };

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
              if (!editor) return;
              let text = "";
              if (editor.isActive("link")) {
                editor.chain().focus().extendMarkRange("link").run();
              }
              const { from, to } = editor.state.selection;
              text = editor.state.doc.textBetween(from, to, " ");
              
              const attrs = editor.getAttributes("link");
              setLinkInputUrl(attrs.href || "");
              setLinkInputText(text || "");
              setLinkOpenInNewTab(attrs.target === "_blank");
              const rel = attrs.rel || "";
              setLinkNofollow(rel.includes("nofollow"));
              setLinkSponsored(rel.includes("sponsored"));
              setLinkShowAd(attrs.showAd || false);
              setLinkIsPaste(false);
              setLinkAdvancedOpen(false);
              setLinkDialogOpen(true);
            }}
            disabled={!editor}
          >
            <LinkIcon />
          </IconButton>
        </Tooltip>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #e6c8c8",
            borderRadius: "4px",
            background: "#fffaf5",
            padding: "2px 4px",
            gap: 0.25,
            marginRight: 8,
            height: 36,
          }}
        >
          {/* Decrement Button */}
          <Tooltip title="Decrease Font Size">
            <span>
              <IconButton
                size="small"
                onClick={handleDecrement}
                disabled={!editor}
                sx={{ color: "#800000", padding: "4px" }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          {/* Size Input Box */}
          <Tooltip title="Font Size">
            <input
              type="text"
              value={fontSizeInput}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onBlur={handleInputBlur}
              disabled={!editor}
              style={{
                width: "32px",
                height: "26px",
                border: "1px solid #e6c8c8",
                borderRadius: "4px",
                textAlign: "center",
                fontSize: "14px",
                color: "#800000",
                background: "#ffffff",
                outline: "none",
                fontWeight: "bold",
              }}
            />
          </Tooltip>

          {/* Dropdown Button */}
          <Tooltip title="Select Font Size">
            <span>
              <IconButton
                size="small"
                onClick={(e) => setFontSizeAnchorEl(e.currentTarget)}
                disabled={!editor}
                sx={{ color: "#800000", padding: "4px" }}
              >
                <ArrowDropDownIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          {/* Increment Button */}
          <Tooltip title="Increase Font Size">
            <span>
              <IconButton
                size="small"
                onClick={handleIncrement}
                disabled={!editor}
                sx={{ color: "#800000", padding: "4px" }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
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
        <Tooltip title="Insert Custom HTML Block">
          <IconButton
            onClick={() => {
              setCodeDialogPos(null);
              setInputHtml("");
              setInputCss("");
              setInputJs("");
              setCodeActiveTab("html");
              setCodeDialogOpen(true);
            }}
            color={editor?.isActive('htmlBlock') ? 'primary' : 'default'}
            disabled={!editor}
          >
            <IntegrationInstructionsIcon />
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
            onChange={(color) => {
              setCurrentColor(color.hex);
              editor?.chain().focus().setColor(color.hex).run();
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
            onChange={(color) => {
              setCurrentHighlightColor(color.hex);
              editor?.chain().focus().setHighlight({ color: color.hex }).run();
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
            },
            "& img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: "8px",
              border: "1px solid #e6c8c8",
              transition: "all 0.2s ease-in-out",
              display: "block",
              margin: "16px auto",
              "&.ProseMirror-selectednode": {
                outline: "3px solid #800000",
                outlineOffset: "3px",
                boxShadow: "0 0 16px rgba(128, 0, 0, 0.35)",
              }
            }
          }
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{
            duration: 150,
            placement: "top",
          }}
          shouldShow={({ editor }) => editor.isActive("image")}
        >
          <Box
            sx={{
              background: "#fffaf5",
              border: "1px solid #800000",
              borderRadius: "8px",
              boxShadow: "0px 4px 16px rgba(128, 0, 0, 0.15)",
              p: 0.75,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: "bold",
                color: "#800000",
                px: 1,
                borderRight: "1px solid #e6c8c8",
                fontSize: "11px",
              }}
            >
              IMAGE OPTIONS
            </Typography>
            
            {/* Delete action button */}
            <Tooltip title="Delete Image">
              <IconButton
                size="small"
                onClick={() => editor.commands.deleteSelection()}
                sx={{
                  color: "#d32f2f",
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: "#fde8e8",
                  },
                }}
              >
                <IoCloseCircle size={20} />
              </IconButton>
            </Tooltip>
          </Box>
        </BubbleMenu>
      )}

      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{
            duration: 150,
            placement: "bottom-start",
          }}
          shouldShow={({ editor }) => editor.isActive("link") && !editor.isActive("image")}
        >
          <Box
            sx={{
              background: "#fffaf5",
              border: "1px solid #800000",
              borderRadius: "8px",
              boxShadow: "0px 4px 16px rgba(128, 0, 0, 0.15)",
              p: 0.75,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: "bold",
                color: "#800000",
                px: 1,
                borderRight: "1px solid #e6c8c8",
                fontSize: "11px",
                maxWidth: "180px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {editor.getAttributes("link").href || "Link"}
            </Typography>

            <Tooltip title="Edit Link">
              <IconButton
                size="small"
                onClick={() => {
                  const attrs = editor.getAttributes("link");
                  editor.chain().focus().extendMarkRange("link").run();
                  const { from, to } = editor.state.selection;
                  const text = editor.state.doc.textBetween(from, to, " ");
                  
                  setLinkInputUrl(attrs.href || "");
                  setLinkInputText(text || "");
                  setLinkOpenInNewTab(attrs.target === "_blank");
                  const rel = attrs.rel || "";
                  setLinkNofollow(rel.includes("nofollow"));
                  setLinkSponsored(rel.includes("sponsored"));
                  setLinkShowAd(attrs.showAd || false);
                  setLinkIsPaste(false);
                  setLinkAdvancedOpen(false);
                  setLinkDialogOpen(true);
                }}
                sx={{
                  color: "#800000",
                  "&:hover": {
                    backgroundColor: "rgba(128, 0, 0, 0.08)",
                  },
                }}
              >
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Unlink">
              <IconButton
                size="small"
                onClick={() => {
                  editor.chain().focus().unsetLink().run();
                }}
                sx={{
                  color: "#d32f2f",
                  "&:hover": {
                    backgroundColor: "#fde8e8",
                  },
                }}
              >
                <LinkOffIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </BubbleMenu>
      )}

      <input
        type="file"
        accept="image/*"
        ref={inputImageRef}
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />

      {/* Link Dialog */}
      <Dialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#fffaf5",
            borderRadius: "10px",
            border: "1px solid #800000",
          },
        }}
      >
        <DialogTitle sx={{ color: "#800000", fontWeight: "bold", pb: 1 }}>
          {linkIsPaste ? "Pasted Link Options" : "Insert / Edit Link"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          
          {/* TEXT Field */}
          <Box>
            <Typography variant="caption" display="block" sx={{ color: "#800000", fontWeight: "bold", mb: 0.5, letterSpacing: "0.5px" }}>
              TEXT
            </Typography>
            <TextField
              margin="none"
              placeholder="e.g. Click Here"
              fullWidth
              variant="outlined"
              value={linkInputText}
              onChange={(e) => setLinkInputText(e.target.value)}
              disabled={linkIsPaste}
              sx={{
                backgroundColor: "#fff",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#e6c8c8" },
                  "&:hover fieldset": { borderColor: "#800000" },
                  "&.Mui-focused fieldset": { borderColor: "#800000" },
                },
              }}
            />
          </Box>

          {/* LINK Field */}
          <Box>
            <Typography variant="caption" display="block" sx={{ color: "#800000", fontWeight: "bold", mb: 0.5, letterSpacing: "0.5px" }}>
              LINK
            </Typography>
            <TextField
              autoFocus
              margin="none"
              placeholder="https://example.com"
              type="url"
              fullWidth
              variant="outlined"
              value={linkInputUrl}
              onChange={(e) => setLinkInputUrl(e.target.value)}
              disabled={linkIsPaste}
              sx={{
                backgroundColor: "#fff",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#e6c8c8" },
                  "&:hover fieldset": { borderColor: "#800000" },
                  "&.Mui-focused fieldset": { borderColor: "#800000" },
                },
              }}
            />
          </Box>

          {/* Collapsible Advanced Settings */}
          <Box>
            <Box
              onClick={() => setLinkAdvancedOpen(!linkAdvancedOpen)}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                userSelect: "none",
                color: "#800000",
                py: 0.5,
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            >
              {linkAdvancedOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              <Typography variant="body2" sx={{ fontWeight: "bold", ml: 0.5 }}>
                Advanced
              </Typography>
            </Box>
            <Collapse in={linkAdvancedOpen} timeout="auto" unmountOnExit>
              <Box sx={{ display: "flex", flexDirection: "column", mt: 1, pl: 1, gap: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={linkOpenInNewTab}
                      onChange={(e) => setLinkOpenInNewTab(e.target.checked)}
                      sx={{
                        color: "#800000",
                        "&.Mui-checked": { color: "#800000" },
                      }}
                    />
                  }
                  label="Open in new tab"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={linkNofollow}
                      onChange={(e) => setLinkNofollow(e.target.checked)}
                      sx={{
                        color: "#800000",
                        "&.Mui-checked": { color: "#800000" },
                      }}
                    />
                  }
                  label="Set to nofollow"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={linkSponsored}
                      onChange={(e) => setLinkSponsored(e.target.checked)}
                      sx={{
                        color: "#800000",
                        "&.Mui-checked": { color: "#800000" },
                      }}
                    />
                  }
                  label="Set to sponsored"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={linkShowAd}
                      onChange={(e) => setLinkShowAd(e.target.checked)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#800000",
                          "&:hover": {
                            backgroundColor: "rgba(128, 0, 0, 0.08)",
                          },
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#800000",
                        },
                      }}
                    />
                  }
                  label="Show Ad when this link is clicked"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Collapse>
          </Box>

        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setLinkDialogOpen(false)}
            variant="outlined"
            sx={{
              color: "#800000",
              borderColor: "#800000",
              textTransform: "none",
              "&:hover": {
                borderColor: "#600000",
                backgroundColor: "rgba(128, 0, 0, 0.04)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              const trimmedUrl = linkInputUrl.trim();
              const trimmedText = linkInputText.trim();
              if (trimmedUrl) {
                if (isEmbeddableUrl(trimmedUrl)) {
                  const attrs = toEmbedAttrs(trimmedUrl);
                  if (attrs) {
                    editor?.chain().focus().insertContent({ type: "embed", attrs }).run();
                  }
                } else {
                  // Compute target and rel
                  let rels = [];
                  if (linkOpenInNewTab) {
                    rels.push("noopener", "noreferrer");
                  }
                  if (linkNofollow) {
                    rels.push("nofollow");
                  }
                  if (linkSponsored) {
                    rels.push("sponsored");
                  }
                  const relValue = rels.length > 0 ? rels.join(" ") : null;
                  const targetValue = linkOpenInNewTab ? "_blank" : null;
                  const finalLinkText = trimmedText || trimmedUrl;

                  if (linkIsPaste) {
                    editor?.chain().focus().insertContent({
                      type: "text",
                      text: finalLinkText,
                      marks: [
                        {
                          type: "link",
                          attrs: {
                            href: trimmedUrl,
                            target: targetValue,
                            rel: relValue,
                            showAd: linkShowAd
                          }
                        }
                      ]
                    }).run();
                  } else {
                    if (editor.isActive("link")) {
                      // We want to edit the existing link.
                      // First select the link range
                      editor.chain().focus().extendMarkRange("link").run();
                      const { from, to } = editor.state.selection;
                      // Replace the content inside that range with finalLinkText and apply link mark
                      editor.chain().focus().insertContentAt({ from, to }, {
                        type: "text",
                        text: finalLinkText,
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: trimmedUrl,
                              target: targetValue,
                              rel: relValue,
                              showAd: linkShowAd
                            }
                          }
                        ]
                      }).run();
                    } else {
                      // Insert new link at selection
                      editor.chain().focus().insertContent({
                        type: "text",
                        text: finalLinkText,
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: trimmedUrl,
                              target: targetValue,
                              rel: relValue,
                              showAd: linkShowAd
                            }
                          }
                        ]
                      }).run();
                    }
                  }
                }
              } else {
                // If URL is empty, remove link
                editor?.chain().focus().extendMarkRange("link").unsetLink().run();
              }
              setLinkDialogOpen(false);
            }}
            variant="contained"
            sx={{
              backgroundColor: "#800000",
              color: "#fff",
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#600000",
              },
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Code Editor Dialog */}
      <Dialog
        open={codeDialogOpen}
        onClose={() => setCodeDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#fffaf5",
            borderRadius: "12px",
            border: "1px solid #800000",
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, backgroundColor: "#800000", color: "#fff", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{codeDialogPos !== null ? "Edit Custom HTML Block" : "Insert Custom HTML Block"}</span>
          <IconButton onClick={() => setCodeDialogOpen(false)} sx={{ color: "#fff" }}>
            <IoCloseCircle size={24} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Tab bar */}
          <Box display="flex" borderBottom="1px solid #e6c8c8" mb={2}>
            {["html", "css", "js"].map((tab) => (
              <Button
                key={tab}
                onClick={() => setCodeActiveTab(tab)}
                sx={{
                  color: codeActiveTab === tab ? "#800000" : "#888",
                  borderBottom: codeActiveTab === tab ? "2px solid #800000" : "none",
                  fontWeight: codeActiveTab === tab ? "bold" : "normal",
                  borderRadius: 0,
                  px: 3,
                  py: 1,
                  textTransform: "uppercase",
                  fontSize: "13px",
                  "&:hover": {
                    background: "rgba(128,0,0,0.05)"
                  }
                }}
              >
                {tab === "js" ? "JavaScript" : tab}
              </Button>
            ))}
          </Box>

          {/* Code textareas */}
          {codeActiveTab === "html" && (
            <Box>
              <Typography variant="caption" display="block" color="#800000" fontWeight="bold" mb={0.5}>
                HTML Content
              </Typography>
              <TextField
                multiline
                rows={12}
                fullWidth
                variant="outlined"
                placeholder="<!-- Paste your HTML here -->"
                value={inputHtml}
                onChange={(e) => setInputHtml(e.target.value)}
                inputProps={{
                  style: { fontFamily: "monospace", fontSize: "14px" }
                }}
                sx={{
                  backgroundColor: "#fff",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#e6c8c8" },
                    "&:hover fieldset": { borderColor: "#800000" },
                    "&.Mui-focused fieldset": { borderColor: "#800000" }
                  }
                }}
              />
            </Box>
          )}

          {codeActiveTab === "css" && (
            <Box>
              <Typography variant="caption" display="block" color="#800000" fontWeight="bold" mb={0.5}>
                CSS Styles (applied only inside this block)
              </Typography>
              <TextField
                multiline
                rows={12}
                fullWidth
                variant="outlined"
                placeholder="/* Style rules */&#10;.my-class { color: red; }"
                value={inputCss}
                onChange={(e) => setInputCss(e.target.value)}
                inputProps={{
                  style: { fontFamily: "monospace", fontSize: "14px" }
                }}
                sx={{
                  backgroundColor: "#fff",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#e6c8c8" },
                    "&:hover fieldset": { borderColor: "#800000" },
                    "&.Mui-focused fieldset": { borderColor: "#800000" }
                  }
                }}
              />
            </Box>
          )}

          {codeActiveTab === "js" && (
            <Box>
              <Typography variant="caption" display="block" color="#800000" fontWeight="bold" mb={0.5}>
                JavaScript Code (sandboxed)
              </Typography>
              <TextField
                multiline
                rows={12}
                fullWidth
                variant="outlined"
                placeholder="// JavaScript logic&#10;console.log('Hello from custom HTML block');"
                value={inputJs}
                onChange={(e) => setInputJs(e.target.value)}
                inputProps={{
                  style: { fontFamily: "monospace", fontSize: "14px" }
                }}
                sx={{
                  backgroundColor: "#fff",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#e6c8c8" },
                    "&:hover fieldset": { borderColor: "#800000" },
                    "&.Mui-focused fieldset": { borderColor: "#800000" }
                  }
                }}
              />
            </Box>
          )}

          {/* Quick Preview panel in dialog */}
          <Box border="1px solid #e6c8c8" borderRadius="6px" p={1.5} bgcolor="#ffffff" mt={1}>
            <Typography variant="caption" display="block" color="#666" mb={1} sx={{ fontStyle: 'italic' }}>
              ⚡ Live Preview inside Sandbox
            </Typography>
            <iframe
              title="Dialog sandbox preview"
              srcDoc={`
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { margin: 0; padding: 6px; font-family: sans-serif; font-size: 13px; color: #333; }
                    ${inputCss}
                  </style>
                </head>
                <body>
                  ${inputHtml || '<div style="color: #999; font-style: italic;">No HTML content yet.</div>'}
                  <script>
                    try {
                      ${inputJs}
                    } catch (err) {
                      console.error(err);
                    }
                  </script>
                </body>
                </html>
              `}
              style={{ width: "100%", height: "120px", border: "none", background: "#fdfdfd" }}
              sandbox="allow-scripts"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, backgroundColor: "#fffaf5", gap: 1.5 }}>
          <Button
            onClick={() => setCodeDialogOpen(false)}
            variant="outlined"
            sx={{
              color: "#800000",
              borderColor: "#800000",
              textTransform: "none",
              "&:hover": { borderColor: "#600000", background: "rgba(128,0,0,0.05)" }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCode}
            variant="contained"
            sx={{
              backgroundColor: "#800000",
              color: "#fff",
              textTransform: "none",
              "&:hover": { backgroundColor: "#600000" }
            }}
          >
            Save Code
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={fontSizeAnchorEl}
        open={Boolean(fontSizeAnchorEl)}
        onClose={() => setFontSizeAnchorEl(null)}
        PaperProps={{
          style: {
            maxHeight: 300,
            width: "80px",
          },
        }}
      >
        {["8", "9", "10", "11", "12", "14", "16", "18", "24", "30", "36", "48", "60", "72", "96"].map((size) => (
          <MenuItem
            key={size}
            selected={fontSizeInput === size}
            onClick={() => {
              applyFontSize(size);
              setFontSizeAnchorEl(null);
            }}
            style={{ justifyContent: "center" }}
          >
            {size}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
