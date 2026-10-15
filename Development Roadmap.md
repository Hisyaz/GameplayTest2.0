# Development Roadmap: Next-Gen Lightweight Football Simulation

## Vision & Architecture Principles
Build an authentic, tactical, and fluid football experience that runs at a solid 60 FPS even on low-end and older mobile devices.
- **Authentic Football Realism (Zero Magic, Zero Superpowers)**: Pure grounded, tactile physical football. No giant glowing sci-fi shields, neon magical forcefields, or arcade superpowers. Ball protection is achieved purely through realistic physical body leverage, arm placement, planted studs, and a low center of gravity.
- **Maximum Compatibility & Locked 60 FPS on Budget Phones**: Optimized to run silky-smooth on $50 budget Android devices, older iPhones, and low-spec hardware without garbage collection spikes or thermal throttling. Zero bulky 3D meshes; all visual features (cinematics, replays, player ratings, video ref) are built using lightweight procedural HTML5 Canvas 2D math and pre-allocated zero-allocation buffers.
- **32-Bit Arcade Console Design Constitution**: Pure late-90s / early-2000s 32-bit console visual identity (metallic console gradients, dithered shading, beveled arcade borders, tactile chiseled buttons).
- **Mobile-First UI Without Clutter**: Console-style layouts avoiding vertical/horizontal scrolling on mobile devices and desktop displays; single-screen accessibility with intuitive toggles.
- **Realistic Ball & Match Flow Physics**: Sub-millisecond deterministic game loop with authentic trajectory physics, official IFAB match regulation timing (45m halves, stoppage time calculation, intelligent half/full time whistle logic, extra time & penalty shootouts).
- **Daily Token Budget Calibration**: Strictly 1 Phase = 1 Day's worth of Google AI Studio tokens (~600k–900k tokens over focused engineering turns), guaranteeing a 100% compiled and playable build at the end of each session.

---

# Completed Roadmap Archive (Summary of Phases 1 – 18)

Below is the verified summary of all completed development milestones across the initial development lifecycle:

| Phase | Title | Core Technical Accomplishments |
| :---: | :--- | :--- |
| **Phase 0.5** | **Match Rules, Foul Attribution & Modern Pressing** | Symmetrical foul recognition; strict discrimination between attacking penalty box (penalties) vs. defending box (defensive free kicks); zero friendly-fire tackles; 2026 pressing triggers (backward-facing, sideline traps, loose-ball contest). |
| **Phase 0.6** | **Driven Through-Balls & Camera Suite** | Driven ground through-balls (`W`) with forward leading space vector; delicate chipped long pass over defensive lines (`E + W`); swerving pass (`Q + W`); 3-mode broadcast camera suite (Pitch auto-framing, Ball lock, Player lock). |
| **Phase 1** | **Ball Out-of-Bounds & Set-Piece Attribution** | Robust previous-vs-current segment raycasting distinguishing touchline exits (throw-ins) from endline exits; strict last-touch attribution (attacking touch $\rightarrow$ goal kick; defending deflection/keeper save $\rightarrow$ corner kick). |
| **Phase 2** | **Passing, Shooting & Skill-Chip Delivery** | 4-button canonical control scheme (Short pass `S`, Lead pass `W`, Box cross `D`, Shot `A`); `E` chip modifier suite for scoop chip shots, floating crosses, and lofted passes. |
| **Phase 3** | **Lowered Set-Piece Camera & Aiming Engine** | Immersive pitch-level lowered camera perspective for free kicks and penalties; target aiming reticle with elevation & bend dials; timing-based shot power meter; defensive wall jump duels. |
| **Phase 4** | **Dynamic Team AI, Pressing & Off-Ball Runs** | 2-man pressing traps (Hunter + Trap Closer + Cover Shadow); intelligent teammate support triangles and blindside runs; offside line tracking; zero-allocation mobile AI loops. |
| **Phase 5** | **Canonical Player Stats Architecture** | 18 outfield stats across 6 pillars (Pace, Stamina, Strength; Ball Control, Retention, Dribbling; Short Pass, Long Pass, Crossing; Shooting, Heading, Long Shots; Tackling, Sliding, Interceptions, Marking; Positioning, Composure, Reactions) + 7 Goalkeeper metrics (Saving, Reflexes, Handling, Positioning, Aerial Reach, 1v1, Distribution). |
| **Phase 6** | **Attribute Progression Tiers & Stat Breaks** | 4 canonical tiers (Amateur 40–69, Pro 70–84, Elite 85–94, Pinnacle 95–99) + Stat Break breakthrough traits (>99); duel resolution matrices for speed, dribbling vs. tackling, and aerial battles. |
| **Phase 7** | **Positional Hierarchy & Tactical Playstyles** | 3-tier hierarchy (Primary $\rightarrow$ Sub-Position $\rightarrow$ Playstyle); 16 distinct sub-positions; 28 specialized player playstyles (Poacher, Box-to-Box, Regista, Inverted Fullback, Libero, Sweeper GK, etc.). |
| **Phase 7.5** | **Controls & Ball State Machine Polish** | Progressive charge meter running alongside player cleats; dead-ball collision barriers; touch joystick calibration. |
| **Phase 8** | **Expressive Procedural Animations Suite** | Procedural animation state machine (dribbling cadence, body feints, driven laces strike, trivela, sliding toe poke, bullet header, diving volley, acrobatic GK saves). |
| **Phase 9** | **Scalable 3-Tier Graphics & Retro Filters** | Scalable pipeline (Performance, Balanced, High-End); Quad-Shadow floodlights; zero-lag hardware-accelerated CRT Arcade, VHS 1994, Neo-Geo 16-Bit, and Manga retro filters. |
| **Phase 9.5** | **AI Set-Piece Overhaul & Grounded Realism** | AI throw-in distribution; direct free kick tactical intelligence; subtle anti-magic ball shielding with zero forcefield graphics. |
| **Phase 10** | **Dynamic Stadiums & Match Atmosphere** | 3 stadium tiers (Monumental Grand Arena, Craven Heritage Ground, Ascenso Municipal); rendered city horizon; custom seat color modes; time-of-day lighting. |
| **Phase 11** | **Pitch Dimensions, Weather & Surface Physics** | IFAB pitch dimensions (Compact, Balanced, Expansive, Custom); turf puddles with ball hydroplaning; winter snow with red line markings and orange/yellow balls; Brazilian deep-box nets. |
| **Phase 12** | **Parametric Player Appearance Framework** | Zero-GC 120-byte player appearance contract (skin tones, hairstyles, facial hair, uniform fits, sleeve length, tattoos, physical body scaling 0.92–1.08). |
| **Phase 13** | **Multi-Tier Team Database & Selection Engine** | Drill-down team selection (Clubs, National, Special); randomizer roulette; 4 rating tiers (S, A, B, C); canonical set-piece role specialist assignments. |
| **Phase 13.5** | **Expanded Teams & All-Time Legends** | 2026 World Cup squads, historic South American clubs, Bogotá FC derby, and 7 All-Time Continental Dream Teams. |
| **Phase 14** | **Pre-Match Presentation & Modular Uniforms** | Split-screen presentation layout; 32-bit captain hero sprites; modular kit mixer (shirts, shorts, socks) with automatic anti-clash contrast engine. |
| **Phase 15** | **Dual-Pitch Tactical Game Plan Board** | Side-by-side tactical boards (desktop) and toggleable single pitch (mobile); OVR star ratings; live bench drag-and-drop substitutions; dedicated set-piece role picker. |
| **Phase 16** | **32-Bit Retro Aesthetic & Pitch Drag-and-Drop** | Compact jersey silhouette with squad numbers; interactive pitch drag-and-drop with live positional reclassification; 32-bit metallic console styling across all menus. |
| **Phase 16.5** | **Drop-Zone Grid & Overlap Disambiguation** | 3-tier mechanical pitch partition (ATT, MID, DEF, locked GK sanctuary); multi-role overlap popover (ST/SS, CM/CAM, CM/CDM, LM/LWB, CB/LIB); automatic reversion to 'Basic' playstyle on incompatible positions. |
| **Phase 17** | **Unified Pre-Match Hub & Atmosphere Suite** | 5-button bottom navigation bar (Uniform, Stadium, Tactics, Settings, Kick Off); 3 turf quality grades (Poor, Normal, Pristine); 7 lawn mowing designs; streamlined 3-button in-game pause hub. |
| **Phase 18** | **Mobile Optimization & GC Hardening** | Zero per-frame memory allocations; pre-allocated vector and particle pools; spatial collision partitioning; locked 60 FPS verified on budget smartphones. |

---

# New Development Roadmap: 32-Bit Tactical Simulation & AI Mastery

## Daily Token Budget Profile (1 Phase = 1 Day's Quota)
- **Bounded Engineering Scope**: Each sprint focuses on 1 to 3 designated modules.
- **Non-Breaking Invariant**: Every phase terminates in a fully compiling, zero-regression, playable build.
- **Console-Grade UI Invariant**: All screens follow pristine 32-bit retro styling with **ZERO vertical or horizontal scrolling** across mobile, tablets, and PC desktop viewports.
- **Budget Phone Performance Invariant**: All new systems (ratings, replays, cinematics, match flow state machines) run zero per-frame memory allocation, ensuring steady 60 FPS on $50 hardware.

---

## Phase 0: 32-Bit Console UI Transition, Zero-Scroll Game Plan, Broadcast HUD & Device Profiling [COMPLETED]
*Priority: Architecture Foundation, Zero-Scroll Viewport Constitution, Custom Formation Rules & Hardware Detection*  
*Daily Token Budget Profile: Scope: `src/components/TacticsModal.tsx`, `src/components/PitchCanvas.tsx`, `src/components/PreMatchPresentationModal.tsx`, `src/components/TeamSelectorModal.tsx`, `src/game/formations.ts`, `src/game/specialTeamsData.ts`, `src/App.tsx` | Target: ~750k tokens*

### 0.1 Zero-Scroll Game Plan & Pitch Scale Overhaul
- **Strict Single-Screen Viewport Fit (No Scrolling Anywhere)**:
  - Eliminate all vertical and horizontal page scrolling from the Game Plan / Tactics board on PC desktop, tablet, and mobile devices.
  - Scale down the pitch dimensions and jersey nodes dynamically using CSS `h-full`, `max-h-[calc(100vh-...)]`, and responsive aspect ratios so the tactical board, bench substitutes, team tactics panel, and navigation buttons fit comfortably on a single screen without requiring any mouse scroll or touch swipe.
  - Ensure all squad numbers, names, sub-positions, and attribute tags are crisp, high-contrast, and legible.
- **Authentic 32-Bit Aesthetic Refinement**:
  - Re-theme the Game Plan screen to match authentic 32-bit console UI (metallic steel/slate gradient panels, chiseled gold/cyan bevels, retro font styling, glowing LED status badges, tactile embossed action buttons).

### 0.2 Custom Formation Engine & Structural Validation Rules
- **Freeform Tactical Pitch Customization**:
  - Allow users to freely adjust and create custom formations by dragging and dropping outfield players across the pitch board.
- **Formation Integrity Rules & Enforcement**:
  - Every custom formation **MUST** satisfy the following canonical line minimums to be structurally valid:
    1. **Goalkeeper**: Exactly 1 GK (locked in sanctuary).
    2. **Defenders**: At least **2 Defenders** (`CB`, `LB`, `RB`, `LWB`, `RWB`, `LIB`).
    3. **Midfielders**: At least **2 Midfielders** (`CDM`, `CM`, `CAM`, `LM`, `RM`).
    4. **Attackers**: At least **1 Attacker** (`ST`, `SS`, `CF`, `LW`, `RW`).
  - **Dynamic Invalidation Banner**: If a player drags a lineup into an illegal structure (e.g. 1 defender or 0 attackers):
    - Display an amber/red retro warning: `"⚠️ INVALID FORMATION: Lineup requires at least 2 Defenders, 2 Midfielders, and 1 Attacker!"`
    - **Disable the `[ CONFIRM ]` / `[ PROCEED ]` button** with a locked indicator until the positional balance is restored.

### 0.3 Gameplay HUD & Mobile Controller Viewport Cleansing
- **Broadcast Clean Screen Mandate**:
  - Remove all redundant top navigation and debug buttons during live gameplay (`MATCHDAY`, `TACTICS`, and `GFC` buttons removed from top gameplay bar).
  - Clean top bar layout:
    - **Top-Left**: Broadcast Scoreboard (Home vs Away, score, match timer, team colors).
    - **Top-Right**: "DRAWSTAR TV" retro broadcast network logo.
    - All secondary match indicators (stoppage time, card alerts) must anchor cleanly below these two top elements.
- **Controller-Aware Viewport & Camera Center Offset**:
  - When the on-screen virtual touch controller is visible and solid, the active camera gameplay framing area is bounded strictly to the screen area **ABOVE** the controller overlay.
  - The center of camera focus must never be obscured or occluded beneath the bottom virtual pad or buttons.
- **Input Method Auto-Detection & Key Allocation Suggestions**:
  - On application startup (prior to team selection):
    - Detect current device profile, touch capability, keyboard availability, and connected Gamepads (`navigator.getGamepads()`).
    - **Keyboard / Controller Detected**: Display an automatic suggestion prompt showing recommended button allocations (e.g., Short Pass: `S` / `Cross`, Shoot: `A` / `Square`, Through Ball: `W` / `Triangle`, Long Pass: `D` / `Circle`).
    - Provide an instant toggle: **Hide On-Screen Controller Entirely** when hardware keyboard or joystick is active.
    - **Touchscreen / Mouse Detected**: Enable responsive on-screen virtual joystick and action buttons.
- **Hardware Performance Profiling & Graphic Quality Suggestion**:
  - Auto-benchmark device capacity (GPU renderer string, logical CPU cores, screen DPR, device memory) and suggest an optimal graphics preset:
    - **Performance**: Optimized for budget devices (flat turf, standard lighting, maximum FPS).
    - **Balanced**: Standard shadows and turf patterns.
    - **High**: Quad-shadow floodlights, retro CRT/scanline filtering, pitch detail.

### 0.4 Special Teams Canonical Formations, Starting XI, Substitutes & Playstyles
Align all 7 Special / Continental Dream Teams with their official historical rosters, tactical formations, managers, and philosophies:
1. **CLASSIC SOUTH AMERICA 🌎**: Mario Zagallo | 4-3-3 | Jogo Bonito | Mazurkiewicz GK; Carlos Alberto, Figueroa, Passarella, Nílton Santos; Falcão CDM, Gérson CM, Maradona CAM; Garrincha RW, Pelé SS (biased left), Romário ST. (Subs: Chilavert, Djalma Santos, Nasazzi, Domingos da Guia, Marzolini, Obdulio Varela, Cubillas, Valderrama, Zico, Jairzinho, Kempes).
2. **CLASSIC EUROPE 🇪🇺**: Bob Paisley | 4-4-2 | Counterattack | Yashin GK; Bergomi, Beckenbauer, Baresi, Krol; Rijkaard CDM, Luis Suárez CM, Matthews RM, Best LM; Cruyff SS, Van Basten ST. (Subs: Zoff, Vogts, Scirea, Moore, Brehme, Matthäus, Charlton, Gento, Kopa, Gullit, Eusébio).
3. **MODERN SOUTH AMERICA 🌎**: Luiz Felipe Scolari | 4-2-3-1 (Offensive) | Jogo Bonito | Alisson GK; Cafu, Thiago Silva, Romero, Roberto Carlos; Casemiro CDM, Redondo CM, Kaká CAM; Messi RW, Ronaldinho LW, Ronaldo Nazário ST. (Subs: E. Martínez, Dani Alves, Lúcio, Ayala, Marcelo, Mascherano, Vidal, Riquelme, Di María, Neymar, L. Suárez).
4. **MODERN EUROPE 🇪🇺**: Carlo Ancelotti | 4-3-3 | Counterattack | Neuer GK; Lahm, Ramos, Cannavaro, Maldini; Busquets CDM, Xavi CM, Zidane CAM; Robben RW, Lewandowski ST, C. Ronaldo LW. (Subs: Casillas, Thuram, Van Dijk, Nesta, Alba, Rodri, Modrić, Iniesta, Bale, Mbappé, Henry).
5. **CAF — AFRICA ALL-STARS 🌍**: Stephen Keshi | 4-2-3-1 (Offensive) | Counterattack | Bono GK; Hakimi, Kolo Touré, Kuffour, Asamoah; Essien CDM, Yaya Touré CM, Okocha CAM; Salah RW, Eto’o LW, Weah ST. (Subs: Mendy, Eboué, Koulibaly, Matip, Taiwo, Mikel, Keita, Abedi Pelé, Mahrez, Mané, Drogba).
6. **ASIA / OCEANIA ALL-STARS 🌏**: Choi Kang-hee | 4-4-2 | Long Ball | Schwarzer GK; Mahdavikia, Hong Myung-bo, Kim Min-jae, Nagatomo; Hasebe CDM, Nakata CM, Park Ji-sung RM, Son Heung-min LM; Cahill SS, Rufer ST. (Subs: Ryan, Moore, Yoshida, Emerton, Lee Young-pyo, Jedinak, Ono, Kagawa, Nakamura, Cha Bum-kun, Ali Daei).
7. **CONCACAF LEGENDS 🌎**: Javier Aguirre | 5-3-2 | Catenaccio | Navas GK; Claudio Suárez, Morgan, Duarte CBs; Alphonso Davies LWB, Landon Donovan RWB; Márquez CDM, Bryan Ruiz CM; Mágico González CAM (biased left), David Suazo SS (biased right), Hugo Sánchez ST (center). (Subs: Ochoa, Balboa, Peña, Brooks, Pulisic, Osorio, Edson Álvarez, Dempsey, Blanco, L. Hernández, Chicharito).

---

## Phase 1: Official Match Regulation Flow, Stoppage Time & Intelligent Whistle Engine [COMPLETED]
*Priority: Complete 2-Half Match Engine, Dynamic Stoppage Time, Non-Dangerous Whistle AI & End-Game Hub*  
*Daily Token Budget Profile: Scope: `src/game/engine.ts`, `src/game/matchRules.ts`, `src/components/PauseModal.tsx`, `src/components/EndGameModal.tsx`, `src/types.ts` | Target: ~800k tokens (1 Day's Quota)*

### 1.1 Complete Match Half State Machine & Stoppage Time Mechanics
- **Match Regulation Halves**:
  - Full match consists of two halves of 45:00 simulated match time.
  - **1st Half Kickoff**: Executed by the **Away team**.
  - **2nd Half Kickoff**: Executed by the **Home team** (automatic side swap).
- **Calculated Stoppage Time (Added Time) Engine**:
  - Added time is displayed directly on the broadcast scoreboard banner (`+1'`, `+2'`, etc.).
  - **1st Half Stoppage Time**:
    - Minimum added time: **1 minute**.
    - Additional time added: **+30 seconds** for every substitution or injury occurring in the first half.
    - Accumulated time rounds to whole minute batches (e.g., 2 subs/injuries = +2 minutes).
  - **2nd Half Stoppage Time**:
    - Minimum added time: **2 minutes**.
    - Additional time added: **+30 seconds** per substitution or injury occurring in the 2nd half.
    - Accrued strictly in 1-minute batches (e.g., 2 subs = +3 minutes total).

### 1.2 Context-Aware Intelligent Referee Whistle Engine
- **Non-Dangerous Ending Logic**:
  - The referee does **NOT** blow the half-time or full-time whistle while a team is in an active, dangerous attacking position.
  - If a team possesses the ball inside or directly threatening the opposing penalty box, the referee allows play to continue until:
    - The ball goes out of play (touchline, endline, or goal scored).
    - Defending team clears the ball out of danger.
  - **Penalty Kicks**: If awarded before whistle, the kick must always be taken; whistle cannot blow until the penalty sequence resolves.
  - **Set-Pieces at the Death**:
    - **Corner Kicks**: 70% probability the referee permits the corner to be delivered; 30% whistle is blown before corner is taken.
    - **Free Kicks**: Same 70% / 30% context-aware decision rule based on distance from target goal.

### 1.3 Halftime Transition & Full-Time End-Game Hub
- **Halftime Transition Screen**:
  - Automatically transitions to a specialized 32-bit Pause / Halftime Menu.
  - Prominent primary action: `[ ⏩ START 2ND HALF ]` (teams switch ends, Home team kicks off).
- **Full-Time End-Game Hub**:
  - **Win / Loss Outcome**: Displayed in 32-bit retro victory/defeat banners.
  - **Available Navigation Actions**:
    1. `[ 🔁 REMATCH ]`: Instantly restarts match with the exact same teams, settings, stadium, and tactics/lineups.
    2. `[ 👥 TEAM SELECTION ]`: Returns user directly to the Team Selector modal.
    3. `[ 📊 STATS ]`: Opens match statistics (placeholder scaffold for upcoming phase).
    4. `[ ⭐ RATINGS ]`: Opens player match ratings (placeholder scaffold for upcoming phase).
    5. `[ ⚙️ SETTINGS ]`: Opens match settings.
    6. `[ 🏠 MAIN MENU ]`: Rendered in disabled state for now.
  - **Draw Resolution Options (After 90 Minutes in Draw)**:
    - `[ ⏱️ EXTRA TIME ]`: Initiates two 15-minute extra time periods (ET1 and ET2), followed by penalty shootout if still tied.
    - `[ 🥅 PENALTIES ]`: Skips extra time and transitions immediately to penalty shootout.

---


## Phase 2: Startup Flow Overhaul, Captain Menu, Difficulty Tiers & Game Plan Load Fix
*Priority: Correct Entry Point, 32-Bit Captain Hub, Difficulty Scaling Foundation, Critical Bug Fix*  
*Daily Token Budget Profile: Scope: `src/App.tsx`, `src/components/TeamSelectorModal.tsx`, `src/components/PreMatchPresentationModal.tsx`, `src/components/TacticalGamePlanModal.tsx`, `src/game/ai.ts`, difficulty settings in UnifiedSettingsModal | Target: ~700–800k tokens (1 Day's Quota)*

### 2.1 Correct Application Entry Sequence
- Application **must** start at **Team Selector** (never jump straight into a live match).
- After both teams are confirmed → transition into the **Captain Presentation Menu**.
- Remove every remaining "PES" / "Pro Evolution" string or stylistic reference from UI copy, comments, and asset labels.

### 2.2 32-Bit Captain Presentation Menu (Mobile-First, Zero-Scroll)
- Layout rules (strict single-screen, no scrolling):
  - Local team captain + kit on the **left**.
  - Away team captain + kit on the **right**.
  - On vertical mobile: show **only the local team**; add a top-right button `[ VIEW OTHER TEAM ]` that swaps the entire panel to the away side (uniform, tactics summary, stadium name).
  - On horizontal / desktop: both sides visible simultaneously.
- Bottom button row (single horizontal line, equally spaced, tactile 32-bit bevels):
  - `[ UNIFORM ]` | `[ TACTICS ]` | **`[ START ]`** (larger, centred) | `[ STADIUM ]` | `[ SETTINGS ]`
- Each button opens a dedicated, self-contained console-style sub-panel (no nested scrolling).
- START launches the match with currently selected teams, formations, playstyles, stadium and difficulty.

### 2.3 Five Difficulty Tiers (AI Effectiveness Scaling)
Add to Settings (and persist):
1. **Standing** – AI almost stationary, very slow reactions, high error rate (tutorial / casual).
2. **Easy** – Current baseline behaviour with relaxed decision timers.
3. **Normal** – Solid modern decisions, reasonable compactness, occasional mistakes.
4. **Elite** – Tight shape, aggressive but clean pressing, rare mistakes; only high-rated players consistently outplay them.
5. **Legend** – Near-perfect positioning, anticipation and decision-making; player must play almost perfectly to win.

Difficulty multiplies:
- AI reaction delay
- Cover-shadow tightness
- Pass error probability (still gated by player stats)
- Press intensity and recovery run commitment
- GK decision quality

### 2.4 Critical Fix – Tactical Game Plan Modal Not Loading
- Diagnose and resolve the current failure to open / render `TacticalGamePlanModal`.
- Guaranteed props safety: defensive defaults for every formation, playstyle, tactics and roles object so the modal never crashes on missing data.
- Ensure `isOpen` transition, team cloning and tab state reset work on both pre-match and mid-match entry points.
- Verify zero-scroll pitch board still fits after the fix.

---

## Phase 3: Goalkeeper Mechanical Mastery & Dual Control / AI Symmetry
*Priority: Full GK Control Scheme + Identical AI Logic*  
*Daily Token Budget Profile: Scope: `src/game/ai.ts`, `src/game/engine.ts`, `src/game/sprites.ts`, controller mapping | Target: ~750k tokens*

### 3.1 Human Goalkeeper Control Mapping (Ball State Aware)
- **Without ball**:
  - Short Pass → sprint full speed toward the ball.
  - Long Pass → spread / star shape to occupy maximum 1v1 blocking space.
  - Cross → high dive / jump in stick direction, aiming top corners, opposite-hand reach.
  - Shoot → low dive aiming bottom corner.
  - No input after opponent shot → automatic dive (medium height/power).
  - Ball Shield (Q) → high jump to catch (corners / crosses).
  - Special (E) → punch clear instead of catch.
- **With ball**: behaves exactly like an outfield player (same pass / clear / throw options).

### 3.2 AI Goalkeeper Uses Identical Decision Tree
- AI GK evaluates the same action set under the same conditions.
- Catch vs Punch decision driven by ball power, curve, and Handling / Reflexes attributes.
- 1v1 star-spread, high/low dives and recovery positioning scale with difficulty tier.

### 3.3 Procedural GK Sprite & Animation Hooks
- Lightweight procedural frames for dive, star-spread, catch, punch, distribution.
- No heavy sprite sheets; keep memory footprint mobile-safe.

---

## Phase 4: Modern Compact Positioning Foundation (AI Core – Part 1)
*Priority: 2026 Compactness, Block Height, Shape Maintenance*  
*Daily Token Budget Profile: Scope: `src/game/ai.ts`, `src/game/tactics.ts`, `src/game/formations.ts`, `src/game/pitchGrid.ts` | Target: ~800k tokens*

**Research grounding (2026 tactics)**: Teams keep vertical distance between the highest attacker and deepest defender typically 25–35 m. Mid-block is the default recovery shape. High press is selective and short; low block is used deliberately. Entire unit shifts together.

### 4.1 Vertical Compactness Engine
- Target vertical span (first attacker → last defender) clamped to 25–35 m depending on tactical playstyle and current phase of play.
- High-press phase: back line pushes higher; attackers stay connected.
- Mid-block phase: default recovery shape, compact central corridor.
- Low-block phase: attackers drop deeper to protect the box; no idle high strikers.

### 4.2 Synchronised Block Movement
- Entire team treated as a single elastic unit relative to ball X/Y.
- When the block shifts left/right or up/down, every line (defence, midfield, attack) moves together while preserving relative spacing.
- Difficulty scales how tightly and how quickly the block re-forms after a transition.

### 4.3 Rest-Defence & Transition Safety
- Always leave a minimum number of players behind the ball (rest defence) based on formation and playstyle.
- After losing possession, counter-press trigger window (first 3–5 seconds) is intensity-scaled by difficulty and tactical instructions.

### 4.4 Direct Implementation Notes (Token-Efficient)
- Extend existing role / sub-position system; do not rewrite formation data.
- Use pre-allocated target-position buffers; zero new allocations per frame.
- Expose a single `updateTeamBlockShape(team, ball, phase, difficulty)` entry point.

---

## Phase 5: Advanced AI Positioning, Line Intermingling & Role Fluidity (AI Core – Part 2)
*Priority: Realistic Occupation of Space, Modern Interlocking Lines*  
*Daily Token Budget Profile: Scope: `src/game/ai.ts`, `src/game/tactics.ts`, `src/game/formations.ts` | Target: ~800k tokens*

### 5.1 Line Intermingling Rules
- Forwards actively occupy and shadow opposition centre-backs / defensive midfielders (not stuck on their own half).
- Midfield line interlocks with both the defensive and attacking thirds according to playstyle (e.g. box-to-box vs holding).
- Full-backs / wing-backs tuck inside or push high based on tactical instructions and ball location.

### 5.2 Positional Roles Drive Off-Ball Behaviour
- Every AI player continuously evaluates its assigned Primary Role + Sub-Position + Playstyle to decide:
  - Support run type (underlap, overlap, blind-side, drop into pocket)
  - Cover shadow target
  - When to step out vs hold the line
- Higher Positioning / Reactions attributes = earlier, more accurate arrival at the optimal spot.

### 5.3 Difficulty-Scaled Anticipation
- Standing / Easy: delayed reaction, larger positioning errors.
- Normal: solid modern shape.
- Elite / Legend: near-perfect reading of ball trajectory and opponent intention; only the very best human play consistently beats them.

### 5.4 Implementation Guardrails
- Re-use existing `evaluatePlayerRoleFit` and pitch-grid helpers.
- Keep all calculation inside the already zero-allocation AI tick.
- Unit-test compactness and intermingling distances on a few canonical formations (4-3-3, 4-2-3-1, 3-5-2, 5-3-2).

---

## Phase 6: AI Decision Quality, Passing Logic, Clean Defending & Anti-Spam
*Priority: Intelligent Choices, Stat-Grounded Errors, Modern Pressing Intensity*  
*Daily Token Budget Profile: Scope: `src/game/ai.ts`, `src/game/ballPhysics.ts`, `src/game/engine.ts` | Target: ~750–800k tokens*

### 6.1 Decision-Making Hierarchy
- AI chooses the highest-value available action under pressure:
  1. Safe progressive pass into free pocket
  2. Cross-field switch when wing is overloaded
  3. Controlled clearance only when no progressive option exists
- Eliminate the current “20 back-passes between two CBs” loop. Under pressure the AI must play forward or switch.

### 6.2 Pass / Cross / Shot Accuracy Strictly Stat-Driven
- Miss probability is a function of Short Pass / Long Pass / Crossing / Shooting attributes + pressure + fatigue + difficulty multiplier.
- A 90-rated passer under light pressure almost never misses a simple pass; a 45-rated player under high press frequently does.
- Long-range power shots and switches travel the full required distance (see Phase 7); distance only reduces aiming precision, not velocity.

### 6.3 Clean Tackling & Foul Calibration
- Good defenders (high Tackling + Positioning) preferentially use standing tackles and toe-pokes.
- Sliding tackles reserved for last-ditch or specific aggressive philosophies.
- Fouls become rare on Elite/Legend; more common only on low-defending-stat players or when the tactical instruction is ultra-aggressive.

### 6.4 Modern Pressing Intensity
- Every opponent in possession should feel 1–2 markers within realistic distance (modern “always under pressure” principle).
- Press triggers and recovery runs scale with difficulty and the team’s chosen playstyle (High Press vs Mid Block vs Low Block).

---

## Phase 7: True Long-Range Ball Flight, Cambio de Frente & Physics Polish
*Priority: Authentic Trajectory Distance & Cross-Field Switches*  
*Daily Token Budget Profile: Scope: `src/game/ballPhysics.ts`, `src/game/engine.ts` | Target: ~650–750k tokens*

### 7.1 Extended Flight Curve
- 80–95 % power shots / long passes from three-quarter pitch must reach the penalty area / goal with remaining pace.
- Aerodynamic drag is realistic; distance makes aiming harder, it does not kill velocity.

### 7.2 Automatic “Cambio de Frente” (Switch of Play)
- High-power cross aimed from one wing toward the opposite flank is interpreted as a flat switch.
- Ball receives appropriate leading vector so the receiving winger can take it in stride.

### 7.3 Consistency with Existing Chip / Driven / Swerve Modifiers
- Preserve the current E / Q modifier suite; only extend the base trajectory tables.

---

## Phase 8: Procedural Dribbling Animation Tiers, On-Ball Acceleration & Ginga
*Priority: Fluid On-Ball Locomotion, Skill Differentiation*  
*Daily Token Budget Profile: Scope: `src/game/animationEngine.ts`, `src/game/sprites.ts`, `src/game/ginga.ts` | Target: ~750–850k tokens*

### 8.1 Six Dribbling Animation Tiers
| Attribute Band | Tier Name          | Animation Character                     |
|----------------|--------------------|-----------------------------------------|
| 40–59          | Amateur            | Heavy, upright, slow turns              |
| 60–69          | Semi-Pro           | Basic close control                     |
| 70–79          | Pro                | Sharper cuts, better body feints        |
| 80–89          | Elite              | Quick step-overs, rapid direction change|
| 90–99          | World Class        | Fluid, low centre of gravity, explosive |
| 100+ (Stat Break) | Unique           | Signature / exaggerated elite moves     |

### 8.2 On-Ball Physics Separation
- Top speed still governed by Pace.
- Acceleration while on the ball and turn radius governed by Dribbling + Ball Control.
- Higher tiers unlock faster, cleaner animations for step-overs and skill moves.

### 8.3 Ginga Thresholds
- Effective only with Ball Control ≥ 70 **and** Dribbling ≥ 70.
- At 90+ on both attributes it becomes highly reliable.
- Below threshold: high failure / loss-of-possession chance.

### 8.4 Supporting Animations
- Lightweight procedural improvements for standing tackle, sliding tackle, shooting follow-through (no heavy new sprite sheets).

---

## Phase 9: Aerial Anticipation, Headers, Volleys & Rebound Reflexes
*Priority: Reading Flight Paths & Winning the Second Ball*  
*Daily Token Budget Profile: Scope: `src/game/ai.ts`, `src/game/ballPhysics.ts`, `src/game/animationEngine.ts` | Target: ~700–800k tokens*

### 9.1 Drop-Zone Prediction
- AI calculates expected landing zone of aerial balls.
- Positioning attribute determines how early the player starts moving to the optimal spot.
- Interceptions attribute helps defenders arrive first to clear.

### 9.2 Header / Volley / Clearance Animations
- Procedural header (directed / glancing / power), volley, and defensive clearance frames.
- Timing window scales with Reactions and Heading / Volleying attributes.

### 9.3 Rebound & Second-Ball Reflexes
- Reflexes attribute shortens reaction time to deflections and loose balls in the box.
- Higher difficulty AI wins a larger share of second balls.

---

## Phase 10: Live Player Rating Engine (SofaScore Model) & Match MVP
*Priority: Zero-Allocation Live Analytics*  
*Daily Token Budget Profile: Scope: `src/game/playerRatings.ts` (new), `src/game/engine.ts`, HUD components, EndGameModal | Target: ~700k tokens*

### 10.1 Live Rating Core
- Every player starts at 6.0.
- Pre-allocated rating array; zero GC pressure.
- Positive / negative event matrix (pass, dribble, shot, tackle, foul, card, goal, own-goal, clean-sheet contribution, etc.).
- Human player’s live rating shown as a small floating badge (bottom-right, above controller).

### 10.2 End-Game Board & MVP
- Full team ratings list.
- Highest-rated player receives Match MVP gold star treatment.
- Subbed players’ ratings freeze at the moment of substitution.

---

## Phase 11: IFAB Linesman Offside Engine & VideoRef (VIR)
*Priority: Law 11 Correctness + Lightweight Review Presentation*  
*Daily Token Budget Profile: Scope: `src/game/engine.ts`, offside helpers, simple referee cut-scene | Target: ~650–750k tokens*

### 11.1 Autonomous Assistant Referee
- Two-player offside ray-cast (IFAB Law 11).
- Correct exceptions (own half, ball played backward, throw-in, etc.).
- Animated sideline linesman with flag.

### 11.2 Toggleable VideoRef
- Optional short referee-monitor style review for tight offside / penalty decisions.
- Fully skippable; can be disabled in Graphics settings for performance.

---

## Phase 12: Lightweight Cinematics Suite & Slow-Mo Replay Buffer
*Priority: Presentation Polish Without Performance Cost*  
*Daily Token Budget Profile: Scope: circular frame buffer, simple cut-scene triggers | Target: ~700k tokens*

### 12.1 Zero-Allocation Replay Ring Buffer
- 300-frame circular buffer of essential state (player positions, ball, camera).
- Automatic slow-mo on goals, penalties, red cards, tight offsides.
- Instant any-key skip.

### 12.2 Future Entrance Cinematic Hook (data only this phase)
- Prepare data structures and timing hooks for a later “players walking onto the pitch” entrance using the larger captain models.
- Do **not** implement the full cinematic yet; only the plumbing so a future phase can drop it in cleanly.

---


## Phase 13: Stadium Data Model & Lightweight Config Schema (Foundation)
*Priority: Keep Stadium System Fully Data-Driven and Mobile-Light*  
*Daily Token Budget Profile: Scope: new TypeScript interfaces in `src/types/stadium.ts` (or extend existing), stadium registry, team binding fields | Target: ~650–750k tokens*

**Design principle**: Stadiums are pure configuration objects + procedural Canvas drawing. No meshes, no large textures, no per-frame allocation spikes. Everything is serialisable JSON so a stadium can be saved, loaded, and shared.

### 13.1 Four Architectural Types (exact shape rules)
1. **Round** (Maracanã / Estadio Olímpico style)
   - Exactly 4 stands: North, South, West, East.
   - Stands are curved and must visually join their neighbours.
   - **Unique option**: optional athletics / running track surrounding the pitch (only Round and Oval support this).
   - Produces a focused circular sunlight / floodlight pool with soft surrounding shadow.
2. **Oval**
   - Same 4 stands as Round, but the whole bowl is elongated (East/West stands are longer).
   - Also supports the optional running track.
   - Same focused circular light behaviour as Round.
3. **Square**
   - 8 stands: North, South, West, East + four corner stands (NW, NE, SW, SE).
   - Main stands are straight; corners are independent and can be configured separately or omitted.
4. **Rectangular**
   - Same 8-stand layout as Square, but East and West stands are longer (classic European “box” stadium).

### 13.2 Stand Configuration (shared vocabulary for all types)
Every stand (main or corner) carries the following fields:

**Tiers**
- `tierCount`: 1 | 2 | 3 | 4  
  **or** the special value `"wall"` (Dortmund-style single gigantic tier that occupies the visual height of a full 4-tier stand and forbids additional tiers).
- Each individual tier has a size: `"small"` | `"medium"` | `"large"`.
  - Size differences are linear: medium ≈ 1.5× small, large ≈ 2× small.
  - When stacking tiers the stand height and capacity scale automatically.

**Roof**
- `roofStyle`: `"none"` | `"small"` | `"medium"` | `"large"`
- `roofDesign`: 1 | 2 | 3 (three distinct silhouette variants)
- `roofMaterial`: `"metal"` | `"concrete"` | `"translucent"` | `"canvas"`
- `roofColor`: hex or named colour

**Fence / Barrier**
- `fenceType`: `"none"` | `"small"` | `"big"` | `"hugeSteel"` (South-American style tall steel fencing)

**Stand Structure Colour** (concrete / cladding – separate from seats)
- `standColorPrimary` / `standColorSecondary` (optional two-tone)

**Corner-stand special rules (Square & Rectangular only)**
- A corner can be:
  - Full corner stand (same tier/roof/fence options as main stands)
  - Simple column / pillar
  - Plain wall
  - Completely omitted (open corner)

### 13.3 Seat Colour & Pattern System
Seats are independent of stand structure colours.
- `seatColors`: array of 1–4 colours
- `seatPattern`:
  - `"solid"` – single colour whole stadium
  - `"perStand"` – each stand can have its own colour
  - `"horizontalBands"` – 2 / 3 / 4 horizontal colour bands (lower / middle / upper)
  - `"verticalStripes"` – continuous stripes running around the bowl
  - `"lowerUpper"` – one colour lower tier(s), another colour upper tier(s)

### 13.4 Track (Round & Oval only)
- `hasTrack`: boolean
- When true a running track is drawn around the pitch (classic Olympic / Maracanã look).
- Track width and colour are fixed lightweight constants; only presence is configurable.
- Square and Rectangular stadiums **must ignore** this flag.

### 13.5 Lighting Model
- `lightBanks`: number of floodlight groups (2 / 4 / 6 / 8)
- `lightPower`: 0.0–1.0 (affects night brightness and shadow softness)
- `lightFocus`: `"focused"` (Round/Oval default) | `"spread"` (Square/Rectangular default)
- Day-time sunlight produces soft, non-obstructive shadows whose shape follows the stadium type (circular pool vs more rectangular shadow volumes).

### 13.6 Team Binding Layer (per-team overrides)
Each team stores:
- `homeStadiumId` – reference into the global stadium registry
- `stadiumDisplayName` – the name shown in menus and cinematics
- `fanColors` – 1 to 4 colours worn by the crowd and used on banners
- `bannerMessages` – exactly 4 short strings that appear on fan banners around the stadium
- `sponsors` – ordered list of sponsor names/logos shown on electronic ad boards
- `pitchPattern` – existing pitch designs (plain, vertical stripes, horizontal stripes, checkered, etc.)
- `netStyle` – colour(s) and pattern of the goal nets (single colour, two-tone, vertical/horizontal stripes, club emblem style)
- `pitchSizePreset` – `"small"` | `"medium"` | `"normal"` | `"large"` | `"wide"` | `"long"` | custom dimensions later

### 13.7 Implementation Notes (token-efficient)
- Create clean TypeScript interfaces only (`StadiumConfig`, `StandConfig`, `SeatConfig`, `LightingConfig`, `TeamStadiumOverrides`).
- Ship 4–6 starter stadiums (one clean example of each architectural type + 1–2 variants).
- No editor UI and no renderer yet – pure data layer so Phases 14 and 15 can consume it safely.
- All numeric values pre-computed where possible; nothing allocated at runtime.

---

## Phase 14: Procedural Stadium Renderer & Match Integration
*Priority: Draw Any Configured Stadium at Locked 60 FPS on Budget Phones*  
*Daily Token Budget Profile: Scope: `src/game/stadiumRenderer.ts`, lighting/shadow helpers, integration into match start | Target: ~750–850k tokens*

### 14.1 Procedural Drawing Pipeline
Single Canvas 2D path that reads a `StadiumConfig` + `TeamStadiumOverrides` and draws, in order:
1. Pitch (size + pattern from team overrides)
2. Optional running track (only if `hasTrack === true` and type is Round or Oval)
3. Four or eight stands with correct curvature / straightness according to architectural type
4. Tier stacking (height and depth calculated from tierCount + sizes; “wall” treated as special max-height single tier)
5. Roofs (silhouette from roofStyle + roofDesign, coloured by roofMaterial/roofColor)
6. Fences
7. Seats (pattern applied according to seatPattern and seatColors)
8. Floodlight banks and their glow
9. Soft day/night shadows (shape dictated by stadium type – circular pool for Round/Oval, more angular for Square/Rectangular)
10. Fan banners (4 messages) and electronic ad boards (sponsors)
11. Crowd colour wash using the team’s fanColors

### 14.2 Tier, Roof, Seat & Track Rendering Rules (concrete)
- **Tiers**: each successive tier is drawn higher and slightly set back; capacity estimate is derived from tier sizes for UI display only.
- **Wall tier**: rendered as one continuous massive stand face; no upper tiers allowed.
- **Roofs**: three silhouette variants (flat cantilever, curved shell, multi-panel) scaled by small/medium/large.
- **Seats**: pixel-level or simple rect fills following the chosen pattern; never per-seat sprites.
- **Track**: simple concentric oval/round band with lane lines; completely omitted for Square/Rectangular.

### 14.3 Performance Contract
- All geometry and path data generated once at match start (or when stadium is first previewed) and cached.
- Zero path allocation inside the 60 FPS game loop.
- Graphics quality preset can:
  - Disable soft shadows
  - Reduce stand detail (flatten upper tiers)
  - Skip banner text
- Night matches simply raise floodlight intensity and darken the ambient.

### 14.4 Live Match Binding
When a match begins the engine loads:
- the referenced `StadiumConfig`
- the home (and optionally away) team’s overrides
- applies pitch size, net style, banners, sponsors and fan colours automatically.

---

## Phase 15: Stadium Creator UI & Team Assignment
*Priority: Deep but Still Single-Screen 32-Bit Console Editor*  
*Daily Token Budget Profile: Scope: `StadiumCreatorModal` (new or extend existing StadiumSelectorModal), team editor hooks, live miniature preview | Target: ~750–850k tokens*

### 15.1 Creator Entry & Type Selection
- First screen: choose architectural type (Round / Oval / Square / Rectangular) with a small silhouette icon for each.
- Immediately after type selection the appropriate stand list appears (4 stands for Round/Oval, 8 for Square/Rectangular).

### 15.2 Stand Editor (Zero-Scroll Console Panels)
For each stand the user can set, without scrolling:
- Tier mode: 1 / 2 / 3 / 4 tiers **or** Wall
- Size of each active tier (Small / Medium / Large)
- Roof: style + design variant + material + colour
- Fence type
- Stand structure colour(s)
- (Corners only) Full stand / Column / Wall / None

Live miniature preview updates instantly using the same procedural renderer from Phase 14.

### 15.3 Global Stadium Options
- Track toggle (visible and enabled **only** when type is Round or Oval; hidden otherwise)
- Lighting: number of banks + power slider
- Overall capacity estimate (read-only, derived from tiers)

### 15.4 Seat Colour & Pattern Panel
- Pick 1–4 colours
- Choose pattern (solid / per-stand / horizontal bands / vertical stripes / lower-upper)
- When “per-stand” is selected, each stand gets its own colour picker

### 15.5 Save & Registry
- Name the stadium configuration
- Save into the global stadium registry (persisted)
- Newly created stadiums become available for any team to select as home

### 15.6 Team-Side Customisation (from team / captain menu)
- Assign any registered stadium as the team’s home stadium
- Override display name
- Set 1–4 fan colours (crowd + banners)
- Write the 4 banner messages
- Manage sponsor list (ad boards)
- Choose pitch pattern, net style/colour, and pitch size preset

### 15.7 Preview Contract
- The exact same procedural renderer used in live matches powers the creator preview and the team assignment preview (“what you see is what you get”).
- All controls remain single-screen, 32-bit bevelled console style, zero scrolling on mobile.

---

## Master Development Execution Order (Updated)

| Phase | Title | Focus | Status / Notes |
| :---: | :--- | :--- | :--- |
| **0** | 32-Bit UI, Zero-Scroll Game Plan, Broadcast HUD & Device Profiling | Architecture & UI | **COMPLETED** |
| **1** | Match Regulation Halves, Stoppage Time, Whistle AI & End-Game Hub | Match Flow | **COMPLETED** |
| **2** | Startup Flow, Captain Menu, Difficulty Tiers (5), Game Plan Load Fix | Entry Point & Settings | NEXT |
| **3** | Goalkeeper Mechanical Mastery & Dual Control/AI | Goalkeeping | |
| **4** | Modern Compact Positioning Foundation (AI Part 1) | AI Positioning | Dedicated AI |
| **5** | Advanced Positioning, Line Intermingling & Role Fluidity (AI Part 2) | AI Positioning | Dedicated AI |
| **6** | AI Decision Quality, Passing Logic, Clean Defending | AI Decisions | |
| **7** | Long-Range Ball Flight & Cambio de Frente | Physics | |
| **8** | Dribbling Animation Tiers, On-Ball Accel, Ginga | Locomotion | |
| **9** | Aerial Anticipation, Headers, Volleys | Aerial | |
| **10** | Live Player Rating Engine & Match MVP | Analytics | |
| **11** | IFAB Linesman Offside & VideoRef | Rules | |
| **12** | Lightweight Cinematics & Replay Buffer | Presentation | |
| **13** | Stadium Data Model & Config Schema (tiers, roofs, seats, track rules) | Stadium Foundation | Expanded |
| **14** | Procedural Stadium Renderer & Match Integration | Stadium Render | Expanded |
| **15** | Stadium Creator UI & Team Assignment | Stadium Editor | Expanded |

---

**Token Discipline Reminder**  
Every phase is deliberately scoped to one focused Google AI Studio free-tier day. Each phase ends with a compilable, playable build. Prefer extending existing zero-allocation systems over introducing new heavy abstractions. Mobile 60 FPS and single-screen 32-bit UI remain non-negotiable constraints for every change.

