/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PITCH_CONFIG, HOME_KIT, AWAY_KIT } from './constants';
import { StadiumTier, SeatColorMode, TeamKit, GraphicsSettings } from '../types';

/**
 * Individual spectator data in the grandstands
 */
export interface Spectator {
  x: number;
  baseY: number;
  isAwaySection: boolean;
  color: string;
  headColor: string;
  hasScarf: boolean;
  scarfColor: string;
  phase: number;
  bobAmp: number;
}

/**
 * Curva / Kop Supporter Banner
 */
export interface SupporterBanner {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  isCheckered?: boolean;
}

/**
 * Large Ultras waving flag
 */
export interface UltrasFlag {
  poleX: number;
  poleY: number;
  width: number;
  height: number;
  color1: string;
  color2: string;
  phase: number;
}

const CROWD_HEAD_PALETTE = ['#f5c898', '#d09868', '#fcd34d', '#c58a5c', '#8d5b32'];

// Cache generated crowds so we don't re-allocate memory every frame
let cachedTopCrowd: Spectator[] = [];
let cachedBottomCrowd: Spectator[] = [];
let cachedHomeColor = '';
let cachedAwayColor = '';
let cachedSeatMode: SeatColorMode = 'auto';

/**
 * Resolves seat color for grandstand tiers based on mode and team kit
 */
export function getSeatColors(mode: SeatColorMode, homeKit: TeamKit = HOME_KIT): { primary: string; secondary: string; isBare: boolean } {
  switch (mode) {
    case 'blue':
      return { primary: '#0284c7', secondary: '#0369a1', isBare: false };
    case 'red':
      return { primary: '#dc2626', secondary: '#b91c1c', isBare: false };
    case 'yellow':
      return { primary: '#eab308', secondary: '#ca8a04', isBare: false };
    case 'green':
      return { primary: '#16a34a', secondary: '#15803d', isBare: false };
    case 'white':
      return { primary: '#f8fafc', secondary: '#e2e8f0', isBare: false };
    case 'wooden':
      return { primary: '#92400e', secondary: '#78350f', isBare: false };
    case 'concrete':
      return { primary: '#475569', secondary: '#334155', isBare: true };
    case 'auto':
    default:
      return {
        primary: homeKit.primaryColor || '#0055b8',
        secondary: homeKit.secondaryColor || '#ffffff',
        isBare: false,
      };
  }
}

/**
 * Initializes grandstand crowd seating with dynamic club allocations
 */
function initGrandstandCrowd(
  grandstandY: number,
  homeKit: TeamKit,
  awayKit: TeamKit
): Spectator[] {
  const left = PITCH_CONFIG.PITCH_LEFT - 100;
  const width = PITCH_CONFIG.FIELD_WIDTH + 200;
  const spectators: Spectator[] = [];

  let seed = 4217 + Math.floor(grandstandY);
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Dedicated away fan section occupies ~15% on the far right of the top stand
  const awayStartX = left + width * 0.82;

  for (let row = 0; row < 5; row++) {
    const baseY = grandstandY + row * 15 + 4;
    for (let x = left + 8; x < left + width - 8; x += 11) {
      const isAwaySection = x >= awayStartX;
      const kit = isAwaySection ? awayKit : homeKit;

      // Color variation: 65% primary kit, 20% secondary kit, 15% dark supporter jacket
      const r = rand();
      let color = kit.primaryColor;
      if (r < 0.20) color = kit.secondaryColor;
      else if (r < 0.35) color = '#1e293b'; // dark jacket

      const headIdx = Math.floor(rand() * CROWD_HEAD_PALETTE.length);
      const hasScarf = rand() < 0.35;
      const scarfColor = rand() < 0.5 ? kit.primaryColor : kit.secondaryColor;

      spectators.push({
        x,
        baseY,
        isAwaySection,
        color,
        headColor: CROWD_HEAD_PALETTE[headIdx],
        hasScarf,
        scarfColor,
        phase: (x * 0.022) + (row * 0.65) + rand() * 0.5,
        bobAmp: 1.1 + rand() * 0.8,
      });
    }
  }

  return spectators;
}

/**
 * Ensures crowd cache is synchronized with current team kits & seat color mode
 */
function ensureCrowdCache(homeKit: TeamKit, awayKit: TeamKit, seatMode: SeatColorMode) {
  if (
    cachedTopCrowd.length === 0 ||
    cachedHomeColor !== homeKit.primaryColor ||
    cachedAwayColor !== awayKit.primaryColor ||
    cachedSeatMode !== seatMode
  ) {
    cachedTopCrowd = initGrandstandCrowd(PITCH_CONFIG.PITCH_TOP - 95 - 80, homeKit, awayKit);
    cachedBottomCrowd = initGrandstandCrowd(PITCH_CONFIG.PITCH_BOTTOM + 95, homeKit, awayKit);
    cachedHomeColor = homeKit.primaryColor;
    cachedAwayColor = awayKit.primaryColor;
    cachedSeatMode = seatMode;
  }
}

/**
 * Renders the top grandstand, seats, club-colored crowd, ultras banners, and flags
 */
export function drawTopGrandstandWithAtmosphere(
  ctx: CanvasRenderingContext2D,
  stadiumTier: StadiumTier = 'monumental',
  seatMode: SeatColorMode = 'auto',
  homeKit: TeamKit = HOME_KIT,
  awayKit: TeamKit = AWAY_KIT,
  graphicsSettings?: GraphicsSettings
) {
  ensureCrowdCache(homeKit, awayKit, seatMode);

  ctx.save();
  const boardY = PITCH_CONFIG.PITCH_TOP - 95;
  const grandstandY = boardY - 80;
  const left = PITCH_CONFIG.PITCH_LEFT - 100;
  const width = PITCH_CONFIG.FIELD_WIDTH + 200;

  // 1. GRANDSTAND CONCRETE STRUCTURE & STEPS
  drawGrandstandStructure(ctx, left, grandstandY, width, 80, stadiumTier, seatMode, homeKit);

  // 2. SEAT ROWS (if plastic/wood seats active)
  drawSeatRows(ctx, left, grandstandY, width, 5, seatMode, homeKit, stadiumTier);

  // 3. DYNAMIC CLUB-COLORED SPECTATORS
  const isStatic = graphicsSettings?.tier === 'performance';
  const now = Date.now();

  for (let i = 0; i < cachedTopCrowd.length; i++) {
    const s = cachedTopCrowd[i];
    const bob = isStatic ? 0 : Math.round(Math.sin(now * 0.0032 + s.phase) * s.bobAmp);
    const y = s.baseY + bob;

    // Body
    ctx.fillStyle = s.color;
    ctx.fillRect(s.x, y + 4, 6, 7);

    // Head
    ctx.fillStyle = s.headColor;
    ctx.fillRect(s.x + 1, y, 4, 4);

    // Supporter Scarf
    if (s.hasScarf) {
      ctx.fillStyle = s.scarfColor;
      ctx.fillRect(s.x - 2, y - 1, 10, 2);
    }
  }

  // 4. CURVA / KOP SUPPORTER BANNERS (Draped along the barrier rail)
  drawCurvaBanners(ctx, left, boardY - 8, width, homeKit, awayKit, stadiumTier);

  // 5. WAVING ULTRAS FLAGS (Curva ultras section behind goal)
  drawUltrasWavingFlags(ctx, left, grandstandY, homeKit, graphicsSettings);

  // 6. Photographers sitting on pitchside stools
  drawPitchsidePhotographers(ctx, left, boardY, width);

  ctx.restore();
}

/**
 * Renders the bottom grandstand, seats, club-colored crowd, and barrier banners
 */
export function drawBottomGrandstandWithAtmosphere(
  ctx: CanvasRenderingContext2D,
  stadiumTier: StadiumTier = 'monumental',
  seatMode: SeatColorMode = 'auto',
  homeKit: TeamKit = HOME_KIT,
  awayKit: TeamKit = AWAY_KIT,
  graphicsSettings?: GraphicsSettings
) {
  ensureCrowdCache(homeKit, awayKit, seatMode);

  ctx.save();
  const boardY = PITCH_CONFIG.PITCH_BOTTOM + 65;
  const grandstandY = boardY + 36;
  const left = PITCH_CONFIG.PITCH_LEFT - 100;
  const width = PITCH_CONFIG.FIELD_WIDTH + 200;

  // Barrier rail
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(left, boardY + 34, width, 4);

  // 1. GRANDSTAND CONCRETE STRUCTURE & STEPS
  drawGrandstandStructure(ctx, left, grandstandY, width, 80, stadiumTier, seatMode, homeKit);

  // 2. SEAT ROWS
  drawSeatRows(ctx, left, grandstandY, width, 5, seatMode, homeKit, stadiumTier);

  // 3. DYNAMIC CLUB-COLORED SPECTATORS
  const isStatic = graphicsSettings?.tier === 'performance';
  const now = Date.now();

  for (let i = 0; i < cachedBottomCrowd.length; i++) {
    const s = cachedBottomCrowd[i];
    const bob = isStatic ? 0 : Math.round(Math.sin(now * 0.0032 + s.phase) * s.bobAmp);
    const y = s.baseY + bob;

    // Body
    ctx.fillStyle = s.color;
    ctx.fillRect(s.x, y + 4, 6, 7);

    // Head
    ctx.fillStyle = s.headColor;
    ctx.fillRect(s.x + 1, y, 4, 4);

    // Scarf
    if (s.hasScarf) {
      ctx.fillStyle = s.scarfColor;
      ctx.fillRect(s.x - 2, y - 1, 10, 2);
    }
  }

  // 4. BOTTOM BANNERS
  drawBottomBanners(ctx, left, grandstandY - 6, width, homeKit, stadiumTier);

  ctx.restore();
}

/**
 * Draws the concrete/brick/wood steps of the grandstand
 */
function drawGrandstandStructure(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  tier: StadiumTier,
  seatMode: SeatColorMode,
  homeKit: TeamKit
) {
  if (tier === 'monumental') {
    // Sleek modern pre-cast concrete arena steps
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = '#334155';
    for (let s = 0; s < 5; s++) {
      ctx.fillRect(x, y + s * 15 + 13, width, 2);
    }
  } else if (tier === 'craven') {
    // Victorian red brick terrace steps with dark coping
    ctx.fillStyle = '#2b221d';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = '#451a03';
    for (let s = 0; s < 5; s++) {
      ctx.fillRect(x, y + s * 15 + 13, width, 2);
    }
  } else {
    // Ascenso: Bare, rough weathered concrete with cracks
    ctx.fillStyle = '#292524';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = '#44403c';
    for (let s = 0; s < 5; s++) {
      ctx.fillRect(x, y + s * 15 + 13, width, 2);
    }
  }
}

/**
 * Draws plastic fold-down seats, wood bench slats, or terrace step highlights
 */
function drawSeatRows(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  rows: number,
  seatMode: SeatColorMode,
  homeKit: TeamKit,
  tier: StadiumTier
) {
  const { primary, secondary, isBare } = getSeatColors(seatMode, homeKit);

  if (isBare && tier === 'ascenso') {
    // Bare concrete steps: just draw weathered step edge highlights
    ctx.fillStyle = '#57534e';
    for (let r = 0; r < rows; r++) {
      ctx.fillRect(left, top + r * 15 + 11, width, 1);
    }
    return;
  }

  // Draw discrete seats along each row step
  for (let r = 0; r < rows; r++) {
    const rowY = top + r * 15 + 6;
    const rowColor = (r % 2 === 0) ? primary : (secondary === '#ffffff' ? primary : secondary);

    ctx.fillStyle = rowColor;
    for (let sx = left + 7; sx < left + width - 7; sx += 11) {
      if (seatMode === 'wooden') {
        // Wooden bench slats
        ctx.fillStyle = primary;
        ctx.fillRect(sx, rowY, 9, 3);
        ctx.fillStyle = secondary;
        ctx.fillRect(sx, rowY + 4, 9, 2);
      } else {
        // Molded stadium plastic bucket seat
        ctx.fillStyle = rowColor;
        ctx.fillRect(sx, rowY, 8, 7);
        // Bevel highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(sx + 1, rowY, 6, 2);
      }
    }
  }
}

/**
 * Draws Curva / Kop Ultras Banners along the top barrier rail
 */
function drawCurvaBanners(
  ctx: CanvasRenderingContext2D,
  left: number,
  railY: number,
  width: number,
  homeKit: TeamKit,
  awayKit: TeamKit,
  tier: StadiumTier
) {
  // Railing bar
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(left, railY + 2, width, 3);

  // Curva banners draped over railing
  const banners = [
    { x: left + 60, w: 180, text: 'FORZA RETRO', bg: homeKit.primaryColor, textCol: '#ffffff' },
    { x: left + 270, w: 220, text: '★ 100% PASSION ★', bg: '#1e293b', textCol: '#facc15' },
    { x: left + 520, w: 190, text: 'CURVA ULTRAS', bg: homeKit.primaryColor, textCol: '#ffffff' },
    { x: left + 740, w: 240, text: 'PRIDE & GLORY', bg: homeKit.secondaryColor === '#ffffff' ? '#b91c1c' : homeKit.secondaryColor, textCol: '#ffffff' },
    { x: left + 1010, w: 170, text: 'TILL I DIE', bg: '#0f172a', textCol: '#38bdf8' },
    { x: left + 1210, w: 160, text: 'AWAY SECTOR', bg: awayKit.primaryColor, textCol: '#ffffff' },
  ];

  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textBaseline = 'middle';

  for (const b of banners) {
    if (b.x + b.w > left + width) continue;

    // Cloth drape shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(b.x + 2, railY + 6, b.w, 14);

    // Banner cloth body
    ctx.fillStyle = b.bg;
    ctx.fillRect(b.x, railY + 4, b.w, 14);

    // Cloth edge fringe
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(b.x, railY + 4, b.w, 1);
    ctx.fillRect(b.x, railY + 17, b.w, 1);

    // Text slogan
    ctx.fillStyle = b.textCol;
    ctx.fillText(b.text, b.x + 8, railY + 11);
  }
}

/**
 * Draws bottom supporter banners
 */
function drawBottomBanners(
  ctx: CanvasRenderingContext2D,
  left: number,
  y: number,
  width: number,
  homeKit: TeamKit,
  tier: StadiumTier
) {
  const banners = [
    { x: left + 120, w: 210, text: 'HERITAGE STAND', bg: '#1e293b', textCol: '#fde047' },
    { x: left + 420, w: 260, text: '16-BIT FOOTBALL CLUB', bg: homeKit.primaryColor, textCol: '#ffffff' },
    { x: left + 780, w: 220, text: 'RESPECT THE GAME', bg: '#334155', textCol: '#ffffff' },
  ];

  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textBaseline = 'middle';

  for (const b of banners) {
    if (b.x + b.w > left + width) continue;
    ctx.fillStyle = b.bg;
    ctx.fillRect(b.x, y, b.w, 12);
    ctx.fillStyle = b.textCol;
    ctx.fillText(b.text, b.x + 10, y + 6);
  }
}

/**
 * Renders large Ultras waving flags with procedural sine-wave cloth animation
 */
function drawUltrasWavingFlags(
  ctx: CanvasRenderingContext2D,
  left: number,
  grandstandY: number,
  homeKit: TeamKit,
  graphicsSettings?: GraphicsSettings
) {
  const flags = [
    { x: left + 140, y: grandstandY + 10, w: 34, h: 22, col1: homeKit.primaryColor, col2: '#ffffff', speed: 0.005 },
    { x: left + 360, y: grandstandY + 14, w: 42, h: 26, col1: '#facc15', col2: homeKit.primaryColor, speed: 0.004 },
    { x: left + 620, y: grandstandY + 8, w: 38, h: 24, col1: homeKit.primaryColor, col2: homeKit.secondaryColor || '#ffffff', speed: 0.0055 },
    { x: left + 920, y: grandstandY + 12, w: 36, h: 22, col1: '#ef4444', col2: '#ffffff', speed: 0.0048 },
  ];

  const isStatic = graphicsSettings?.tier === 'performance';
  const now = Date.now();

  for (const f of flags) {
    // Flag pole
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(f.x - 2, f.y - 14, 2, 38);

    // Procedural cloth wave geometry
    ctx.save();
    ctx.translate(f.x, f.y - 14);

    const segments = 6;
    const segW = f.w / segments;

    for (let s = 0; s < segments; s++) {
      const segX = s * segW;
      const wave = isStatic ? 0 : Math.sin(now * f.speed + s * 0.9) * 3.5;
      const waveNext = isStatic ? 0 : Math.sin(now * f.speed + (s + 1) * 0.9) * 3.5;

      // Two-color check / stripe pattern
      ctx.fillStyle = (s % 2 === 0) ? f.col1 : f.col2;
      ctx.beginPath();
      ctx.moveTo(segX, wave);
      ctx.lineTo(segX + segW, waveNext);
      ctx.lineTo(segX + segW, waveNext + f.h);
      ctx.lineTo(segX, wave + f.h);
      ctx.closePath();
      ctx.fill();

      // Top edge cloth sheen
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(segX, wave, segW, 1.5);
    }

    ctx.restore();
  }
}

/**
 * Draws pitchside press photographers with telephoto lenses
 */
function drawPitchsidePhotographers(ctx: CanvasRenderingContext2D, left: number, boardY: number, width: number) {
  for (let px = left + 140; px < left + width - 140; px += 280) {
    // Stool
    ctx.fillStyle = '#444444';
    ctx.fillRect(px - 4, boardY + 36, 8, 8);
    // Face
    ctx.fillStyle = '#d09868';
    ctx.fillRect(px - 3, boardY + 24, 6, 6);
    // Fluorescent media bib
    ctx.fillStyle = '#ff7700';
    ctx.fillRect(px - 5, boardY + 30, 10, 8);
    // Camera with telephoto lens pointed at pitch
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px - 2, boardY + 33, 4, 10);
    ctx.fillStyle = '#111111';
    ctx.fillRect(px - 1, boardY + 41, 2, 3);
  }
}

/**
 * Crowd Flashbulbs Engine
 */
let flashCounter = 0;
interface ActiveFlashbulb {
  x: number;
  y: number;
  life: number;
  size: number;
}
const activeFlashbulbs: ActiveFlashbulb[] = [];

export function updateAndDrawCrowdFlashbulbs(
  ctx: CanvasRenderingContext2D,
  ballY: number = PITCH_CONFIG.CENTER_Y,
  isShooting: boolean = false
) {
  flashCounter++;
  const isDangerousPhase =
    ballY < PITCH_CONFIG.PITCH_TOP + 450 ||
    ballY > PITCH_CONFIG.PITCH_BOTTOM - 450 ||
    isShooting;

  if (isDangerousPhase && flashCounter % 4 === 0 && Math.random() < 0.72) {
    const isTop = ballY < PITCH_CONFIG.CENTER_Y;
    const seats = isTop ? cachedTopCrowd : cachedBottomCrowd;
    if (seats.length > 0) {
      const s = seats[Math.floor(Math.random() * seats.length)];
      activeFlashbulbs.push({
        x: s.x + 3,
        y: s.baseY + 2,
        life: 5,
        size: 6 + Math.random() * 5,
      });
    }
  }

  if (activeFlashbulbs.length === 0) return;

  ctx.save();
  for (let i = activeFlashbulbs.length - 1; i >= 0; i--) {
    const f = activeFlashbulbs[i];
    f.life--;
    if (f.life <= 0) {
      activeFlashbulbs.splice(i, 1);
      continue;
    }

    // Brilliant white flash core
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(f.x - 1, f.y - 1, 3, 3);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(f.x - f.size / 2, f.y, f.size, 1);
    ctx.fillRect(f.x, f.y - f.size / 2, 1, f.size);

    // Warm halogen flash aura
    ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
