#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const collectionsDir = path.join(root, "you-i", "collections");

async function listGuides() {
  try {
    const files = await readdir(collectionsDir);
    return files.filter((file) => file.endsWith(".md")).sort();
  } catch {
    return [];
  }
}

function matchName(file, name) {
  const slug = file.replace(/\.md$/, "");
  const needle = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return slug === needle || slug.includes(needle) || file.toLowerCase().includes(name.toLowerCase());
}

const server = new McpServer({
  name: "you-i",
  version: "0.1.0",
});

server.tool(
  "list_collections",
  "List saved You-i Design DNA collections available for UI inspiration.",
  {},
  async () => {
    const files = await listGuides();
    const names = files.map((file) => file.replace(/\.md$/, "")).join("\n");
    return {
      content: [
        {
          type: "text",
          text: names || "No You-i collections saved yet.",
        },
      ],
    };
  },
);

server.tool(
  "get_collection",
  "Load a You-i collection style guide by name or slug (for example dashboard-app). Apply palette, type, buttons, and motion. Moodboard photos are inspiration only — do not put them in the UI.",
  { name: z.string() },
  async ({ name }) => {
    const files = await listGuides();
    const hit = files.find((file) => matchName(file, name));
    if (!hit) {
      return {
        content: [
          {
            type: "text",
            text: `No collection named "${name}". Available: ${files.map((file) => file.replace(/\.md$/, "")).join(", ") || "none"}`,
          },
        ],
      };
    }
    const guide = await readFile(path.join(collectionsDir, hit), "utf8");
    return {
      content: [
        {
          type: "text",
          text: `Apply this You-i Design DNA when building UI.

HARD RULE: Moodboard / reference photos are inspiration only. Do not include those images or URLs in the generated UI. Translate palette, type, materials, buttons, and motion into the interface instead.

${guide}`,
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
