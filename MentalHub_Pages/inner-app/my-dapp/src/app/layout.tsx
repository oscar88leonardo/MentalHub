import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/innerverse-theme.css";
import { ThirdwebProvider } from "thirdweb/react";
import { CeramicProvider } from "@/context/CeramicContext";
import { client } from "@/lib/client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Innerverse - DApp",
  description: "Innerverse decentralized application with Thirdweb integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThirdwebProvider client={client}>
          <CeramicProvider>
            {children}
          </CeramicProvider>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
