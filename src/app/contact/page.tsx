import Link from "next/link";
import { Mail, MapPin, MessageSquare, Sparkles } from "lucide-react";

import { ContactForm } from "@/components/contact/contact-form";
import { PageShell } from "@/components/layout/page-shell";

export const metadata = {
  title: "Contact | SkillProof",
  description:
    "Get in touch with the SkillProof team — questions about plans, partnerships, or support.",
};

export default function ContactPage() {
  return (
    <PageShell wide>
      <div className="pb-16 pt-4 md:pb-24 md:pt-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/80 px-4 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm backdrop-blur-sm">
            <Sparkles className="size-4" />
            Contact
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            We&apos;d love to hear from you
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Questions about plans, teams, or partnerships? Send us a message and
            we&apos;ll get back to you as soon as we can.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-5">
          <aside className="space-y-4 lg:col-span-2">
            <div className="glass-card p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Mail className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">Email</p>
                  <a
                    href="mailto:hello@skillproof.app"
                    className="mt-1 block text-sm text-primary hover:underline"
                  >
                    hello@skillproof.app
                  </a>
                </div>
              </div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <MessageSquare className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">Enterprise sales</p>
                  <a
                    href="mailto:hello@skillproof.app?subject=Enterprise%20inquiry"
                    className="mt-1 block text-sm text-primary hover:underline"
                  >
                    Request a demo
                  </a>
                </div>
              </div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-600">
                  <MapPin className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">Location</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Colombo, Sri Lanka
                    <br />
                    Cursor Buildathon 2026
                  </p>
                </div>
              </div>
            </div>
            <p className="px-2 text-sm text-muted-foreground">
              Prefer self-serve?{" "}
              <Link href="/pricing" className="font-medium text-primary hover:underline">
                Compare plans
              </Link>{" "}
              or{" "}
              <Link href="/#upload" className="font-medium text-primary hover:underline">
                create a course
              </Link>{" "}
              to try SkillProof free.
            </p>
          </aside>

          <ContactForm />
        </div>
      </div>
    </PageShell>
  );
}
