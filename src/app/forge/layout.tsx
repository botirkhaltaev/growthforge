import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GTM Factory — Growth Forge",
  description:
    "Scope ICP and signals, distribute work across agents, then approve a multi-touch reach-out cadence.",
};

export default function ForgeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
