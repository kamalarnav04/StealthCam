import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { StreamProvider } from "@/contexts/StreamContext";
import DevAuthHelper from "@/components/DevAuthHelper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StealthCam - Remote Surveillance Tool",
  description: "StealthCam is a lightweight remote monitoring tool that turns your computer into a live surveillance device. Capture and stream video/audio securely to your phone in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVars = `${geistSans.variable} ${geistMono.variable}`;
  
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <div className={`${fontVars} antialiased min-h-screen`}>
          <AuthProvider>
            <StreamProvider>
              <DevAuthHelper>
                {children}
              </DevAuthHelper>
            </StreamProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
