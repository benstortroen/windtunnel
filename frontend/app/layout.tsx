// layout.tsx
// Layout applies to all pages, useful for consistent components across website

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from 'next-themes'
// components
import Footer from '@/components/Footer';
import MaintenanceHeader from '@/components/MaintenanceHeader';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Set metadata for webpage for SEO
export const metadata: Metadata = {
  title: "Wind Tunnel @ UMN",
  description: "Digital Twin for the Wind Tunnel located in the University of Minnesota AEM Department",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const debug = false;
  const maintenance = false;
  const debugClassName = debug ? "[&_*]:outline [&_*]:outline-1 [&_*]:outline-red-500/50" : "";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
          <body className="min-h-screen flex flex-col ">
            <ThemeProvider
              attribute="data-theme"
              themes={['light', 'dark', 'umn']}
              defaultTheme="umn"
              enableSystem
            >


                {maintenance && <MaintenanceHeader/>} {/* Display Maintenance Notification */}

                {/* debug class name makes a red outline for all elements*/}
                <div className={debugClassName}>{
                    <main className="flex-1">
                        {children}
                    </main>
                }</div>

                <Footer/> {/* Navigation Bar */}


             </ThemeProvider>
          </body>
    </html>

  );
}
