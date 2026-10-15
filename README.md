# Ellie Talbot — Portfolio Site

A three-page portfolio: a homepage with a scroll-driven hero, a projects
gallery, and an About page with an Instagram-Stories-style intro.

## Getting started in VS Code

1. Open this folder in VS Code (`File > Open Folder…`).
2. Install the **Live Server** extension (by Ritwick Dey) if you don't have
   it — search for it in the Extensions panel (`Cmd/Ctrl+Shift+X`).
3. Right-click `index.html` → **Open with Live Server**.

You can also just double-click `index.html` to open it straight in a
browser — everything works over `file://` too. Live Server is only nicer
because it auto-refreshes when you save a change.

## Project structure

```
├── index.html          Homepage — hero, scroll animation, project cards
├── projects.html        Full project gallery — tag filter + sort
├── about.html            About page — stories, experience, philosophy
├── css/
│   ├── base.css          Shared: colors, reset, nav, footer, page headers
│   ├── home.css          Homepage-only styles
│   ├── projects.css      Projects page-only styles
│   └── about.css         About page-only styles
├── js/
│   ├── nav.js            Shared: mobile hamburger menu (all pages)
│   ├── home.js           Homepage scroll animation
│   ├── projects.js       Projects tag filter + sort
│   └── about.js          About page stories + experience accordion
├── images/
│   └── memoji.png        Your memoji, used in the homepage hero
└── resume.pdf            ⚠️ not included — see below
```

Every page pulls in `css/base.css` first and its own page-specific
stylesheet second, so shared things (the nav bar, footer, page headers,
colors) only exist in one place. Same idea for JS — `nav.js` is loaded on
every page for the mobile menu, alongside one page-specific script.

## Before this is really "done" — replace these

Almost everything here was built with placeholder content so the real
mechanics (animations, filtering, drag physics, etc.) had something to work
with. Swap these out with your real information:

- **`resume.pdf`** — doesn't exist yet. Drop your actual resume PDF at the
  project root with exactly that filename (or update the `href="resume.pdf"`
  links in each page's nav and footer if you'd rather name it differently).
- **Email & social links** — currently `hello@ellietalbot.design`,
  `linkedin.com/in/ellietalbot`, plus placeholder Instagram/Dribbble/Twitter
  handles. Search each HTML file for `ellietalbot` to find every instance.
- **Project cards & gallery** (`index.html`, `projects.html`) — all
  descriptions, dates, and roles are invented. The colored gradient
  "photos" are stand-ins for real screenshots — swap the inline
  `background: linear-gradient(...)` styles for `background-image: url(...)`
  on the same elements once you have real images; sizing and hover behavior
  will carry over untouched.
- **About page** (`about.html`) — the bio text, the 4 story bubbles (school /
  code / design / fun) and their 9 slide captions, the 5 experience entries,
  education, skillset, and toolkit are all placeholders in Ellie's voice.
  Replace with your real background.
- **Toolkit icons** — simplified colored badges with 2-letter initials
  rather than real app logos (recreating trademarked logos exactly wasn't
  something I'd do). Swap in real icons/screenshots if you have
  brand-appropriate versions.

## A few implementation notes, in case you keep building on this

- The hero's memoji-to-chat animation is driven by a single 0–1 scroll
  "progress" value — if you want to retime it, look for the `lerp(...)` calls
  in `home.js` rather than trying to edit CSS keyframes.
- The project card folder shape is one SVG path (`folder-shape` class) with
  a single shared `drop-shadow` filter on the wrapper, not two separate
  box-shadows — that's what makes the tab and body read as one object.
- `transform: scale(...)` doesn't shrink how much space an element reserves
  in the page's layout — only how it looks. A few places (the homepage
  memoji, the project folder) compensate for this with a matching negative
  margin; worth knowing if something you scale down leaves a mystery gap
  behind it.
