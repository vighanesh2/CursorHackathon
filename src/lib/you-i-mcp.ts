import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { listUserCollections, matchCollection } from "@/lib/collection-store";
import { renderStyleGuide } from "@/lib/export-collection";

const APPLY_PREFIX = `Apply this You-i Design DNA when building UI.

HARD RULE: Moodboard / reference photos are inspiration only. Do not include those images or URLs in the generated UI. Translate palette, type, materials, buttons, and motion into the interface instead.

`;

function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

export function createYouIMcpServer(userId: string | null) {
  const server = new McpServer({
    name: "you-i",
    version: "0.1.0",
  });

  server.registerTool(
    "list_collections",
    {
      title: "List You-i collections",
      description:
        "List saved You-i Design DNA collections for this user. Use before get_collection if the name is unclear.",
    },
    async () => {
      if (!userId) {
        return textResult(
          "No You-i user id. In Cursor MCP config, set header x-you-i-user-id to the session id shown on the You-i Collection page.",
        );
      }
      try {
        const designs = await listUserCollections(userId);
        if (!designs.length) {
          return textResult("No You-i collections saved yet for this user.");
        }
        return textResult(
          designs
            .map((design) => `${design.name} — ${design.moodboard_title}`)
            .join("\n"),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not list collections.";
        return textResult(message);
      }
    },
  );

  server.registerTool(
    "get_collection",
    {
      title: "Get You-i collection",
      description:
        "Load a You-i collection style guide by name or slug. Apply palette, type, buttons, and motion. Moodboard photos are inspiration only — do not put them in the UI.",
      inputSchema: {
        name: z.string().describe("Collection name or slug, for example ecommerce-app"),
      },
    },
    async ({ name }) => {
      if (!userId) {
        return textResult(
          "No You-i user id. In Cursor MCP config, set header x-you-i-user-id to the session id shown on the You-i Collection page.",
        );
      }
      try {
        const designs = await listUserCollections(userId);
        const hit = matchCollection(designs, name);
        if (!hit) {
          const available = designs.map((design) => design.name).join(", ") || "none";
          return textResult(`No collection named "${name}". Available: ${available}`);
        }
        const guide = renderStyleGuide({
          name: hit.name,
          prompt: hit.prompt,
          moodboardTitle: hit.moodboard_title,
          dna: hit.dna,
        });
        return textResult(`${APPLY_PREFIX}${guide}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not load collection.";
        return textResult(message);
      }
    },
  );

  return server;
}

export function readYouIUserId(request: Request) {
  const headerId = request.headers.get("x-you-i-user-id")?.trim();
  if (headerId) return headerId;

  const auth = request.headers.get("authorization")?.trim();
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }

  return null;
}
