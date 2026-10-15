/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PITCH_CONFIG, HOME_KIT, AWAY_KIT } from './constants';
import { StadiumTier, TimeOfDay, TeamKit, GraphicsSettings } from '../types';

/**
 * Procedural sky and horizon atmospheric color schemes for each time of day
 */
interface SkyPalette {
  top: string;
  mid: string;
  horizon: string;
  groundFog: string;
  ambientLight: string;
  sunColor: string;
  sunGlow: string;
  hasStars: boolean;
  cloudColor: string;
  cloudShadow: string;
}

const SKY_PALETTES: Record<TimeOfDay, SkyPalette> = {
  dawn: {
    top: '#181136',
    mid: '#432354',
    horizon: '#e07a5f',
    groundFog: 'rgba(235, 148, 120, 0.22)',
    ambientLight: 'rgba(255, 200, 160, 0.15)',
    sunColor: '#ffe5a3',
    sunGlow: 'rgba(255, 180, 100, 0.35)',
    hasStars: true,
    cloudColor: 'rgba(255, 200, 180, 0.45)',
    cloudShadow: 'rgba(80, 40, 70, 0.4)',
  },
  noon: {
    top: '#1565c0',
    mid: '#388e3c', // soft transition towards bright horizon
    horizon: '#90caf9',
    groundFog: 'rgba(255, 255, 255, 0.08)',
    ambientLight: 'rgba(255, 255, 255, 0.12)',
    sunColor: '#fff9c4',
    sunGlow: 'rgba(255, 255, 200, 0.4)',
    hasStars: false,
    cloudColor: 'rgba(255, 255, 255, 0.85)',
    cloudShadow: 'rgba(180, 200, 220, 0.45)',
  },
  sunset: {
    top: '#240046',
    mid: '#7b2cbf',
    horizon: '#ff7b00',
    groundFog: 'rgba(255, 120, 40, 0.25)',
    ambientLight: 'rgba(255, 140, 60, 0.2)',
    sunColor: '#ffea00',
    sunGlow: 'rgba(255, 100, 30, 0.55)',
    hasStars: true,
    cloudColor: 'rgba(255, 140, 100, 0.65)',
    cloudShadow: 'rgba(90, 20, 80, 0.5)',
  },
  night: {
    top: '#050a18',
    mid: '#0d1830',
    horizon: '#142444',
    groundFog: 'rgba(15, 30, 60, 0.35)',
    ambientLight: 'rgba(100, 150, 255, 0.08)',
    sunColor: '#e2e8f0', // Moon
    sunGlow: 'rgba(200, 225, 255, 0.25)',
    hasStars: true,
    cloudColor: 'rgba(30, 45, 75, 0.45)',
    cloudShadow: 'rgba(10, 15, 30, 0.6)',
  },
};

/**
 * Renders the full procedural perimeter horizon, skybox, city skyline,
 * and outer architectural structures behind the stadium.
 */
export function drawPerimeterHorizon(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  cameraY: number,
  stadiumTier: StadiumTier = 'monumental',
  timeOfDay: TimeOfDay = 'night',
  graphicsSettings?: GraphicsSettings
) {
  const cx = PITCH_CONFIG.CENTER_X;
  const cy = PITCH_CONFIG.CENTER_Y;

  // Parallax offsets (subtle realistic camera shift)
  const pX = (cameraX - cx) * 0.12;
  const pY = (cameraY - cy) * 0.08;

  const bgLeft = PITCH_CONFIG.PITCH_LEFT - 1500;
  const bgTop = PITCH_CONFIG.PITCH_TOP - 1300;
  const bgWidth = PITCH_CONFIG.FIELD_WIDTH + 3000;
  const skyHeight = PITCH_CONFIG.PITCH_TOP - bgTop + 140;

  const sky = SKY_PALETTES[timeOfDay] || SKY_PALETTES.night;

  ctx.save();

  // 1. ATMOSPHERIC SKYBOX GRADIENT
  const skyGrad = ctx.createLinearGradient(0, bgTop, 0, PITCH_CONFIG.PITCH_TOP - 220);
  skyGrad.addColorStop(0, sky.top);
  skyGrad.addColorStop(0.55, sky.mid);
  skyGrad.addColorStop(1, sky.horizon);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(bgLeft, bgTop, bgWidth, skyHeight);

  // 2. CELESTIAL BODY (Sun or Moon)
  const sunX = cx + (timeOfDay === 'sunset' ? 420 : timeOfDay === 'dawn' ? -420 : 120) - pX * 0.15;
  const sunY = bgTop + (timeOfDay === 'noon' ? 90 : 160) - pY * 0.1;
  const sunRadius = timeOfDay === 'noon' ? 24 : 28;

  // Sun / Moon radial halo
  const sunGlow = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.6, sunX, sunY, sunRadius * 4.2);
  sunGlow.addColorStop(0, sky.sunGlow);
  sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius * 4.2, 0, Math.PI * 2);
  ctx.fill();

  // Sun / Moon solid core
  ctx.fillStyle = sky.sunColor;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fill();

  // 3. TWINKLING STARS & CLOUDS
  if (sky.hasStars) {
    ctx.fillStyle = timeOfDay === 'night' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 240, 200, 0.35)';
    for (let sx = bgLeft + 40; sx < bgLeft + bgWidth - 40; sx += 140) {
      const starY = bgTop + 30 + ((sx * 17) % 220);
      const size = ((sx * 7) % 3 === 0) ? 2 : 1;
      ctx.fillRect(sx - pX * 0.05, starY - pY * 0.05, size, size);
    }
  }

  // Drifting clouds (procedural pixel puffs)
  drawProceduralClouds(ctx, bgLeft, bgTop, bgWidth, pX, pY, sky);

  // 4. ARCHITECTURAL PERIMETER HORIZON BASED ON STADIUM TIER
  const horizonBaseY = PITCH_CONFIG.PITCH_TOP - 280 - pY * 0.45;

  if (stadiumTier === 'monumental') {
    // 🌆 ELITE METROPOLIS SKYLINE: Modern high-rise skyscrapers, glass towers, antenna masts
    drawMonumentalCitySkyline(ctx, bgLeft, bgWidth, horizonBaseY, pX, timeOfDay);
  } else if (stadiumTier === 'craven') {
    // 🏘️ HISTORIC ENGLISH HERITAGE HORIZON: Victorian terraced houses, chimneys with smoke, leafy park trees, church spires
    drawCravenHeritageHorizon(ctx, bgLeft, bgWidth, horizonBaseY, pX, timeOfDay);
  } else {
    // 🏭 ASCENSO MUNICIPAL HORIZON: Latin American second-division surroundings: rolling hills, tin roofs, water tanks, telegraph wires
    drawAscensoSurroundings(ctx, bgLeft, bgWidth, horizonBaseY, pX, timeOfDay);
  }

  // Atmospheric Ground Mist / Horizon Blend
  const fogGrad = ctx.createLinearGradient(0, horizonBaseY - 60, 0, PITCH_CONFIG.PITCH_TOP - 160);
  fogGrad.addColorStop(0, 'rgba(0,0,0,0)');
  fogGrad.addColorStop(1, sky.groundFog);
  ctx.fillStyle = fogGrad;
  ctx.fillRect(bgLeft, horizonBaseY - 60, bgWidth, 180);

  ctx.restore();
}

/**
 * Draws procedural pixel cloud clusters across the upper sky
 */
function drawProceduralClouds(
  ctx: CanvasRenderingContext2D,
  bgLeft: number,
  bgTop: number,
  bgWidth: number,
  pX: number,
  pY: number,
  sky: SkyPalette
) {
  const cloudBands = [
    { x: bgLeft + 180, y: bgTop + 85, w: 190, h: 22 },
    { x: bgLeft + 640, y: bgTop + 130, w: 260, h: 28 },
    { x: bgLeft + 1200, y: bgTop + 70, w: 220, h: 24 },
    { x: bgLeft + 1750, y: bgTop + 120, w: 290, h: 32 },
    { x: bgLeft + 2350, y: bgTop + 95, w: 210, h: 26 },
  ];

  for (const c of cloudBands) {
    const cx = c.x - pX * 0.12;
    const cy = c.y - pY * 0.08;

    // Cloud shadow underside
    ctx.fillStyle = sky.cloudShadow;
    ctx.fillRect(cx + 6, cy + 10, c.w - 12, c.h - 8);

    // Main cloud puff body
    ctx.fillStyle = sky.cloudColor;
    ctx.fillRect(cx, cy, c.w, c.h - 6);
    // Upper billows
    ctx.fillRect(cx + 25, cy - 8, c.w * 0.45, 8);
    ctx.fillRect(cx + c.w * 0.4, cy - 12, c.w * 0.38, 12);
  }
}

/**
 * Tier 1: Monumental Elite Metropolis Skyline
 * Dense gleaming skyscrapers, lit window grids, telecommunication spires, and red beacons
 */
function drawMonumentalCitySkyline(
  ctx: CanvasRenderingContext2D,
  bgLeft: number,
  bgWidth: number,
  horizonY: number,
  pX: number,
  timeOfDay: TimeOfDay
) {
  const isNightOrDusk = timeOfDay === 'night' || timeOfDay === 'dawn' || timeOfDay === 'sunset';
  const silhouetteColor = timeOfDay === 'night' ? '#0b1329' : timeOfDay === 'sunset' ? '#22112d' : timeOfDay === 'dawn' ? '#201633' : '#334155';

  // Back skyscraper layer (taller, darker)
  ctx.fillStyle = silhouetteColor;
  for (let bx = bgLeft + 80; bx < bgLeft + bgWidth - 80; bx += 85) {
    const bHeight = 110 + ((bx * 37) % 150);
    const bWidth = 55 + ((bx * 23) % 45);
    const bX = bx - pX * 0.35;
    ctx.fillRect(bX, horizonY - bHeight, bWidth, bHeight);

    // Antenna & aircraft warning light
    if ((bx % 240) < 90) {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(bX + bWidth / 2 - 1, horizonY - bHeight - 32, 2, 32);
      ctx.fillStyle = '#ef4444'; // Flashing red beacon
      ctx.fillRect(bX + bWidth / 2 - 2, horizonY - bHeight - 33, 4, 3);
      ctx.fillStyle = silhouetteColor;
    }
  }

  // Front skyscraper layer (with lit windows)
  const frontColor = timeOfDay === 'night' ? '#111c38' : timeOfDay === 'sunset' ? '#351c46' : timeOfDay === 'dawn' ? '#2e2145' : '#475569';
  ctx.fillStyle = frontColor;
  for (let bx = bgLeft + 120; bx < bgLeft + bgWidth - 120; bx += 110) {
    const bHeight = 70 + ((bx * 47) % 100);
    const bWidth = 60 + ((bx * 19) % 40);
    const bX = bx - pX * 0.48;
    ctx.fillRect(bX, horizonY - bHeight, bWidth, bHeight);

    // Modern glass curtain wall roof crown
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(bX + 4, horizonY - bHeight, bWidth - 8, 3);
    ctx.fillStyle = frontColor;

    // Glowing office & residential windows
    if (isNightOrDusk) {
      const winColor = timeOfDay === 'night' ? 'rgba(254, 240, 138, 0.42)' : 'rgba(255, 230, 150, 0.28)';
      ctx.fillStyle = winColor;
      for (let wy = horizonY - bHeight + 14; wy < horizonY - 12; wy += 14) {
        for (let wx = bX + 7; wx < bX + bWidth - 7; wx += 11) {
          if (((wx + wy * 3) % 7) !== 0) {
            ctx.fillRect(wx, wy, 5, 7);
          }
        }
      }
      ctx.fillStyle = frontColor;
    }
  }
}

/**
 * Tier 2: Craven Heritage English Ground Horizon
 * Victorian red-brick terraced houses, brick chimneys with smoke plumes, leafy park trees, and church spires
 */
function drawCravenHeritageHorizon(
  ctx: CanvasRenderingContext2D,
  bgLeft: number,
  bgWidth: number,
  horizonY: number,
  pX: number,
  timeOfDay: TimeOfDay
) {
  const isNight = timeOfDay === 'night';
  const brickColor = isNight ? '#2a1b18' : '#7f2d22';
  const roofColor = isNight ? '#1e242b' : '#334155';
  const treeColor = isNight ? '#122515' : '#22542a';

  // Victorian Terraced Housing Row
  for (let hx = bgLeft + 60; hx < bgLeft + bgWidth - 60; hx += 75) {
    const houseX = hx - pX * 0.4;
    const houseW = 68;
    const houseH = 48 + ((hx * 13) % 18);
    const houseY = horizonY - houseH;

    // Brick house facade
    ctx.fillStyle = brickColor;
    ctx.fillRect(houseX, houseY, houseW, houseH);

    // Pitched slate roof
    ctx.fillStyle = roofColor;
    ctx.beginPath();
    ctx.moveTo(houseX - 3, houseY);
    ctx.lineTo(houseX + houseW / 2, houseY - 18);
    ctx.lineTo(houseX + houseW + 3, houseY);
    ctx.closePath();
    ctx.fill();

    // Chimney stack with cozy fireplace smoke
    ctx.fillStyle = brickColor;
    ctx.fillRect(houseX + 12, houseY - 26, 8, 14);
    ctx.fillRect(houseX + 10, houseY - 28, 12, 3); // Chimney pot

    // Chimney smoke puff
    ctx.fillStyle = isNight ? 'rgba(255, 255, 255, 0.15)' : 'rgba(220, 220, 220, 0.35)';
    ctx.fillRect(houseX + 13, houseY - 34, 4, 5);
    ctx.fillRect(houseX + 15, houseY - 42, 6, 6);
    ctx.fillRect(houseX + 18, houseY - 50, 9, 7);

    // Warm sash windows
    const winGlow = isNight ? '#fde047' : '#94a3b8';
    ctx.fillStyle = winGlow;
    ctx.fillRect(houseX + 10, houseY + 12, 8, 12);
    ctx.fillRect(houseX + 32, houseY + 12, 8, 12);
    ctx.fillRect(houseX + 50, houseY + 12, 8, 12);
  }

  // Historic Parish Church Spire every 600px
  for (let cx = bgLeft + 350; cx < bgLeft + bgWidth - 200; cx += 650) {
    const churchX = cx - pX * 0.4;
    const churchY = horizonY - 75;

    // Church stone tower
    ctx.fillStyle = isNight ? '#1e2430' : '#475569';
    ctx.fillRect(churchX - 16, churchY, 32, 75);

    // Gothic steeple spire
    ctx.fillStyle = isNight ? '#141c28' : '#334155';
    ctx.beginPath();
    ctx.moveTo(churchX - 16, churchY);
    ctx.lineTo(churchX, churchY - 65);
    ctx.lineTo(churchX + 16, churchY);
    ctx.closePath();
    ctx.fill();

    // Spire cross
    ctx.fillStyle = '#facc15';
    ctx.fillRect(churchX - 1, churchY - 72, 2, 8);
    ctx.fillRect(churchX - 3, churchY - 69, 6, 2);
  }

  // Leafy Park Trees between buildings
  for (let tx = bgLeft + 110; tx < bgLeft + bgWidth - 110; tx += 120) {
    const treeX = tx - pX * 0.42;
    const treeY = horizonY - 14;

    // Trunk
    ctx.fillStyle = '#422006';
    ctx.fillRect(treeX - 2, treeY - 20, 4, 20);

    // Foliage canopy
    ctx.fillStyle = treeColor;
    ctx.beginPath();
    ctx.arc(treeX, treeY - 32, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(treeX - 8, treeY - 26, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(treeX + 8, treeY - 26, 12, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Tier 3: Ascenso Municipal Raw Concrete Surroundings
 * Latin American 2nd-division ground: rolling hills, tin industrial roofs, water tanks, telegraph wires
 */
function drawAscensoSurroundings(
  ctx: CanvasRenderingContext2D,
  bgLeft: number,
  bgWidth: number,
  horizonY: number,
  pX: number,
  timeOfDay: TimeOfDay
) {
  const isNight = timeOfDay === 'night';
  const hillColor = isNight ? '#101d14' : timeOfDay === 'sunset' ? '#3d251d' : '#3a5028';

  // Rolling Arid/Green Hills in distance
  ctx.fillStyle = hillColor;
  ctx.beginPath();
  ctx.moveTo(bgLeft, horizonY);
  for (let x = bgLeft; x <= bgLeft + bgWidth; x += 180) {
    const hillY = horizonY - 70 - Math.sin((x * 0.0035)) * 45 - Math.cos((x * 0.008)) * 25;
    ctx.lineTo(x - pX * 0.25, hillY);
  }
  ctx.lineTo(bgLeft + bgWidth, horizonY + 50);
  ctx.lineTo(bgLeft, horizonY + 50);
  ctx.closePath();
  ctx.fill();

  // Low industrial brick houses & cinderblock rooftops
  const houseColor = isNight ? '#22272e' : '#8d6e63';
  const tinRoofColor = isNight ? '#2d333b' : '#94a3b8';

  for (let hx = bgLeft + 70; hx < bgLeft + bgWidth - 70; hx += 80) {
    const bX = hx - pX * 0.42;
    const bW = 72;
    const bH = 34 + ((hx * 17) % 22);
    const bY = horizonY - bH;

    // Cinderblock wall
    ctx.fillStyle = houseColor;
    ctx.fillRect(bX, bY, bW, bH);

    // Corrugated tin roof with rust patches
    ctx.fillStyle = tinRoofColor;
    ctx.fillRect(bX - 2, bY - 4, bW + 4, 5);
    ctx.fillStyle = '#b45309'; // Rust spots
    ctx.fillRect(bX + 8, bY - 4, 14, 2);
    ctx.fillRect(bX + 42, bY - 4, 18, 2);

    // Rooftop Blue/Black Water Tank (Tanque de agua)
    if ((hx % 160) < 90) {
      ctx.fillStyle = isNight ? '#1e293b' : '#0284c7';
      ctx.fillRect(bX + bW - 20, bY - 14, 14, 10);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(bX + bW - 22, bY - 16, 18, 3); // Tank lid
    }

    // Windows with iron security bars
    ctx.fillStyle = isNight ? '#fde047' : '#334155';
    ctx.fillRect(bX + 12, bY + 10, 10, 10);
    ctx.fillRect(bX + 40, bY + 10, 10, 10);
  }

  // Wooden Utility Poles with Overhead Wire Cables
  ctx.strokeStyle = isNight ? 'rgba(255, 255, 255, 0.2)' : 'rgba(30, 41, 59, 0.4)';
  ctx.lineWidth = 1;

  for (let px = bgLeft + 150; px < bgLeft + bgWidth - 150; px += 240) {
    const poleX = px - pX * 0.45;
    const poleTopY = horizonY - 65;

    // Wooden pole
    ctx.fillStyle = '#451a03';
    ctx.fillRect(poleX - 2, poleTopY, 4, 65);
    // Crossbeam
    ctx.fillRect(poleX - 10, poleTopY + 4, 20, 3);

    // Wire drooping to next pole
    const nextX = poleX + 240;
    ctx.beginPath();
    ctx.moveTo(poleX - 8, poleTopY + 4);
    ctx.quadraticCurveTo(poleX + 120, poleTopY + 18, nextX - 8, poleTopY + 4);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(poleX + 8, poleTopY + 4);
    ctx.quadraticCurveTo(poleX + 120, poleTopY + 22, nextX + 8, poleTopY + 4);
    ctx.stroke();
  }
}

/**
 * Draws the stadium apron, perimeter floor, running track or gravel border,
 * dugouts, ad hoardings, and floodlight towers according to the stadium tier.
 */
export function drawStadiumArchitecture(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  cameraY: number,
  stadiumTier: StadiumTier = 'monumental',
  timeOfDay: TimeOfDay = 'night',
  homeKit: TeamKit = HOME_KIT,
  awayKit: TeamKit = AWAY_KIT,
  graphicsSettings?: GraphicsSettings
) {
  const cx = PITCH_CONFIG.CENTER_X;
  const cy = PITCH_CONFIG.CENTER_Y;
  const pX = (cameraX - cx) * 0.12;
  const pY = (cameraY - cy) * 0.08;

  // 1. STADIUM APRON & SURROUNDS
  drawStadiumApron(ctx, stadiumTier);

  // 2. ADVERTISING HOARDINGS (LED, Painted Billboards, or Rustic Concrete Walls)
  drawStadiumAdHoardings(ctx, stadiumTier, timeOfDay, graphicsSettings);

  // 3. TECHNICAL AREAS & DUGOUTS (Modern VIP Dugout, English Timber, or Concrete Block)
  drawStadiumDugouts(ctx, stadiumTier, homeKit, awayKit);

  // 4. FOUR CORNER FLOODLIGHT TOWERS / PYLONS
  drawStadiumFloodlights(ctx, stadiumTier, timeOfDay, pX, pY);
}

/**
 * Draws outer stadium apron & running track / boundary floor
 */
function drawStadiumApron(ctx: CanvasRenderingContext2D, tier: StadiumTier) {
  const left = PITCH_CONFIG.PITCH_LEFT - 130;
  const top = PITCH_CONFIG.PITCH_TOP - 160;
  const width = PITCH_CONFIG.FIELD_WIDTH + 260;
  const height = PITCH_CONFIG.FIELD_HEIGHT + 320;

  if (tier === 'monumental') {
    // Pristine modern dark asphalt concourse with synthetic deep blue / cyan accent running apron
    ctx.fillStyle = '#0f172a'; // Deep asphalt
    ctx.fillRect(left - 50, top - 50, width + 100, height + 100);

    // High-tech blue synthetic athletic run-off track
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(left, top, width, height);

    // Crisp regulation laser white dashes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(left + 16, top + 16, width - 32, height - 32);
    ctx.strokeRect(left + 36, top + 36, width - 72, height - 72);
    ctx.setLineDash([]);
  } else if (tier === 'craven') {
    // Traditional red cinder running track with dark perimeter curb
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(left - 40, top - 40, width + 80, height + 80);

    ctx.fillStyle = '#873d2f'; // Red clay cinder
    ctx.fillRect(left, top, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(left + 15, top + 15, width - 30, height - 30);
    ctx.strokeRect(left + 35, top + 35, width - 70, height - 70);
    ctx.setLineDash([]);

    // Cinder track grain texture
    ctx.fillStyle = '#733327';
    for (let y = top + 8; y < top + height; y += 14) {
      ctx.fillRect(left + 4, y, width - 8, 1);
    }
  } else {
    // Ascenso: Weathered concrete, dirt gravel apron, dry grass patches, weed tufts
    ctx.fillStyle = '#292524'; // Weathered concrete
    ctx.fillRect(left - 40, top - 40, width + 80, height + 80);

    // Gravel & compacted soil apron
    ctx.fillStyle = '#44403c';
    ctx.fillRect(left, top, width, height);

    // Earthy dry dirt patches & cracks
    ctx.fillStyle = '#78350f';
    for (let i = 0; i < 28; i++) {
      const rx = left + 20 + ((i * 127) % (width - 40));
      const ry = top + 20 + ((i * 89) % (height - 40));
      ctx.fillRect(rx, ry, 24, 8);
    }

    // Concrete expansion joint cracks
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 1.5;
    for (let x = left + 60; x < left + width; x += 110) {
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x + 4, top + height);
      ctx.stroke();
    }
  }
}

/**
 * Advertising Hoardings:
 * - Monumental: Animated scrolling / glowing LED panels
 * - Craven: Vintage painted billboard sponsors
 * - Ascenso: Weathered hand-painted concrete barriers with wire mesh fence
 */
function drawStadiumAdHoardings(
  ctx: CanvasRenderingContext2D,
  tier: StadiumTier,
  timeOfDay: TimeOfDay,
  graphicsSettings?: GraphicsSettings
) {
  const left = PITCH_CONFIG.PITCH_LEFT - 100;
  const width = PITCH_CONFIG.FIELD_WIDTH + 200;
  const boardYTop = PITCH_CONFIG.PITCH_TOP - 95;
  const boardYBottom = PITCH_CONFIG.PITCH_BOTTOM + 65;
  const adHeight = 32;

  ctx.save();
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textBaseline = 'middle';

  const isAnimatedLED = tier === 'monumental' && graphicsSettings?.tier !== 'performance';
  const now = Date.now();
  const ledOffset = isAnimatedLED ? (now * 0.04) % 240 : 0;

  const positions = [boardYTop, boardYBottom];

  for (const boardY of positions) {
    // Base backing
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(left, boardY, width, adHeight);

    if (tier === 'monumental') {
      // Modern High-Res Animated LED Ad Hoardings
      const ledPanels = [
        { bg: '#0284c7', glow: '#38bdf8', text: '⚡ SONY PLAYSTATION', color: '#ffffff' },
        { bg: '#b91c1c', glow: '#f87171', text: 'PIRELLI FORMULA', color: '#ffffff' },
        { bg: '#047857', glow: '#34d399', text: 'HEINEKEN 0.0%', color: '#ffffff' },
        { bg: '#4338ca', glow: '#818cf8', text: 'EA SPORTS FC', color: '#facc15' },
        { bg: '#d97706', glow: '#fbbf24', text: 'MASTERCARD PRIDE', color: '#ffffff' },
      ];
      const pWidth = 240;
      let curX = left - (isAnimatedLED ? ledOffset : 0);
      let idx = 0;

      while (curX < left + width + pWidth) {
        if (curX + pWidth > left) {
          const p = ledPanels[idx % ledPanels.length];
          ctx.fillStyle = p.bg;
          ctx.fillRect(Math.max(left, curX), boardY, Math.min(pWidth - 4, left + width - curX), adHeight);

          // Digital top LED neon strip
          ctx.fillStyle = p.glow;
          ctx.fillRect(Math.max(left, curX), boardY, Math.min(pWidth - 4, left + width - curX), 2);
          ctx.fillRect(Math.max(left, curX), boardY + adHeight - 2, Math.min(pWidth - 4, left + width - curX), 2);

          // LED text
          ctx.fillStyle = p.color;
          if (curX + 16 >= left && curX + 16 <= left + width - 40) {
            ctx.fillText(p.text, curX + 14, boardY + adHeight / 2 + 1);
          }
        }
        curX += pWidth;
        idx++;
      }
    } else if (tier === 'craven') {
      // Classic English Painted Billboard Sponsors
      const panels = [
        { bg: '#b81212', text: 'SENSIBLE SOCCER', color: '#ffffff' },
        { bg: '#d4d4d4', text: "'95 / '96", color: '#111111' },
        { bg: '#0055b8', text: 'PIXEL CUP', color: '#ffffff' },
        { bg: '#1c7430', text: 'AMIGA POWER', color: '#ffd700' },
        { bg: '#78350f', text: 'RETRO BITTER ALE', color: '#fef08a' },
        { bg: '#1e293b', text: 'HERITAGE GROUND', color: '#ffffff' },
      ];
      const pWidth = 220;
      let curX = left;
      let idx = 0;

      while (curX < left + width) {
        const p = panels[idx % panels.length];
        ctx.fillStyle = p.bg;
        ctx.fillRect(curX, boardY, pWidth - 4, adHeight);

        // Painted wood bevel
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.fillRect(curX, boardY, pWidth - 4, 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(curX, boardY + adHeight - 2, pWidth - 4, 2);

        ctx.fillStyle = p.color;
        ctx.fillText(p.text, curX + 12, boardY + adHeight / 2 + 1);

        curX += pWidth;
        idx++;
      }
    } else {
      // Ascenso: Hand-painted local ads on weathered concrete wall + chain-link fence
      const panels = [
        { bg: '#292524', text: 'TALLER MECANICO', color: '#facc15' },
        { bg: '#1c1917', text: 'FERRETERIA GOL', color: '#ef4444' },
        { bg: '#292524', text: 'GASEOSA RETRO', color: '#38bdf8' },
        { bg: '#1c1917', text: 'CARNICERIA TITO', color: '#ffffff' },
        { bg: '#292524', text: 'C.A. ASCENSO 1948', color: '#4ade80' },
      ];
      const pWidth = 240;
      let curX = left;
      let idx = 0;

      while (curX < left + width) {
        const p = panels[idx % panels.length];
        ctx.fillStyle = p.bg;
        ctx.fillRect(curX, boardY, pWidth - 6, adHeight);

        // Weathered wall texture
        ctx.fillStyle = '#44403c';
        ctx.fillRect(curX + 6, boardY + 4, 18, 4);

        ctx.fillStyle = p.color;
        ctx.fillText(p.text, curX + 14, boardY + adHeight / 2 + 1);

        curX += pWidth;
        idx++;
      }

      // Chain-link safety fence (Alambrado) along the boards
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
      ctx.lineWidth = 1;
      for (let fx = left; fx < left + width; fx += 16) {
        ctx.beginPath();
        ctx.moveTo(fx, boardY - 14);
        ctx.lineTo(fx, boardY + adHeight);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(left, boardY - 14);
      ctx.lineTo(left + width, boardY - 14);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Dugouts / Technical Shelters along left touchline
 */
function drawStadiumDugouts(
  ctx: CanvasRenderingContext2D,
  tier: StadiumTier,
  homeKit: TeamKit,
  awayKit: TeamKit
) {
  const left = PITCH_CONFIG.PITCH_LEFT;
  const cy = PITCH_CONFIG.CENTER_Y;

  ctx.save();

  // Technical box markings
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(left - 38, cy - 110, 32, 90); // Away box
  ctx.strokeRect(left - 38, cy + 20, 32, 90);  // Home box
  ctx.setLineDash([]);

  if (tier === 'monumental') {
    // Modern sunken dugout with curved acrylic roof and leather bucket seats
    drawExecutiveDugout(ctx, left - 62, cy - 95, 18, 60, awayKit.primaryColor);
    drawExecutiveDugout(ctx, left - 62, cy + 35, 18, 60, homeKit.primaryColor);
  } else if (tier === 'craven') {
    // Classic British painted timber shelter with pitched dark roof
    drawClassicDugout(ctx, left - 55, cy - 95, 14, 55, awayKit.primaryColor);
    drawClassicDugout(ctx, left - 55, cy + 35, 14, 55, homeKit.primaryColor);
  } else {
    // Ascenso: Bare concrete block shelter with weathered bench
    drawRusticDugout(ctx, left - 50, cy - 90, 12, 50, awayKit.primaryColor);
    drawRusticDugout(ctx, left - 50, cy + 40, 12, 50, homeKit.primaryColor);
  }

  ctx.restore();
}

function drawExecutiveDugout(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, teamColor: string) {
  // Dugout shadow
  ctx.fillStyle = 'rgba(10, 20, 10, 0.55)';
  ctx.fillRect(x - 3, y + 2, w + 6, h + 4);

  // Tinted tempered glass canopy
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(x, y, w, h);

  // Sleek aluminum frame
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);

  // Luxury Recaro style bucket seats
  ctx.fillStyle = teamColor;
  for (let sy = y + 5; sy < y + h - 8; sy += 11) {
    ctx.fillRect(x + 3, sy, w - 6, 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + w / 2 - 2, sy + 1, 4, 2); // Headrest logo
    ctx.fillStyle = teamColor;
  }
}

function drawClassicDugout(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, teamColor: string) {
  ctx.fillStyle = 'rgba(10, 30, 10, 0.45)';
  ctx.fillRect(x - 2, y + 2, w + 4, h + 4);

  ctx.fillStyle = 'rgba(30, 41, 59, 0.88)';
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = teamColor;
  for (let seatY = y + 4; seatY < y + h - 6; seatY += 10) {
    ctx.fillRect(x + 3, seatY, w - 6, 6);
  }
}

function drawRusticDugout(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, teamColor: string) {
  // Raw concrete walls
  ctx.fillStyle = '#44403c';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#292524';
  ctx.strokeRect(x, y, w, h);

  // Wooden bench
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x + 2, y + 4, w - 4, h - 8);

  ctx.fillStyle = teamColor;
  ctx.fillRect(x + 3, y + h / 2 - 6, w - 6, 12);
}

/**
 * Four Corner Floodlight Towers:
 * - Monumental: Sleek tubular pylons with angled high-output halogen arrays
 * - Craven: Traditional criss-cross steel lattice towers
 * - Ascenso: Concrete/pipe poles with spotlights (some bulbs burnt out for raw character)
 */
function drawStadiumFloodlights(
  ctx: CanvasRenderingContext2D,
  tier: StadiumTier,
  timeOfDay: TimeOfDay,
  pX: number,
  pY: number
) {
  const towers = [
    { x: PITCH_CONFIG.PITCH_LEFT - 190, y: PITCH_CONFIG.PITCH_TOP - 220 },
    { x: PITCH_CONFIG.PITCH_RIGHT + 190, y: PITCH_CONFIG.PITCH_TOP - 220 },
    { x: PITCH_CONFIG.PITCH_LEFT - 190, y: PITCH_CONFIG.PITCH_BOTTOM + 220 },
    { x: PITCH_CONFIG.PITCH_RIGHT + 190, y: PITCH_CONFIG.PITCH_BOTTOM + 220 },
  ];

  for (const t of towers) {
    const tx = t.x - pX * 0.25;
    const ty = t.y - pY * 0.25;

    if (tier === 'monumental') {
      drawModernTubularMast(ctx, tx, ty, timeOfDay);
    } else if (tier === 'craven') {
      drawSteelLatticePylon(ctx, tx, ty, timeOfDay);
    } else {
      drawRusticSpotlightPole(ctx, tx, ty, timeOfDay);
    }
  }
}

function drawModernTubularMast(ctx: CanvasRenderingContext2D, tx: number, ty: number, timeOfDay: TimeOfDay) {
  const isNight = timeOfDay === 'night' || timeOfDay === 'sunset' || timeOfDay === 'dawn';
  ctx.save();

  // White/silver aerodynamic tubular column
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(tx - 4, ty - 65, 8, 85);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(tx, ty - 65, 4, 85); // Shading

  // Modern angled floodlight bank head
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(tx - 26, ty - 82, 52, 18);

  // Modern LED matrix bulbs
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 7; c++) {
      const lx = tx - 22 + c * 7;
      const ly = ty - 79 + r * 7;
      ctx.fillStyle = isNight ? '#ffffff' : '#64748b';
      ctx.fillRect(lx, ly, 5, 5);
      if (isNight) {
        ctx.fillStyle = '#38bdf8'; // Subtle cyan high-tech tint
        ctx.fillRect(lx + 1, ly + 1, 3, 3);
      }
    }
  }

  // Brilliant LED atmospheric halo
  if (isNight) {
    const halo = ctx.createRadialGradient(tx, ty - 73, 6, tx, ty - 73, 95);
    halo.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    halo.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(tx, ty - 73, 95, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawSteelLatticePylon(ctx: CanvasRenderingContext2D, tx: number, ty: number, timeOfDay: TimeOfDay) {
  const isNight = timeOfDay === 'night' || timeOfDay === 'sunset' || timeOfDay === 'dawn';
  ctx.save();

  // Steel tower base & lattice legs
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(tx - 18, ty + 20);
  ctx.lineTo(tx - 6, ty - 60);
  ctx.lineTo(tx + 6, ty - 60);
  ctx.lineTo(tx + 18, ty + 20);
  ctx.stroke();

  // Cross braces
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(tx - 14, ty);
  ctx.lineTo(tx + 10, ty - 30);
  ctx.moveTo(tx + 14, ty);
  ctx.lineTo(tx - 10, ty - 30);
  ctx.stroke();

  // Top floodlight head platform
  ctx.fillStyle = '#334155';
  ctx.fillRect(tx - 24, ty - 75, 48, 16);

  // Warm Halogen incandescent bulbs
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 6; col++) {
      const lx = tx - 20 + col * 7;
      const ly = ty - 71 + row * 6;
      ctx.fillStyle = isNight ? '#fef08a' : '#64748b';
      ctx.fillRect(lx, ly, 5, 4);
      if (isNight) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(lx + 1, ly + 1, 3, 2);
      }
    }
  }

  // Warm halogen halo
  if (isNight) {
    const halo = ctx.createRadialGradient(tx, ty - 65, 8, tx, ty - 65, 90);
    halo.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
    halo.addColorStop(0.5, 'rgba(253, 224, 71, 0.12)');
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(tx, ty - 65, 90, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawRusticSpotlightPole(ctx: CanvasRenderingContext2D, tx: number, ty: number, timeOfDay: TimeOfDay) {
  const isNight = timeOfDay === 'night' || timeOfDay === 'sunset' || timeOfDay === 'dawn';
  ctx.save();

  // Concrete pole with rust stains
  ctx.fillStyle = '#64748b';
  ctx.fillRect(tx - 5, ty - 55, 10, 75);
  ctx.fillStyle = '#92400e'; // Rust streak
  ctx.fillRect(tx - 2, ty - 35, 3, 20);

  // Cross steel arm
  ctx.fillStyle = '#334155';
  ctx.fillRect(tx - 18, ty - 62, 36, 8);

  // 4 circular spotlights (3 lit, 1 burnt out for authentic raw 2nd-division character!)
  for (let i = 0; i < 4; i++) {
    const lx = tx - 15 + i * 9;
    const ly = ty - 60;
    const isBurntOut = i === 2; // 1 bulb burnt out!
    ctx.fillStyle = isNight ? (isBurntOut ? '#475569' : '#fef08a') : '#334155';
    ctx.fillRect(lx, ly, 7, 5);
    if (isNight && !isBurntOut) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(lx + 1, ly + 1, 5, 3);
    }
  }

  if (isNight) {
    const halo = ctx.createRadialGradient(tx, ty - 58, 6, tx, ty - 58, 75);
    halo.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(tx, ty - 58, 75, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
