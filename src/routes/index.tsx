import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Secure Access — Authentication Demo" },
      { name: "description", content: "A simple, secure email authentication demo." },
      { property: "og:title", content: "Secure Access — Authentication Demo" },
      { property: "og:description", content: "A simple, secure email authentication demo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({ to: "/login", replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 text-sm text-muted-foreground">
      Loading…
    </div>
  );
}
