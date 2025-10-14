import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/innerverse-theme.css";
import Providers from "./Providers";
import { CeramicProvider } from "@/context/CeramicContext";

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
        <Providers>
          <CeramicProvider>
            {children}
          </CeramicProvider>
        </Providers>
      </body>
    </html>
  );
}
