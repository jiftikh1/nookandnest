# Interior Design Studio — AI Client Portal
## Project Specification & Build Plan

> Import this file into a new Claude Code session and say:
> **"Read PROJECT_PLAN.md and start building Phase 1"**

---

## 0. Existing Work — DO NOT Rebuild From Scratch

Two working prototypes already exist in this folder. **Use these as the direct source for the Next.js build — do not redesign from scratch.**

---

### Existing Website → `existing-website.html`
**Source:** `/Users/jalal/Interior/existing-website.html`
**Brand name:** Elara Interiors
**Technology:** Single HTML file (HTML + embedded CSS + vanilla JS)

**Sections already built (convert each to a Next.js page/component):**
| Section | Convert to |
|---|---|
| Navbar (fixed, scroll effect, mobile hamburger) | `components/layout/PublicNav.tsx` |
| Hero (grid layout, stats counter animation) | `components/public/Hero.tsx` |
| About (2-col, image + text) | `components/public/About.tsx` |
| Services (3-col card grid with hover) | `components/public/Services.tsx` |
| Portfolio (filterable grid + lightbox) | `components/public/Portfolio.tsx` |
| Process (4-step dark section) | `components/public/Process.tsx` |
| Testimonials (3-col cards) | `components/public/Testimonials.tsx` |
| CTA banner | `components/public/CTA.tsx` |
| Contact (form + info) | `components/public/Contact.tsx` |
| Footer (4-col grid) | `components/layout/Footer.tsx` |

**Design tokens to extract into Tailwind config:**
```
--color-bg:           #FAF8F5   → cream background
--color-dark:         #1A1A1A   → primary dark
--color-accent:       #8B7355   → brand brown/gold
--color-accent-light: #C4A882   → lighter gold
--color-text:         #4A4A4A   → body text
--color-text-light:   #7A7A7A   → muted text
--color-cream:        #F0EDE8   → section background
--color-line:         #E0DCD6   → borders/dividers
Font heading: 'Playfair Display' (or unify with Cormorant Garamond from portal)
Font body:    'Inter'
```

---

### Existing Client Portal → `existing-portal/`
**Source:** `/Users/jalal/Interior/existing-portal/`
**Files:** `index.html`, `style.css`, `app.js`, `data/clients.json`
**Technology:** HTML + CSS + vanilla JS, data-driven via JSON

**Features already built (convert each to a Next.js component):**
| Feature | Convert to |
|---|---|
| Login screen (access code → client lookup) | `app/(auth)/login/page.tsx` + Supabase Auth |
| Portal header (fixed, nav links, logout) | `components/layout/ClientNav.tsx` |
| Hero section (project name, label, subtitle) | `components/client/ProjectHero.tsx` |
| Mood board (editorial CSS grid, 12-col) | `components/client/MoodBoardView.tsx` |
| Product cards (image, brand, name, price, link) | `components/client/ProductCard.tsx` |
| Color palette (swatches with name + paint code) | `components/client/PaletteView.tsx` |
| Portal footer | already in `components/layout/Footer.tsx` |

**Data structure from `clients.json` → already matches Prisma schema:**
```
client.id          → User.id
client.name        → Project.name
client.label       → Project.description
client.moodboard[] → MoodBoardItem.imageUrl[]
client.products[]  → Product (name, brand, price, image, notes, link)
client.palette[]   → (add ColorPalette model or store as JSON on Project)
client.password    → handled by Supabase Auth (not plaintext)
```

**Design tokens (already unified with website):**
```
--cream:    #FAF8F5   ← same as website --color-bg
--charcoal: #1C1C1A   ← same as website --color-dark
--gold:     #C4A882   ← same as website --color-accent-light
Font serif: 'Cormorant Garamond' (consider unifying with Playfair Display)
Font sans:  'Inter'
```

---

### Design System Unification

Both projects share the same color palette. When building the Next.js app, use this unified `tailwind.config.ts`:

```ts
colors: {
  cream:   '#FAF8F5',
  dark:    '#1A1A1A',
  accent:  '#8B7355',
  gold:    '#C4A882',
  text:    '#4A4A4A',
  muted:   '#7A7A7A',
  line:    '#E0DCD6',
  section: '#F0EDE8',
}
```

**Serif font decision:** Use **Cormorant Garamond** throughout (more refined for a luxury studio brand). Replace Playfair Display in the website conversion.

---

## 1. Project Overview

A full-stack web application for an interior design studio with three distinct areas:

1. **Public Website** — Brand landing page, services, contact
2. **Client Portal** — Clients log in and view their project designs, mood boards, product lists, and AI-generated photorealistic room renders
3. **Designer Portal** — Interior designers manage client projects, upload room photos, describe design ideas, and trigger AI generation of photorealistic room visualizations

### Core AI Flow
```
Designer uploads room photo + describes changes (wall color, curtains, furniture)
                    ↓
        Claude Vision analyzes the room
        (style, layout, lighting, existing elements)
                    ↓
        Claude generates a detailed image prompt
        tailored to the room + design instructions
                    ↓
        FLUX.1 via Replicate renders photorealistic result
                    ↓
        Designer reviews → approves → publishes to client portal
```

---

## 2. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, API routes, file-based routing |
| Language | TypeScript | Type safety across all layers |
| Styling | Tailwind CSS + shadcn/ui | Fast, polished UI |
| Database | PostgreSQL via Supabase | Free hosted DB + built-in auth + storage |
| ORM | Prisma | Type-safe DB queries, easy migrations |
| Authentication | Supabase Auth | Handles sessions, supports roles |
| File Storage | Supabase Storage | S3-compatible, free tier |
| AI — Vision | Claude API (claude-sonnet-4-6) | Analyze room photos and catalog images |
| AI — Generation | FLUX.1-schnell via Replicate | Photorealistic room rendering at $0.003/image |
| Deployment | Vercel | Zero-config Next.js hosting |

---

## 3. Environment Variables Required

Create a `.env.local` file at the project root with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database
DATABASE_URL=your_supabase_postgresql_connection_string

# Claude API (Anthropic)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Replicate (FLUX image generation)
REPLICATE_API_TOKEN=your_replicate_api_token

# App
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Where to get these:**
- Supabase: https://supabase.com → create project → Settings → API
- Anthropic: https://console.anthropic.com → API Keys
- Replicate: https://replicate.com → Account → API Tokens

---

## 4. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  CLIENT
  DESIGNER
  ADMIN
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum RenderStatus {
  PENDING
  GENERATING
  COMPLETED
  FAILED
  PUBLISHED
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  role          Role      @default(CLIENT)
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  clientProjects  Project[] @relation("ClientProjects")
  designerProjects Project[] @relation("DesignerProjects")
}

model Project {
  id          String        @id @default(cuid())
  name        String
  description String?
  status      ProjectStatus @default(ACTIVE)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Relations
  clientId    String
  client      User          @relation("ClientProjects", fields: [clientId], references: [id])
  designerId  String
  designer    User          @relation("DesignerProjects", fields: [designerId], references: [id])

  moodBoards  MoodBoard[]
  products    Product[]
  rooms       Room[]
  updates     ProjectUpdate[]
}

model MoodBoard {
  id          String   @id @default(cuid())
  title       String
  description String?
  order       Int      @default(0)
  createdAt   DateTime @default(now())

  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  items       MoodBoardItem[]
}

model MoodBoardItem {
  id          String   @id @default(cuid())
  imageUrl    String
  caption     String?
  order       Int      @default(0)

  moodBoardId String
  moodBoard   MoodBoard @relation(fields: [moodBoardId], references: [id], onDelete: Cascade)
}

model Product {
  id          String   @id @default(cuid())
  name        String
  supplier    String?
  price       Float?
  currency    String   @default("USD")
  productUrl  String?
  imageUrl    String?
  category    String?
  notes       String?
  status      String   @default("recommended") // recommended | ordered | installed
  createdAt   DateTime @default(now())

  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model Room {
  id              String   @id @default(cuid())
  name            String   // e.g. "Living Room", "Master Bedroom"
  originalPhotoUrl String?  // uploaded room photo
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  projectId       String
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  renders         RoomRender[]
}

model RoomRender {
  id              String       @id @default(cuid())
  status          RenderStatus @default(PENDING)

  // Designer inputs
  wallColor       String?      // hex color or color name
  wallColorName   String?      // e.g. "Warm White SW7012"
  curtainStyle    String?      // e.g. "floor-length linen drapes"
  furnitureStyle  String?      // e.g. "mid-century modern"
  designNotes     String?      // free text from designer
  referenceUrls   String[]     // reference/catalog image URLs

  // AI processing
  claudePrompt    String?      // prompt Claude generated
  replicateJobId  String?      // Replicate prediction ID

  // Output
  generatedImageUrl String?    // final rendered image URL
  isPublished     Boolean      @default(false)
  publishedAt     DateTime?

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  roomId          String
  room            Room         @relation(fields: [roomId], references: [id], onDelete: Cascade)
}

model ProjectUpdate {
  id        String   @id @default(cuid())
  title     String
  body      String
  createdAt DateTime @default(now())

  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

---

## 5. Project File Structure

```
/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (public)/                    # Public website
│   │   │   ├── page.tsx                 # Landing page
│   │   │   ├── about/page.tsx
│   │   │   └── contact/page.tsx
│   │   │
│   │   ├── (auth)/                      # Auth pages
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── client/                      # Client portal
│   │   │   ├── layout.tsx               # Client nav + auth guard
│   │   │   ├── dashboard/page.tsx       # Project overview
│   │   │   ├── projects/
│   │   │   │   └── [projectId]/
│   │   │   │       ├── page.tsx         # Project home
│   │   │   │       ├── mood-board/page.tsx
│   │   │   │       ├── products/page.tsx
│   │   │   │       └── designs/page.tsx # Renders gallery
│   │   │
│   │   ├── designer/                    # Designer portal
│   │   │   ├── layout.tsx               # Designer nav + auth guard
│   │   │   ├── dashboard/page.tsx       # All projects overview
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx             # Project list
│   │   │   │   ├── new/page.tsx         # Create project
│   │   │   │   └── [projectId]/
│   │   │   │       ├── page.tsx         # Project detail
│   │   │   │       ├── mood-board/page.tsx
│   │   │   │       ├── products/page.tsx
│   │   │   │       └── rooms/
│   │   │   │           ├── page.tsx
│   │   │   │           └── [roomId]/
│   │   │   │               ├── page.tsx        # Room + renders
│   │   │   │               └── generate/page.tsx # AI generation form
│   │   │
│   │   └── api/
│   │       ├── auth/[...supabase]/route.ts
│   │       ├── projects/
│   │       │   ├── route.ts             # GET list, POST create
│   │       │   └── [projectId]/route.ts # GET, PATCH, DELETE
│   │       ├── rooms/
│   │       │   ├── route.ts
│   │       │   └── [roomId]/
│   │       │       └── renders/
│   │       │           └── route.ts
│   │       ├── renders/
│   │       │   └── [renderId]/
│   │       │       ├── generate/route.ts  # Trigger AI generation
│   │       │       └── publish/route.ts   # Publish to client
│   │       └── upload/route.ts            # Image upload to Supabase
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── ClientNav.tsx
│   │   │   ├── DesignerNav.tsx
│   │   │   └── PublicNav.tsx
│   │   ├── client/
│   │   │   ├── MoodBoardView.tsx
│   │   │   ├── ProductList.tsx
│   │   │   ├── DesignGallery.tsx
│   │   │   └── ImageLightbox.tsx
│   │   └── designer/
│   │       ├── ProjectCard.tsx
│   │       ├── RoomUploader.tsx
│   │       ├── GenerateForm.tsx         # The AI generation form
│   │       ├── RenderCard.tsx
│   │       └── PublishButton.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts                    # Prisma client singleton
│   │   ├── supabase.ts                  # Supabase client
│   │   ├── claude.ts                    # Claude Vision + prompt generation
│   │   ├── replicate.ts                 # FLUX image generation
│   │   └── utils.ts
│   │
│   ├── types/
│   │   └── index.ts                     # Shared TypeScript types
│   │
│   └── middleware.ts                    # Route protection by role
│
├── public/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 6. Build Phases

### Phase 1 — Foundation
**Goal:** Working auth with client/designer roles, database connected

Tasks:
- [ ] Scaffold Next.js 14 project with TypeScript + Tailwind + shadcn/ui
- [ ] Set up Supabase project and connect to Prisma
- [ ] Run initial migration with full schema
- [ ] Set up Supabase Auth (email/password)
- [ ] Create middleware for route protection (client vs designer vs public)
- [ ] Build login page
- [ ] Create Prisma client singleton (`src/lib/prisma.ts`)

Completion check: A designer can log in and land on `/designer/dashboard`. A client can log in and land on `/client/dashboard`. Unauthenticated users are redirected to `/login`.

---

### Phase 2 — Public Website
**Goal:** Professional landing page for the studio

Tasks:
- [ ] Hero section with studio branding
- [ ] Services section
- [ ] Portfolio/example work section (static for now)
- [ ] Contact form
- [ ] Navigation with Login button
- [ ] Mobile responsive

---

### Phase 3 — Designer Portal
**Goal:** Designers can manage projects, clients, rooms, and content

Tasks:
- [ ] Designer dashboard (list all projects, status overview)
- [ ] Create/edit project form (assign client, name, description)
- [ ] Project detail page (tabs: Rooms, Mood Board, Products, Updates)
- [ ] Mood board manager (upload images, add captions, reorder)
- [ ] Product list manager (add/edit/delete products with images)
- [ ] Room manager (create rooms, upload original room photo)
- [ ] Image upload API route → Supabase Storage
- [ ] Project updates (post text updates visible to client)

---

### Phase 4 — Client Portal
**Goal:** Clients can view their project beautifully

Tasks:
- [ ] Client dashboard (their assigned project)
- [ ] Mood board view (image grid with lightbox)
- [ ] Product list view (card layout with links to buy)
- [ ] Designs gallery (published renders only, before/after slider)
- [ ] Project updates feed
- [ ] Mobile responsive throughout

---

### Phase 5 — AI Room Generation
**Goal:** Designer uploads room + describes changes → photorealistic render

Tasks:
- [ ] `src/lib/claude.ts` — Claude Vision integration
  - Analyze room photo (identify style, colors, layout)
  - Analyze reference/catalog images
  - Build detailed FLUX prompt from inputs
- [ ] `src/lib/replicate.ts` — FLUX.1-schnell integration
  - Submit prediction to Replicate
  - Poll for completion
  - Store result URL in database
- [ ] Generation form UI (`designer/rooms/[roomId]/generate/page.tsx`)
  - Wall color picker (hex + name input)
  - Curtain style selector
  - Furniture style description
  - Reference image upload (catalog photos)
  - Free-text design notes
  - "Generate" button with loading state
- [ ] Render management (list renders, preview, delete)
- [ ] Publish button → sets `isPublished: true`, appears in client portal
- [ ] Before/after image slider component for client portal

---

### Phase 6 — Polish + Deploy
**Goal:** Production-ready, deployed on Vercel

Tasks:
- [ ] Loading skeletons on all data-fetching pages
- [ ] Empty states for all lists/galleries
- [ ] Toast notifications for all actions (save, upload, generate, publish)
- [ ] Error boundaries
- [ ] Mobile navigation (hamburger menu)
- [ ] Image optimization (Next.js Image component throughout)
- [ ] Vercel deployment
- [ ] Custom domain setup
- [ ] Environment variables in Vercel dashboard

---

## 7. Key API Implementations

### Claude Vision — Room Analysis (`src/lib/claude.ts`)

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function analyzeRoomAndGeneratePrompt({
  roomPhotoUrl,
  wallColor,
  wallColorName,
  curtainStyle,
  furnitureStyle,
  designNotes,
  referenceImageUrls,
}: {
  roomPhotoUrl: string;
  wallColor?: string;
  wallColorName?: string;
  curtainStyle?: string;
  furnitureStyle?: string;
  designNotes?: string;
  referenceImageUrls?: string[];
}): Promise<string> {

  // Build image content array
  const imageContent: Anthropic.ImageBlockParam[] = [
    {
      type: "image",
      source: { type: "url", url: roomPhotoUrl },
    },
    ...(referenceImageUrls?.map((url) => ({
      type: "image" as const,
      source: { type: "url" as const, url },
    })) ?? []),
  ];

  const designRequest = [
    wallColorName && `Wall color: ${wallColorName} (${wallColor})`,
    curtainStyle && `Curtains/drapes: ${curtainStyle}`,
    furnitureStyle && `Furniture style: ${furnitureStyle}`,
    designNotes && `Additional notes: ${designNotes}`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          ...imageContent,
          {
            type: "text",
            text: `You are an expert interior design prompt engineer.

Analyze this room photo (and any reference images provided) and create a detailed, photorealistic image generation prompt for FLUX.1.

The designer wants to make these changes:
${designRequest}

Write a single detailed prompt (200-300 words) that:
1. Preserves the room's exact layout, dimensions, windows, doors, and architectural features
2. Applies the requested design changes precisely
3. Specifies lighting conditions (natural + artificial), time of day
4. Describes materials, textures, and finishes in detail
5. Maintains a photorealistic interior photography style
6. References the style of high-end interior design magazines like Architectural Digest

Output ONLY the prompt text, nothing else.`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude did not return a text response");
  }

  return textBlock.text;
}
```

### Replicate — FLUX Image Generation (`src/lib/replicate.ts`)

```typescript
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function generateRoomRender({
  prompt,
  roomPhotoUrl,
}: {
  prompt: string;
  roomPhotoUrl: string;
}): Promise<string> {

  const output = await replicate.run(
    "black-forest-labs/flux-1.1-pro",
    {
      input: {
        prompt,
        image: roomPhotoUrl,           // use room as base image
        prompt_strength: 0.75,         // how much to change vs preserve
        num_inference_steps: 28,
        guidance_scale: 3.5,
        output_format: "webp",
        output_quality: 90,
      },
    }
  );

  // output is a URL string or array
  const imageUrl = Array.isArray(output) ? output[0] : output;

  if (typeof imageUrl !== "string") {
    throw new Error("Replicate did not return an image URL");
  }

  return imageUrl;
}
```

### Generate API Route (`src/app/api/renders/[renderId]/generate/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeRoomAndGeneratePrompt } from "@/lib/claude";
import { generateRoomRender } from "@/lib/replicate";

export async function POST(
  req: NextRequest,
  { params }: { params: { renderId: string } }
) {
  try {
    const render = await prisma.roomRender.findUnique({
      where: { id: params.renderId },
      include: { room: true },
    });

    if (!render || !render.room.originalPhotoUrl) {
      return NextResponse.json({ error: "Render or room photo not found" }, { status: 404 });
    }

    // Update status to generating
    await prisma.roomRender.update({
      where: { id: render.id },
      data: { status: "GENERATING" },
    });

    // Step 1: Claude analyzes room and generates prompt
    const claudePrompt = await analyzeRoomAndGeneratePrompt({
      roomPhotoUrl: render.room.originalPhotoUrl,
      wallColor: render.wallColor ?? undefined,
      wallColorName: render.wallColorName ?? undefined,
      curtainStyle: render.curtainStyle ?? undefined,
      furnitureStyle: render.furnitureStyle ?? undefined,
      designNotes: render.designNotes ?? undefined,
      referenceImageUrls: render.referenceUrls,
    });

    // Step 2: FLUX generates the image
    const generatedImageUrl = await generateRoomRender({
      prompt: claudePrompt,
      roomPhotoUrl: render.room.originalPhotoUrl,
    });

    // Step 3: Save results
    await prisma.roomRender.update({
      where: { id: render.id },
      data: {
        status: "COMPLETED",
        claudePrompt,
        generatedImageUrl,
      },
    });

    return NextResponse.json({ success: true, imageUrl: generatedImageUrl });

  } catch (error) {
    await prisma.roomRender.update({
      where: { id: params.renderId },
      data: { status: "FAILED" },
    });
    console.error("Generation failed:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
```

---

## 8. Packages to Install

```bash
# Core
npx create-next-app@latest interior-studio --typescript --tailwind --app --src-dir

# Database
npm install prisma @prisma/client
npm install @supabase/supabase-js @supabase/ssr

# UI
npx shadcn@latest init
npx shadcn@latest add button card input label badge dialog sheet tabs toast

# AI
npm install @anthropic-ai/sdk
npm install replicate

# Utilities
npm install clsx tailwind-merge
npm install react-dropzone          # file uploads
npm install react-image-comparison  # before/after slider
npm install sonner                  # toast notifications
```

---

## 9. Supabase Storage Buckets

Create these buckets in the Supabase dashboard (Storage section):

| Bucket Name | Public | Purpose |
|---|---|---|
| `room-photos` | Yes | Original room photos uploaded by designer |
| `mood-boards` | Yes | Mood board images |
| `product-images` | Yes | Product/furniture images |
| `renders` | Yes | AI-generated room renders |
| `references` | Yes | Reference/catalog images from designer |

Set all buckets to **public** so images load without auth tokens.

---

## 10. User Roles & Access Control

| Route | CLIENT | DESIGNER | ADMIN |
|---|---|---|---|
| `/` (public site) | ✅ | ✅ | ✅ |
| `/login` | ✅ | ✅ | ✅ |
| `/client/*` | Own projects only | ❌ | ✅ |
| `/designer/*` | ❌ | Own projects only | ✅ |
| `/api/renders/*/generate` | ❌ | ✅ | ✅ |
| `/api/renders/*/publish` | ❌ | ✅ | ✅ |

Implement in `src/middleware.ts` using Supabase session + user role from DB.

---

## 11. Token & Cost Summary

| Item | Estimate |
|---|---|
| **To build (Claude Code)** | ~160K–225K tokens (~$8–20) |
| **Per AI render (runtime)** | Claude Vision: ~$0.01–0.02 + FLUX: $0.003 = ~$0.013–0.023 |
| **Monthly running cost (100 renders/mo)** | ~$5–10 in API fees |
| **Supabase** | Free tier (up to 500MB storage, 2GB bandwidth) |
| **Vercel** | Free tier |

---

## 12. How to Start a New Build Session

Paste this into a new Claude Code session:

```
Read the file PROJECT_PLAN.md in my project directory.

I want to build this interior design studio app.
Start with Phase 1:
- Scaffold a Next.js 14 project with TypeScript, Tailwind CSS, and shadcn/ui
- Set up Prisma with the schema defined in the plan
- Configure Supabase Auth with client and designer roles
- Build the login page
- Set up middleware for role-based route protection

Ask me for any environment variables or credentials you need.
```

---

*Document version: 1.0 — Created February 2026*
*Project: Interior Design Studio — AI Client Portal*
