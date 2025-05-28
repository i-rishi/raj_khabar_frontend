/* eslint-disable no-unused-vars */
import { Node, mergeAttributes } from "@tiptap/core";

const AdSnippet = Node.create({
  name: "adSnippet",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      code: {
        default: ""
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-adsnippet]"
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-adsnippet": "true",
        style:
          "background: #fffbe7; border: 1px dashed #f4b400; padding: 12px; border-radius: 6px; font-family: monospace; color: #b8860b;"
      }),
      "Google Ad Snippet"
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("div");
      dom.setAttribute("data-adsnippet", "true");
      dom.style.background = "#fffbe7";
      dom.style.border = "1px dashed #f4b400";
      dom.style.padding = "12px";
      dom.style.borderRadius = "6px";
      dom.style.fontFamily = "monospace";
      dom.style.color = "#b8860b";
      dom.style.position = "relative";
      dom.innerText = "Google Ad Snippet";

      // Optional: Show code on hover
      dom.title = node.attrs.code || "";

      return {
        dom,
        contentDOM: null
      };
    };
  }
});

export default AdSnippet;
