import { withSoftHyphens } from "@/lib/i18n/softHyphens";

interface HyphenateProps {
  children: string;
}

/** Visible heading or label text. Soft hyphens stay out of `t()` and attributes. */
export default function Hyphenate({ children }: HyphenateProps) {
  return withSoftHyphens(children);
}
