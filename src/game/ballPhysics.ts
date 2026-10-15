/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ball, Player, TeamSide, KeyState } from '../types';
import { PITCH_CONFIG, PHYSICS } from './constants';
import { audio } from './audio';
import {
  calculateShortPassSuccessRate,
  calculateLongPassSuccessRate,
  calculateCrossSuccessRate,
  calculateInsideBoxShotAccuracy,
  calculateLongShotAccuracy,
  isStatBreak,
} from './playerStats';

/**
 * Aerodynamic soccer ball constants (FIFA Regulation Size 5 ball, 430g, 22cm diameter)
 */
export const BALL_AERO = {
  MAGNUS_COEFF: 0.0125,   // Lateral acceleration per unit of spin * velocity
  LIFT_COEFF: 0.008,      // Vertical lift from backspin
  SPIN_DECAY: 0.986,      // Rate at which ball spin attenuates in flight
  TURF_SPIN_GRIP: 0.35,   // Spin to linear velocity transfer on bounce
  MAX_DEFORMATION: 0.85,  // Maximum elongation factor (oval stretch)
  MIN_SPEED_DEFORM: 3.2,  // Speed threshold before elongation kicks in
  CHIP_TURF_BITE: 0.62,   // Deceleration factor when backspin chip checks up on grass
};

export interface KickAccuracyInfo {
  isStanding: boolean;
  isRunning: boolean;
  isSprinting: boolean;
  isDefenderTouching: boolean;
  touchingDefender: Player | null;
  errorSpreadMultiplier: number;
}

export interface TrajectoryResult {
  vx: number;
  vy: number;
  vz: number;
  spin: number;
  spinY: number;
  isAirborne: boolean;
  isOverpowered: boolean;
  isSpecialCurve: boolean;
  isChipped: boolean;
  chipType?: 'shot' | 'cross' | 'pass';
  bannerMessage: string;
  isThunderbolt?: boolean;
  isLaserPing?: boolean;
  isGuidedWhip?: boolean;
  isRadarTelemetry?: boolean;
  isDeadlyAssassin?: boolean;
  statBreakTrait?: string;
}

/**
 * Evaluates kick accuracy based on player momentum, standing precision, and defender proximity
 */
export function evaluateKickAccuracyInfo(
  player: Player,
  keys: KeyState | undefined,
  allPlayers: Player[]
): KickAccuracyInfo {
  const isMoving = Math.hypot(player.vx, player.vy) > 0.35;
  const hasArrowInput = !!(keys && (keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight));
  const isRunning = isMoving || hasArrowInput || player.action === 'running';
  const isStanding = !isRunning;
  const isSprinting = isRunning && !!(keys?.Shift || (player.dashTimer && player.dashTimer > 0));

  let isDefenderTouching = false;
  let touchingDefender: Player | null = null;
  for (const p of allPlayers) {
    if (p.team !== player.team && !p.isRedCarded) {
      const d = Math.hypot(p.x - player.x, p.y - player.y);
      if (d < 28) {
        isDefenderTouching = true;
        touchingDefender = p;
        break;
      }
    }
  }

  let errorSpreadMultiplier = 1.0;
  if (isStanding) errorSpreadMultiplier = 0.45;
  if (isRunning) errorSpreadMultiplier = 1.0;
  if (isSprinting) errorSpreadMultiplier = 1.45;
  if (isDefenderTouching) errorSpreadMultiplier *= 2.0;

  return {
    isStanding,
    isRunning,
    isSprinting,
    isDefenderTouching,
    touchingDefender,
    errorSpreadMultiplier,
  };
}

/**
 * Phase 5 — 1. Canonical Short Pass Trajectory (S / Green S Button)
 * Governed by Short Passing (SPA), Composure (CMP), and Match Stakes (W):
 * P_short(S) in [10% at 40 -> 95% at 99 -> 98% Break]
 * On failure: angular error dispersion theta_err in +- [15 deg, 35 deg] & velocity scatter +- 30%
 */
export function calculateShortPassPhysics(
  player: Player,
  targetX: number,
  targetY: number,
  power: number,
  isSpecial: boolean,
  isChip: boolean,
  acc: KickAccuracyInfo,
  stakeFactor: number = 0
): TrajectoryResult {
  const dx = targetX - player.x;
  const dy = targetY - player.y;
  const dist = Math.hypot(dx, dy) || 1;

  // Retrieve canonical attributes
  const spa = player.canonicalStats && 'spa' in player.canonicalStats ? player.canonicalStats.spa : 75;
  const cmp = player.canonicalStats && 'cmp' in player.canonicalStats ? player.canonicalStats.cmp : 70;
  const baseSuccess = calculateShortPassSuccessRate(spa, cmp, stakeFactor);
  const effectiveSuccess = Math.max(0.04, baseSuccess / acc.errorSpreadMultiplier);
  const isSuccess = Math.random() < effectiveSuccess;
  const hasStatBreak = isStatBreak(spa);

  if (power >= 0.90) {
    // Overpowered Short Pass: rolls past teammate with excessive force
    const overSpeed = 15.5;
    return {
      vx: (dx / dist) * overSpeed,
      vy: (dy / dist) * overSpeed,
      vz: 0.3,
      spin: isSpecial ? (Math.random() > 0.5 ? 8.2 : -8.2) : (Math.random() - 0.5) * 1.5,
      spinY: 0,
      isAirborne: false,
      isOverpowered: true,
      isSpecialCurve: isSpecial,
      isChipped: false,
      bannerMessage: isSpecial
        ? 'VIOLENT HOOK PASS PAST TEAMMATE!'
        : 'OVERHIT PASS! ROLLED PAST TEAMMATE! (BURGUNDY)',
    };
  }

  // Calculate direction angle and apply error dispersion on miss
  let aimAngle = Math.atan2(dy, dx);
  let speedMultiplier = 1.0;

  if (!isSuccess && !hasStatBreak) {
    const errorAngle = ((15 + Math.random() * 20) * Math.PI) / 180;
    const sign = Math.random() > 0.5 ? 1 : -1;
    aimAngle += errorAngle * sign;
    speedMultiplier = 0.70 + Math.random() * 0.60; // +- 30% velocity scatter
  }

  const finalDirX = Math.cos(aimAngle);
  const finalDirY = Math.sin(aimAngle);

  if (isChip) {
    // Delicate chipped short pass / dink over lunging leg
    const chipSpeed = Math.min(14.0, Math.max(9.0, dist * 0.07)) * (0.95 + power * 0.35) * speedMultiplier;
    return {
      vx: finalDirX * chipSpeed + (acc.isRunning ? player.vx * 0.14 : 0),
      vy: finalDirY * chipSpeed + (acc.isRunning ? player.vy * 0.14 : 0),
      vz: 2.8 + power * 0.6,
      spin: 0,
      spinY: -1.8,
      isAirborne: true,
      isOverpowered: false,
      isSpecialCurve: false,
      isChipped: true,
      chipType: 'pass',
      bannerMessage: acc.isDefenderTouching
        ? 'DINKED PASS UNDER PRESSURE (-50% ACCURACY)'
        : hasStatBreak
        ? '⚡ PINPOINT SCOOP CHIP! [STAT BREAK]'
        : 'DELICATE CHIPPED PASS TO FEET! [E]',
    };
  }

  // Crisp, clean ground roll (z = 0, vz = 0)
  const baseSpeed = Math.min(15.2, Math.max(8.8, dist * 0.068)) * (0.95 + power * 0.45) * speedMultiplier;
  const speed = hasStatBreak ? baseSpeed * 1.25 : baseSpeed; // ⚡ Laser Ping: +25% supersonic velocity across grass
  let vx = finalDirX * speed;
  let vy = finalDirY * speed;
  if (acc.isRunning) {
    vx += player.vx * 0.16;
    vy += player.vy * 0.16;
  }

  let spin = (Math.random() - 0.5) * 1.2;
  if (isSpecial) {
    spin = player.x < PITCH_CONFIG.CENTER_X ? 4.5 : -4.5;
  }

  let banner = 'CRISP GROUND PASS TO FEET!';
  if (hasStatBreak) {
    banner = '⚡ LASER PING PASS! [STAT BREAK]';
    audio.playStatBreakChime();
  } else if (isSpecial) banner = 'CURVED SHORT PASS! [Q]';
  else if (!isSuccess) banner = 'MISPLACED PASS UNDER PRESSURE!';
  else if (power >= 0.75) banner = 'CRISP ZIP PASS! (MAX OUTPUT)';
  if (acc.isDefenderTouching && isSuccess) banner = 'PASS UNDER DEFENDER PRESSURE (-50% ACCURACY)';

  return {
    vx,
    vy,
    vz: 0,
    spin,
    spinY: 0,
    isAirborne: false,
    isOverpowered: false,
    isSpecialCurve: isSpecial,
    isChipped: false,
    bannerMessage: banner,
    isLaserPing: hasStatBreak,
    statBreakTrait: hasStatBreak ? 'Laser Ping' : undefined,
  };
}

/**
 * Phase 5 — 2. Canonical Long Pass / Through Ball Trajectory (W / Red L Button)
 * Governed by Long Passing (LPA), Composure (CMP), and Match Stakes (W):
 * P_long = P_short * (1.0 - 0.40) = 0.60 * P_short
 * Stat Break (>99): Radar Telemetry zero-bounce glide with pinpoint targeting
 */
export function calculateLongPassPhysics(
  player: Player,
  targetX: number,
  targetY: number,
  power: number,
  isSpecial: boolean,
  isChip: boolean,
  acc: KickAccuracyInfo,
  stakeFactor: number = 0
): TrajectoryResult {
  const dx = targetX - player.x;
  const dy = targetY - player.y;
  const dist = Math.hypot(dx, dy) || 1;

  // Retrieve canonical attributes
  const lpa = player.canonicalStats && 'lpa' in player.canonicalStats ? player.canonicalStats.lpa : 70;
  const cmp = player.canonicalStats && 'cmp' in player.canonicalStats ? player.canonicalStats.cmp : 70;
  const baseSuccess = calculateLongPassSuccessRate(lpa, cmp, stakeFactor);
  const effectiveSuccess = Math.max(0.03, baseSuccess / acc.errorSpreadMultiplier);
  const isSuccess = Math.random() < effectiveSuccess;
  const hasStatBreak = isStatBreak(lpa);

  if (power >= 0.96) {
    // Overpowered: overcooks through ball past the endline (only at 96%+ burgundy max)
    const overSpeed = 19.5;
    return {
      vx: (dx / dist) * overSpeed,
      vy: (dy / dist) * overSpeed,
      vz: 4.8,
      spin: isSpecial ? (Math.random() > 0.5 ? 9.0 : -9.0) : (Math.random() - 0.5) * 2.0,
      spinY: 0,
      isAirborne: true,
      isOverpowered: true,
      isSpecialCurve: isSpecial,
      isChipped: false,
      bannerMessage: isSpecial
        ? 'VIOLENTLY CURVED LONG PASS! OVERCOOKED!'
        : 'UNCATCHABLE OVERCOOKED THROUGH-BALL! (BURGUNDY)',
    };
  }

  // Calculate direction angle and apply error dispersion on miss
  let aimAngle = Math.atan2(dy, dx);
  let speedMultiplier = 1.0;

  if (!isSuccess && !hasStatBreak) {
    const errorAngle = ((18 + Math.random() * 22) * Math.PI) / 180;
    const sign = Math.random() > 0.5 ? 1 : -1;
    aimAngle += errorAngle * sign;
    speedMultiplier = 0.65 + Math.random() * 0.70; // velocity scatter
  }

  const finalDirX = Math.cos(aimAngle);
  const finalDirY = Math.sin(aimAngle);

  if (isChip) {
    // ⚡ CHIPPED LONG PASS: Scooped aerial ball lifted softly over pressing midfield into channels
    const chipSpeed = (11.6 + power * 1.6) * speedMultiplier;
    return {
      vx: finalDirX * chipSpeed + (acc.isRunning ? player.vx * 0.16 : 0),
      vy: finalDirY * chipSpeed + (acc.isRunning ? player.vy * 0.16 : 0),
      vz: 4.2 + power * 0.8,
      spin: 0,
      spinY: -1.6,
      isAirborne: true,
      isOverpowered: false,
      isSpecialCurve: false,
      isChipped: true,
      chipType: 'pass',
      bannerMessage: acc.isDefenderTouching
        ? 'CHIPPED PASS UNDER PRESSURE (-50% ACCURACY)'
        : hasStatBreak
        ? '⚡ RADAR TELEMETRY GLIDE CHIP! [STAT BREAK]'
        : 'CHIPPED THROUGH-BALL OVER DEFENDERS! [E]',
    };
  }

  if (isSpecial) {
    // Curved swerving through-ball bending around defenders
    const curveSpeed = (11.2 + power * 2.4) * speedMultiplier;
    const curlDir = targetX < player.x ? -1 : 1;
    return {
      vx: finalDirX * curveSpeed + (acc.isRunning ? player.vx * 0.16 : 0),
      vy: finalDirY * curveSpeed + (acc.isRunning ? player.vy * 0.16 : 0),
      vz: 1.4,
      spin: curlDir * 5.2,
      spinY: 1.6,
      isAirborne: true,
      isOverpowered: false,
      isSpecialCurve: true,
      isChipped: false,
      bannerMessage: acc.isDefenderTouching
        ? 'CURVED THROUGH-BALL UNDER PRESSURE (-50% ACCURACY)'
        : 'CURVED SWERVING THROUGH-BALL! [Q]',
    };
  }

  // Standard high-velocity driven ground through-ball cutting through defense
  const drivenSpeed = (12.4 + power * 2.6) * speedMultiplier;
  return {
    vx: finalDirX * drivenSpeed + (acc.isRunning ? player.vx * 0.18 : 0),
    vy: finalDirY * drivenSpeed + (acc.isRunning ? player.vy * 0.18 : 0),
    vz: 0,
    spin: (Math.random() - 0.5) * 1.0,
    spinY: 0,
    isAirborne: false,
    isOverpowered: false,
    isSpecialCurve: false,
    isChipped: false,
    bannerMessage: acc.isDefenderTouching
      ? 'DRIVEN THROUGH-BALL UNDER PRESSURE (-50% ACCURACY)'
      : hasStatBreak
      ? '⚡ RADAR TELEMETRY SWITCH! [STAT BREAK]'
      : !isSuccess
      ? 'OVERHIT / STRAY THROUGH-BALL!'
      : power >= 0.75
      ? 'ROCKET DRIVEN THROUGH-BALL! (MAX VELOCITY)'
      : 'DRIVEN THROUGH-BALL INTO SPACE!',
    isRadarTelemetry: hasStatBreak,
    statBreakTrait: hasStatBreak ? 'Radar Telemetry Switch' : undefined,
  };
}

/**
 * Phase 5 — 3. Canonical Cross Trajectory (D / Blue C Button)
 * Governed by Crossing (CRO), Composure (CMP), and Match Stakes (W):
 * P_cross = P_short * (1.0 - 0.20) = 0.80 * P_short
 * Stat Break (>99): Guided Whip with extreme dipping Magnus curvature
 */
export function calculateCrossPhysics(
  player: Player,
  targetBoxX: number,
  targetBoxY: number,
  power: number,
  isSpecial: boolean,
  isChip: boolean,
  acc: KickAccuracyInfo,
  stakeFactor: number = 0
): TrajectoryResult {
  const fromLeftWing = player.x < PITCH_CONFIG.CENTER_X - 140;
  const fromRightWing = player.x > PITCH_CONFIG.CENTER_X + 140;
  const aimingOppositeWing = (fromLeftWing && targetBoxX > PITCH_CONFIG.CENTER_X + 120) ||
                             (fromRightWing && targetBoxX < PITCH_CONFIG.CENTER_X - 120);
  const isFieldSwitch = aimingOppositeWing && power >= 0.50;

  // Retrieve canonical attributes
  const cro = player.canonicalStats && 'cro' in player.canonicalStats ? player.canonicalStats.cro : 75;
  const cmp = player.canonicalStats && 'cmp' in player.canonicalStats ? player.canonicalStats.cmp : 70;
  const baseSuccess = calculateCrossSuccessRate(cro, cmp, stakeFactor);
  const effectiveSuccess = Math.max(0.04, baseSuccess / acc.errorSpreadMultiplier);
  const isSuccess = Math.random() < effectiveSuccess;
  const hasStatBreak = isStatBreak(cro);

  if (power >= 0.96) {
    // Overpowered Cross: blasts out into far touchline/stands
    const overSpeed = 24.5;
    const overX = fromLeftWing ? PITCH_CONFIG.PITCH_RIGHT + 160 : PITCH_CONFIG.PITCH_LEFT - 160;
    const odx = overX - player.x;
    const ody = targetBoxY - player.y;
    const odist = Math.hypot(odx, ody) || 1;
    return {
      vx: (odx / odist) * overSpeed,
      vy: (ody / odist) * overSpeed,
      vz: 8.5,
      spin: isSpecial ? (fromLeftWing ? 8.2 : -8.2) : (fromLeftWing ? 4.5 : -4.5),
      spinY: 0,
      isAirborne: true,
      isOverpowered: true,
      isSpecialCurve: isSpecial,
      isChipped: false,
      bannerMessage: isSpecial
        ? 'VIOLENT HOOK CROSS INTO FAR STANDS!'
        : 'OVERHIT CROSS! OUT TO THE STANDS! (BURGUNDY)',
    };
  }

  let finalTargetX = targetBoxX;
  let finalTargetY = targetBoxY;

  if (!isSuccess && !hasStatBreak) {
    const errorX = (Math.random() - 0.5) * 85;
    const errorY = (Math.random() - 0.5) * 65;
    finalTargetX += errorX;
    finalTargetY += errorY;
  }

  const dx = finalTargetX - player.x;
  const dy = finalTargetY - player.y;
  const dist = Math.hypot(dx, dy) || 1;

  if (isFieldSwitch) {
    // CAMBIO DE FRENTE: Driven cross-field diagonal switch across to the opposite flank
    const switchSpeed = (18.5 + power * 8.5) * (player.stats.shotPower / 4.4);
    const vx = (dx / dist) * switchSpeed + (acc.isRunning ? player.vx * 0.16 : 0);
    const vy = (dy / dist) * switchSpeed + (acc.isRunning ? player.vy * 0.16 : 0);
    const vz = 2.4 + power * 1.4; // Flatter, driven trajectory to travel quickly
    const spin = fromLeftWing ? 2.5 : -2.5;

    return {
      vx,
      vy,
      vz,
      spin,
      spinY: 0.8,
      isAirborne: true,
      isOverpowered: false,
      isSpecialCurve: isSpecial,
      isChipped: false,
      bannerMessage: 'CAMBIO DE FRENTE! (DRIVEN CROSS-FIELD SWITCH)',
      isGuidedWhip: hasStatBreak,
      statBreakTrait: hasStatBreak ? 'Radar Switch' : undefined,
    };
  }

  if (isChip) {
    // ⚡ CHIPPED CROSS: High floating aerial cross with maximum hang-time; drops onto far-post runners
    const chipSpeed = (12.2 + power * 3.8) * (player.stats.shotPower / 4.4);
    return {
      vx: (dx / dist) * chipSpeed + (acc.isRunning ? player.vx * 0.15 : 0),
      vy: (dy / dist) * chipSpeed + (acc.isRunning ? player.vy * 0.15 : 0),
      vz: 5.4 + power * 1.0, // High floating hang-time for headers
      spin: fromLeftWing ? 1.8 : -1.8,
      spinY: -1.6, // soft float landing in 6-yard box
      isAirborne: true,
      isOverpowered: false,
      isSpecialCurve: false,
      isChipped: true,
      chipType: 'cross',
      bannerMessage: acc.isDefenderTouching
        ? 'CHIPPED CROSS UNDER PRESSURE (-50% ACCURACY)'
        : hasStatBreak
        ? '⚡ GUIDED DIPPING WHIP CROSS! [STAT BREAK]'
        : 'HIGH FLOATING CHIPPED CROSS! [E]',
    };
  }

  // Whipped delivery into dangerous box corridor
  const speed = (15.2 + power * 6.5) * (player.stats.shotPower / 4.5);
  const vx = (dx / dist) * speed + (acc.isRunning ? player.vx * 0.16 : 0);
  const vy = (dy / dist) * speed + (acc.isRunning ? player.vy * 0.16 : 0);
  const vz = 3.6 + power * 1.6;

  let spin = fromLeftWing ? 3.8 : -3.8;
  if (hasStatBreak) spin = fromLeftWing ? 8.5 : -8.5; // Guided whip dipping curve
  else if (isSpecial) spin = fromLeftWing ? 6.8 : -6.8;

  let banner = 'WHIPPED DANGEROUS CROSS INTO BOX!';
  if (hasStatBreak) banner = '⚡ GUIDED WHIP DIPPING CROSS! [STAT BREAK]';
  else if (isSpecial) banner = 'BENDING BANANA CROSS! [Q]';
  else if (!isSuccess) banner = 'OVERCOOKED / DRIFTING CROSS!';
  else if (power >= 0.75) banner = 'POWERFUL WHIPPED CROSS! (RED MAX)';
  if (acc.isDefenderTouching && isSuccess) banner = 'CROSS UNDER DEFENDER PRESSURE (-50% ACCURACY)';

  return {
    vx,
    vy,
    vz,
    spin,
    spinY: 1.8,
    isAirborne: true,
    isOverpowered: false,
    isSpecialCurve: isSpecial,
    isChipped: false,
    bannerMessage: banner,
    isGuidedWhip: hasStatBreak,
    statBreakTrait: hasStatBreak ? 'Guided Whip' : undefined,
  };
}

/**
 * Phase 5 — 4. Canonical Shot Trajectory (A / Orange S Button) & ⚡ Chip Shot (E + A)
 * Inside Box: P_shoot(SHO) [10% at 40 -> 95% at 99 -> 98% Break]
 * Outside Box: P_long_shoot(LSH, D_box) loses 3.5% accuracy per meter outside penalty area
 * Governed by Composure (CMP) and Match Stakes (W)
 */
export function calculateShotPhysics(
  player: Player,
  targetGoalY: number,
  aimX: number,
  power: number,
  isSpecial: boolean,
  isChip: boolean,
  acc: KickAccuracyInfo,
  stakeFactor: number = 0
): TrajectoryResult {
  const isHome = player.team === 'home';
  const boxTop = PITCH_CONFIG.PITCH_TOP + 140;
  const boxBottom = PITCH_CONFIG.PITCH_BOTTOM - 140;
  const isInBox = isHome ? player.y <= boxTop : player.y >= boxBottom;

  // Retrieve canonical attributes
  const sho = player.canonicalStats && 'sho' in player.canonicalStats ? player.canonicalStats.sho : 75;
  const lsh = player.canonicalStats && 'lsh' in player.canonicalStats ? player.canonicalStats.lsh : 72;
  const cmp = player.canonicalStats && 'cmp' in player.canonicalStats ? player.canonicalStats.cmp : 70;

  let successRate: number;
  if (isInBox) {
    successRate = calculateInsideBoxShotAccuracy(sho, cmp, stakeFactor);
  } else {
    const distOutsidePx = isHome ? Math.max(0, player.y - boxTop) : Math.max(0, boxBottom - player.y);
    const distMeters = distOutsidePx / 8.5; // ~8.5 field px per meter
    successRate = calculateLongShotAccuracy(lsh, distMeters, cmp, stakeFactor);
  }

  const effectiveSuccess = Math.max(0.02, successRate / acc.errorSpreadMultiplier);
  const isSuccess = Math.random() < effectiveSuccess;
  const hasStatBreak = isInBox ? isStatBreak(sho) : isStatBreak(lsh);

  if (power >= 0.96) {
    // Overpowered: Blasted over crossbar into the grandstands (only at 96%+ burgundy max)
    const blastSpeed = 31.0 + Math.random() * 3.5;
    const dx = aimX - player.x;
    const dy = targetGoalY - player.y;
    const dist = Math.hypot(dx, dy) || 1;
    return {
      vx: (dx / dist) * blastSpeed,
      vy: (dy / dist) * blastSpeed,
      vz: 9.6,
      spin: isSpecial ? (player.x < PITCH_CONFIG.CENTER_X ? 8.5 : -8.5) : (Math.random() - 0.5) * 3.0,
      spinY: 0,
      isAirborne: true,
      isOverpowered: true,
      isSpecialCurve: isSpecial,
      isChipped: isChip,
      chipType: isChip ? 'shot' : undefined,
      bannerMessage: isSpecial
        ? 'VIOLENT SWERVE INTO THE STANDS! (OVERHIT)'
        : isChip
        ? 'OVERCOOKED CHIP OVER THE CROSSBAR! (BURGUNDY)'
        : 'BLASTED INTO THE STANDS! (OVERHIT)',
    };
  }

  // Adjust aim target based on success vs error dispersion
  let targetX = aimX;
  if (!isSuccess && !hasStatBreak) {
    // Expands shot dispersion angle based on distance outside box
    const distOutsidePx = isHome ? Math.max(0, player.y - boxTop) : Math.max(0, boxBottom - player.y);
    const distFactor = Math.min(2.4, 1.0 + (distOutsidePx / 600));
    const errorSpread = (Math.random() - 0.5) * (90 * distFactor);
    targetX += errorSpread;
  } else {
    // Precision strike within +- 2 degrees
    targetX += (Math.random() - 0.5) * 12;
  }

  const dx = targetX - player.x;
  const dy = targetGoalY - player.y;
  const dist = Math.hypot(dx, dy) || 1;

  if (isChip) {
    // ⚡ CHIP SHOT (E + A): Delicate dink scoop lifting cleanly over a rushing Goalkeeper's hands into net with soft backspin
    let chipSpeed = (10.2 + power * 3.2) * (player.stats.shotPower / 4.4);
    if (acc.isDefenderTouching) chipSpeed *= 0.90;

    return {
      vx: (dx / dist) * chipSpeed + (acc.isRunning ? player.vx * 0.14 : 0),
      vy: (dy / dist) * chipSpeed + (acc.isRunning ? player.vy * 0.14 : 0),
      vz: 4.4 + power * 0.8, // lifts over goalkeeper diving reach
      spin: 0,
      spinY: -2.4, // pronounced backspin checks up softly on bounce
      isAirborne: true,
      isOverpowered: false,
      isSpecialCurve: false,
      isChipped: true,
      chipType: 'shot',
      bannerMessage: acc.isDefenderTouching
        ? 'CHIP SHOT UNDER DEFENDER PRESSURE (-50% ACCURACY)'
        : hasStatBreak
        ? '⚡ SURGICAL CHIP OVER GOALKEEPER! [STAT BREAK]'
        : 'DELICATE CHIP OVER GOALKEEPER! [E]',
    };
  }

  // High-velocity strike aimed toward corners/side netting (true power reaches goal from 3/4 pitch)
  let shotSpeed = (18.5 + power * 15.0) * (player.stats.shotPower / 4.4);
  const isThunderbolt = !isInBox && hasStatBreak;
  const isDeadlyAssassin = isInBox && hasStatBreak;

  if (isThunderbolt) {
    // ⚡ Thunderbolt Cannon: Supersonic ball velocity (33+ px/f), audible sonic crack
    shotSpeed = Math.min(36.0, Math.max(30.0, shotSpeed * 1.36));
    audio.playSonicCrack();
  } else if (isDeadlyAssassin) {
    shotSpeed *= 1.15;
    audio.playStatBreakChime();
  } else if (hasStatBreak) {
    shotSpeed *= 1.12;
    audio.playStatBreakChime();
  }

  if (acc.isDefenderTouching) shotSpeed *= 0.90;

  const vx = (dx / dist) * shotSpeed + (acc.isRunning ? player.vx * 0.16 : 0);
  const vy = (dy / dist) * shotSpeed + (acc.isRunning ? player.vy * 0.16 : 0);
  const vz = 1.6 + power * 2.2;

  let spin = 0;
  if (isThunderbolt) {
    spin = (Math.random() - 0.5) * 5.0; // Erratic knuckleball wobble
  } else if (isSpecial) {
    spin = player.x < PITCH_CONFIG.CENTER_X ? 4.8 : -4.8;
  } else if (player.x < PITCH_CONFIG.CENTER_X - 50) {
    spin = 2.4;
  } else if (player.x > PITCH_CONFIG.CENTER_X + 50) {
    spin = -2.4;
  } else {
    spin = (Math.random() - 0.5) * 1.5;
  }

  let banner = `${player.name.toUpperCase()} STRIKES!`;
  if (isThunderbolt) {
    banner = `⚡ THUNDERBOLT CANNON FROM ${player.name.toUpperCase()}! [STAT BREAK]`;
  } else if (isDeadlyAssassin) {
    banner = `⚡ DEADLY ASSASSIN FINISH FROM ${player.name.toUpperCase()}! [STAT BREAK]`;
  } else if (isSpecial) {
    banner = 'BANANA BEND STRIKE! [Q SPECIAL]';
  } else if (!isInBox) {
    banner = isSuccess ? 'THUMPING LONG RANGE STRIKE ON TARGET!' : 'LONG SHOT DISPERSED WIDE!';
  } else if (power >= 0.75) {
    banner = acc.isStanding ? 'CLEAN POWER STRIKE! (HIGH ACCURACY)' : 'ROCKET STRIKE ON THE RUN!';
  }
  if (acc.isDefenderTouching && isSuccess) banner = 'SHOT UNDER DEFENDER PRESSURE (-50% ACCURACY)';

  return {
    vx,
    vy,
    vz,
    spin,
    spinY: -0.8,
    isAirborne: true,
    isOverpowered: false,
    isSpecialCurve: isSpecial,
    isChipped: false,
    bannerMessage: banner,
    isThunderbolt,
    isDeadlyAssassin,
    statBreakTrait: isThunderbolt ? 'Thunderbolt Cannon' : isDeadlyAssassin ? 'Deadly Assassin' : undefined,
  };
}
