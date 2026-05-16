import type { Metadata } from "next";
import { Suspense } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";

import { AuthQueryHandler } from "@/components/auth/auth-query-handler";
import { AuthModal } from "@/components/auth/auth-modal";
import { CourseGenerationModal } from "@/components/generation/course-generation-modal";
import { AuthProvider } from "@/contexts/auth-context";
import { GenerationProvider } from "@/contexts/generation-context";
import { getAuthUser } from "@/lib/auth/get-auth-user";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getAuthUser();

  return (
    <html
      lang="en"
      className={`${poppins.variable} light h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider initialUser={initialUser}>
          <GenerationProvider>
            <Suspense fallback={null}>
              <AuthQueryHandler />
            </Suspense>
            {children}
            <AuthModal />
            <CourseGenerationModal />
          </GenerationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
