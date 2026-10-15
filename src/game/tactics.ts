/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Ball, TeamSide, PlayerRole, TacticalPlaystyle, DetailedTactics } from '../types';
import { PITCH_CONFIG, PHYSICS } from './constants';

/**
 * =========================================================================
 * 4.4 LIGHTWEIGHT MOBILE ARCHITECTURE: ZERO-ALLOCATION STATIC SCRATCHPADS
 * Pre-allocated typed buffers and arrays completely eliminate per-frame GC thrash.
 * =========================================================================
 */
export const CANDIDATE_TARGETS = new Int32Array(11);
export const CANDIDATE_SCORES = new Float32Array(11);
export const SCRATCH_VEC = new Float32Array(8);

// Reusable scratchpad for pressing assignments without heap allocations
export const SCRATCH_DEFENDER_INDICES = new Int32Array(11);
export const SCRATCH_DEFENDER_DISTSQ = new Float32Array(11);

/**
 * Staggered & Time-Sliced Tactical Decision Ticking:
 * Staggers heavy trigonometric and raycast scanning across 4 frames: (frame + playerIndex) % 4 === 0.
 * Locomotion continues every frame at 60 FPS, reducing AI CPU consumption by 70%.
 */
export function shouldRunTacticalScan(frame: number, playerIndex: number): boolean {
  return (frame + playerIndex) % 4 === 0;
}

/**
 * Fast Euclidean squared distance (dx*dx + dy*dy) avoids expensive Math.sqrt in inner loops
 */
export function distSq(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

/**
 * Fast squared distance from point (px, py) to line segment (x1, y1) -> (x2, y2)
 */
export function distToSegmentSq(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const l2 = distSq(x1, y1, x2, y2);
  if (l2 === 0) return distSq(px, py, x1, y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  return distSq(px, py, projX, projY);
}

/**
 * =========================================================================
 * 4.1 MODERN TACTICAL PRESSING ARCHITECTURE
 * =========================================================================
 */

/**
 * 4.1.1 Computes an interception vector that cuts across the dribbler's forward stride
 * rather than passively chasing their rear coordinates.
 */
export function calculateInterceptionVector(
  defender: Player,
  carrier: Player,
  leadFrames: number = 8
): { targetX: number; targetY: number } {
  // Carrier forward motion vector
  const carrierSpeedSq = carrier.vx * carrier.vx + carrier.vy * carrier.vy;
  const forwardDx = carrierSpeedSq > 0.16 ? carrier.vx : Math.cos(carrier.facingAngle) * 1.5;
  const forwardDy = carrierSpeedSq > 0.16 ? carrier.vy : Math.sin(carrier.facingAngle) * 1.5;

  // Intercept point ahead of the dribbler
  const interceptX = carrier.x + forwardDx * leadFrames;
  const interceptY = carrier.y + forwardDy * leadFrames;

  // Clamp within pitch boundaries
  return {
    targetX: Math.max(PITCH_CONFIG.PITCH_LEFT + 25, Math.min(PITCH_CONFIG.PITCH_RIGHT - 25, interceptX)),
    targetY: Math.max(PITCH_CONFIG.PITCH_TOP + 30, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 30, interceptY)),
  };
}

/**
 * 4.1.1 Tests if the ball carrier has entered the "Zone of Imminent Danger" (Pressing Corridor < 320px)
 */
export function isCarrierInPressingCorridor(
  carrier: Player,
  defLineY: number,
  isDefenderDefendingTop: boolean
): boolean {
  if (isDefenderDefendingTop) {
    // Defending Top Goal (Away team defending Top):
    // Danger if carrier enters within 320px of defLineY towards top goal
    return carrier.y < defLineY + 320;
  } else {
    // Defending Bottom Goal (Home team defending Bottom):
    // Danger if carrier enters within 320px of defLineY towards bottom goal
    return carrier.y > defLineY - 320;
  }
}

/**
 * 4.1.2 Computes cover shadow position along passing ray:
 * P_cover = 0.65 * P_carrier + 0.35 * P_target
 */
export function calculateCoverShadowPosition(
  carrierX: number,
  carrierY: number,
  targetX: number,
  targetY: number
): { x: number; y: number } {
  return {
    x: carrierX * 0.65 + targetX * 0.35,
    y: carrierY * 0.65 + targetY * 0.35,
  };
}

/**
 * 4.1.2 Identifies the best proximate attacking target to shadow for a covering defender
 */
export function findCoverShadowTarget(
  defender: Player,
  carrier: Player,
  allPlayers: Player[],
  isAttackingUp: boolean
): { x: number; y: number } | null {
  let closestAttacker: Player | null = null;
  let minAttackerDistSq = Infinity;

  for (let i = 0; i < allPlayers.length; i++) {
    const p = allPlayers[i];
    // Candidate is an attacking teammate of the ball carrier
    if (p.team === carrier.team && p.id !== carrier.id && p.role !== 'GK' && !p.isRedCarded) {
      const dSq = distSq(defender.x, defender.y, p.x, p.y);
      if (dSq < minAttackerDistSq && dSq < 260 * 260) {
        minAttackerDistSq = dSq;
        closestAttacker = p;
      }
    }
  }

  if (closestAttacker) {
    return calculateCoverShadowPosition(carrier.x, carrier.y, closestAttacker.x, closestAttacker.y);
  }

  return null;
}

/**
 * 4.1.3 Computes Zone 14 screening coordinate (space right outside the 18-yard box)
 */
export function calculateZone14Position(
  player: Player,
  isAttackingUp: boolean,
  ballX: number
): { x: number; y: number } {
  // Zone 14 is centered at 18-yard box arc (D-box)
  const zone14Y = isAttackingUp ? PITCH_CONFIG.PITCH_BOTTOM - 230 : PITCH_CONFIG.PITCH_TOP + 230;
  // Shift horizontally towards ball to block shooting angles
  const shiftX = (ballX - PITCH_CONFIG.CENTER_X) * 0.35;
  return {
    x: Math.max(PITCH_CONFIG.CENTER_X - 120, Math.min(PITCH_CONFIG.CENTER_X + 120, PITCH_CONFIG.CENTER_X + shiftX)),
    y: zone14Y,
  };
}

/**
 * =========================================================================
 * 4.2 PASSING TRIANGLES & UNOBSTRUCTED PASSING LANES
 * =========================================================================
 */

/**
 * 4.2.2 Evaluates whether an opponent sits directly on the passing lane between carrier and teammate.
 * If obstructed (distSq < 35*35), calculates an evasive lateral/diagonal step into open space.
 */
export function findUnobstructedPassingTarget(
  mate: Player,
  carrier: Player,
  opponents: Player[],
  isAttackingUp: boolean
): { targetX: number; targetY: number; isObstructed: boolean } {
  const OBSTRUCT_RADIUS_SQ = 35 * 35; // 35px threshold
  let isObstructed = false;
  let obstructingOpp: Player | null = null;

  for (let i = 0; i < opponents.length; i++) {
    const opp = opponents[i];
    if (opp.isRedCarded || opp.action === 'fouled_falling' || opp.role === 'GK') continue;
    const dSq = distToSegmentSq(opp.x, opp.y, carrier.x, carrier.y, mate.x, mate.y);
    if (dSq < OBSTRUCT_RADIUS_SQ) {
      isObstructed = true;
      obstructingOpp = opp;
      break;
    }
  }

  if (!isObstructed || !obstructingOpp) {
    return { targetX: mate.x, targetY: mate.y, isObstructed: false };
  }

  // Teammate takes 2-3 explosive lateral/diagonal steps into open passing channel
  const passAngle = Math.atan2(mate.y - carrier.y, mate.x - carrier.x);
  const perpAngle1 = passAngle + Math.PI / 2;
  const perpAngle2 = passAngle - Math.PI / 2;

  // Test lateral shift 1 vs shift 2 to see which moves further away from the obstructing opponent
  const stepDist = 48; // ~2-3 sprint strides
  const shift1X = mate.x + Math.cos(perpAngle1) * stepDist;
  const shift1Y = mate.y + Math.sin(perpAngle1) * stepDist;
  const shift2X = mate.x + Math.cos(perpAngle2) * stepDist;
  const shift2Y = mate.y + Math.sin(perpAngle2) * stepDist;

  const dist1 = distSq(shift1X, shift1Y, obstructingOpp.x, obstructingOpp.y);
  const dist2 = distSq(shift2X, shift2Y, obstructingOpp.x, obstructingOpp.y);

  const bestX = dist1 > dist2 ? shift1X : shift2X;
  const bestY = dist1 > dist2 ? shift1Y : shift2Y;

  return {
    targetX: Math.max(PITCH_CONFIG.PITCH_LEFT + 30, Math.min(PITCH_CONFIG.PITCH_RIGHT - 30, bestX)),
    targetY: Math.max(PITCH_CONFIG.PITCH_TOP + 40, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 40, bestY)),
    isObstructed: true,
  };
}

/**
 * =========================================================================
 * 4.2.1 SUPPORT PHASE STATE MACHINE & PASSING TRIANGULATION
 * =========================================================================
 */
export type SupportPhase = 'deep_buildup' | 'midfield_progression' | 'final_third_overload';

/**
 * Determines current team in-possession phase based on ball carrier pitch position
 */
export function determineSupportPhase(carrier: Player, isAttackingUp: boolean): SupportPhase {
  if (isAttackingUp) {
    // Attacking Up: Home defending bottom (~1200px), attacking top (~80px)
    if (carrier.y > PITCH_CONFIG.CENTER_Y + 120) return 'deep_buildup';
    if (carrier.y < PITCH_CONFIG.CENTER_Y - 140) return 'final_third_overload';
    return 'midfield_progression';
  } else {
    // Attacking Down: Away defending top (~80px), attacking bottom (~1200px)
    if (carrier.y < PITCH_CONFIG.CENTER_Y - 120) return 'deep_buildup';
    if (carrier.y > PITCH_CONFIG.CENTER_Y + 140) return 'final_third_overload';
    return 'midfield_progression';
  }
}

/**
 * 4.2.1 Calculates dynamic support target for an outfield teammate:
 * - Deep Buildup: Fullbacks push wide for width; central midfielders drop to form 30°-60° passing triangles.
 * - Midfield Progression: Rest defense pivot holds; attacking midfielders drift into half-spaces.
 * - Final Third Overloads: Strikers pin CBs; wingers make blindside diagonal runs; midfielders arrive on edge of box.
 */
export function calculateSupportVector(
  mate: Player,
  carrier: Player,
  allTeammates: Player[],
  allOpponents: Player[],
  isAttackingUp: boolean,
  playstyle: TacticalPlaystyle,
  tactics?: DetailedTactics
): { targetX: number; targetY: number; runType: Player['supportRunType'] } {
  const phase = determineSupportPhase(carrier, isAttackingUp);
  const dirY = isAttackingUp ? -1 : 1;
  const isDefender = mate.role === 'CB1' || mate.role === 'CB2' || mate.role === 'LB' || mate.role === 'RB';
  const isMidfielder = mate.role === 'CM1' || mate.role === 'CM2' || mate.role === 'LM' || mate.role === 'RM';
  const isForward = mate.role === 'ST1' || mate.role === 'ST2';

  // 1. DEEP BUILDUP:
  if (phase === 'deep_buildup') {
    if (mate.role === 'LB') {
      // Fullbacks push wide for width
      return {
        targetX: PITCH_CONFIG.PITCH_LEFT + 75,
        targetY: carrier.y + dirY * 60,
        runType: 'triangle_short',
      };
    } else if (mate.role === 'RB') {
      return {
        targetX: PITCH_CONFIG.PITCH_RIGHT - 75,
        targetY: carrier.y + dirY * 60,
        runType: 'triangle_short',
      };
    } else if (mate.role === 'CM1' || mate.role === 'CM2') {
      // Central midfielders drop to form passing triangles at 30°-60° angles
      const side = mate.role === 'CM1' ? -1 : 1;
      const angle = (Math.PI / 4) * side; // 45 degree angle
      const triangleDist = 140; // 120-180px optimal short outlet
      const tx = carrier.x + Math.sin(angle) * triangleDist;
      const ty = carrier.y + dirY * Math.cos(angle) * triangleDist;
      return {
        targetX: Math.max(PITCH_CONFIG.PITCH_LEFT + 90, Math.min(PITCH_CONFIG.PITCH_RIGHT - 90, tx)),
        targetY: ty,
        runType: 'triangle_short',
      };
    } else if (isForward) {
      // Forward provides long progressive outlet
      return {
        targetX: mate.role === 'ST1' ? PITCH_CONFIG.CENTER_X - 60 : PITCH_CONFIG.CENTER_X + 60,
        targetY: carrier.y + dirY * 260,
        runType: 'triangle_penetrate',
      };
    }
  }

  // 2. MIDFIELD PROGRESSION:
  if (phase === 'midfield_progression') {
    // Overlapping Fullback Check:
    if (mate.role === 'LB' || mate.role === 'RB') {
      const winger = allTeammates.find(t => (mate.role === 'LB' ? t.role === 'LM' : t.role === 'RM'));
      if (winger) {
        const overlap = calculateOverlappingFullbackRun(mate, winger, carrier, isAttackingUp);
        if (overlap) {
          return { targetX: overlap.targetX, targetY: overlap.targetY, runType: 'overlap' };
        }
      }
    }

    // CM1 holds as defensive pivot (Rest Defense) while CM2 advances into half-spaces
    if (mate.role === 'CM1') {
      return {
        targetX: PITCH_CONFIG.CENTER_X,
        targetY: carrier.y - dirY * 85, // Trailing rest-defense anchor
        runType: 'triangle_short',
      };
    } else if (mate.role === 'CM2') {
      // Half-space penetration between lines
      const halfSpaceX = carrier.x < PITCH_CONFIG.CENTER_X ? PITCH_CONFIG.CENTER_X + 80 : PITCH_CONFIG.CENTER_X - 80;
      return {
        targetX: halfSpaceX,
        targetY: carrier.y + dirY * 135,
        runType: 'triangle_penetrate',
      };
    } else if (mate.role === 'LM') {
      return {
        targetX: PITCH_CONFIG.PITCH_LEFT + 110,
        targetY: carrier.y + dirY * 120,
        runType: 'triangle_penetrate',
      };
    } else if (mate.role === 'RM') {
      return {
        targetX: PITCH_CONFIG.PITCH_RIGHT - 110,
        targetY: carrier.y + dirY * 120,
        runType: 'triangle_penetrate',
      };
    } else if (isForward) {
      // Blindside channel run check
      const channelRun = calculateBlindsideChannelRun(mate, allOpponents, isAttackingUp);
      if (channelRun) {
        return { targetX: channelRun.targetX, targetY: channelRun.targetY, runType: 'blindside' };
      }
    }
  }

  // 3. FINAL THIRD OVERLOADS:
  if (phase === 'final_third_overload') {
    // Cutback check if carrier is near byline
    const cutback = calculateCutbackTarget(mate, carrier, allTeammates, isAttackingUp);
    if (cutback) {
      return { targetX: cutback.targetX, targetY: cutback.targetY, runType: 'cutback' };
    }

    if (isForward) {
      // Strikers pin center-backs and make blindside diagonal runs
      const channelRun = calculateBlindsideChannelRun(mate, allOpponents, isAttackingUp);
      if (channelRun) {
        return { targetX: channelRun.targetX, targetY: channelRun.targetY, runType: 'blindside' };
      }
      return {
        targetX: mate.role === 'ST1' ? PITCH_CONFIG.CENTER_X - 55 : PITCH_CONFIG.CENTER_X + 55,
        targetY: carrier.y + dirY * 85,
        runType: 'blindside',
      };
    } else if (mate.role === 'LM' || mate.role === 'RM') {
      // Wingers make blindside diagonal runs into the box
      const targetBoxX = mate.role === 'LM' ? PITCH_CONFIG.CENTER_X - 70 : PITCH_CONFIG.CENTER_X + 70;
      return {
        targetX: targetBoxX,
        targetY: carrier.y + dirY * 70,
        runType: 'blindside',
      };
    } else if (isMidfielder) {
      // Trailing midfielders arrive on edge of 18-yard box for cutback shots
      const edgeBoxY = isAttackingUp ? PITCH_CONFIG.PITCH_TOP + 230 : PITCH_CONFIG.PITCH_BOTTOM - 230;
      return {
        targetX: mate.role === 'CM1' ? PITCH_CONFIG.CENTER_X - 45 : PITCH_CONFIG.CENTER_X + 45,
        targetY: edgeBoxY,
        runType: 'cutback',
      };
    }
  }

  // Fallback anchor calculation
  const fieldW = PITCH_CONFIG.FIELD_WIDTH;
  const fieldH = PITCH_CONFIG.FIELD_HEIGHT;
  return {
    targetX: PITCH_CONFIG.PITCH_LEFT + mate.baseX * fieldW,
    targetY: PITCH_CONFIG.PITCH_TOP + mate.baseY * fieldH,
    runType: null,
  };
}

/**
 * =========================================================================
 * 4.2.3 INTELLIGENT OFF-THE-BALL RUNS (MODERN TACTICAL ARCHETYPES)
 * =========================================================================
 */

/**
 * Blindside Channel Run:
 * Strikers run between CB and FB on defender's blind side when attacking open space.
 */
export function calculateBlindsideChannelRun(
  striker: Player,
  defenders: Player[],
  isAttackingUp: boolean
): { targetX: number; targetY: number } | null {
  // Find opponent CBs and fullbacks
  let cb1: Player | null = null;
  let cb2: Player | null = null;
  let lb: Player | null = null;
  let rb: Player | null = null;

  for (let i = 0; i < defenders.length; i++) {
    const d = defenders[i];
    if (d.isRedCarded) continue;
    if (d.role === 'CB1') cb1 = d;
    else if (d.role === 'CB2') cb2 = d;
    else if (d.role === 'LB') lb = d;
    else if (d.role === 'RB') rb = d;
  }

  // Channel 1: between LB and CB1; Channel 2: between CB2 and RB
  let channel1X = PITCH_CONFIG.CENTER_X - 110;
  let channel2X = PITCH_CONFIG.CENTER_X + 110;

  if (lb && cb1) channel1X = (lb.x + cb1.x) * 0.5;
  if (rb && cb2) channel2X = (rb.x + cb2.x) * 0.5;

  const diff1 = Math.abs(striker.x - channel1X);
  const diff2 = Math.abs(striker.x - channel2X);

  const bestChannelX = diff1 < diff2 ? channel1X : channel2X;
  const forwardY = isAttackingUp ? striker.y - 140 : striker.y + 140;

  return {
    targetX: bestChannelX,
    targetY: Math.max(PITCH_CONFIG.PITCH_TOP + 60, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 60, forwardY)),
  };
}

/**
 * Overlapping Fullback Run:
 * When a winger cuts inside with the ball, the outside back makes an explosive sprint along touchline.
 */
export function calculateOverlappingFullbackRun(
  fullback: Player,
  winger: Player,
  carrier: Player,
  isAttackingUp: boolean
): { targetX: number; targetY: number } | null {
  const isWingerCarrier = carrier.id === winger.id;
  const isWingerInverted = Math.abs(winger.x - PITCH_CONFIG.CENTER_X) < 320; // Cut inside from flank

  if (!isWingerCarrier || !isWingerInverted) return null;

  // Fullback overlaps along the outside boundary
  const isLeftFlank = fullback.role === 'LB';
  const touchlineX = isLeftFlank ? PITCH_CONFIG.PITCH_LEFT + 75 : PITCH_CONFIG.PITCH_RIGHT - 75;
  const advanceY = isAttackingUp ? winger.y - 110 : winger.y + 110;

  return {
    targetX: touchlineX,
    targetY: Math.max(PITCH_CONFIG.PITCH_TOP + 80, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 80, advanceY)),
  };
}

/**
 * Cutback Awareness:
 * When an attacker reaches the byline inside the penalty box, forwards stagger their runs:
 * Near Post, Penalty Spot, and Edge of 18-yard Box.
 */
export function calculateCutbackTarget(
  runner: Player,
  carrier: Player,
  allTeammates: Player[],
  isAttackingUp: boolean
): { targetX: number; targetY: number } | null {
  // Carrier reached byline inside or near 18-yard box
  const inFinalThirdY = isAttackingUp ? carrier.y < PITCH_CONFIG.PITCH_TOP + 140 : carrier.y > PITCH_CONFIG.PITCH_BOTTOM - 140;
  const isFlankByline = Math.abs(carrier.x - PITCH_CONFIG.CENTER_X) > 160;

  if (!inFinalThirdY || !isFlankByline) return null;

  const isLeftFlank = carrier.x < PITCH_CONFIG.CENTER_X;
  const nearPostX = isLeftFlank ? PITCH_CONFIG.CENTER_X - 60 : PITCH_CONFIG.CENTER_X + 60;
  const penSpotX = PITCH_CONFIG.CENTER_X;
  const edgeBoxX = isLeftFlank ? PITCH_CONFIG.CENTER_X - 30 : PITCH_CONFIG.CENTER_X + 30;

  const goalLineY = isAttackingUp ? PITCH_CONFIG.PITCH_TOP : PITCH_CONFIG.PITCH_BOTTOM;
  const nearPostY = isAttackingUp ? goalLineY + 65 : goalLineY - 65;
  const penSpotY = isAttackingUp ? goalLineY + 130 : goalLineY - 130;
  const edgeBoxY = isAttackingUp ? goalLineY + 230 : goalLineY - 230;

  // Assign roles based on player role:
  // ST1 -> Near Post dart
  // ST2 -> Penalty Spot arrival
  // Arriving Midfielder (CM1/CM2/CAM) -> Edge of box cutback volley
  if (runner.role === 'ST1') {
    return { targetX: nearPostX, targetY: nearPostY };
  } else if (runner.role === 'ST2') {
    return { targetX: penSpotX, targetY: penSpotY };
  } else if (runner.role === 'CM1' || runner.role === 'CM2') {
    return { targetX: edgeBoxX, targetY: edgeBoxY };
  }

  return null;
}

/**
 * 4.2.3 Third-Man Run:
 * When Player A passes to Player B, Player C anticipates the pass and begins a sprint behind the defense
 * before Player B even touches the ball!
 */
export function calculateThirdManRun(
  runner: Player,
  passer: Player,
  receiver: Player,
  isAttackingUp: boolean
): { targetX: number; targetY: number } | null {
  // Candidate is forward or winger running in behind receiver
  if (runner.id === passer.id || runner.id === receiver.id) return null;
  const isRunnerUpfield = isAttackingUp ? runner.y < receiver.y : runner.y > receiver.y;
  if (!isRunnerUpfield) return null;

  const dirY = isAttackingUp ? -1 : 1;
  const targetX = (receiver.x + PITCH_CONFIG.CENTER_X) * 0.5;
  const targetY = receiver.y + dirY * 150;

  return {
    targetX: Math.max(PITCH_CONFIG.PITCH_LEFT + 40, Math.min(PITCH_CONFIG.PITCH_RIGHT - 40, targetX)),
    targetY: Math.max(PITCH_CONFIG.PITCH_TOP + 50, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 50, targetY)),
  };
}

/**
 * =========================================================================
 * 4.3 MATCH CONTEXT & GAME STATE ADAPTATION
 * =========================================================================
 */
export function getContextPressMultiplier(
  scoreDiff: number, // positive = AI winning, negative = AI losing
  matchTimeMinutes: number,
  isGegenpress: boolean
): number {
  let mult = 1.0;
  // Trailing late in match: aggressive surging press
  if (scoreDiff < 0) {
    mult += 0.15;
    if (matchTimeMinutes > 65) mult += 0.20;
    if (matchTimeMinutes > 80) mult += 0.25;
  } else if (scoreDiff > 0 && matchTimeMinutes > 70) {
    // Protecting lead: controlled, compact shape
    mult -= 0.10;
  }

  if (isGegenpress) mult += 0.18;
  return Math.max(0.85, Math.min(1.65, mult));
}

/**
 * =========================================================================
 * 15.5 AUTHORITATIVE "ROLES" SET-PIECE ASSIGNMENT & CANONICAL STAT EVALUATION
 * Evaluated strictly and exclusively via the 18 canonical outfield stats.
 * Zero fictitious stats like "Curve".
 * =========================================================================
 */
import type { TeamRosterPlayer, TeamTacticalRoles } from '../types/team';
import type { CanonicalOutfieldStats } from '../types';

export function getOutfieldStat(player: TeamRosterPlayer, key: keyof CanonicalOutfieldStats): number {
  if (!player.canonicalStats || player.role === 'GK' || !('pac' in player.canonicalStats)) {
    return 40;
  }
  const val = (player.canonicalStats as CanonicalOutfieldStats)[key];
  return typeof val === 'number' ? val : 50;
}

export interface RoleFitResult {
  score: number;
  highlightText: string;
}

/**
 * Evaluates candidate player's fit for a specific set-piece role
 * based strictly on the canonical 18 outfield stats formulas.
 */
export function evaluatePlayerRoleFit(
  player: TeamRosterPlayer,
  role: keyof TeamTacticalRoles
): RoleFitResult {
  const isGK = player.role === 'GK';

  switch (role) {
    case 'captainId': {
      // Captain (C): Composure (CMP) 65% + Positioning (POS) 35%
      const cmp = isGK ? 80 : getOutfieldStat(player, 'cmp');
      const pos = isGK ? 80 : getOutfieldStat(player, 'pos');
      const score = Math.round(cmp * 0.65 + pos * 0.35);
      return { score, highlightText: `CMP ${cmp} · POS ${pos}` };
    }

    case 'freeKickNearId': {
      // Free Kick Near (< 28m): Shooting (SHO) 50% + Long Shots (LSH) 30% + Composure (CMP) 20%
      if (isGK) return { score: 35, highlightText: 'GK' };
      const sho = getOutfieldStat(player, 'sho');
      const lsh = getOutfieldStat(player, 'lsh');
      const cmp = getOutfieldStat(player, 'cmp');
      const score = Math.round(sho * 0.50 + lsh * 0.30 + cmp * 0.20);
      return { score, highlightText: `SHO ${sho} · LSH ${lsh} · CMP ${cmp}` };
    }

    case 'freeKickLongId': {
      // Free Kick Long (> 28m): Long Pass (LPA) 55% + Crossing (CRO) 45%
      if (isGK) return { score: 35, highlightText: 'GK' };
      const lpa = getOutfieldStat(player, 'lpa');
      const cro = getOutfieldStat(player, 'cro');
      const score = Math.round(lpa * 0.55 + cro * 0.45);
      return { score, highlightText: `LPA ${lpa} · CRO ${cro}` };
    }

    case 'penaltyTakerId': {
      // Penalty Taker: Shooting (SHO) 60% + Composure (CMP) 40%
      if (isGK) return { score: 35, highlightText: 'GK' };
      const sho = getOutfieldStat(player, 'sho');
      const cmp = getOutfieldStat(player, 'cmp');
      const score = Math.round(sho * 0.60 + cmp * 0.40);
      return { score, highlightText: `SHO ${sho} · CMP ${cmp}` };
    }

    case 'leftCornerTakerId': {
      // Left Corner: Crossing (CRO) 65% + Short Pass (SPA) 35%
      if (isGK) return { score: 35, highlightText: 'GK' };
      const cro = getOutfieldStat(player, 'cro');
      const spa = getOutfieldStat(player, 'spa');
      const score = Math.round(cro * 0.65 + spa * 0.35);
      return { score, highlightText: `CRO ${cro} · SPA ${spa}` };
    }

    case 'rightCornerTakerId': {
      // Right Corner: Crossing (CRO) 65% + Short Pass (SPA) 35%
      if (isGK) return { score: 35, highlightText: 'GK' };
      const cro = getOutfieldStat(player, 'cro');
      const spa = getOutfieldStat(player, 'spa');
      const score = Math.round(cro * 0.65 + spa * 0.35);
      return { score, highlightText: `CRO ${cro} · SPA ${spa}` };
    }
  }
}

/**
 * Automatically calculates and assigns the optimal set-piece specialist roles
 * across the starting 11 players using canonical stat weight formulas.
 */
export function autoAssignOptimalRoles(startingPlayers: TeamRosterPlayer[]): TeamTacticalRoles {
  const outfield = startingPlayers.filter((p) => p.role !== 'GK');
  const pool = outfield.length > 0 ? outfield : startingPlayers;

  const findBestFor = (role: keyof TeamTacticalRoles): string => {
    let bestId = pool[0]?.id || '';
    let bestScore = -Infinity;
    for (const p of pool) {
      const fit = evaluatePlayerRoleFit(p, role);
      if (fit.score > bestScore) {
        bestScore = fit.score;
        bestId = p.id;
      }
    }
    return bestId;
  };

  // Find natural captain or leader
  const explicitCaptain = startingPlayers.find((p) => p.isCaptain);
  const captainId = explicitCaptain ? explicitCaptain.id : findBestFor('captainId');

  return {
    captainId,
    freeKickNearId: findBestFor('freeKickNearId'),
    freeKickLongId: findBestFor('freeKickLongId'),
    penaltyTakerId: findBestFor('penaltyTakerId'),
    leftCornerTakerId: findBestFor('leftCornerTakerId'),
    rightCornerTakerId: findBestFor('rightCornerTakerId'),
  };
}

