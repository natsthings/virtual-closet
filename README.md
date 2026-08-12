# Virtual Closet

A personal wardrobe app: Next.js (deployed on Vercel) + Supabase (auth, database, and
photo storage — the "bucket" you asked about is built in, no separate service needed).

## 1. Set up Supabase (~10 min)

1. Go to supabase.com → New project.
2. In the SQL Editor, paste and run everything in `supabase/schema.sql`. This creates
   every table (including ones for features you haven't turned on yet, so we never have
   to run a painful migration later), turns on Row Level Security so your data is
   private to your account, and creates the `closet-photos` storage bucket.
3. In Project Settings → API, copy your **Project URL** and **anon public key**.
4. In Authentication → Providers, email OTP ("magic link") is on by default — that's
   what this app uses to sign in, no password to manage.

## 2. Run it locally

```bash
cp .env.local.example .env.local     # paste in your Supabase URL + anon key
npm install
npm run dev
```

Open http://localhost:3000, enter your email, and click the sign-in link it emails you.

## 3. Push to GitHub + deploy to Vercel

```bash
git init
git add .
git commit -m "virtual closet v1"
gh repo create virtual-closet --private --source=. --push
# or push manually to a repo you create on github.com
```

Then on vercel.com: **New Project → Import** your GitHub repo → add the same two
`NEXT_PUBLIC_SUPABASE_*` env vars in Project Settings → Deploy.

## What's built (Phase 1)

- Tabs by category: shirts, tees, tanks, skirts, shorts, pants, dresses, outerwear,
  shoes, jewelry, accessories
- Location tag: home / dorm / hamper / away (seasonal storage)
- Wishlist, with a "found it online" link and one-click move into your real closet
- Calendar wear log with fit-check selfie upload, and a **repeat-outfit warning**
  if something you're logging was worn in the last 14 days
- Laundry basket: mark items dirty, "move everything back to closet" button
- Dressing room: build-your-own mix & match, **and** a tinder-style keep/skip
  swipe mode, both save as a named outfit
- Packing list: pick a weather type, get matching clean (non-away) clothes
- Forgotten fits: anything not logged as worn in 30+ days gets a `!` flag on its card
- Cost-per-wear leaderboard, wear counts, and favorites (★)
- Category balance tool: set a target count per category, see what to buy next
- Basic color-compatibility suggestions in the dressing room
- Jewelry section with metal/gemstone fields
- Memory notes (where bought, story) per item
- Layering field (base/mid/outer) on items
- Borrow tracking: mark an item as lent to a friend
- "Add to wardrobe" style shortcut: every item gets an auto-generated Google Image
  Search link instead of building a 3D try-on model

## Not yet built — by design, so nothing here needed guessing

- **Weather API auto-recommendations** ("don't wear draggy pants, it's windy") — the
  packing page currently uses weather *tags you pick manually*. Wiring a real forecast
  (e.g. OpenWeather, free tier) is a small addition once you have an API key.
- **Google Shopping visual try-on** — the "on vs. png" idea and true try-on rendering
  is a bigger integration (Google doesn't offer a public try-on API); the current
  version links out to Google Image Search per item as the lightweight version of this.
- **Friend sharing / "Spotify Wrapped" placard** — the schema has room for it (see the
  comment in `schema.sql`), but since you weren't sure yet whether friends need
  accounts, I didn't build shared views or a shareable card. Tell me how you want
  friends to see things (their own login? a public read-only link?) and I'll build it.
- **Smart 2-week duplicate logic accounting for your specific class schedule** (e.g.
  MWF vs. T/Th groups) — right now it warns on *any* repeat within 14 days, which
  covers most of the goal. True schedule-aware logic needs you to define your
  recurring days, which we can add as a settings page.
- **Ideal wardrobe ratio auto-recommendations beyond simple counts** — you can set a
  target count per category now; smarter proportional suggestions (e.g. "3 tops per
  1 bottom") can be layered on top once you've used it a bit and know what ratio you
  actually want.

## Notes

- Every table has Row Level Security — your data is private to your Supabase auth
  account by default, even though the code is written to make sharing easy to add later.
- Photos live in the `closet-photos` Supabase Storage bucket, organized by user ID folder.
