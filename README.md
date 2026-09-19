# You-i

A Cursor tool to get rid of AI slop UI.

Describe a company or website, get three moodboards, pick one, and save its design DNA.

## Getting started

```bash
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env.local` and fill in:

- `GROQ_API_KEY` — used to write the three visual personalities and image prompts
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, used to save without login
- `MCP_TOKEN_SECRET` — optional; used to sign Cursor MCP tokens (falls back to the service role key)

Then run `supabase/schema.sql` in the Supabase SQL editor.

## Hosted MCP

The deployed app exposes Streamable HTTP MCP at `/mcp`. Collections are scoped to a signed Cursor token from the Collection page (`Authorization: Bearer …`). A raw session UUID still works for older configs.

```json
{
  "mcpServers": {
    "you-i": {
      "url": "https://YOUR-VERCEL-URL/mcp",
      "headers": {
        "Authorization": "Bearer YOUR-CURSOR-TOKEN"
      }
    }
  }
}
```

Open Collection on the live site to copy that block. Then enable the `you-i` server in Cursor Settings → MCP. Local `mcp/you-i.mjs` still reads markdown files in this repo for development.

## Cursor plugin (any project)

The installable plugin lives in `cursor-plugin/`. It bundles the hosted MCP, the You-i skill, and the anti-slop rule.

To try it on this machine:

```bash
mkdir -p ~/.cursor/plugins/local
cp -R cursor-plugin ~/.cursor/plugins/local/you-i
```

Reload Cursor, open Customize → Plugins, paste your **Connect Cursor** token into `YOU_I_TOKEN`, and enable the server.

Marketplace submit is the next step: public Git repo + [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish).

## Use a collection in Cursor

Saving a design writes a style guide to `you-i/collections/{slug}.md`. Cursor can load that DNA through the **you-i** MCP server.

1. Reload Cursor so `.cursor/mcp.json` connects (Settings → MCP, server name `you-i`).
2. In Agent chat:

```
@you-i dashboard-app use this design inspiration to design the website
```

The agent should call `get_collection` (or you can `@` the markdown file directly: `you-i/collections/dashboard-app.md`). It will use that palette, Google Font, buttons, and motion instead of generic AI UI. Moodboard photos stay inspiration-only and should not appear in the generated screens.

To use You-i from another repo, copy the `you-i` MCP block into `~/.cursor/mcp.json` and keep this project’s `you-i/collections` folder, or point the server at that folder.

Groq does not currently host image generation. Moodboard photos come from Openverse. There is no login: a user id is stored in the browser.
