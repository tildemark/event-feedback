import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Annual Christmas Party Feedback",
  description: "Share your thoughts about our Christmas celebration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
