"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const fieldClass =
  "contact-glass-input bg-white text-foreground placeholder:text-muted-foreground";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="contact-glass-panel flex flex-col items-center justify-center p-10 text-center lg:col-span-3">
        <p className="text-lg font-semibold text-foreground">Message received</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Thanks for reaching out. We&apos;ll reply to your email shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="contact-glass-panel space-y-5 p-6 sm:p-8 lg:col-span-3"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="contact-name" className="contact-glass-label">
            Name
          </label>
          <Input
            id="contact-name"
            name="name"
            required
            placeholder="Your name"
            className={fieldClass}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="contact-email" className="contact-glass-label">
            Email
          </label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className={fieldClass}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="contact-subject" className="contact-glass-label">
          Subject
        </label>
        <Input
          id="contact-subject"
          name="subject"
          required
          placeholder="How can we help?"
          className={fieldClass}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="contact-message" className="contact-glass-label">
          Message
        </label>
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="Tell us about your use case..."
          className={cn(
            "contact-glass-textarea bg-white text-foreground placeholder:text-muted-foreground",
          )}
        />
      </div>
      <Button
        type="submit"
        className="btn-gradient h-11 w-full rounded-xl border-0 font-semibold sm:w-auto sm:px-8"
      >
        Send message
        <Send className="size-4" />
      </Button>
    </form>
  );
}
