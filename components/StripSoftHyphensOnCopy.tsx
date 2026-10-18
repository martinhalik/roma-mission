"use client";

import { useLayoutEffect } from "react";

const SOFT_HYPHEN = "\u00AD";

const BLOCK_TAGS = new Set([
  "ADDRESS",
  "ARTICLE",
  "ASIDE",
  "BLOCKQUOTE",
  "DD",
  "DIV",
  "DL",
  "DT",
  "FIELDSET",
  "FIGCAPTION",
  "FIGURE",
  "FOOTER",
  "FORM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "HR",
  "LI",
  "MAIN",
  "NAV",
  "OL",
  "P",
  "PRE",
  "SECTION",
  "TABLE",
  "TR",
  "UL",
]);

type CopyEngine = "chromium" | "firefox" | "webkit";

interface PlainState {
  parts: string[];
  /** Indent, in spaces, of each line. `indents[0]` is the first line. */
  indents: number[];
  indent: number;
  lastTag: string;
}

/**
 * Chromium's `selection.toString()` applies `text-transform`, but its native
 * copy keeps the source characters. Plain text is therefore read from the
 * live nodes the range covers (the same fragment as `cloneContents`, so a
 * flex item's computed display is still available): text in source case,
 * U+00AD removed, `<br>` as a newline, and a newline at each block boundary.
 * A paragraph keeps the blank line Chromium and WebKit copy after it.
 * Firefox copies flex items inline, leaves the blank line before a paragraph
 * or list, and indents a list that sits inside a larger selection.
 * WebKit's native copy uppercases transformed labels. Hyphenated labels here
 * stay in source case, which matches Chromium and Firefox and is the accepted
 * difference for WebKit. A selection with no soft hyphen is left to the browser.
 */
export default function StripSoftHyphensOnCopy() {
  useLayoutEffect(() => {
    function engine(): CopyEngine {
      const agent = navigator.userAgent;
      if (agent.includes("Firefox/")) return "firefox";
      if (agent.includes("AppleWebKit") && !/Chrome|Chromium|Edg\//.test(agent)) return "webkit";
      return "chromium";
    }

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

    function hiddenFromCopy(element: Element): boolean {
      if (element.tagName === "SCRIPT" || element.tagName === "STYLE") return true;
      const style = getComputedStyle(element);
      return style.display === "none" || style.visibility === "hidden";
    }

    function blockElement(element: Element, which: CopyEngine): boolean {
      if (element.tagName === "BR") return false;
      if (BLOCK_TAGS.has(element.tagName)) return true;
      // Firefox copies flex and grid items inline, so a bullet stays on the
      // same line as the item. Chromium and WebKit break between them.
      if (which === "firefox") return false;
      const display = getComputedStyle(element).display;
      return (
        display === "block" ||
        display === "flex" ||
        display === "grid" ||
        display === "list-item" ||
        display === "table" ||
        display === "table-row"
      );
    }

    function emptyBlock(element: Element): boolean {
      const text = (element.textContent ?? "").replaceAll(SOFT_HYPHEN, "").trim();
      return text.length === 0 && element.querySelector("br") === null;
    }

    function overlaps(range: Range, node: Node): boolean {
      if (node.nodeType === Node.TEXT_NODE) {
        const length = node.nodeValue?.length ?? 0;
        if (length === 0) return false;
        const probe = document.createRange();
        probe.setStart(node, 0);
        probe.setEnd(node, length);
        return (
          range.compareBoundaryPoints(Range.END_TO_START, probe) < 0 &&
          range.compareBoundaryPoints(Range.START_TO_END, probe) > 0
        );
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      const probe = document.createRange();
      probe.selectNode(node);
      return (
        range.compareBoundaryPoints(Range.END_TO_START, probe) < 0 &&
        range.compareBoundaryPoints(Range.START_TO_END, probe) > 0
      );
    }

    function sliceText(range: Range, textNode: Text): string {
      const value = textNode.nodeValue ?? "";
      let start = 0;
      let end = value.length;
      if (textNode === range.startContainer) start = range.startOffset;
      if (textNode === range.endContainer) end = Math.min(end, range.endOffset);
      return value.slice(start, end).replaceAll(SOFT_HYPHEN, "");
    }

    function trailingBreaks(state: PlainState): number {
      let count = 0;
      for (let index = state.parts.length - 1; index >= 0; index--) {
        const piece = state.parts[index];
        for (let cursor = piece.length - 1; cursor >= 0; cursor--) {
          if (piece[cursor] !== "\n") return count;
          count++;
        }
      }
      return count;
    }

    function pushText(state: PlainState, text: string) {
      let rest = text;
      while (rest.length > 0) {
        const at = rest.indexOf("\n");
        const head = at === -1 ? rest : rest.slice(0, at);
        if (head.length > 0) {
          const atLineStart =
            state.parts.length === 0 || state.parts[state.parts.length - 1].endsWith("\n");
          if (atLineStart) state.indents[state.indents.length - 1] = state.indent;
          state.parts.push(head);
        }
        if (at === -1) return;
        state.parts.push("\n");
        state.indents.push(state.indent);
        rest = rest.slice(at + 1);
      }
    }

    function ensureBreaks(state: PlainState, count: number) {
      let have = trailingBreaks(state);
      while (have < count) {
        pushText(state, "\n");
        have++;
      }
    }

    function walk(range: Range, node: Node, state: PlainState, which: CopyEngine) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!overlaps(range, node)) return;
        pushText(state, sliceText(range, node as Text));
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) {
        for (const child of node.childNodes) walk(range, child, state, which);
        return;
      }
      const element = node as Element;
      if (!overlaps(range, element) || hiddenFromCopy(element)) return;
      if (element.tagName === "BR") {
        pushText(state, "\n");
        return;
      }
      const block = blockElement(element, which);
      if (block && which === "firefox" && emptyBlock(element)) return;
      const blankBefore =
        which === "firefox" &&
        (element.tagName === "P" || element.tagName === "UL" || element.tagName === "OL");
      if (block && blankBefore && state.parts.length > 0) {
        ensureBreaks(state, 2);
      } else if (block && state.parts.length > 0 && trailingBreaks(state) === 0) {
        pushText(state, "\n");
      }
      const list = which === "firefox" && (element.tagName === "UL" || element.tagName === "OL");
      if (list) state.indent += 4;
      for (const child of element.childNodes) walk(range, child, state, which);
      if (list) state.indent -= 4;
      if (!block) return;
      state.lastTag = element.tagName;
      ensureBreaks(state, element.tagName === "P" && which !== "firefox" ? 2 : 1);
    }

    function plainFromSelection(selection: Selection, which: CopyEngine): string {
      const state: PlainState = { parts: [], indents: [0], indent: 0, lastTag: "" };
      for (let index = 0; index < selection.rangeCount; index++) {
        const range = selection.getRangeAt(index);
        const root = range.commonAncestorContainer;
        if (root.nodeType === Node.TEXT_NODE) walk(range, root, state, which);
        else for (const child of root.childNodes) walk(range, child, state, which);
      }
      const lines = state.parts
        .join("")
        .split("\n")
        .map((line, index) => {
          const trimmed = line.trim();
          const pad = state.indents[index] ?? 0;
          return pad > 0 && trimmed.length > 0 ? `${" ".repeat(pad)}${trimmed}` : trimmed;
        });
      // Chromium and WebKit keep the blank line after a paragraph that ends
      // the selection. Other trailing block breaks are not copied.
      const keepParagraphTail = which !== "firefox" && state.lastTag === "P";
      while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
      if (keepParagraphTail) lines.push("", "");
      return lines.join("\n");
    }

    function handleCopy(event: ClipboardEvent) {
      const selection = document.getSelection();
      if (!selection || selection.rangeCount === 0 || !event.clipboardData) return;
      if (!selectionHasSoftHyphen(selection)) return;
      event.preventDefault();
      event.clipboardData.setData("text/plain", plainFromSelection(selection, engine()));
      event.clipboardData.setData("text/html", htmlWithoutSoftHyphens(selection));
    }

    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, []);
  return null;
}
