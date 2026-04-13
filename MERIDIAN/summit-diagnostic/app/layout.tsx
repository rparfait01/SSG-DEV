import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Summit Diagnostic | Summit Strategies Group",
  description: "Organizational and leadership diagnostic engine by Summit Strategies Group.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#F8F5EF] antialiased">
        {children}
      </body>
    </html>
  );
}
