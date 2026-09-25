import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Download, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { generateRegisteredUsersPdf } from "@/lib/registered-users-pdf.functions";

export const Route = createFileRoute("/hello")({
  head: () => ({
    meta: [
      { title: "Hello World — Secure Access" },
      { name: "description", content: "Your protected Hello World page." },
      { property: "og:title", content: "Hello World — Secure Access" },
      { property: "og:description", content: "Your protected Hello World page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelloPage,
});

function HelloPage() {
  const navigate = useNavigate();
  const generatePdf = useServerFn(generateRegisteredUsersPdf);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (!data.user) {
        void navigate({ to: "/login", search: { registered: false }, replace: true });
        return;
      }
      setEmail(data.user.email ?? "your account");
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    await navigate({ to: "/login", search: { registered: false }, replace: true });
  }

  async function handleDownloadUsersPdf() {
    setPdfError(null);
    setIsGeneratingPdf(true);

    try {
      const result = await generatePdf();
      const binary = window.atob(result.data);
      const bytes = new Uint8Array(binary.length);

      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }

      const url = URL.createObjectURL(new Blob([bytes], { type: result.contentType }));
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download registered users PDF", error);
      setPdfError("We could not generate the PDF right now. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-muted/40 text-sm text-muted-foreground">Checking your session…</div>;
  }

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col rounded-2xl border bg-background shadow-xl">
        <header className="flex items-center justify-between border-b px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3 text-sm font-semibold tracking-wide">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            Secure access
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadUsersPdf} disabled={isGeneratingPdf}>
              {isGeneratingPdf ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              {isGeneratingPdf ? "Generating PDF…" : "Download users PDF"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" />
              Log out
            </Button>
          </div>
        </header>
        <section className="flex flex-1 items-center justify-center px-5 py-16 sm:px-8">
          <Card className="w-full max-w-xl border-0 shadow-none">
            <CardContent className="p-0 text-center">
              <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CheckCircle2 className="size-8" />
              </div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Authenticated</p>
              <h1 className="mt-4 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">Hello World</h1>
              <p className="mx-auto mt-6 max-w-md text-base leading-7 text-muted-foreground">
                You have reached a protected page. Your session is active and your account is securely signed in.
              </p>
              <div className="mx-auto mt-8 flex max-w-sm items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3 text-left">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Logged in as</p>
                  <p className="truncate pt-1 text-sm font-medium text-foreground">{email}</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
              {pdfError ? (
                <p className="mt-4 text-sm text-destructive" role="alert">
                  {pdfError}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}