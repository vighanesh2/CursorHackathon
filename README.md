# You-i

A Cursor tool to get rid of generic “AI slop” UI. Describe a company, pick a photographic moodboard, lock type / buttons / motion into Design DNA, then `@you-i` that collection so Cursor builds a real interface from it.

Demo: [https://cursorhackathon-sandy.vercel.app](https://cursorhackathon-sandy.vercel.app)

## Pitch

AI coding agents are fast at UI and bad at taste. Ask for a landing page or a chatbot and you get the same product: Inter or Poppins, a purple gradient, glass cards, sparkle icons. Founders, designers, and small teams using Cursor ship looking like every other generated app. The people it hurts most are those without a design system yet—the bakery, the freight tool, the jazz club—who need a face that matches their world, not a template.

You-i is a Design DNA studio plus a Cursor MCP. You describe the business. The app returns three photographic moodboards (Openverse, not fake image gen), then you lock a Google Font, a button system, and a text motion. That mix is saved as a named collection for an anonymous browser session. In any repo you switch on the hosted MCP, paste a Connect Cursor token, and say `@you-i bakeryshop use this design inspiration`. The agent loads palette, type, radii, and motion. Moodboard photos stay look-don’t-copy: they inform materials and light; they are not dumped into the product as hero shots.

Impact is a closed loop from “what should this feel like?” to “build the screen” without a Figma file. `/test` shows the before (generic AI chatbot) and after (Rustic Hearth bakery: Bodoni, brick, flour counter). Collections persist in Supabase so the same DNA can restyle the next page tomorrow. The bet is simple: if agents will write most UI anyway, they should write *this* UI, not everyone’s.

- [x] Quick start
- [x] Tech stack & architecture
- [x] How to reproduce the demo
- [x] Datasets / synthetic data + provenance
- [x] Known limitations & next steps

## Quick start

```bash
git clone https://github.com/vighanesh2/CursorHackathon.git
cd CursorHackathon
npm install
cp .env.example .env.local
```

Fill `.env.local` (see [Reproduce the demo](#how-to-reproduce-the-demo)). In Supabase, run `supabase/schema.sql`. Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js app (studio, collection, `/test` chatbot, `/mcp`) |
| `npm run build` / `npm start` | Production build |
| `npm run lint` | ESLint |
| `npm run you-i` | Local stdio MCP that reads `you-i/collections/*.md` |

## Tech stack & architecture

- **App:** Next.js 16 (App Router), React 19, TypeScript, Tailwind 4
- **DNA / chat:** Groq (`openai/gpt-oss-120b` for moodboards & fonts, `openai/gpt-oss-20b` for `/test` chat)
- **Photos:** Openverse photograph search (not image generation)
- **Persistence:** Supabase (`users`, `design_dnas`); anonymous `you-i-user-id` in `localStorage`
- **Cursor:** Streamable HTTP MCP at `/mcp`, plugin in `cursor-plugin/`, skill + rule for `@you-i`

```mermaid
flowchart LR
  User[Browser] --> App[Next.js on Vercel]
  App --> Groq[Groq LLM]
  App --> Openverse[Openverse photos]
  App --> SB[(Supabase)]
  Cursor[Cursor Agent] --> MCP["/mcp HTTP"]
  MCP --> SB
  Cursor --> Skill[You-i skill / rule]
```

Flow: prompt → 3 moodboards → font → button system → text motion → name & save → Collection. Saving also writes `you-i/collections/{slug}.md` locally (dev) and stores DNA in Supabase (source of truth for hosted MCP).

`/test` is a separate route (no You-i chrome) used to show a generic chatbot vs a DNA-applied rebuild.

## How to reproduce the demo

### 1. API keys

| Variable | Where to get it | Used for |
| --- | --- | --- |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) | Moodboards, font picks, test chat |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings | Client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase API keys | Public anon key (RLS on; writes go through service role) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase API keys (secret) | Save / list / delete / MCP without login |
| `MCP_TOKEN_SECRET` | Any long random string (optional) | Sign Cursor tokens; falls back to the service role key |

Never commit `.env` / `.env.local`. The service role key is server-only.

### 2. Sample `.env.local`

Copy `.env.example`:

```
GROQ_API_KEY=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MCP_TOKEN_SECRET=
```

### 3. Database

Create a free Supabase project. In the SQL editor, run `supabase/schema.sql` (`users` + `design_dnas`).

### 4. Studio walkthrough

1. Open `/` and describe a business (e.g. “chatbot for my bakery”).
2. Pick one of three moodboards → Next.
3. Pick a Google Font card → Next.
4. Pick a button system → Next.
5. Pick a text motion, name the collection, Save.
6. Open `/collection` to view, edit, or delete (delete takes two extra confirms).
7. **Connect Cursor** copies `mcp.json` with `Authorization: Bearer yi1.…`.

### 5. Cursor demo (`@you-i`)

Point Cursor at the hosted MCP (live site or your deploy):

```json
{
  "mcpServers": {
    "you-i": {
      "url": "https://cursorhackathon-sandy.vercel.app/mcp",
      "headers": {
        "Authorization": "Bearer PASTE_TOKEN_FROM_COLLECTION"
      }
    }
  }
}
```

Enable **you-i** in Settings → MCP. In Agent chat:

```
@you-i bakeryshop use this design inspiration to rebuild the /test frontend
```

The agent should call `get_collection` and apply palette, font, buttons, and motion. **Moodboard photo URLs are inspiration only** — they must not appear as `<img>` or backgrounds in the generated UI.

Optional local plugin: copy `cursor-plugin/` to `~/.cursor/plugins/local/you-i`, reload Cursor, set `YOU_I_TOKEN`.

### 6. Test chatbot

- `/test` — chatbot UI rebuilt from a saved collection (for example bakeryshop), compared against a generic AI look when you choose to restyle it.

## Datasets / synthetic data & provenance

You-i does **not** train on a downloaded dataset. Everything at runtime is:

| Data | Provenance | License / notes |
| --- | --- | --- |
| Moodboard photographs | Live [Openverse](https://api.openverse.org) search, `category=photograph`, filtered away from icons/UI kits | Creative Commons / public domain per Openverse result; thumbs only, not shipped into generated product UI |
| Design DNA (palette, materials, layout copy) | Groq model output from the user’s prompt | Synthetic; stored in `design_dnas.dna` (JSONB) |
| Fonts | [Google Fonts](https://fonts.google.com) CSS2 URLs chosen from a small catalog in `src/lib/google-fonts.ts` | SIL OFL / Apache per family |
| Test chat replies | Groq chat completions | Synthetic |
| User identity | `crypto.randomUUID()` in `localStorage` (`you-i-user-id`) | Not a real account |
| Sample collections in git (`you-i/collections/*.md`) | Previously saved DNA exports | Examples for local stdio MCP |

No third-party customer PII is required. Do not treat Openverse thumbs as assets to hotlink in production UIs.

## Known limitations & next steps

**Limitations**

- Identity is a browser UUID + HMAC token, not OAuth. Another device does not see the same collections unless the token/`mcp.json` is copied.
- Hosted MCP is stateless (fine on Vercel) but depends on Supabase + the token matching the saver’s `user_id`.
- Groq sometimes returns incomplete JSON; the app retries/normalizes, but moodboards can still fail.
- Openverse can rate-limit or return weak matches; photos are search, not generation.
- Cursor Marketplace listing is submitted/local-plugin only until review; `cursor.directory` is the faster community path.
- Local file export (`you-i/collections`) does not persist on serverless; MCP must read Supabase.
- `/test` is a demo surface, not a multi-tenant bakery product.

**Next steps**

- OAuth (or magic link) so a token is bound to an account, not a tab.
- Official Cursor Marketplace approval + install deeplink from Connect Cursor.
- Rotate/revoke MCP tokens without rotating `MCP_TOKEN_SECRET`.
- Stronger Openverse ranking and attribution UI on the moodboard itself (still not in generated apps).
- Public collection slugs for share-by-link without leaking other users’ DNA.
