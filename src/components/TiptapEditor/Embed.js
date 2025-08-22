/* eslint-disable no-unused-vars */
import { Node, mergeAttributes } from "@tiptap/core";

// A simple block-level atom node that renders an iframe for supported providers.
// We precompute and store the provider-specific embed src in attrs.src to keep the view simple.
const Embed = Node.create({
  name: "embed",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      // For iframe-based providers (YouTube, Facebook)
      src: {
        default: "",
      },
      // Provider hint (youtube | instagram | facebook)
      provider: {
        default: "",
      },
      // Optional title for accessibility
      title: {
        default: "",
      },
      // For Instagram, keep the original post URL (permalink)
      url: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-embed]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-embed": "true" }),
    ];
  },

  addNodeView() {
    function ensureInstagramScript(callback) {
      const id = "instagram-embed-script";
      if (document.getElementById(id)) {
        // If script is already loaded, call process if available
        if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === "function") {
          try { window.instgrm.Embeds.process(); } catch (e) {}
        }
        if (callback) callback();
        return;
      }
      const script = document.createElement("script");
      script.id = id;
      script.async = true;
      script.src = "https://www.instagram.com/embed.js";
      script.onload = () => {
        if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === "function") {
          try { window.instgrm.Embeds.process(); } catch (e) {}
        }
        if (callback) callback();
      };
      document.head.appendChild(script);
    }

    return ({ node }) => {
      const dom = document.createElement("div");
      dom.setAttribute("data-embed", "true");
      dom.style.position = "relative";
      dom.style.width = "100%";
      dom.style.maxWidth = "680px";
      dom.style.margin = "8px auto";
      dom.style.background = "transparent";
      dom.style.border = "1px solid #e0e0e0";
      dom.style.borderRadius = "6px";
      dom.style.overflow = "hidden";

      const provider = node.attrs.provider;

      if (provider === "instagram") {
        // Use Instagram official embed (blockquote + script + process)
        const permalink = node.attrs.url || node.attrs.src || "";

        // Visible placeholder/link while loading or if embed fails
        const placeholder = document.createElement("div");
        placeholder.style.padding = "12px";
        placeholder.style.textAlign = "center";
        placeholder.style.background = "#fff";
        placeholder.style.borderBottom = "1px solid #e0e0e0";
        const phLink = document.createElement("a");
        phLink.href = permalink;
        phLink.textContent = "View on Instagram";
        phLink.style.color = "#385898";
        phLink.style.textDecoration = "none";
        placeholder.appendChild(phLink);
        dom.appendChild(placeholder);

        const block = document.createElement("blockquote");
        block.className = "instagram-media";
        block.style.margin = "0 auto";
        block.style.background = "#fff";
        block.style.width = "100%";
        block.style.minHeight = "320px"; // visible placeholder height until script loads
        block.style.border = "none";
        block.setAttribute("data-instgrm-permalink", permalink);
        block.setAttribute("data-instgrm-version", "14");
        block.setAttribute("data-instgrm-captioned", "");
        dom.appendChild(block);

        // Observe for embed processed content and hide placeholder
        const observer = new MutationObserver(() => {
          // When Instagram replaces blockquote with an iframe or adds content, hide placeholder
          if (block.querySelector("iframe") || dom.querySelector("iframe")) {
            placeholder.style.display = "none";
            observer.disconnect();
          }
        });
        observer.observe(dom, { childList: true, subtree: true });

        // Ensure embed script is present and process the blockquote
        ensureInstagramScript(() => {
          if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === "function") {
            try { window.instgrm.Embeds.process(); } catch (e) {}
          }
        });
      } else {
        // Default: iframe-based embedding
        const iframe = document.createElement("iframe");
        iframe.src = node.attrs.src || "";
        iframe.style.border = "0";
        iframe.style.width = "100%";
        iframe.style.height = provider === "facebook" ? "430px" : "380px";
        iframe.setAttribute("allowfullscreen", "true");
        iframe.setAttribute("title", node.attrs.title || "Embedded content");
        iframe.setAttribute("loading", "lazy");
        iframe.referrerPolicy = "no-referrer-when-downgrade";
        iframe.setAttribute(
          "allow",
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        );
        dom.appendChild(iframe);
      }

      return {
        dom,
        contentDOM: null,
        ignoreMutation: () => true,
      };
    };
  },

  addCommands() {
    return {
      insertEmbed:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

export default Embed;

