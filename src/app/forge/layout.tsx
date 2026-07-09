import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GTM Factory — Growth Forge",
  description:
    "Enter a product brief and watch four Cursor agents create, test, and iterate GTM creative until it clears the launch gate.",
};

export default function ForgeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
