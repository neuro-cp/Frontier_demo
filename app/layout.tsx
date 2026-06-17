import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";
import { WorkspaceProvider } from "@/components/WorkspaceContext";
import { getCurrentUser } from "@/lib/auth/session";
import "leaflet/dist/leaflet.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frontier",
  description: "Business Operations Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <AuthSessionProvider initialUser={user}>
          <WorkspaceProvider>
            <AppShell>
              {children}
            </AppShell>
          </WorkspaceProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
