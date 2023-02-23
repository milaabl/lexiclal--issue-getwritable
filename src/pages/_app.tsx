import "react-activity/dist/Dots.css";
import "./../styles/globals.css";
import "./../styles/streaming.css";
import "./../appBase/components/markdownEditor/editor.css";
import type { AppProps } from "next/app";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <>
      <Head>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
export default MyApp;
