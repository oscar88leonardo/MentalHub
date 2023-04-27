import "../styles/scss/style.scss";
import Layout from "../layout/Layout";
import { Provider } from "@self.id/react";


function MyApp({ Component, pageProps }) {
  return (
    <Provider client={{ ceramic: "testnet-clay" }}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Provider>

  );
}

export default MyApp;
