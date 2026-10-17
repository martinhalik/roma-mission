"use client";

import { useLayoutEffect } from "react";

const SOFT_HYPHEN = "\u00AD";

/** Chromium copies U+00AD with the selection. Strip it only when it is there. */
export default function StripSoftHyphensOnCopy() {
  useLayoutEffect(() => {
    function selectedText(): string {
      const selection = document.getSelection();
      if (!selection || selection.rangeCount === 0) return "";
      let text = "";
      for (let index = 0; index < selection.rangeCount; index++) {
        // selection.toString() drops U+00AD in Chromium. The range still has it.
        text += selection.getRangeAt(index).cloneContents().textContent ?? "";
      }
      return text;
    }

    function handleCopy(event: ClipboardEvent) {
      const text = selectedText();
      if (!text.includes(SOFT_HYPHEN) || !event.clipboardData) return;
      event.preventDefault();
      event.clipboardData.setData("text/plain", text.replaceAll(SOFT_HYPHEN, ""));
    }

    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, []);
  return null;
}
