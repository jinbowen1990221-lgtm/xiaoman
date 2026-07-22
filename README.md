# Bob Observer MVP

Next.js App Router prototype for Bob, a restrained AI companion that notices,
remembers, and replies in short human lines.

## Run

```bash
npm install
npm run dev
```

Open [https://xiaoman-lime.vercel.app](https://xiaoman-lime.vercel.app).

## Implemented

- Mobile-first shell with a max-width `480px` desktop container.
- Four primary tabs: Today, Record, History, Me.
- Secondary pages hide the tab bar and use a top back affordance.
- Tailwind theme maps the requested CSS variables and Bob palette.
- Mock route handlers for today note, open-today options, lottery numbers,
  history insights, and records.
- Deterministic weekly lottery generation based on birthday and ISO week.
- Font variables are wired for Noto Serif SC, PingFang SC, and EB Garamond.
  This local prototype uses CSS fallbacks so it can build without fetching
  Google font assets; swap to `next/font` or local font files when assets are
  available in the repo.

## Next Integration Points

- Replace mock API responses with Claude generation and Supabase persistence.
- Add Whisper-powered voice mode to `/record`.
- Add authenticated `userId` from the eventual auth layer.
