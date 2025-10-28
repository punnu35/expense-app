import "../styles/globals.css"
import type { AppProps } from "next/app"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import Head from "next/head"
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="icon" href="/favicon.png" /> {/* <-- place your favicon file in the public folder */}
        <title>Cub Scout Expense App</title> {/* optional: page title */}
      </Head>
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
    </>
  )
}

export default MyApp
