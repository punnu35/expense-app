import { AppProps } from "next/app";
import { useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import Navbar from "../components/Navbar";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  // Use the new recommended function
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Navbar />
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}
