

import Header from "./header/Header.tsx";
import Footer from "./footer/Footer";
import AppProvider from "../context/AppContext.tsx"
//import { children } from "react";

export default function RootLayout ({ children })  {
  return (  
    <div id="main-wrapper">
    <AppProvider>
          <Header />
          <div className="page-wrapper"
          style={{
            marginTop: '50px'
          }}
          >
            <div className="container-fluid">{children}</div>
          </div>        
          <Footer />      
    </AppProvider>
  </div>
  );
};

