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
  title: "MentalHub - Mental Health Care Platform",
  description: "A digital community, aimed at mental health care through psychological consultation for anxiety, depression, breakups and grief.",
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
