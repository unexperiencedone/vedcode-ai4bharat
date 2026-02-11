import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Footer } from "@/components/layout/Footer";
import { MainLayout } from "@/components/layout/MainLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Archive",
  description:
    "A high-end, minimalist developer archive and collaborative portfolio.",
};

import { TabProvider } from "@/components/providers/TabProvider";
import { WorkspaceLayout } from "@/components/layout/WorkspaceLayout";
import { Providers } from "@/components/providers/Providers";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col selection:bg-primary selection:text-primary-foreground transition-colors duration-300`}
      >
        <Providers>
          <TabProvider>
            <WorkspaceLayout>
              <MainLayout>{children}</MainLayout>
            </WorkspaceLayout>
            <Footer />
          </TabProvider>
        </Providers>
      </body>
    </html>
  );
}
