"use client";

import Link from "next/link";
import { useState } from "react";

const fields = [
  { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
  { id: "password", label: "Password", type: "password", placeholder: "••••••••" }
];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 800); // mock feedback
  };

  return (
    <section className="card p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">Auth shell</p>
        <h1 className="text-2xl font-semibold text-white">Login</h1>
        <p className="text-sm text-slate-200/80">
          This is a placeholder form. Hook it up to your auth service when ready.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {fields.map((field) => (
          <label key={field.id} className="block space-y-2 text-sm text-slate-100">
            <span className="font-semibold">{field.label}</span>
            <input
              id={field.id}
              name={field.id}
              type={field.type}
              placeholder={field.placeholder}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-white/40 focus:bg-white/10"
              required
            />
          </label>
        ))}

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-4 text-sm text-slate-300">
        <span className="text-slate-400">New user?</span>{" "}
        <Link href="/" className="font-semibold text-blue-200 hover:text-white">
          Go back home
        </Link>
      </div>
    </section>
  );
}

