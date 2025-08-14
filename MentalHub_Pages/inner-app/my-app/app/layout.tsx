import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import "../styles/theme.css";
import "../styles/scss/style.scss";
import  Footer from "../innerComp/Footer";
import  Header from "../innerComp/header/Header";
import AppProvider from "../context/AppContext";  
import { ThirdwebProvider } from "thirdweb/react";

const inter = Inter({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Innerverse - Mental Health Care",
  description: "A digital community, aimed at mental health care through psychological consultation for anxiety, depression, breakups and grief.",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#6666ff' }
    ]
  },
  manifest: '/site.webmanifest',
  themeColor: '#6666ff',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'Innerverse - Mental Health Care',
    description: 'A digital community, aimed at mental health care through psychological consultation for anxiety, depression, breakups and grief.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Innerverse - Mental Health Care',
    description: 'A digital community, aimed at mental health care through psychological consultation for anxiety, depression, breakups and grief.',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className={inter.className}>
      <body className="bg-bg text-text font-inter">        
          <div id="main-wrapper">
          <ThirdwebProvider>
            <AppProvider>
                  <Header/>
                  <div className="page-wrapper"
                  style={{
                    marginTop: '50px'
                  }}
                  >
                  <div className="container-fluid">{children}</div>
                  </div>  
                  <Footer />                
            </AppProvider>
          </ThirdwebProvider>
          </div>        
      </body>
  </html>
  );
}
