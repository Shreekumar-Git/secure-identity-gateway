import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const USERS_PER_PAGE = 1000;

function escapeMarkdownCell(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/[\r\n]+/g, " ");
}

export const generateRegisteredUsersPdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const apiKey = process.env["PAPERMILL_API_KEY"];
    if (!apiKey) {
      throw new Error("PDF generation is not configured yet.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const users: Array<{ email: string; createdAt: string }> = [];
    let page = 1;

    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: USERS_PER_PAGE,
      });

      if (error) {
        console.error("[Registered users PDF] Failed to list users", error);
        throw new Error("We could not load the registered users right now.");
      }

      for (const user of data.users) {
        users.push({
          email: user.email ?? "No email address",
          createdAt: user.created_at,
        });
      }

      if (data.users.length < USERS_PER_PAGE) {
        break;
      }

      page += 1;
    }

    const rows = users.length
      ? users
          .map(
            (user, index) =>
              `| ${index + 1} | ${escapeMarkdownCell(user.email)} | ${escapeMarkdownCell(
                new Date(user.createdAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "UTC",
                }),
              )} UTC |`,
          )
          .join("\n")
      : "| — | No registered users | — |";

    const markdown = [
      "# Registered Users",
      "",
      `Total registered users: **${users.length}**`,
      "",
      "| # | Email | Registered At |",
      "| ---: | --- | --- |",
      rows,
    ].join("\n");

    const response = await fetch(
      "https://api.papermill.io/v2/pdf?template_id=papermill-simple-report",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "text/markdown",
        },
        body: markdown,
      },
    );

    if (!response.ok) {
      const providerMessage = await response.text();
      console.error("[Registered users PDF] Papermill request failed", {
        status: response.status,
        message: providerMessage.slice(0, 500),
      });
      throw new Error("Papermill could not generate the PDF right now.");
    }

    const pdf = Buffer.from(await response.arrayBuffer()).toString("base64");

    return {
      contentType: "application/pdf",
      data: pdf,
      filename: "registered-users.pdf",
      userCount: users.length,
    };
  });