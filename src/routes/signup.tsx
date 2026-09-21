import { createFileRoute } from "@tanstack/react-router";

import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — Secure Access" },
      { name: "description", content: "Create a secure account with your email and password." },
      { property: "og:title", content: "Create account — Secure Access" },
      { property: "og:description", content: "Create a secure account with your email and password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AuthShell mode="signup" />,
});