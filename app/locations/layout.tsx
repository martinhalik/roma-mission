import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Locations",
  description:
    "Our active mission centers in Slovakia — Klenovec, Markovce, Kacanov, and Mutnik — where Orthodox parishes are being planted among Roma communities.",
  openGraph: {
    title: "Locations — Roma Mission",
    description:
      "Our active mission centers in Slovakia — Klenovec, Markovce, Kacanov, and Mutnik — where Orthodox parishes are being planted among Roma communities.",
    url: "https://romamission.eu/locations",
    images: [{ url: "/images/klenovec-chapel.jpeg", width: 1200, height: 630, alt: "Klenovec — Roma Mission Center" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Locations — Roma Mission",
    description:
      "Our active mission centers in Slovakia — Klenovec, Markovce, Kacanov, and Mutnik — where Orthodox parishes are being planted among Roma communities.",
    images: ["/images/klenovec-chapel.jpeg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
