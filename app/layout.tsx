import type { Metadata } from "next";
import { Figtree , Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const figTree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JASON Formatter",
  description: "JASON DERULO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${figTree.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
