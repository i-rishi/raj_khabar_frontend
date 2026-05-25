/* eslint-disable no-unused-vars */
import { Node, mergeAttributes } from "@tiptap/core";

const HtmlBlock = Node.create({
  name: "htmlBlock",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      html: {
        default: "",
      },
      css: {
        default: "",
      },
      js: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-html-block]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-html-block": "true" }),
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("div");
      dom.setAttribute("data-html-block", "true");
      dom.style.border = "1px dashed #800000";
      dom.style.borderRadius = "8px";
      dom.style.padding = "14px";
      dom.style.background = "#fffbf5";
      dom.style.margin = "12px 0";
      dom.style.position = "relative";
      dom.style.fontFamily = "sans-serif";

      // Header panel
      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.justifyContent = "space-between";
      header.style.alignItems = "center";
      header.style.borderBottom = "1px solid #e6c8c8";
      header.style.paddingBottom = "8px";
      header.style.marginBottom = "10px";
      header.style.fontSize = "13px";
      header.style.fontWeight = "bold";
      header.style.color = "#800000";

      const titleSpan = document.createElement("span");
      titleSpan.innerText = "🔌 Custom HTML / CSS / JS Block";
      header.appendChild(titleSpan);

      const buttonsContainer = document.createElement("div");
      buttonsContainer.style.display = "flex";
      buttonsContainer.style.gap = "8px";

      const editBtn = document.createElement("button");
      editBtn.innerText = "Edit Code";
      editBtn.style.padding = "4px 10px";
      editBtn.style.border = "1px solid #800000";
      editBtn.style.background = "#fff";
      editBtn.style.color = "#800000";
      editBtn.style.borderRadius = "4px";
      editBtn.style.cursor = "pointer";
      editBtn.style.fontSize = "11px";
      editBtn.style.fontWeight = "600";
      editBtn.style.transition = "all 0.2s ease";
      
      editBtn.addEventListener("mouseover", () => {
        editBtn.style.background = "#ffe0e0";
      });
      editBtn.addEventListener("mouseout", () => {
        editBtn.style.background = "#fff";
      });

      editBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Dispatch custom event to notify React component
        const event = new CustomEvent("edit-html-block", {
          detail: {
            pos: getPos(),
            html: node.attrs.html,
            css: node.attrs.css,
            js: node.attrs.js,
          },
        });
        window.dispatchEvent(event);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Delete";
      deleteBtn.style.padding = "4px 10px";
      deleteBtn.style.border = "1px solid #d32f2f";
      deleteBtn.style.background = "#fff";
      deleteBtn.style.color = "#d32f2f";
      deleteBtn.style.borderRadius = "4px";
      deleteBtn.style.cursor = "pointer";
      deleteBtn.style.fontSize = "11px";
      deleteBtn.style.fontWeight = "600";
      deleteBtn.style.transition = "all 0.2s ease";

      deleteBtn.addEventListener("mouseover", () => {
        deleteBtn.style.background = "#fde8e8";
      });
      deleteBtn.addEventListener("mouseout", () => {
        deleteBtn.style.background = "#fff";
      });

      deleteBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof getPos === "function") {
          editor.commands.deleteRange({ from: getPos(), to: getPos() + 1 });
        }
      });

      buttonsContainer.appendChild(editBtn);
      buttonsContainer.appendChild(deleteBtn);
      header.appendChild(buttonsContainer);
      dom.appendChild(header);

      // Code preview container (safe iframe)
      const previewWrapper = document.createElement("div");
      previewWrapper.style.background = "#ffffff";
      previewWrapper.style.border = "1px solid #e6c8c8";
      previewWrapper.style.borderRadius = "6px";
      previewWrapper.style.overflow = "hidden";
      previewWrapper.style.display = "flex";
      previewWrapper.style.flexDirection = "column";

      const iframe = document.createElement("iframe");
      iframe.style.width = "100%";
      iframe.style.height = "160px";
      iframe.style.border = "none";
      iframe.setAttribute("sandbox", "allow-scripts");

      const updateIframeContent = (html, css, js) => {
        const docContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                margin: 0;
                padding: 10px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: 14px;
                color: #333;
                background-color: #fafafa;
              }
              ${css || ""}
            </style>
          </head>
          <body>
            ${html || '<div style="color: #999; font-style: italic; text-align: center; margin-top: 50px;">🔌 Custom HTML Block (Empty code)</div>'}
            <script>
              try {
                ${js || ""}
              } catch (err) {
                console.error("Error in custom code execution:", err);
                document.body.innerHTML += '<div style="color: red; font-size: 12px; margin-top: 10px;">Execution Error: ' + err.message + '</div>';
              }
            </script>
          </body>
          </html>
        `;
        iframe.srcdoc = docContent;
      };

      updateIframeContent(node.attrs.html, node.attrs.css, node.attrs.js);
      previewWrapper.appendChild(iframe);
      dom.appendChild(previewWrapper);

      return {
        dom,
        contentDOM: null,
        ignoreMutation: () => true,
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) return false;
          
          if (
            updatedNode.attrs.html !== node.attrs.html ||
            updatedNode.attrs.css !== node.attrs.css ||
            updatedNode.attrs.js !== node.attrs.js
          ) {
            updateIframeContent(
              updatedNode.attrs.html,
              updatedNode.attrs.css,
              updatedNode.attrs.js
            );
          }
          return true;
        },
      };
    };
  },

  addCommands() {
    return {
      insertHtmlBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

export default HtmlBlock;
