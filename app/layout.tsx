import type { Metadata } from "next";
import { Figtree, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const figTree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JSON Diff, Format and Convert",
  description: "A free tool to diff, prettify, convert and validate JSON",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "JSON Diff, Format, Convert and Validate",
    description: "A free tool to diff, prettify, convert and validate JSON",
    images: [
      {
        url: "https://jason-formatter.vercel.app/og_image.png",
        width: 1200,
        height: 477,
        alt: "JSON Diff, Format, Convert and Validate",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body className={`${figTree.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Script
          src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
          strategy="beforeInteractive"
        ></Script>
        <Script id="ko-fi-widget">
          {`kofiWidgetOverlay.draw('roho', {
    'type': 'floating-chat',
    'floating-chat.donateButton.text': 'Support me',
    'floating-chat.donateButton.background-color': '#ffffff',
    'floating-chat.donateButton.text-color': '#323842'
  });`}
        </Script>
      </body>
    </html>
  );
}
