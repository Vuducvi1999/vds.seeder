import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Data Seeder",
  description: "Tool for seeding data with flexible strategies",
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
