"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (!error) setSent(true);
  }

  return (
    <div className="max-w-sm mx-auto mt-16 text-center space-y-4">
      <h1 className="font-display text-2xl text-plum">Welcome to your closet</h1>
      {sent ? (
        <p className="text-sm text-ink/60">Check your email for a sign-in link.</p>
      ) : (
        <form onSubmit={sendLink} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full border border-plum/20 rounded-tag px-3 py-2 text-center"
          />
          <button className="w-full bg-plum text-cream py-2.5 rounded-tag">Send sign-in link</button>
        </form>
      )}
    </div>
  );
}
