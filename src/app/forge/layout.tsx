import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forge Campaign — Growth Forge",
  description:
    "Enter a product brief and watch four Cursor agents forge, test, and iterate ad creative until it wins.",
};

export default function ForgeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
