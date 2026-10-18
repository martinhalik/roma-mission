"use client";

import { useLayoutEffect } from "react";

const SOFT_HYPHEN = "\u00AD";

/**
 * Chromium copies U+00AD with the selection. Strip it only when the selection
 * contains one, and leave every other copy on the browser's own clipboard.
 * Plain text comes from `selection.toString()`, which already keeps the line
 * breaks and spacing `<br>` produces, including each engine's text-transform
 * case. `cloneContents().textContent` drops those breaks.
 */
export default function StripSoftHyphensOnCopy() {
  useLayoutEffect(() => {
    function selectionHasSoftHyphen(selection: Selection): boolean {
      for (let index = 0; index < selection.rangeCount; index++) {
        const text = selection.getRangeAt(index).cloneContents().textContent ?? "";
        if (text.includes(SOFT_HYPHEN)) return true;
      }
      return false;
    }

    function htmlWithoutSoftHyphens(selection: Selection): string {
      const holder = document.createElement("div");
      for (let index = 0; index < selection.rangeCount; index++) {
        const fragment = selection.getRangeAt(index).cloneContents();
        const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const value = node.textContent ?? "";
          if (!value.includes(SOFT_HYPHEN)) continue;
          node.textContent = value.replaceAll(SOFT_HYPHEN, "");
        }
        holder.append(fragment);
      }
      return holder.innerHTML;
    }

    function handleCopy(event: ClipboardEvent) {
      const selection = document.getSelection();
      if (!selection || selection.rangeCount === 0 || !event.clipboardData) return;
      if (!selectionHasSoftHyphen(selection)) return;
      event.preventDefault();
      event.clipboardData.setData("text/plain", selection.toString().replace(/\u00AD/g, ""));
      event.clipboardData.setData("text/html", htmlWithoutSoftHyphens(selection));
    }

    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, []);
  return null;
}
