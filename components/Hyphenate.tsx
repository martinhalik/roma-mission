import { withSoftHyphens } from "@/lib/i18n/softHyphens";

interface HyphenateProps {
  children: string;
}

/**
 * Visible heading or label text. Soft hyphens stay out of `t()` and attributes.
 * `hyphens: manual` keeps the break on these marks. `auto` would also use the
 * dictionary and can split a compound mid-syllable.
 */
export default function Hyphenate({ children }: HyphenateProps) {
  return <span className="hyphenate-shy">{withSoftHyphens(children)}</span>;
}
