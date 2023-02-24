import Header from "./header/Header.tsx";
import Footer from "./footer/Footer";
import AppProvider from "../context/AppContext.tsx"

const Layout = ({ children }) => {
  return (
    <div id="main-wrapper">
      <AppProvider>
        <Header />
        <div className="page-wrapper">
          <div className="container-fluid">{children}</div>
        </div>
        <Footer />
      </AppProvider>
    </div>
  );
};

export default Layout;
