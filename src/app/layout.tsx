import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/contexts/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkillProof",
  description:
    "Transform YouTube videos, PDFs, and articles into micro-courses with flashcards, quizzes, and certificates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} light h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
