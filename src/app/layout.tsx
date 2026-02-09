import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SWRProvider } from "@/context/SWRProvider";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "ChitWise Org",
  description: "Chit Fund Management for Organizations",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ChitWise",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Updated to match bg-zinc-950
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased">
        <SWRProvider>
          <AuthProvider>
            {children}
            <BottomNav />
          </AuthProvider>
        </SWRProvider>
      </body>
    </html>
  );
}
