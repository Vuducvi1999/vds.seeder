import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Công cụ nạp dữ liệu mẫu",
  description: "Công cụ hỗ trợ nạp dữ liệu mẫu vào hệ thống với nhiều chiến lược linh hoạt",
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
