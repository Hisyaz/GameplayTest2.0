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

## Phase 2: Live Player Rating System (SofaScore Model) & End-Game MVP Engine [NEXT IMMEDIATE PRIORITY]
*Priority: Zero-Allocation Live Rating Calculation & Performance Analytics*  
*Daily Token Budget Profile: Scope: `src/game/playerRatings.ts`, `src/game/engine.ts`, `src/components/PitchCanvas.tsx`, `src/components/EndGameModal.tsx` | Target: ~750k tokens (1 Day's Quota)*

### 2.1 Live Player Rating Engine & In-Game Floating Badge
- **Lightweight Zero-Allocation Architecture**:
  - Pre-allocated rating state array to maintain silky 60 FPS on budget smartphones.
  - Every player on the pitch begins with a baseline rating of **6.0**.
- **HUD Live Display**:
  - Displays the current human-controlled player's live rating badge on the **bottom-right corner** (anchored just above the virtual controller if active).
  - Dynamic color-coding: Red (<6.0), Yellow/Orange (6.0–6.9), Green (7.0–7.9), Cyan/Blue (8.0–8.9), Gold Star (9.0–10.0).

### 2.2 SofaScore-Grounded Algorithmic Actions Matrix
- **Positive Impact Actions**:
  - Successful dribble / duel won (+0.1 to +0.2).
  - Successful short pass (+0.05).
  - Successful cross (+0.15).
  - Successful long pass (+0.20; rewarded higher than short pass or standard cross).
  - Shot on goal (+0.15 to +0.25 based on xG).
  - Key pass / assist (+0.4 to +0.7).
  - Goal scored (+1.0 to +1.2).
  - Successful standing tackle (+0.15).
  - Successful sliding tackle (+0.25; sliding tackles rewarded higher due to risk).
  - Interception / clearance (+0.1 to +0.15).
  - Goalkeeper save (+0.3 to +0.6 based on shot speed and danger).
- **Negative Impact Actions**:
  - Missed pass (-0.1 to -0.15; missed long pass penalizes slightly less than missed simple short pass).
  - Shot off target (-0.15).
  - Turnover leading to opponent shot (-0.3).
  - Turnover directly leading to opponent goal (-0.8).
  - Committing an ordinary foul (-0.15).
  - Committing a penalty kick foul (-0.5).
  - Receiving a yellow card (-0.3).
  - Receiving a red card (-1.2).
  - Own goal (-1.5).
  - Conceding a goal (-0.3 penalty applied to defenders, goalkeepers, CDMs, and wingbacks).

### 2.3 Subbed-Out Freezing & End-Game Ratings Board
- If a player is substituted out, their rating is immediately **frozen** for the remainder of the match.
- **End-Game Ratings Tab**:
  - Full breakdown of both teams listing all starting players and substitutes who entered the match.
  - **Match MVP Award**: Highest-rated player is crowned Match MVP with a gold star badge and highlighted card presentation.

---

## Phase 3: IFAB Autonomous Assistant Referee (Linesman Offside Engine) & VideoRef (VIR / VAR)
*Priority: Flawless Offside Geometry, Autonomous Linesman & VAR Replay Interventions*  
*Daily Token Budget Profile: Scope: `src/game/matchRules.ts`, `src/game/engine.ts`, `src/components/PitchCanvas.tsx`, `src/types.ts` | Target: ~800k tokens (1 Day's Quota)*

### 3.1 Strict IFAB Law 11 Autonomous Offside Engine
- **Raycasted Offside Detection**:
  - Calculated at the exact millisecond the ball leaves the passer's foot.
  - Receiver must have at least **two opposing players** (typically the goalkeeper and last outfield defender, or two outfielders) between them and the opposing goal line.
- **Official IFAB Exceptions Strictly Modeled**:
  1. Receiving player is in their own half (at or behind the halfway line).
  2. Receiving player is level with or behind the ball when the pass is struck.
  3. Receiving player receives ball directly from a **Throw-In**, **Corner Kick**, or **Goal Kick**.
- **Interactive Animated Sideline Assistant Referee**:
  - Procedural linesman sprite sprinting along the touchline following the last defender line.
  - When offside occurs: Linesman halts, raises yellow-and-red checkered flag vertically, and signals the whistle.

### 3.2 VideoRef (VIR / VAR) Autonomous Review System
- **Match Settings Toggle**: Configurable in Match Settings (`VideoRef: ON / OFF`).
- **All-Seeing Review Engine**:
  - VIR monitors all penalty box incidents, red card offenses, and contested offside goals.
  - If on-field referee overlooks a red card foul, penalty foul, or offside goal:
    - Game briefly pauses with a retro 32-bit "VIR REVIEW IN PROGRESS" overlay.
    - Referee walks to the pitchside monitor, reviews a brief procedural slow-mo replay, and reverses the decision to award the correct penalty, red card, or offside free kick.

---

## Phase 4: Lightweight Cinematics Suite & Skip-able Slow-Motion Replay Engine
*Priority: Match Atmosphere, Celebration Cutscenes & Action Replay Loop*  
*Daily Token Budget Profile: Scope: `src/game/replayEngine.ts`, `src/components/CinematicOverlay.tsx`, `src/game/stadiumRenderer.ts` | Target: ~750k tokens (1 Day's Quota)*

### 4.1 Low-Overhead Procedural Cinematics Engine
- **Settings Toggle**: Enable/disable cinematics in Settings (`Cinematics: ON / OFF`) for ultimate performance on ultra-budget devices.
- **Atmospheric 32-Bit Cutscenes**:
  - Match walkout tunnel entrance.
  - Goal celebration cutscenes with team huddles and signature fist pumps.
  - Dramatic referee card presentations (yellow / straight red card).
  - Violent or dirty tackle reactions with referee warnings.
  - Post-match emotional cutscenes (celebrations, fallen players, handshakes).

### 4.2 Circular Frame-Buffer Slow-Motion Replay System
- **Zero-Allocation Circular Ring Buffer**:
  - Constantly records the past 300 game state frames (~5 seconds of ball & player coordinates) with zero heap allocation.
- **Automatic Replay Triggers**:
  - Goal scored (plays slow-motion replay of strike and net ripple following celebration).
  - Crucial fouls leading to direct free kicks or penalty kicks.
  - Contested offside calls.
- **Instant Skip Constitution**:
  - Any button press (`Space`, `Enter`, touch tap, gamepad button) instantly skips the replay and restores active match play.
  - Can be completely toggled off in Graphics Settings (`Replay System: ON / OFF`).

---

## Phase 5: Goalkeeper Mechanical Mastery & Dual Control/AI Architecture
*Priority: Complete User & AI Goalkeeper Mechanics*  
*Daily Token Budget Profile: Scope: `src/game/engine.ts`, `src/game/ai.ts`, `src/game/sprites.ts` | Target: ~750k tokens (1 Day's Quota)*

### 5.1 Symmetrical AI Goalkeeper Intelligence
- AI goalkeepers utilize the exact same mechanical decision tree as the player-controlled GK:
  - 1v1 breakaway $\rightarrow$ dynamic choice between rushing out to sweep vs. executing a star spread block based on attacker distance.
  - Reading incoming shot trajectory $Z$-elevation and angle to trigger high exchanged-hand fingertip parries vs. low turf smothers.
  - Evaluating whether to attempt a two-handed catch (`Q`) or a two-fist punch (`E`) based on shot velocity, knuckle wobble, and aerial congestion.

### 5.2 Catch-Slip vs. Punch Physics
- Model ball handling friction: shots exceeding 24 px/frame velocity or bearing $>4.5$ Magnus curve risk slipping through the goalkeeper's gloves if a catch is attempted, resulting in dangerous rebounds.
- Punch clears (`E`) guarantee ball safety at the cost of giving away a throw-in, corner, or long rebound.

### 5.3 Procedural Goalkeeper Animation Enhancements
- Dedicated 32-bit sprite frames for:
  - Star spread stance with extended arms and splayed legs.
  - High fingertip leap with trailing hand reach.
  - Low lateral dive with tucked chin and body roll recovery.
  - Two-fisted punch in mid-air.

---

## Phase 6: Modern Compact Tactical Positioning & 5-Tier AI Intelligence Engine
*Priority: AI Team Intelligence, Modern Compactness & Passing Overhaul*  
*Daily Token Budget Profile: Scope: `src/game/ai.ts`, `src/game/tactics.ts`, `src/game/formations.ts` | Target: ~800k tokens (1 Day's Quota)*

### 6.1 Modern Vertical Compactness (Short Team Structure)
- Modern teams stay compact from the first attacker to the last defender ($28\text{m}–35\text{m}$ total vertical spread):
  - **High Press Phase**: Defensive backline pushes up toward the halfway circle, squeezing midfield space.
  - **Low Block Phase**: Attackers drop into their own half to support defensive shape rather than standing idle.
- Synchronized block shifting: entire squad moves as an integrated unit relative to the ball position.

### 6.2 Line Intermingling & Positional Fluidity
- Forwards actively contest and shadow opponent center backs.
- Midfield units interlock and contest central lanes rather than adhering to rigid horizontal bands.
- Fullbacks tuck into half-spaces or overlap depending on assigned tactical playstyle.

### 6.3 Elimination of Repetitive Defensive Back-Passes & High-Press Pressure
- AI defenders will no longer engage in endless 20-pass loops between two center backs.
- If pressured by 1 or 2 oncoming opponents, defenders execute forward passes to midfield pockets, cross-field switches, or emergency clearances.

### 6.4 Attribute-Grounded Passing Accuracy & Difficulty Execution
- Passing errors occur strictly as a function of canonical player stats (`SPA`, `LPA`, `CMP`) and pressure modifiers.
- 5 Difficulty tiers strictly calibrate reaction delay, cover shadow tightness, and error rates.

---

## Phase 7: Extended Ball Flight, Cross-Field Switch & Clean Defensive Tackling AI
*Priority: Ball Flight Realism & Clean Defensive AI*  
*Daily Token Budget Profile: Scope: `src/game/ballPhysics.ts`, `src/game/engine.ts`, `src/game/ai.ts` | Target: ~700k tokens (1 Day's Quota)*

### 7.1 True Long-Range Ball Flight Physics
- Aerodynamic drag curve allowing 80%–94% power shots from 3/4 pitch to hit the crossbar or corners with authentic pace.
- Distance-based accuracy penalties: precision is harder from 40 yards, but velocity remains lethal.

### 7.2 Automated "Cambio de Frente" Recognition
- When crossing across pitch width with high power, the engine applies flat trajectory physics and leading forward vector, allowing wing-to-wing switches to arrive cleanly at the opposite winger's stride.

### 7.3 Clean AI Tackling & Foul Calibration
- AI defenders prioritize standing tackles and clean toe-pokes when positioned favorably.
- Sliding tackles are restricted to desperate last-ditch blocks or specific aggressive philosophies.
- Clean tackle win rate scales with `TCK` and `SLD` canonical attributes; fouls only occur on late lunges or tackles from behind.

---

## Phase 8: Procedural Dribbling Animation Tiers, Acceleration & Ginga Revamp
*Priority: Fluid On-Ball Locomotion & Skill Progression*  
*Daily Token Budget Profile: Scope: `src/game/animationEngine.ts`, `src/game/sprites.ts`, `src/game/ginga.ts` | Target: ~800k tokens (1 Day's Quota)*

### 8.1 6-Tier Dribbling Animation Architecture
- Dribbling animations dynamically scale across 6 canonical skill brackets (Amateur 40–59, Semi-Pro 60–69, Pro 70–79, Elite 80–89, World Class 90–99, Stat Break 100+).

### 8.2 On-Ball Acceleration vs. Top Sprint Speed
- Top sprint speed is determined by Pace (`PAC`).
- On-ball acceleration and turn sharpness are governed directly by Dribbling (`DRI`) and Ball Control (`BCL`).

### 8.3 Ginga Mechanics Revamp
- Ginga requires both $70+$ Ball Control and $70+$ Dribbling to execute cleanly; awkward stumbles below 70; lightning evasion at $90+$.

---

## Phase 9: Aerial Anticipation, Dynamic Headers, Volleys & Deflection Reflexes Engine
*Priority: Aerial Ball Physics, Drop-Zone Reading & Acrobatic Strikes*  
*Daily Token Budget Profile: Scope: `src/game/ballPhysics.ts`, `src/game/ai.ts`, `src/game/sprites.ts` | Target: ~750k tokens (1 Day's Quota)*

### 9.1 Trajectory Drop-Zone Anticipation
- Players calculate projected landing coordinates $(x, y, t)$ of airborne balls governed by Positioning (`POS`) and Interceptions (`INT`).

### 9.2 Goalmouth Deflection & Rebound Reflexes
- Rebound reaction delay governed directly by Reactions (`REA`) and Reflexes (`REF`). High-reflex players react in sub-120ms.

### 9.3 Acrobatic Aerial Strikes
- Procedural animations for bullet headers, diving headers, chest-traps, side volleys, and bicycle clearances.

---

## Phase 10: Deep Modular Stadium Creator Architecture & Engine Preview
*Priority: Stadium Customizer, Architectural Lighting & Team Identity*  
*Daily Token Budget Profile: Scope: `src/components/StadiumCreatorModal.tsx`, `src/game/stadiumRenderer.ts`, `src/game/turfPhysics.ts` | Target: ~850k tokens (1 Day's Quota)*

### 10.1 Low-Weight Architectural Constitution for Stadium Creation
- Procedural Canvas 2D Vector Geometry (zero 3D meshes, zero bulky texture files).
- Pre-baked seat & lawn pattern buffers on off-screen canvases.
- Dynamic gradient shadow masks for circular/geometric roof shading.

### 10.2 The 4 Stadium Architectural Types
- Round (Estadio Olímpico / Maracaná with athletic running track option).
- Square (8-stand modern arena).
- Rectangular (European football heritage).
- Oval (curved touchline elongation).

### 10.3 Stand Customization & Team-to-Stadium Binding
- 1–4 tier stacking + single massive Wall Stand (Dortmund Yellow Wall inspired).
- Custom fan text banners, LED sponsors, crowd colors, pitch mowing designs.

---

## Master Development Execution Order

| Phase | Milestone | Focus Area | Deliverables & Playable State |
| :---: | :--- | :--- | :--- |
| **Phase 0** | **32-Bit UI, Zero-Scroll Game Plan, Broadcast HUD & Device Profiling** | Architecture & UI | [COMPLETED] Zero-scroll single screen pitch in Game Plan on PC & mobile; 32-bit styling overhaul; custom formation builder with $\ge 2$ DEF, $\ge 2$ MID, $\ge 1$ ATT validation & confirm blocking; removal of gameplay top buttons with only Scoreboard (left) and Drawstar TV (right); camera center offset above solid touch controller; startup hardware profiler (keyboard/gamepad mapping vs touch, graphics preset suggestion); all 7 Special Teams starting XI, substitutes, formations & playstyles synced. |
| **Phase 1** | **Match Regulation Halves, Stoppage Time, Whistle AI & End-Game Hub** | Match Regulation Flow | Two 45m halves; away kickoff 1st half, home kickoff 2nd half; dynamic stoppage time (+1m min in 1st half, +2m min in 2nd half, +30s per sub/injury in 1m batches); non-dangerous ending whistle AI (box possession delay, penalty must-take, 70/30 corners/freekicks); Halftime pause hub; End-Game victory hub with Rematch, Team Selection, Settings, Extra Time & Penalties for draws. |
| **Phase 2** | **Live Player Rating Engine (SofaScore Model) & Match MVP** | Analytics & HUD | Live 6.0 baseline rating; bottom-right floating badge above controller; comprehensive positive/negative events matrix (passes, dribbles, shots, goals, tackles, cards, own goals, clean sheet penalties); subbed-out rating freeze; end-game ratings board with MVP star. |
| **Phase 3** | **IFAB Linesman Offside Engine & VideoRef (VIR / VAR)** | Rules & Technology | IFAB Law 11 2-player offside raycasting; proper exceptions (own half, behind ball, throw-in); animated sideline linesman with checkered flag; VideoRef (VIR) toggleable review system with referee monitor cutscene. |
| **Phase 4** | **Lightweight Cinematics Suite & Slow-Mo Replay Engine** | Presentation & Replays | Zero-allocation circular ring buffer for 300 frames; automatic goal, foul, penalty & offside slow-mo replays with instant any-key skip; entrance, celebration & card cutscenes; toggleable in graphics settings for budget devices. |
| **Phase 5** | **Goalkeeper Mechanical Mastery & Dual Control/AI Architecture** | Goalkeeping Engine | Symmetrical GK AI; catch-slip vs. punch mechanics; star spread 1v1 block; high/low dives; procedural GK sprites. |
| **Phase 6** | **Modern Compact Positioning & 5-Tier AI** | Tactical AI | Modern vertical compactness; line intermingling; high press vs. low block; elimination of repetitive back passes; stats-based passing precision. |
| **Phase 7** | **Extended Ball Flight & Clean Tackling** | Physics & Defending | 90% power shots from 3/4 pitch reach goal; "Cambio de Frente" cross-field switches; clean tackling AI without excessive fouls. |
| **Phase 8** | **Dribbling Animation Tiers & Ginga Revamp** | Locomotion & Skills | 6-tier procedural dribbling animations; on-ball acceleration scaling; stepovers; Ginga 70+ attribute threshold. |
| **Phase 9** | **Aerial Anticipation, Headers & Volleys** | Aerial Gameplay | Drop-zone trajectory reading; positioning/interceptions anticipation; rebound reflexes; acrobatic headers and volleys. |
| **Phase 10** | **Modular Stadium Creator & Engine Preview** | Atmosphere & Stadiums | 4 stadium types (Round, Square, Rectangular, Oval); tier stacking (1–4 tiers + Wall); roof & fence styles; team banners, sponsors & crowd colors. |
