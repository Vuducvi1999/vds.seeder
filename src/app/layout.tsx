import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VDS Data Seeder",
  description: "Tool for seeding VDS event data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
