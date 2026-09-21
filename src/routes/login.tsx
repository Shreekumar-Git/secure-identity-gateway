import { createFileRoute } from "@tanstack/react-router";

import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    registered: search.registered === true || search.registered === "true",
  }),
  head: () => ({
    meta: [
      { title: "Log in — Secure Access" },
      { name: "description", content: "Log in securely with your email and password." },
      { property: "og:title", content: "Log in — Secure Access" },
      { property: "og:description", content: "Log in securely with your email and password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { registered } = Route.useSearch();
  return <AuthShell mode="login" registered={registered} />;
}