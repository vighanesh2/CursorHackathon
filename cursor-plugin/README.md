# You-i Cursor plugin

Install this plugin so any Cursor project can `@you-i` a collection saved on [You-i](https://cursorhackathon-sandy.vercel.app).

## What it includes

- Remote MCP at `https://cursorhackathon-sandy.vercel.app/mcp`
- Skill that loads Design DNA (`get_collection` / `list_collections`)
- Rule: moodboard photos are inspiration only

## Local test

1. Copy this folder to `~/.cursor/plugins/local/you-i`
2. Reload Cursor (**Developer: Reload Window**)
3. Open **Customize → Plugins**, find **you-i**, set **You-i Cursor token** from the Collection page (**Connect Cursor**)
4. Enable the MCP server, then in Agent chat:

```
@you-i list my collections
```

```
@you-i Pizza Studios use this design inspiration to design the website
```

## Marketplace

Submit this folder as a public Git repo at [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish). Also list on [cursor.directory](https://cursor.directory/).
