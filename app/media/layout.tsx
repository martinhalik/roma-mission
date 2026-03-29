import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media",
  description:
    "Watch documentaries and interviews about Orthodox mission among the Roma — bringing the Gospel to Europe's largest unreached minority.",
  openGraph: {
    title: "Media — Roma Mission",
    description:
      "Watch documentaries and interviews about Orthodox mission among the Roma — bringing the Gospel to Europe's largest unreached minority.",
    url: "https://romamission.eu/media",
    images: [{ url: "/images/dolinka-od-mili-nov-2020-poster-00001.jpg", width: 1200, height: 630, alt: "Roma Mission Documentary" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Media — Roma Mission",
    description:
      "Watch documentaries and interviews about Orthodox mission among the Roma — bringing the Gospel to Europe's largest unreached minority.",
    images: ["/images/dolinka-od-mili-nov-2020-poster-00001.jpg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
