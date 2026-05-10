import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Mission",
  description:
    "Five million Roma across Europe — most unreached by the Gospel. Explore the scale of the need, the state of Orthodox presence, and the work of planting lasting parishes.",
  openGraph: {
    title: "The Mission — Roma Mission",
    description:
      "Five million Roma across Europe — most unreached by the Gospel. Explore the scale of the need, the state of Orthodox presence, and the work of planting lasting parishes.",
    url: "https://romamission.eu/mission",
    images: [{ url: "/images/our-approach.jpg", width: 1200, height: 630, alt: "Roma Mission — Europe's Most Neglected People" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Mission — Roma Mission",
    description:
      "Five million Roma across Europe — most unreached by the Gospel. Explore the scale of the need, the state of Orthodox presence, and the work of planting lasting parishes.",
    images: ["/images/our-approach.jpg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
