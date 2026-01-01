# Components (Next.js app)

This file documents **every component inside `/components`** in the Next.js app.

Notes:
- Many UI primitives in `components/ui/*` are **shadcn-style wrappers** around Radix UI libraries. They mostly have **no internal state** and **call no APIs**.
- Some components exist but are **not currently imported by any `app/*` page** (they may be old/backup/unused right now).

---

## `AIChatFloat.jsx`

**Purpose:** The main “AI Concierge” chat panel (and admin console) users see.

**What it does:**
- Shows a welcome + compliance message.
- Captures lead info (name → email → phone).
- Sends chat messages to the server.
- Has an admin mode (unlock by entering the admin password).
- Shows admin dashboard/analytics and exports.

**Props (types):**
- **open**: `boolean` (required) — whether the chat panel is visible.
- **onClose**: `() => void` (required) — closes the panel.
- **whatsappHref**: `string` (optional) — WhatsApp link to use for CTA buttons.

**State:**
- **messages/adminMessages**: chat history arrays.
- **busy**: `boolean` — sending a message.
- **leadDraft / captureStep / leadId**: lead capture flow.
- **admin / tab / dashboard / analytics / strategy**: admin UI.
- **export/revenue modal state**: admin tools.

**APIs called:**
- `POST /api/leads` (save lead)
- `POST /api/chat` (get AI reply)
- `POST /api/events` (analytics events)
- `POST /api/admin/login` (admin cookie)
- `GET /api/admin/summary` (dashboard)
- `GET /api/admin/analytics` (analytics)
- `GET /api/admin/strategy` (strategy)
- `GET /api/admin/export` (CSV export)
- `POST /api/admin/revenue` (manual revenue)

**Example usage:**

```jsx
import AIChatFloat from "@/components/AIChatFloat";

export default function Example() {
  return <AIChatFloat open={true} onClose={() => {}} whatsappHref="https://wa.me/91XXXXXXXXXX" />;
}
```

**Used in:** `components/WhatsAppFloat.jsx`

**How to modify:**
- Change lead questions: edit the `captureStep` flow inside `send()`.
- Change admin unlock rule: edit the “Admin unlock” block in `send()`.
- Change what endpoints are called: edit `sendChat()`, `upsertLead()`, and admin fetch helpers.

---

## `ChatErrorBoundary.jsx`

**Purpose:** Prevent the whole page from breaking if the chat crashes.

**What it does:**
- Catches React render errors under the chat subtree.
- Logs error to console and best-effort `POST /api/events` (event_type `chat_error`).
- Shows a small “retrying” UI and auto-resets after 3 seconds.

**Props:**
- **children**: `React.ReactNode`

**State:**
- **hasError**: `boolean`
- **resetKey**: number used to remount children

**APIs called:**
- `POST /api/events` (best effort)

**Used in:** `components/WhatsAppFloat.jsx`

---

## `WhatsAppFloat.jsx`

**Purpose:** Floating chat button (WhatsApp-style) that opens the AI chat panel.

**What it does:**
- Shows a floating icon button.
- Shows tooltip on hover.
- Opens `AIChatFloat` in an overlay.
- Wraps chat in `ChatErrorBoundary`.

**Props:** None

**State:**
- **open**: `boolean`
- **showTooltip**: `boolean`

**APIs called:** None directly (child does).

**Used in:** `app/layout.js` (global layout)

---

## `Navigation.jsx`

**Purpose:** Top navigation bar (desktop) + simplified top header (mobile).

**What it does:**
- Tracks scroll to add a glass background when scrolled.
- Switches layout based on viewport width.
- Highlights the active route.

**Props:** None

**State:**
- **isScrolled**: `boolean`
- **isMobile**: `boolean`

**APIs called:** None

**Used in:** `app/layout.js`

---

## `Navigation_backup_pre_shadcn.jsx`

**Purpose:** Backup/older version of navigation (pre-shadcn refactor).

**What it does:** Similar to `Navigation.jsx`, but with a different mobile nav style.

**Props:** None

**Used in:** Not referenced from `app/*` in this snapshot.

---

## `Footer.jsx`

**Purpose:** Site footer with links + compliance disclaimers + a WhatsApp concierge card.

**What it does:**
- Shows navigation columns + contact info.
- Shows a “WhatsApp Us” card with scroll/hover boosts.
- Shows SEBI + investment notice text blocks.

**Props:** None

**State:** Many UI states (hover, “scroll boost”, mobile flags).

**APIs called:** None

**Used in:** `app/layout.js`

---

## `LuxuryMobileDock.jsx`

**Purpose:** Mobile bottom dock navigation + full-screen “More” menu.

**What it does:**
- Shows a fancy bottom dock on small screens.
- Opens a full-screen menu overlay for all navigation links.
- Hides dock while “reading” (scrolling down).

**Props:** None

**State:** Menu open/close, scroll/read states, hovered/idle highlight.

**APIs called:** None

**Used in:** `app/layout.js` (imported as named export `LuxuryMobileDock`)

---

## `AnimatedClouds.jsx`

**Purpose:** Animated hero background (cloud layers + optional rain + lightning).

**Props:**
- **enableRain**: `boolean` (default `false`)

**State:** Lightning on/off; rain on/off + random seed.

**APIs called:** None

**Used in:** `app/page.jsx`

---

## `MarketMoodStrip.jsx`

**Purpose:** Small “Live Mood” text strip above the ticker.

**Props:**
- **onToggleRain**: `() => void` (optional) — toggles rain in the hero background.

**State:** Current rotating mood index.

**APIs called:** None

**Used in:** `app/page.jsx`

---

## `PremiumMarketTicker.jsx`

**Purpose:** Live market ticker UI (scrolling marquee).

**What it does:**
- Fetches `/api/market-data` every 60 seconds.
- Animates a seamless marquee using `requestAnimationFrame`.
- Flashes an item briefly when value changes.

**Props:**
- **className**: `string` (optional)

**State:** Market items array, flash state, pause state (hover/tap).

**APIs called:**
- `GET /api/market-data`

**Used in:** `app/page.jsx`

---

## `ServiceCard.jsx`

**Purpose:** Card used for service tiles (home page grid).

**Props:**
- **service**: `{ title, description, image, link, icon }` (object)
- **index**: `number` (default `0`) — used for image priority

**State:** Mobile scroll animation flag.

**APIs called:** None

**Used in:** `app/page.jsx`

---

## `BlogCard.jsx`

**Purpose:** Premium blog preview card (used on home page).

**Props:**
- **post**: `{ title, excerpt, image/image_url, category, ... }`

**State:** Mobile scroll animation flag.

**APIs called:** None

**Used in:** `app/page.jsx`

---

## `LazyImage.jsx`

**Purpose:** Simple `<img>` wrapper that fades in when loaded.

**Props:** Any normal `<img>` props, plus:
- **src**: `string`
- **alt**: `string`

**State:** `isLoaded` boolean.

**APIs called:** None

**Used in:** `app/blog/page.js`, `app/services/page.jsx`

---

## `MobileScrollBoost.jsx`

**Purpose:** Mobile-only “boost” wrapper that adds an active class when the element is in the viewport’s “eye line”.

**Props (main ones):**
- **as**: element tag/component (default `"div"`)
- **className**: `string`
- **activeClassName**: `string` (default `"is-scroll-boost"`)
- **holdMs**: `number` (default `6000`)
- **bandTop/bandBottom**: `number` (defaults ~0.42/0.58)
- **children**: `React.ReactNode`

**State:** `active` boolean (mobile only).

**APIs called:** None

**Used in:** `app/blog/page.js`, `app/services/page.jsx`, `app/contact/page.jsx`, `app/platforms/page.jsx`, `app/curated-partners/page.jsx`

---

## `FAQSection.jsx`

**Purpose:** Simple FAQ accordion (custom).

**Props:**
- **faqs**: `{ question: string, answer: string }[]`

**State:** `openIndex` (which FAQ is open).

**APIs called:** None

**Used in:** Not referenced from `app/*` in this snapshot.

---

## `RelatedPosts.jsx`

**Purpose:** Shows a “Related Reading” list under a blog post.

**Props:**
- **posts**: array of posts
- **currentPostSlug**: `string`

**State:** None

**APIs called:** None

**Used in:** Not referenced from `app/*` in this snapshot.

---

## `TableOfContents.jsx`

**Purpose:** Builds a table of contents (TOC) from HTML content headings.

**Props:**
- **content**: `string` (HTML)

**State:** `headings`, `activeId`

**APIs called:** None

**Used in:** Not referenced from `app/*` in this snapshot.

---

## `ReadingProgress.jsx`

**Purpose:** Thin progress bar at the top showing how far down the page you scrolled.

**Props:** None

**State:** `progress` number.

**APIs called:** None

**Used in:** Not referenced from `app/*` in this snapshot.

---

## `ToasterProvider.jsx`

**Purpose:** Sonner Toaster provider (toast notifications).

**Props:** None

**State:** None

**APIs called:** None

**Used in:** Not referenced from `app/*` in this snapshot.

---

## `V0Test.jsx`

**Purpose:** Simple UI demo component (v0.dev compatibility test).

**Props:** None

**State:** `activeItem`

**APIs called:** None

**Used in:** `app/v0-test/page.jsx`

---

## `DisclaimerLine.jsx`

**Purpose:** Placeholder file (currently empty).

**What it does:** Nothing (file size is 0 bytes).

**Used in:** Not referenced from `app/*` in this snapshot.

---

## `PremiumMarketTicker.module.css` / `AIChatFloat.module.css`

**Purpose:** CSS modules that style their matching components.

**Used by:**
- `PremiumMarketTicker.module.css` → `PremiumMarketTicker.jsx`
- `AIChatFloat.module.css` → `AIChatFloat.jsx`

---

# UI Components (`components/ui/*`)

These are reusable building blocks. For most of them:
- **State**: none (or minimal, via Radix).
- **APIs called**: none.
- **Props**: “same as underlying primitive” + `className`.
- **Used in**: not referenced by `app/*` pages in this snapshot (mostly internal cross-imports).

For each file below, the **Dependency** line tells you which library it wraps.

---

## `ui/accordion.jsx`
**Purpose:** Accordion UI.
**Dependency:** `@radix-ui/react-accordion`
**Exports:** `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`

---

## `ui/alert-dialog.jsx`
**Purpose:** Confirm/alert modal.
**Dependency:** `@radix-ui/react-alert-dialog`

---

## `ui/alert.jsx`
**Purpose:** Alert box with variants.
**Dependency:** `class-variance-authority`
**Exports:** `Alert`, `AlertTitle`, `AlertDescription`

---

## `ui/aspect-ratio.jsx`
**Purpose:** Keep a fixed aspect ratio box.
**Dependency:** `@radix-ui/react-aspect-ratio`
**Exports:** `AspectRatio`

---

## `ui/avatar.jsx`
**Purpose:** Avatar image/fallback.
**Dependency:** `@radix-ui/react-avatar`
**Exports:** `Avatar`, `AvatarImage`, `AvatarFallback`

---

## `ui/badge.jsx`
**Purpose:** Badge / pill UI.
**Dependency:** `class-variance-authority`
**Exports:** `Badge`, `badgeVariants`

---

## `ui/breadcrumb.jsx`
**Purpose:** Breadcrumb navigation pieces.
**Dependency:** `@radix-ui/react-slot`

---

## `ui/button.jsx`
**Purpose:** Button with variants.
**Dependency:** `@radix-ui/react-slot`, `class-variance-authority`
**Exports:** `Button`, `buttonVariants`

---

## `ui/calendar.jsx`
**Purpose:** Calendar picker.
**Dependency:** `react-day-picker`
**Exports:** `Calendar`

---

## `ui/card.jsx`
**Purpose:** Card layout helpers.
**Dependency:** none (plain React + `cn`)

---

## `ui/carousel.jsx`
**Purpose:** Carousel/slider.
**Dependency:** `embla-carousel-react`

---

## `ui/checkbox.jsx`
**Purpose:** Checkbox input.
**Dependency:** `@radix-ui/react-checkbox`

---

## `ui/collapsible.jsx`
**Purpose:** Collapsible sections.
**Dependency:** `@radix-ui/react-collapsible`

---

## `ui/command.jsx`
**Purpose:** Command palette UI.
**Dependency:** `cmdk`

---

## `ui/context-menu.jsx`
**Purpose:** Right-click context menu.
**Dependency:** `@radix-ui/react-context-menu`

---

## `ui/dialog.jsx`
**Purpose:** Modal dialog.
**Dependency:** `@radix-ui/react-dialog`

---

## `ui/drawer.jsx`
**Purpose:** Bottom sheet drawer.
**Dependency:** `vaul`

---

## `ui/dropdown-menu.jsx`
**Purpose:** Dropdown menu.
**Dependency:** `@radix-ui/react-dropdown-menu`

---

## `ui/form.jsx`
**Purpose:** Form helpers.
**Dependency:** `react-hook-form`, `@radix-ui/react-slot`

---

## `ui/hover-card.jsx`
**Purpose:** Hover card popup.
**Dependency:** `@radix-ui/react-hover-card`

---

## `ui/input-otp.jsx`
**Purpose:** OTP input.
**Dependency:** `input-otp`

---

## `ui/input.jsx`
**Purpose:** Styled input.
**Dependency:** none

---

## `ui/label.jsx`
**Purpose:** Form label.
**Dependency:** `@radix-ui/react-label`

---

## `ui/menubar.jsx`
**Purpose:** Menubar UI.
**Dependency:** `@radix-ui/react-menubar`

---

## `ui/navigation-menu.jsx`
**Purpose:** Navigation menu.
**Dependency:** `@radix-ui/react-navigation-menu`

---

## `ui/pagination.jsx`
**Purpose:** Pagination UI.

---

## `ui/popover.jsx`
**Purpose:** Popover UI.
**Dependency:** `@radix-ui/react-popover`

---

## `ui/progress.jsx`
**Purpose:** Progress bar.
**Dependency:** `@radix-ui/react-progress`

---

## `ui/radio-group.jsx`
**Purpose:** Radio group input.
**Dependency:** `@radix-ui/react-radio-group`

---

## `ui/resizable.jsx`
**Purpose:** Resizable panels.
**Dependency:** `react-resizable-panels`

---

## `ui/scroll-area.jsx`
**Purpose:** Scrollable area + scrollbar.
**Dependency:** `@radix-ui/react-scroll-area`

---

## `ui/select.jsx`
**Purpose:** Select dropdown.
**Dependency:** `@radix-ui/react-select`

---

## `ui/separator.jsx`
**Purpose:** Separator line.
**Dependency:** `@radix-ui/react-separator`

---

## `ui/sheet.jsx`
**Purpose:** Sheet (dialog-based) panel.
**Dependency:** `@radix-ui/react-dialog`

---

## `ui/skeleton.jsx`
**Purpose:** Loading skeleton block.

---

## `ui/slider.jsx`
**Purpose:** Slider input.
**Dependency:** `@radix-ui/react-slider`

---

## `ui/sonner.jsx`
**Purpose:** Sonner toaster wrapper.
**Dependency:** `sonner`, `next-themes`

---

## `ui/switch.jsx`
**Purpose:** Switch input.
**Dependency:** `@radix-ui/react-switch`

---

## `ui/table.jsx`
**Purpose:** Table layout helpers.

---

## `ui/tabs.jsx`
**Purpose:** Tabs UI.
**Dependency:** `@radix-ui/react-tabs`

---

## `ui/textarea.jsx`
**Purpose:** Styled textarea.

---

## `ui/toast.jsx`
**Purpose:** Toast primitives.
**Dependency:** `@radix-ui/react-toast`

---

## `ui/toaster.jsx`
**Purpose:** Toast renderer component.
**Dependency:** `useToast` hook (note: `@/hooks/use-toast` is not present in this Next app snapshot)

---

## `ui/toggle-group.jsx`
**Purpose:** Toggle group.
**Dependency:** `@radix-ui/react-toggle-group`

---

## `ui/toggle.jsx`
**Purpose:** Toggle button.
**Dependency:** `@radix-ui/react-toggle`

---

## `ui/tooltip.jsx`
**Purpose:** Tooltip.
**Dependency:** `@radix-ui/react-tooltip`
