# ASTRA — Your Journey Through the Cosmos

## Scope and implementation approach

Build the requested BR-SOLAR experience as a single Next.js 16 App Router site with real document-order HTML layered over one fixed WebGL canvas. The implementation will keep one non-reactive journey timeline (`journey.t` / `journey.ts`) as the source of truth for Lenis scroll, camera rig interpolation, shader uniforms, HUD state, and DOM chapter progress. Chapters will be measured from their actual DOM sections so flow chapters can grow naturally while stage chapters pin the cosmic viewport.

The project will use the requested TypeScript/React/Three.js stack: strict TypeScript 5.9, React 19, Three.js 0.186, React Three Fiber 9, drei 10, postprocessing, GSAP 3.15 with ScrollTrigger and @gsap/react, Lenis 1.3, Zustand 5, Tailwind CSS v4 via @tailwindcss/postcss, and next/font/google with Instrument Serif, Geist, and Geist Mono. The managed server capability is enabled only for the consultation webhook route; the site will not require a database.

The visual world will be procedural only. Planet materials, stars, dust, numerals, nebula billboards, the galaxy, black-hole lensing, orbit/ring instruments, celestial grid and journey trail will be built from geometry, point sprites, instancing and GLSL shader modules. No image, model, texture, or video asset will replace the requested 3D/shader systems.

## Design direction

Three candidate directions were considered:

- **Editorial astronomical instrument** — probability 0.07; precise observatory markings, deep-space black, warm stellar white and a single solar amber accent.
- **Neo-mystic archive** — probability 0.06; ceremonial typography and antique chart language with violet spectral color.
- **Luxury sci-fi observatory** — probability 0.05; high-contrast black, polished metal neutrals and electric blue navigation cues.

Chosen direction: **Editorial astronomical instrument**.

### Design Movement

A restrained blend of Swiss editorial design and 1960s planetarium instrumentation: large literary display type, calibrated mono labels, sparse UI and a deep, almost-black sky that makes procedural light feel physical.

### Core Principles

1. **The instrument is the interface:** labels, arcs, coordinates and progress marks explain motion without competing with the world.
2. **Scale creates wonder:** copy stays quiet and offset while the camera carries the emotional arc from immensity to personal meaning.
3. **Every light has a job:** solar amber marks origin, pale blue marks navigation, and white-violet marks discovery.
4. **Editorial restraint:** no decorative sections beyond the requested journey chapters, legal pages and consultation flow.

### Color Philosophy

The base is near-black space (`#050608`) with charcoal panels and a blue-black atmospheric range. Warm solar amber (`#F3B562`) owns ASTRA and the origin moments; glacial white (`#E8EBF3`) carries legibility; muted violet-blue (`#9CA7D8`) marks constellation and numerology discovery. Accents stay rare so shader glow and the line-of-light finale remain the visual climax.

### Layout Paradigm

A vertically measured scroll score, not a conventional card grid: pinned full-viewport stages alternate with content-led flow chapters. Copy enters as a precise editorial annotation beside the camera's moving subject. Flow chapters use asymmetrical instrument panels and a birth-chart reading surface.

### Signature Elements

- A fine circular instrument ring that draws itself around Earth and returns as the birth-chart motif.
- A mono HUD with chapter label, phase, journey progress and transient celestial coordinates.
- One continuous thread of light that travels through the world and collapses to the finale point.

### Interaction Philosophy

Scrolling is the primary input and must feel like piloting one camera through one world. Pointer motion subtly shifts HUD/camera parallax. Buttons and fields are calm, magnetic and keyboard-accessible; hovering a celestial target acknowledges it without adding game-like chrome. The date-of-birth interaction changes the numerology readout without interrupting the route.

### Animation

Use GSAP/ScrollTrigger and Lenis for choreography while keeping the render loop independent of React. Text uses restrained split-line/word/character entrances with fade, blur and tracking changes; shader systems ease through journey-time windows rather than hard scene cuts. The Sun boils continuously, stars breathe subtly, constellation strokes draw in sequence, numerals condense from points, the black-hole accretion disk bends light, and the final trail contracts to one point. Respect reduced-motion preferences with a stable, low-motion route and visible HTML copy.

### Typography System

Instrument Serif is the display voice for ASTRA, chapter headlines, numerals and the final line. Geist is the body/UI sans. Geist Mono is reserved for coordinates, phase labels, navigation metadata and form microcopy. Display type is large and airy; body copy is narrow and readable; mono labels are uppercase, tracked and compact.

### Brand Essence

ASTRA is a guided cosmic reading for people who want astrology and numerology to feel spatial, reflective and exact rather than generic. Personality: **observant, luminous, intimate**.

### Brand Voice

Headlines are brief, declarative and quietly poetic. CTAs are invitational rather than sales-driven. Example lines: “Find the pattern you arrived with.” and “Let the sky put your beginning in order.”

### Wordmark & Logo

Use ASTRA as a custom editorial wordmark treatment with generous tracking and a small calibrated four-point star/solar mark, not a default text logo. The same mark appears in the loading lockup, transparent navigation, metadata and finale.

### Signature Brand Color

Solar amber `#F3B562` is ASTRA's ownable color: the origin, the warm edge of the Sun and the final point of light.

## Page and journey structure

The page routes are `/`, `/privacy`, and `/terms`; APIs and assets are excluded from `public/manus-routes.json`. The home route contains exactly the requested chapters in this order: hero, solar, earth, outer, constellations, numerology, chart, nebula, blackhole, courses, consultation, finale. Hero and all stage chapters use pinned viewport sections; chart and courses are flow sections whose height is content-driven.

`src/lib/brand.ts` is the single source for ASTRA's name, wordmark, title, tagline, description, URL, email, locale, social links and legal links. `src/lib/journey.ts` owns the exact ChapterId, Phase, NavMode, `Chapter` model, chapter lengths, chapter lookup helpers and mutable shared journey state from the brief. `src/lib/math.ts` owns the deterministic interpolation, range, smoothstep, pulse, damp, PRNG, Gaussian sample and padding helpers. `src/lib/scroll.ts` owns measured section mapping, Lenis bridge, chapter travel and locking.

`src/lib/camera/keyframes.ts` will be the art-directed flight plan; `src/lib/camera/rig.ts` will interpolate position/look-at/FOV/roll/framing/shake. `src/data/world.ts` places the Sun, planets, constellation corridor, numerals, nebula, galaxy and black hole broadly down -Z. `src/data/constellations.ts`, `courses.ts`, `navigation.ts` hold declarative content. `src/lib/astro/*`, `src/lib/three/*`, `src/lib/numerology.ts`, `src/lib/quality.ts`, `src/lib/motion.ts`, `src/lib/labels.ts`, `src/lib/events.ts`, `src/lib/store.ts`, and `src/lib/audio.ts` isolate domain concerns.

## Component responsibilities

- `src/components/cosmic/CosmicExperience`: client-side composition of loader, navigation, canvas, HUD and document chapters.
- `CosmicCanvas`, `CosmicScene`, `ScrollController`: fixed canvas, R3F scene and measured scroll bridge.
- `Chapter`, `Beat`, `Kinetic`: stage/flow chapter wrappers and accessible motion copy.
- `Hud`, `ConstellationLabels`: chapter HUD, coordinate readout and constellation annotations.
- `src/components/three/*`: procedural scene primitives including camera/director, star/dust fields, solar system, Sun, Planet, constellations, numerology, nebula, galaxy, black hole, observatory, trail and effects.
- `src/components/sections/*`: exact journey copy and section-specific content, including Hero, SolarChapters, BodyCaption, DeepChapters, ChartChapter, CoursesChapter and Footer.
- `src/components/ui/*`: Loader, Navigation, CosmicCursor, CosmicButton, DateCoordinates, BirthChart, ReadingModules, CourseCard, ConsultationDialog and Document.
- `src/shaders/*`: reusable GLSL noise, stars, planet, particle, nebula and black-hole materials.

## Content and behavior

The solar route names the Sun, Mercury, Venus, Earth, Moon, Mars, Jupiter, ringed Saturn, Uranus and Neptune; slows over Earth while two graduated instrument rings draw around it; crosses the Moon and outer worlds; draws and brightens twelve zodiac constellations one by one; condenses nine numerals from points into a ring before one remains; takes a date of birth and reforms the numeral into the visitor's Life Path number; flies through glowing nebula gas and dark dust; approaches a ray-bent black hole with accretion disk and falls into darkness; emerges into a calm observatory sky with a faint celestial grid and guide star; and retreats to the full route line before the line collapses under “And it all started with you.”

The birth-chart UI will provide accessible date input, compute the Life Path number through `src/lib/numerology.ts`, and render the instrument-style chart/reading modules without making claims of medical, legal or financial advice. Consultation will use the server route `src/app/api/consultation/route.ts`; it forwards JSON to `CONSULTATION_WEBHOOK_URL` when configured and logs enquiries when it is not.

## Files and platform details

Create the requested `src/app` routes and metadata files, `src/components`, `src/shaders`, `src/lib`, `src/data`, `src/hooks`, `.env.example`, `public/manus-routes.json`, `package.json`, `tsconfig.json`, `next.config`, `postcss` configuration and the bundled `src/assets/InstrumentSerif-Regular.ttf` path expected by the share-card contract. Keep `.env` values out of source; the canonical URL reads `NEXT_PUBLIC_SITE_URL` with the localhost fallback.

Before the first dev-server start, configure the project runtime through `webdev.config`: read effective config, declare a Session-local port, register TypeScript diagnostics for this local Device, install project dependencies from the selected package manager/lockfile, and start one strict-port server bound to `127.0.0.1`. Validate with typecheck/build and the route manifest. For this complex implementation, run a read-only requirements/connection review after the first coherent build, fix confirmed issues, then checkpoint through the project's Managed Git without changing the user's separate Git repository or enabling publication automatically.

## Build workflow

1. Create the source tree, project metadata, content/data modules and procedural rendering systems in coherent batches.
2. Add the exact chapter/brand/timeline contracts first so all later scene systems share the same coordinate model.
3. Add the DOM experience and accessibility layer, then wire the R3F scene and shader uniforms to the shared journey time.
4. Add the date-of-birth reading, consultation route and metadata/legal pages.
5. Install dependencies, register diagnostics, typecheck, build and start Preview on the declared loopback port.
6. Compare the implementation against the prompt's exact stack, chapter order, lengths, labels, routes and no-assets constraint; fix confirmed issues.
7. Use Managed Git for a checkpoint only after checks pass. Publication is separate and will not be enabled without an explicit request.
