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
  title: "Ved Code",
  description:
    "A professional developer platform for learning, building, and exploring code.",
};

import { TabProvider } from "@/components/providers/TabProvider";
import { WorkspaceLayout } from "@/components/layout/WorkspaceLayout";
import { Providers } from "@/components/providers/Providers";
import { GlobalMentorOverlay } from "@/components/ui/GlobalMentorOverlay";


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
            <GlobalMentorOverlay />
          </TabProvider>
        </Providers>
      </body>
    </html>
  );
}
