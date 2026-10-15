/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Ball, TeamSide, PlayerRole, DifficultyLevel, TacticalPlaystyle, DetailedTactics } from '../types';
import { PITCH_CONFIG, PHYSICS } from './constants';
import { audio } from './audio';
import { isKickingAction } from './engine';
import { PLAYSTYLE_DEFINITIONS, getDefaultTactics } from './formations';
import { processGoalkeeperShotReaction } from './matchRules';
import { executeStepOvers } from './skills';
import { PLAYSTYLE_ID, getPlaystyleBias } from './playstyles';
import {
  CANDIDATE_TARGETS,
  CANDIDATE_SCORES,
  distSq,
  distToSegmentSq,
  calculateInterceptionVector,
  isCarrierInPressingCorridor,
  calculateCoverShadowPosition,
  findCoverShadowTarget,
  calculateZone14Position,
  findUnobstructedPassingTarget,
  calculateSupportVector,
  calculateBlindsideChannelRun,
  calculateOverlappingFullbackRun,
  calculateCutbackTarget,
  calculateThirdManRun,
  getContextPressMultiplier,
  shouldRunTacticalScan,
} from './tactics';

export interface AiActionOutput {
  action?: 'kick' | 'pass' | 'long_pass' | 'shoot' | 'cross' | 'tackle' | 'slide' | 'header' | 'tactical_foul';
  shotType?: 'driven' | 'finesse' | 'chip';
  targetX?: number;
  targetY?: number;
  power?: number;
  receiverId?: string;
  isAerialLob?: boolean;
  isChipped?: boolean;
  isCurved?: boolean;
}

/**
 * Calculates smart tactical positioning and behavior for 11v11 players.
 * Phase 4: Staggered time-sliced tactical decision ticking, zero-allocation math,
 * pressing envelopes, cover shadows, and teammate dynamic passing triangles.
 */
export function updatePlayerAI(
  player: Player,
  allPlayers: Player[],
  ball: Ball,
  isAttackingUp: boolean, // true for Home (attacks top goal), false for Away (attacks bottom goal)
  difficulty: DifficultyLevel = 'easy',
  scoreDiff: number = 0, // awayScore - homeScore: positive = AI winning, negative = AI losing
  isKickoffActive: boolean = false,
  timeScale: number = 1,
  playstyle: TacticalPlaystyle = 'possession',
  matchTimeMinutes: number = 0,
  detailedTactics?: DetailedTactics,
  playerIndex: number = 0,
  frame: number = 0
): AiActionOutput | null {
  const tactics = detailedTactics || getDefaultTactics(playstyle);

  // If player is signaling for pass, decay the signal timer
  if (player.signalPassTimer && player.signalPassTimer > 0) {
    player.signalPassTimer -= timeScale;
    if (player.signalPassTimer <= 0) {
      player.isSignalingForPass = false;
      player.signalPassTimer = 0;
    }
  }

  // If player is currently executing a fixed locked action, wait for it to finish
  if (
    player.action === 'fouled_falling' ||
    player.action === 'sliding_tackle' ||
    player.action === 'goalkeeper_dive' ||
    (player.actionTimer > 0 && isKickingAction(player.action))
  ) {
    return null;
  }

  // --- KICK OFF ENFORCEMENT (Defending team cannot cross midfield or enter center circle) ---
  // Defending team remains in their own half and outside the center circle until the ball has been passed!
  if (isKickoffActive) {
    const kickingTeam = ball.lastTouchTeam || (ball.ownerId ? allPlayers.find(p => p.id === ball.ownerId)?.team : 'home');
    if (player.team !== kickingTeam && ball.ownerId !== player.id) {
      enforceKickoffBoundary(player, kickingTeam);
      player.vx = 0;
      player.vy = 0;
      player.action = 'idle';
      player.facingAngle = Math.atan2(PITCH_CONFIG.CENTER_Y - player.y, PITCH_CONFIG.CENTER_X - player.x);
      return null;
    }
  }

  // --- DIFFICULTY: STANDING MODE ---
  if (difficulty === 'standing' && player.team === 'away' && player.role !== 'GK') {
    player.vx = 0;
    player.vy = 0;
    player.action = 'idle';
    return null;
  }

  const isOwner = ball.ownerId === player.id;
  const teamHasBall = allPlayers.some(p => p.team === player.team && ball.ownerId === p.id);

  // 1. GOALKEEPER SPECIFIC AI
  if (player.role === 'GK') {
    return updateGoalkeeperAI(player, allPlayers, ball, isAttackingUp, timeScale, playstyle, tactics);
  }

  // 2. BALL CARRIER DECISION MAKING (If AI has the ball)
  if (isOwner) {
    return updateBallCarrierAI(
      player,
      allPlayers,
      ball,
      isAttackingUp,
      difficulty,
      scoreDiff,
      timeScale,
      playstyle,
      matchTimeMinutes,
      tactics,
      isKickoffActive
    );
  }

  // 3. OUT-OF-POSSESSION & OFF-THE-BALL POSITIONING
  return updateOffTheBallAI(
    player,
    allPlayers,
    ball,
    isAttackingUp,
    teamHasBall,
    difficulty,
    scoreDiff,
    timeScale,
    playstyle,
    matchTimeMinutes,
    tactics,
    playerIndex,
    frame
  );
}

/**
 * Enforces that opposing players remain in their own half and outside the center circle during kickoff
 * until the ball has been passed.
 */
function enforceKickoffBoundary(player: Player, kickingTeam: TeamSide = 'home') {
  const defendingTeam = kickingTeam === 'home' ? 'away' : 'home';

  // 1. Can't pass the middle of the pitch (halfway line)
  if (defendingTeam === 'away') {
    // Away defends top half (y <= CENTER_Y)
    const maxAllowedY = PITCH_CONFIG.CENTER_Y - 12;
    if (player.y > maxAllowedY) {
      player.y = maxAllowedY;
    }
  } else {
    // Home defends bottom half (y >= CENTER_Y)
    const minAllowedY = PITCH_CONFIG.CENTER_Y + 12;
    if (player.y < minAllowedY) {
      player.y = minAllowedY;
    }
  }

  // 2. Can't enter the circle at the middle of the pitch (CENTER_CIRCLE_RADIUS = 180)
  const distToCenter = Math.hypot(player.x - PITCH_CONFIG.CENTER_X, player.y - PITCH_CONFIG.CENTER_Y);
  const minCircleRadius = PITCH_CONFIG.CENTER_CIRCLE_RADIUS + 15; // 195px
  if (distToCenter < minCircleRadius) {
    const angle = Math.atan2(player.y - PITCH_CONFIG.CENTER_Y, player.x - PITCH_CONFIG.CENTER_X);
    player.x = PITCH_CONFIG.CENTER_X + Math.cos(angle) * minCircleRadius;
    player.y = PITCH_CONFIG.CENTER_Y + Math.sin(angle) * minCircleRadius;
    // Re-clamp halfway line
    if (defendingTeam === 'away' && player.y > PITCH_CONFIG.CENTER_Y - 12) {
      player.y = PITCH_CONFIG.CENTER_Y - 12;
    } else if (defendingTeam === 'home' && player.y < PITCH_CONFIG.CENTER_Y + 12) {
      player.y = PITCH_CONFIG.CENTER_Y + 12;
    }
  }
}

/**
 * Goalkeeper AI
 */
function updateGoalkeeperAI(
  player: Player,
  allPlayers: Player[],
  ball: Ball,
  isAttackingUp: boolean,
  timeScale: number = 1,
  playstyle: TacticalPlaystyle = 'possession',
  tactics?: DetailedTactics
): AiActionOutput | null {
  const goalLineY = isAttackingUp ? PITCH_CONFIG.PITCH_BOTTOM - 20 : PITCH_CONFIG.PITCH_TOP + 20;
  const goalLeft = PITCH_CONFIG.CENTER_X - PITCH_CONFIG.GOAL_WIDTH / 2;
  const goalRight = PITCH_CONFIG.CENTER_X + PITCH_CONFIG.GOAL_WIDTH / 2;

  // A. IF GOALKEEPER CURRENTLY HAS POSSESSION:
  if (ball.ownerId === player.id) {
    player.gkHoldTimer = (player.gkHoldTimer || 0) + 1;
    player.facingAngle = isAttackingUp ? -Math.PI / 2 : Math.PI / 2;
    player.vx = 0;
    player.vy = 0;
    player.action = 'idle';

    if (player.gkHoldTimer > 40) {
      player.gkHoldTimer = 0;

      // Playstyle distribution bias using DetailedTactics creation mode
      const prefersLong = tactics?.creation === 'long' || playstyle === 'long_ball' || playstyle === 'catenaccio';
      const prefersShort = tactics?.creation === 'short' || playstyle === 'possession' || playstyle === 'conservative';
      const chooseShort = prefersShort ? Math.random() < 0.88 : (prefersLong ? Math.random() < 0.15 : Math.random() < 0.50);

      let bestMate: Player | null = null;
      let bestScore = -Infinity;

      for (let i = 0; i < allPlayers.length; i++) {
        const m = allPlayers[i];
        if (m.team !== player.team || m.id === player.id || m.role === 'GK') continue;

        const isUpfield = isAttackingUp ? m.y < player.y - 65 : m.y > player.y + 65;
        if (!isUpfield) continue;

        const dSq = distSq(m.x, m.y, player.x, player.y);
        if (dSq > 85 * 85 && dSq < 440 * 440) {
          let oppPressure = 0;
          for (let j = 0; j < allPlayers.length; j++) {
            const opp = allPlayers[j];
            if (opp.team !== player.team) {
              const dOppSq = distSq(opp.x, opp.y, m.x, m.y);
              if (dOppSq < 45 * 45) oppPressure += 1;
            }
          }
          const score = 100000 - dSq * 0.5 - oppPressure * 3000;
          if (score > bestScore) {
            bestScore = score;
            bestMate = m;
          }
        }
      }

      if (chooseShort && bestMate) {
        return {
          action: 'pass',
          targetX: bestMate.x,
          targetY: bestMate.y,
          power: 0.82,
          receiverId: bestMate.id,
        };
      } else {
        const midX = PITCH_CONFIG.CENTER_X + (Math.random() - 0.5) * 160;
        const midY = PITCH_CONFIG.CENTER_Y + (isAttackingUp ? 40 : -40) + (Math.random() - 0.5) * 60;
        return {
          action: 'kick',
          targetX: midX,
          targetY: midY,
          power: 0.95,
        };
      }
    }
    return null;
  }

  // B. GOALKEEPER POSITIONING & SAVES
  if (player.gkHoldTimer && player.gkHoldTimer < 0) {
    player.vx = 0;
    player.vy = 0;
    return null;
  }

  const targetX = Math.max(goalLeft + 15, Math.min(goalRight - 15, ball.x));
  let targetY = goalLineY;

  const boxTop = isAttackingUp ? PITCH_CONFIG.PITCH_BOTTOM - PITCH_CONFIG.PENALTY_BOX_HEIGHT : PITCH_CONFIG.PITCH_TOP;
  const boxBottom = isAttackingUp ? PITCH_CONFIG.PITCH_BOTTOM : PITCH_CONFIG.PITCH_TOP + PITCH_CONFIG.PENALTY_BOX_HEIGHT;
  const boxLeft = PITCH_CONFIG.CENTER_X - PITCH_CONFIG.PENALTY_BOX_WIDTH / 2;
  const boxRight = PITCH_CONFIG.CENTER_X + PITCH_CONFIG.PENALTY_BOX_WIDTH / 2;

  const isBallInBox = ball.x >= boxLeft && ball.x <= boxRight && ball.y >= boxTop && ball.y <= boxBottom;
  const distSqToBall = distSq(player.x, player.y, ball.x, ball.y);

  // Phase 8.6: 1v1 Star-Spread Smother (Peter Schmeichel / Neuer starfish spread stance closing angles)
  if (ball.ownerId && isBallInBox && player.action !== 'gk_star_spread' && player.action !== 'goalkeeper_dive' && player.action !== 'gk_fingertip_parry') {
    const carrier = allPlayers.find(p => p.id === ball.ownerId);
    if (carrier && carrier.team !== player.team) {
      const distToCarrier = Math.hypot(carrier.x - player.x, carrier.y - player.y);
      if (distToCarrier < 38) {
        player.action = 'gk_star_spread';
        player.actionTimer = 22;
        player.animFrame = 0;
        player.vx = 0;
        player.vy = 0;
        return null;
      }
    }
  }

  if (isBallInBox && !ball.ownerId && (!player.gkHoldTimer || player.gkHoldTimer >= 0)) {
    if (distSqToBall < 36 * 36 && ball.z < 45) {
      ball.ownerId = player.id;
      ball.lastTouchTeam = player.team;
      ball.lastTouchPlayerId = player.id;
      ball.vx = 0;
      ball.vy = 0;
      ball.vz = 0;
      ball.z = 10;
      ball.isAirborne = false;
      player.action = 'idle';
      player.actionTimer = 0;
      player.gkHoldTimer = 0;
      audio.playKick(0.75);
      return null;
    } else {
      targetY = ball.y;
    }
  }

  const isSweeperKeeper = player.playstyleId === PLAYSTYLE_ID.SWEEPER;
  const isWallKeeper = player.playstyleId === PLAYSTYLE_ID.WALL;

  // Sweeper keeper advances further up pitch during team attacks
  if (isSweeperKeeper && !isBallInBox) {
    const sweepAdvanceY = isAttackingUp ? -65 : 65;
    targetY += sweepAdvanceY;

    // Active Sweeper Rush: charge out to sweep loose balls outside the box
    if (!ball.ownerId && distSqToBall < 240 * 240 && ball.z < 25) {
      if (distSqToBall < 34 * 34) {
        // Kick clear upfield
        const clearY = isAttackingUp ? -1 : 1;
        return {
          action: 'kick',
          targetX: PITCH_CONFIG.CENTER_X + (Math.random() - 0.5) * 180,
          targetY: PITCH_CONFIG.CENTER_Y + clearY * 200,
          power: 0.96,
        };
      }
      targetY = ball.y;
    }
  } else if (isWallKeeper) {
    // Wall keeper stays tightly anchored on the line for optimal reflex diving
    targetY = goalLineY;
  }

  const isShotComing = isAttackingUp ? (ball.vy > 1.5 && ball.y > PITCH_CONFIG.CENTER_Y) : (ball.vy < -1.5 && ball.y < PITCH_CONFIG.CENTER_Y);
  if (isShotComing && distSqToBall < 55 * 55 && !ball.ownerId && (!player.gkHoldTimer || player.gkHoldTimer >= 0)) {
    player.action = 'goalkeeper_dive';
    player.actionTimer = 22;
    player.diveX = (ball.x - player.x) * 0.5;
    player.diveY = (ball.y - player.y) * 0.5;

    // Wall Keeper gets reach bonus
    const reachBonus = isWallKeeper ? 15 : 0;
    if (distSqToBall < (42 + reachBonus) * (42 + reachBonus) && ball.z < 52) {
      processGoalkeeperShotReaction(player, ball, Math.sqrt(distSqToBall), isAttackingUp);
    }
    return null;
  }

  const gkMoveSpeed = isSweeperKeeper ? player.stats.sprintSpeed : player.stats.speed;
  moveTowards(player, targetX, targetY, gkMoveSpeed, timeScale);
  return null;
}

/**
 * Ball Carrier AI with Tactical Playstyle Customization & Killer Instinct Engine (4.3)
 */
function updateBallCarrierAI(
  player: Player,
  allPlayers: Player[],
  ball: Ball,
  isAttackingUp: boolean,
  difficulty: DifficultyLevel,
  scoreDiff: number,
  timeScale: number = 1,
  playstyle: TacticalPlaystyle = 'possession',
  matchTimeMinutes: number = 0,
  tactics?: DetailedTactics,
  isKickoff: boolean = false
): AiActionOutput | null {
  // --- KICK OFF PASS EXECUTION (AI) ---
  // "the team doing the kickoff can pass the ball to any teammate"
  if (isKickoff) {
    player.kickoffPrepTimer = (player.kickoffPrepTimer || 0) + 1;
    player.vx = 0;
    player.vy = 0;
    player.action = 'idle';

    const mates = allPlayers.filter(p => p.team === player.team && p.id !== player.id && !p.isRedCarded);
    if (mates.length === 0) return null;

    // The AI kicker can pass to ANY teammate: strike partner, central midfielder, wingers, or defenders!
    let chosenMate = mates.find(m => m.role === 'ST2');
    if (!chosenMate || (player.id.charCodeAt(0) % 2 === 0)) {
      const mid = mates.find(m => m.role === 'CM1' || m.role === 'CM2');
      if (mid) chosenMate = mid;
    }
    if (!chosenMate) chosenMate = mates[0];

    // Face the chosen teammate
    player.facingAngle = Math.atan2(chosenMate.y - player.y, chosenMate.x - player.x);

    // After brief 20 frames (~0.33s) preparation, deliver the kickoff pass!
    if (player.kickoffPrepTimer > 20) {
      player.kickoffPrepTimer = 0;
      return {
        action: 'pass',
        targetX: chosenMate.x,
        targetY: chosenMate.y,
        power: 0.55,
        receiverId: chosenMate.id,
      };
    }
    return null;
  }

  const rivalGoalX = PITCH_CONFIG.CENTER_X;
  const rivalGoalY = isAttackingUp ? PITCH_CONFIG.PITCH_TOP : PITCH_CONFIG.PITCH_BOTTOM;
  const distSqToRivalGoal = distSq(player.x, player.y, rivalGoalX, rivalGoalY);
  const isRelaxed = difficulty === 'easy' && scoreDiff >= 2;

  // =========================================================================
  // 1. BREAKAWAY & 1v1 GOAL-HUNGER ENGINE
  // =========================================================================
  let rivalGK: Player | null = null;
  let hasDefendersAhead = false;

  for (let i = 0; i < allPlayers.length; i++) {
    const opp = allPlayers[i];
    if (opp.team !== player.team) {
      if (opp.role === 'GK') {
        rivalGK = opp;
      } else if (!opp.isRedCarded) {
        const isAheadY = isAttackingUp ? opp.y < player.y - 12 : opp.y > player.y + 12;
        const isNearChannel = Math.abs(opp.x - player.x) < 85;
        if (isAheadY && isNearChannel) {
          hasDefendersAhead = true;
        }
      }
    }
  }

  const inAttackingHalf = isAttackingUp ? player.y < PITCH_CONFIG.CENTER_Y + 70 : player.y > PITCH_CONFIG.CENTER_Y - 70;
  const isBreakaway = inAttackingHalf && !hasDefendersAhead && distSqToRivalGoal < 390 * 390;

  if (isBreakaway) {
    if (distSqToRivalGoal < 240 * 240) {
      const dSqToGK = rivalGK ? distSq(rivalGK.x, rivalGK.y, player.x, player.y) : 999999;
      const isGKRushing = rivalGK
        ? (isAttackingUp ? rivalGK.y > PITCH_CONFIG.PITCH_TOP + 32 : rivalGK.y < PITCH_CONFIG.PITCH_BOTTOM - 32)
        : false;

      if (rivalGK && isGKRushing && dSqToGK < 85 * 85) {
        // 1. Dink Chip Over Rushing Keeper (E + A)
        return {
          action: 'shoot',
          shotType: 'chip',
          targetX: rivalGoalX + (Math.random() - 0.5) * 20,
          targetY: rivalGoalY,
          power: 0.65,
          isAerialLob: true,
        };
      } else if (Math.abs(player.x - PITCH_CONFIG.CENTER_X) > 42) {
        // 2. Curling Finesse Strike bending around keeper
        const targetFarCornerX = player.x < PITCH_CONFIG.CENTER_X
          ? PITCH_CONFIG.CENTER_X + 68
          : PITCH_CONFIG.CENTER_X - 68;
        return {
          action: 'shoot',
          shotType: 'finesse',
          targetX: targetFarCornerX,
          targetY: rivalGoalY + (isAttackingUp ? -10 : 10),
          power: 0.88,
        };
      } else {
        // 3. Driven Rocket into Corners
        const gkSide = rivalGK && rivalGK.x < PITCH_CONFIG.CENTER_X ? 1 : -1;
        const targetCornerX = PITCH_CONFIG.CENTER_X + gkSide * 68;
        return {
          action: 'shoot',
          shotType: 'driven',
          targetX: targetCornerX,
          targetY: rivalGoalY + (isAttackingUp ? -15 : 15),
          power: 0.96,
        };
      }
    } else {
      // Sprint full pace at goal
      moveTowards(player, rivalGoalX, isAttackingUp ? player.y - 120 : player.y + 120, player.stats.sprintSpeed * 1.08, timeScale);
      return null;
    }
  }

  // =========================================================================
  // 2. 4.3.1 DIRECT THREAT & DISTANCE SHOOTING (< 28m / 260px)
  // Opponents recognize shooting within 260px of the net. If unpressed with open line
  // of sight, midfielders and forwards unleash driven shots or bending curlers!
  // =========================================================================
  const distToRivalGoal = Math.sqrt(distSqToRivalGoal);
  const wantsEarlyShoot = tactics?.finalThird === 'early_shoot' || playstyle === 'catenaccio' || playstyle === 'gegenpress';
  const wantsSecureShoot = tactics?.finalThird === 'secure' || playstyle === 'possession' || playstyle === 'arteta_control';
  const maxShootDist = wantsEarlyShoot ? 430 : (wantsSecureShoot ? 240 : 350);

  if (distToRivalGoal < maxShootDist) {
    let isGoalReachable = true;
    for (let i = 0; i < allPlayers.length; i++) {
      const opp = allPlayers[i];
      if (opp.team !== player.team && opp.role !== 'GK') {
        if (distToSegmentSq(opp.x, opp.y, player.x, player.y, rivalGoalX, rivalGoalY) < 24 * 24) {
          isGoalReachable = false;
          break;
        }
      }
    }

    let shotProb = distToRivalGoal < 220 ? 0.48 : (isGoalReachable ? 0.35 : 0.16);
    if (wantsEarlyShoot) shotProb *= 1.45;
    if (wantsSecureShoot && !isGoalReachable) shotProb = 0.05;

    // Trailing late in match: increased killer instinct & long-distance desperation shots
    if (scoreDiff < 0 && matchTimeMinutes > 65) shotProb *= 1.35;

    if (Math.random() < shotProb) {
      const targetCornerX = player.x < PITCH_CONFIG.CENTER_X
        ? PITCH_CONFIG.CENTER_X + 65 + (Math.random() - 0.5) * 20
        : PITCH_CONFIG.CENTER_X - 65 + (Math.random() - 0.5) * 20;
      const shotType: 'driven' | 'finesse' | 'chip' = Math.abs(player.x - PITCH_CONFIG.CENTER_X) > 45 ? 'finesse' : 'driven';
      return {
        action: 'shoot',
        shotType,
        targetX: targetCornerX,
        targetY: rivalGoalY + (isAttackingUp ? -15 : 15),
        power: isRelaxed ? 0.72 : (shotType === 'driven' ? 0.95 : 0.88),
      };
    }
  }

  // =========================================================================
  // 3. CREATION: DIRECT LONG BALL (Route One)
  // =========================================================================
  const prefersLongBall = tactics?.creation === 'long' || playstyle === 'long_ball' || playstyle === 'brexitball';
  if (prefersLongBall && player.role !== 'ST1' && player.role !== 'ST2') {
    let targetStriker: Player | null = null;
    for (let i = 0; i < allPlayers.length; i++) {
      const p = allPlayers[i];
      if (p.team === player.team && (p.role === 'ST1' || p.role === 'ST2') && !p.isRedCarded) {
        targetStriker = p;
        break;
      }
    }
    if (targetStriker && Math.random() < 0.52) {
      return {
        action: 'cross',
        targetX: targetStriker.x + (Math.random() - 0.5) * 25,
        targetY: targetStriker.y + (isAttackingUp ? -35 : 35),
        power: 0.95,
        receiverId: targetStriker.id,
        isAerialLob: true,
      };
    }
  }

  // =========================================================================
  // 4. FINAL THIRD: CROSSING PLAYSTYLE
  // =========================================================================
  const isTrailingLate = playstyle === 'counterattack' && matchTimeMinutes >= 70 && scoreDiff < 0;
  const isWideWing = player.x < PITCH_CONFIG.PITCH_LEFT + 280 || player.x > PITCH_CONFIG.PITCH_RIGHT - 280;
  const isAttackingZone = isAttackingUp
    ? player.y < PITCH_CONFIG.CENTER_Y + 120
    : player.y > PITCH_CONFIG.CENTER_Y - 120;
  const wantsCrossing = tactics?.finalThird === 'crossing' || isTrailingLate || playstyle === 'counterattack' || playstyle === 'long_ball';

  if (isWideWing && (isAttackingZone || isTrailingLate)) {
    const crossProb = wantsCrossing ? 0.52 : (isRelaxed ? 0.08 : 0.24);
    if (Math.random() < crossProb) {
      const penaltyBoxCenterY = isAttackingUp ? PITCH_CONFIG.PITCH_TOP + 170 : PITCH_CONFIG.PITCH_BOTTOM - 170;
      let targetMate: Player | null = null;

      for (let i = 0; i < allPlayers.length; i++) {
        const p = allPlayers[i];
        if (p.team === player.team && p.id !== player.id && p.role !== 'GK') {
          const inBox = Math.abs(p.x - PITCH_CONFIG.CENTER_X) < 260 &&
            (isAttackingUp ? p.y < PITCH_CONFIG.PITCH_TOP + 320 : p.y > PITCH_CONFIG.PITCH_BOTTOM - 320);
          if (inBox) {
            targetMate = p;
            break;
          }
        }
      }

      const targetX = targetMate ? targetMate.x : PITCH_CONFIG.CENTER_X + (Math.random() - 0.5) * 80;
      const targetY = targetMate ? targetMate.y : penaltyBoxCenterY;

      return {
        action: 'cross',
        targetX,
        targetY,
        power: 0.84,
        receiverId: targetMate ? targetMate.id : undefined,
      };
    }
  }

  // =========================================================================
  // 5. SCAN OPPONENT PRESSURE & SKILL MOVES
  // =========================================================================
  let nearestOppDistSq = Infinity;
  let pressingOpp: Player | null = null;
  for (let i = 0; i < allPlayers.length; i++) {
    const opp = allPlayers[i];
    if (opp.team !== player.team && opp.role !== 'GK' && opp.action !== 'fouled_falling' && !opp.isRedCarded) {
      const dSq = distSq(opp.x, opp.y, player.x, player.y);
      if (dSq < nearestOppDistSq) {
        nearestOppDistSq = dSq;
        pressingOpp = opp;
      }
    }
  }

  const isUnderPressure = nearestOppDistSq < 125 * 125;
  const isFacingAwayFromGoal = isAttackingUp ? Math.sin(player.facingAngle) > 0.35 : Math.sin(player.facingAngle) < -0.35;
  const isSkillfulPlayer = (player.stats.dribbling || 70) >= 74 || playstyle === 'jogobonito' || playstyle === 'futbol_champan';

  // 4.3.3 Protecting a lead: shield the ball at touchlines / under heavy contact
  const isProtectingLead = scoreDiff > 0 && matchTimeMinutes > 70;
  if (nearestOppDistSq < 34 * 34 && pressingOpp && (isFacingAwayFromGoal || isProtectingLead || tactics?.shape === 'strict')) {
    if (Math.random() < 0.44 && !player.isShielding) {
      player.isShielding = true;
      player.action = 'shielding';
      player.actionTimer = 24;
      audio.playShoulderHit();
      return null;
    }
  } else if (player.isShielding && nearestOppDistSq > 55 * 55) {
    player.isShielding = false;
  }

  // Skill Move (Step-overs / feints):
  if (pressingOpp && nearestOppDistSq < 42 * 42 && isSkillfulPlayer && !player.isStepOverActive) {
    const isOppTackling = pressingOpp.action === 'sliding_tackle' || pressingOpp.action === 'standing_tackle';
    if (isOppTackling || Math.random() < 0.26) {
      executeStepOvers(player, () => {});
      const evadeSide = player.x > pressingOpp.x ? 1 : -1;
      moveTowards(player, player.x + evadeSide * 45, isAttackingUp ? player.y - 45 : player.y + 45, player.stats.sprintSpeed * 0.9, timeScale);
      return null;
    }
  }

  // =========================================================================
  // 6. ZERO-HEAP ALLOCATION PASSING ENGINE & FAST VERTICAL TRANSITIONS (4.3.2, 4.4)
  // Uses pre-allocated CANDIDATE_TARGETS and CANDIDATE_SCORES typed arrays.
  // =========================================================================
  let bestCandidateIndex = -1;
  let bestCandidateScore = -Infinity;
  let bestCandidateDist = 0;
  let candidateCount = 0;

  const isShortCreation = tactics?.creation === 'short' || playstyle === 'possession' || playstyle === 'arteta_control';
  const inFinalThird = distToRivalGoal < 380;
  const isOwnHalf = isAttackingUp ? player.y > PITCH_CONFIG.CENTER_Y : player.y < PITCH_CONFIG.CENTER_Y;

  for (let i = 0; i < allPlayers.length; i++) {
    const mate = allPlayers[i];
    if (mate.team !== player.team || mate.id === player.id || mate.role === 'GK' || mate.action === 'fouled_falling' || mate.isRedCarded) {
      continue;
    }

    const distSqToMate = distSq(mate.x, mate.y, player.x, player.y);
    if (distSqToMate < 60 * 60 || distSqToMate > 460 * 460) continue;

    // Passing lane check
    let isLaneBlocked = false;
    for (let j = 0; j < allPlayers.length; j++) {
      const opp = allPlayers[j];
      if (opp.team !== player.team) {
        if (distToSegmentSq(opp.x, opp.y, player.x, player.y, mate.x, mate.y) < 28 * 28) {
          isLaneBlocked = true;
          break;
        }
      }
    }
    if (isLaneBlocked && isShortCreation) continue;

    // Nearest opponent distance to teammate
    let mateOppDistSq = Infinity;
    for (let j = 0; j < allPlayers.length; j++) {
      const opp = allPlayers[j];
      if (opp.team !== player.team) {
        const dSq = distSq(opp.x, opp.y, mate.x, mate.y);
        if (dSq < mateOppDistSq) mateOppDistSq = dSq;
      }
    }
    if (mateOppDistSq < 35 * 35 && isShortCreation) continue;

    const isAhead = isAttackingUp ? mate.y < player.y - 25 : mate.y > player.y + 25;
    const isLateral = Math.abs(mate.y - player.y) <= 45;

    // Progressive Attack Bias: Avoid backward passes in final third unless under extreme pressure
    if (inFinalThird && !isAhead) {
      if (!isUnderPressure || nearestOppDistSq > 30 * 30) continue;
    }

    const distToMate = Math.sqrt(distSqToMate);
    const mateOppDist = Math.sqrt(mateOppDistSq);

    let score = mateOppDist * 1.5;
    if (isAhead) score += inFinalThird ? 260 : 130;
    if (isLateral) score += 40;
    score -= distToMate * 0.22;

    // 4.3.2 Fast Vertical Transitions: Heavy forward runner bias when winning ball in own half
    if (isOwnHalf && isAhead && (mate.role === 'ST1' || mate.role === 'ST2' || mate.role === 'LM' || mate.role === 'RM')) {
      score += 240;
    }

    // Creation bias:
    if (tactics?.creation === 'short') {
      if (distToMate < 180) score += 180;
      else score -= 140;
    } else if (tactics?.creation === 'long') {
      if (distToMate > 240) score += 200;
    }

    if (score > bestCandidateScore) {
      bestCandidateScore = score;
      bestCandidateIndex = i;
      bestCandidateDist = distToMate;
    }

    if (candidateCount < 11) {
      CANDIDATE_TARGETS[candidateCount] = i;
      CANDIDATE_SCORES[candidateCount] = score;
      candidateCount++;
    }
  }

  if (bestCandidateIndex >= 0) {
    const mate = allPlayers[bestCandidateIndex];
    const isAhead = isAttackingUp ? mate.y < player.y - 20 : mate.y > player.y + 20;

    let mateOppDistSq = Infinity;
    for (let j = 0; j < allPlayers.length; j++) {
      const opp = allPlayers[j];
      if (opp.team !== player.team) {
        const dSq = distSq(opp.x, opp.y, mate.x, mate.y);
        if (dSq < mateOppDistSq) mateOppDistSq = dSq;
      }
    }

    const hasSeparation = mateOppDistSq > 28 * 28;
    const isCounterOrDirect = playstyle === 'counterattack' || playstyle === 'long_ball' || tactics?.creation === 'long';
    const isPossessionStyle = playstyle === 'possession' || playstyle === 'arteta_control' || playstyle === 'conservative';

    // 4.3.2 AI Through-Ball Engine
    const wantsLongThroughBall = isAhead && (isCounterOrDirect || (hasSeparation && !isPossessionStyle && Math.random() < 0.70));
    const basePassChance = isShortCreation ? 0.44 : 0.28;
    const passTriggerChance = isUnderPressure ? 0.78 : (isRelaxed ? 0.10 : basePassChance);

    if (Math.random() < passTriggerChance) {
      if (wantsLongThroughBall) {
        // KINETIC ATTACK DRIVER: Lead the runner into space
        const dirY = isAttackingUp ? -1 : 1;
        const leadDist = 48 + Math.min(35, Math.hypot(mate.vx, mate.vy) * 12);
        const leadTargetX = mate.x + Math.cos(mate.facingAngle) * 18;
        const leadTargetY = mate.y + dirY * leadDist;

        let isGroundLaneContested = false;
        for (let j = 0; j < allPlayers.length; j++) {
          const opp = allPlayers[j];
          if (opp.team !== player.team) {
            if (distToSegmentSq(opp.x, opp.y, player.x, player.y, leadTargetX, leadTargetY) < 32 * 32) {
              isGroundLaneContested = true;
              break;
            }
          }
        }

        const isChipped = isGroundLaneContested || Math.random() < 0.28;
        const isCurved = !isChipped && (Math.abs(leadTargetX - player.x) > 120 && Math.random() < 0.35);

        return {
          action: 'long_pass',
          targetX: leadTargetX,
          targetY: leadTargetY,
          power: Math.min(0.85, Math.max(0.50, bestCandidateDist / 380)),
          receiverId: mate.id,
          isChipped,
          isCurved,
        };
      } else {
        // TEMPO REGULATOR & POSSESSION CALMER
        return {
          action: 'pass',
          targetX: mate.x,
          targetY: mate.y,
          power: Math.min(0.80, Math.max(0.42, bestCandidateDist / 360)),
          receiverId: mate.id,
        };
      }
    }
  }

  // =========================================================================
  // 7. DRIBBLE & SPACE EVASION
  // =========================================================================
  const speedScale = isRelaxed ? 0.65 : (scoreDiff <= -2 ? 0.98 : 0.88);
  let targetX = player.x;
  let targetY = isAttackingUp ? player.y - 120 : player.y + 120;

  // Phase 7: Playstyle Inverted Cut-Inside vs Traditional Flank Drive
  if (player.playstyleId !== undefined) {
    const bias = getPlaystyleBias(player.playstyleId);
    if (bias.cutInsideBias > 1.2) {
      const cutDir = player.x < PITCH_CONFIG.CENTER_X ? 1 : -1;
      targetX = player.x + cutDir * 60;
    } else if (bias.crossBias > 1.3) {
      const touchlineDir = player.x > PITCH_CONFIG.CENTER_X ? 1 : -1;
      targetX = player.x + touchlineDir * 30;
    }
  }

  if (pressingOpp && nearestOppDistSq < 90 * 90) {
    const evadeDir = player.x > pressingOpp.x ? 1 : -1;
    targetX = player.x + evadeDir * 55;
  }

  moveTowards(player, targetX, targetY, player.stats.speed * speedScale, timeScale);
  return null;
}

/**
 * Out-of-Possession Positioning, Dynamic Pressing & Tactical Blocks (4.1, 4.2)
 */
function updateOffTheBallAI(
  player: Player,
  allPlayers: Player[],
  ball: Ball,
  isAttackingUp: boolean,
  teamHasBall: boolean,
  difficulty: DifficultyLevel,
  scoreDiff: number,
  timeScale: number = 1,
  playstyle: TacticalPlaystyle = 'possession',
  matchTimeMinutes: number = 0,
  tactics?: DetailedTactics,
  playerIndex: number = 0,
  frame: number = 0
): AiActionOutput | null {
  const distSqToBall = distSq(ball.x, ball.y, player.x, player.y);
  const ballCarrier = allPlayers.find(p => p.id === ball.ownerId);
  const isCarrierGK = ballCarrier && ballCarrier.role === 'GK';

  // 4.4 ZERO HEAP ALLOCATIONS: Rank 1st and 2nd pressers in-place without array allocations
  let firstPresserId: string | null = null;
  let firstPresserDistSq = Infinity;
  let secondPresserId: string | null = null;
  let secondPresserDistSq = Infinity;

  for (let i = 0; i < allPlayers.length; i++) {
    const p = allPlayers[i];
    if (p.team === player.team && p.role !== 'GK' && !p.isRedCarded && p.action !== 'fouled_falling') {
      const dSq = distSq(ball.x, ball.y, p.x, p.y);
      if (dSq < firstPresserDistSq) {
        secondPresserDistSq = firstPresserDistSq;
        secondPresserId = firstPresserId;
        firstPresserDistSq = dSq;
        firstPresserId = p.id;
      } else if (dSq < secondPresserDistSq) {
        secondPresserDistSq = dSq;
        secondPresserId = p.id;
      }
    }
  }

  const is1stPresser = firstPresserId === player.id;
  const is2ndPresser = secondPresserId === player.id;

  // Assign pressRole for visual/tactical diagnostics
  if (is1stPresser) player.pressRole = 'hunter';
  else if (is2ndPresser) player.pressRole = 'trap_closer';
  else player.pressRole = 'cover_shadow';

  // Aggression & Speed Multipliers based on Match Context (4.3.3)
  const isGegenpress = playstyle === 'gegenpress' || tactics?.runs === 'all_attack';
  const isMarkingStyle = tactics?.defensiveStyle === 'marking' || playstyle === 'catenaccio';
  const contextMultiplier = getContextPressMultiplier(scoreDiff, matchTimeMinutes, isGegenpress);

  let speedMultiplier = 0.84 * contextMultiplier;
  let canSlideTackle = true;
  let tackleChance = 0.12;

  if (player.team === 'away') {
    if (difficulty === 'standing') {
      speedMultiplier = 0;
      canSlideTackle = false;
      tackleChance = 0;
    } else if (difficulty === 'easy') {
      speedMultiplier = 0.78 * contextMultiplier;
      canSlideTackle = scoreDiff <= -1;
      tackleChance = 0.08;
    } else if (difficulty === 'normal') {
      speedMultiplier = 0.95 * contextMultiplier;
      canSlideTackle = true;
      tackleChance = 0.15;
    } else if (difficulty === 'elite') {
      speedMultiplier = 1.08 * contextMultiplier;
      canSlideTackle = true;
      tackleChance = 0.24;
    } else if (difficulty === 'legend') {
      speedMultiplier = 1.18 * contextMultiplier;
      canSlideTackle = true;
      tackleChance = 0.32;
    }
  }

  if (isGegenpress) {
    speedMultiplier = Math.min(1.08, speedMultiplier * 1.12);
    tackleChance *= 1.35;
  } else if (isMarkingStyle) {
    tackleChance *= 1.45;
  }

  // =========================================================================
  // A. DEFENSE: MODERN 2026 DYNAMIC PRESSING ENGINE & INTERCEPTION VECTORS (4.1)
  // Zero-hesitation ball engagement, pressing envelope, dynamic interception vectors,
  // containment buffer (45px), and physical challenge (< 28px).
  // =========================================================================
  if (!teamHasBall && !isCarrierGK) {
    const rivalCarrier = ballCarrier && ballCarrier.team !== player.team && !ballCarrier.isRedCarded ? ballCarrier : null;

    // Dynamic Pressing Triggers
    const isCarrierBackward = rivalCarrier
      ? (isAttackingUp ? Math.sin(rivalCarrier.facingAngle) > 0.35 : Math.sin(rivalCarrier.facingAngle) < -0.35)
      : false;
    const isCarrierShielding = rivalCarrier?.isShielding ?? false;
    const isFlankTrap = rivalCarrier
      ? (rivalCarrier.x < PITCH_CONFIG.PITCH_LEFT + 200 || rivalCarrier.x > PITCH_CONFIG.PITCH_RIGHT - 200)
      : false;
    const isDividedOrLoose = !ball.ownerId || ball.isDividedBall;

    // 4.1.1 1st Presser Engagement (The Hunter)
    if (is1stPresser) {
      // Tactical Foul Check (Futbol Champan / Argentine Style)
      if (
        playstyle === 'futbol_champan' &&
        !player.hasYellowCard &&
        rivalCarrier &&
        Math.abs(rivalCarrier.x - PITCH_CONFIG.CENTER_X) < 260 &&
        distSqToBall < 30 * 30 &&
        Math.random() < 0.28
      ) {
        return { action: 'tactical_foul' };
      }

      // 4.1.1 Physical Challenge Distance (< 28px)
      if (rivalCarrier && distSqToBall < 28 * 28 && ball.z < 25) {
        if (canSlideTackle && Math.random() < tackleChance * 0.50) {
          return { action: 'slide' };
        } else if (Math.random() < tackleChance) {
          return { action: 'tackle' };
        }
      }

      // Dynamic Closure Speed & Angle: Interception vector cut across forward stride
      const pressSpeed = player.stats.sprintSpeed * speedMultiplier;
      if (rivalCarrier && distSqToBall > 45 * 45) {
        const intercept = calculateInterceptionVector(player, rivalCarrier, 7);
        moveTowards(player, intercept.targetX, intercept.targetY, pressSpeed, timeScale);
      } else {
        // Containment buffer (<= 45px): active jockeying stance with standing tackle readiness
        moveTowards(player, ball.x, ball.y, pressSpeed * 0.95, timeScale);
      }
      return null;
    }

    // 4.1.2 2nd Presser (The Trap Closer / Double-Team)
    if (is2ndPresser) {
      const shouldDoubleTeam =
        isGegenpress ||
        isCarrierBackward ||
        isCarrierShielding ||
        isFlankTrap ||
        isDividedOrLoose ||
        distSqToBall < 110 * 110;

      if (shouldDoubleTeam) {
        if (rivalCarrier && distSqToBall < 26 * 26 && ball.z < 25) {
          if (canSlideTackle && Math.random() < tackleChance * 0.45) {
            return { action: 'slide' };
          } else if (Math.random() < tackleChance) {
            return { action: 'tackle' };
          }
        }
        const pressSpeed = player.stats.sprintSpeed * speedMultiplier * 0.95;
        moveTowards(player, ball.x, ball.y, pressSpeed, timeScale);
        return null;
      }
    }
  }

  // 2. HEADING CONTEST
  if (ball.isAirborne && ball.z < 45 && distSqToBall < 26 * 26) {
    if (Math.random() < 0.22) {
      return { action: 'header' };
    }
  }

  // =========================================================================
  // B. TACTICAL DEFENSIVE LINE & COMPACTNESS (4.1.3)
  // Defensive Block Depths:
  // - High Press: steps aggressively to halfway line (Y ≈ 620px)
  // - Mid-Block: compact 180px vertical lock, Zone 14 screening
  // - Low Block: back four anchors at 18-yard box boundary
  // =========================================================================
  const fieldW = PITCH_CONFIG.FIELD_WIDTH;
  const fieldH = PITCH_CONFIG.FIELD_HEIGHT;
  const anchorX = PITCH_CONFIG.PITCH_LEFT + player.baseX * fieldW;
  const anchorY = PITCH_CONFIG.PITCH_TOP + player.baseY * fieldH;

  const defLineLevel = tactics?.defensiveLine ?? 3;
  const compactnessLevel = tactics?.compactness ?? 2;
  const isOffsideEnabled = tactics?.offsideTrap ?? false;

  // Horizontal Compactness Scale: 1 = Dispersed (1.15), 4 = Ultra Compact (0.58)
  const widthScaleMap = [1.15, 0.95, 0.78, 0.58];
  const widthScale = widthScaleMap[compactnessLevel - 1] ?? 0.95;

  const ballShiftX = (ball.x - PITCH_CONFIG.CENTER_X) * 0.25 * widthScale;
  let targetX = PITCH_CONFIG.CENTER_X + (anchorX - PITCH_CONFIG.CENTER_X) * widthScale + ballShiftX;
  let targetY = anchorY;

  const isDefender = player.role === 'CB1' || player.role === 'CB2' || player.role === 'LB' || player.role === 'RB';
  const isMidfielder = player.role === 'CM1' || player.role === 'CM2' || player.role === 'LM' || player.role === 'RM';
  const isForward = player.role === 'ST1' || player.role === 'ST2';

  if (!teamHasBall) {
    // -----------------------------------------------------------------------
    // DEFENSE WITHOUT BALL
    // -----------------------------------------------------------------------
    let defLineY: number;
    let minSafeDefY: number;
    let maxSafeDefY: number;

    if (!isAttackingUp) {
      // AWAY TEAM DEFENDS TOP GOAL (Y = PITCH_TOP ~80px)
      const awayLevels = [230, 310, 410, 490, 570];
      defLineY = awayLevels[defLineLevel - 1] ?? 410;
      minSafeDefY = 200; // Strict boundary: no defender drops below 200px!
      maxSafeDefY = 610;

      const oppInMidfield = ball.y > 360 && ball.y < 950;
      if (isOffsideEnabled && oppInMidfield) {
        defLineY += 32; // Step up toward halfway line to catch striker offside!
      }

      if (isDefender) {
        if (player.role === 'CB1') {
          targetX = PITCH_CONFIG.CENTER_X - 58 * widthScale;
          targetY = defLineY;
        } else if (player.role === 'CB2') {
          targetX = PITCH_CONFIG.CENTER_X + 58 * widthScale;
          targetY = defLineY;
        } else if (player.role === 'LB') {
          targetX = Math.min(targetX, PITCH_CONFIG.CENTER_X - 160 * widthScale);
          targetY = defLineY + 10;
        } else if (player.role === 'RB') {
          targetX = Math.max(targetX, PITCH_CONFIG.CENTER_X + 160 * widthScale);
          targetY = defLineY + 10;
        }
        targetY = Math.max(minSafeDefY, Math.min(maxSafeDefY, targetY));
      } else if (isMidfielder) {
        // Zone 14 screening in mid-block
        if (defLineLevel === 2 || defLineLevel === 3) {
          const z14 = calculateZone14Position(player, isAttackingUp, ball.x);
          targetX = (targetX * 0.4) + (z14.x * 0.6);
          targetY = z14.y;
        } else {
          const midDistAhead = compactnessLevel === 4 ? 50 : 85;
          targetY = Math.min(620, defLineY + midDistAhead);
        }
      } else if (isForward) {
        targetY = Math.min(630, defLineY + 160);
      }
    } else {
      // HOME TEAM DEFENDS BOTTOM GOAL (Y = PITCH_BOTTOM ~1200px)
      const homeLevels = [1050, 970, 870, 790, 710];
      defLineY = homeLevels[defLineLevel - 1] ?? 870;
      minSafeDefY = 670;
      maxSafeDefY = 1080;

      const oppInMidfield = ball.y > 330 && ball.y < 920;
      if (isOffsideEnabled && oppInMidfield) {
        defLineY -= 32;
      }

      if (isDefender) {
        if (player.role === 'CB1') {
          targetX = PITCH_CONFIG.CENTER_X - 58 * widthScale;
          targetY = defLineY;
        } else if (player.role === 'CB2') {
          targetX = PITCH_CONFIG.CENTER_X + 58 * widthScale;
          targetY = defLineY;
        } else if (player.role === 'LB') {
          targetX = Math.min(targetX, PITCH_CONFIG.CENTER_X - 160 * widthScale);
          targetY = defLineY - 10;
        } else if (player.role === 'RB') {
          targetX = Math.max(targetX, PITCH_CONFIG.CENTER_X + 160 * widthScale);
          targetY = defLineY - 10;
        }
        targetY = Math.max(minSafeDefY, Math.min(maxSafeDefY, targetY));
      } else if (isMidfielder) {
        if (defLineLevel === 2 || defLineLevel === 3) {
          const z14 = calculateZone14Position(player, isAttackingUp, ball.x);
          targetX = (targetX * 0.4) + (z14.x * 0.6);
          targetY = z14.y;
        } else {
          const midDistAhead = compactnessLevel === 4 ? 50 : 85;
          targetY = Math.max(660, defLineY - midDistAhead);
        }
      } else if (isForward) {
        targetY = Math.max(650, defLineY - 160);
      }
    }

    // -----------------------------------------------------------------------
    // DEFENSIVE STYLE: MARKING vs MIXED vs ZONAL (with Cover Shadows 4.1.2)
    // -----------------------------------------------------------------------
    const defStyle = tactics?.defensiveStyle || 'mixed';

    if (defStyle === 'marking') {
      let assignedOpp: Player | null = null;
      let minDistanceSq = Infinity;

      for (let i = 0; i < allPlayers.length; i++) {
        const opp = allPlayers[i];
        if (opp.team !== player.team && opp.role !== 'GK') {
          let roleMatch = false;
          if ((player.role === 'CB1' || player.role === 'CB2') && (opp.role === 'ST1' || opp.role === 'ST2')) roleMatch = true;
          if (player.role === 'LB' && (opp.role === 'RM' || opp.role === 'ST2')) roleMatch = true;
          if (player.role === 'RB' && (opp.role === 'LM' || opp.role === 'ST1')) roleMatch = true;
          if (isMidfielder && (opp.role === 'CM1' || opp.role === 'CM2' || opp.role === 'LM' || opp.role === 'RM')) roleMatch = true;

          const dSq = distSq(opp.x, opp.y, player.x, player.y);
          if (roleMatch && dSq < 240 * 240) {
            assignedOpp = opp;
            break;
          }
          if (dSq < minDistanceSq && dSq < 190 * 190) {
            minDistanceSq = dSq;
            assignedOpp = opp;
          }
        }
      }

      if (assignedOpp) {
        const goalSideY = isAttackingUp ? 18 : -18;
        targetX = assignedOpp.x;
        targetY = assignedOpp.y + goalSideY;
        if (isDefender) {
          if (!isAttackingUp) targetY = Math.max(200, targetY);
          else targetY = Math.min(1080, targetY);
        }
      }
    } else if (defStyle === 'mixed') {
      // 4.1.2 Mixed: Outfield defenders not engaging carrier calculate cover shadows
      if (ballCarrier && !is1stPresser && !is2ndPresser) {
        const shadow = findCoverShadowTarget(player, ballCarrier, allPlayers, isAttackingUp);
        if (shadow) {
          targetX = (targetX * 0.4) + (shadow.x * 0.6);
          targetY = (targetY * 0.4) + (shadow.y * 0.6);
        }
      }
    } else {
      // Zonal: Squeeze toward central channel and maintain block between ball and goal
      const toCenterDist = targetX - PITCH_CONFIG.CENTER_X;
      targetX = PITCH_CONFIG.CENTER_X + toCenterDist * 0.75;
      const ballToGoalY = isAttackingUp ? Math.min(ball.y + 40, targetY) : Math.max(ball.y - 40, targetY);
      targetY = (targetY * 0.6) + (ballToGoalY * 0.4);
    }
  } else {
    // -----------------------------------------------------------------------
    // OFFENSE WITH BALL: SUPPORT PHASE STATE MACHINE & PASSING TRIANGLES (4.2)
    // -----------------------------------------------------------------------
    if (ballCarrier && ballCarrier.id !== player.id) {
      // 4.2.1 Support Phase calculation: Deep Buildup, Midfield Progression, Final Third Overloads
      const support = calculateSupportVector(player, ballCarrier, allPlayers, allPlayers, isAttackingUp, playstyle, tactics);
      targetX = support.targetX;
      targetY = support.targetY;
      player.supportRunType = support.runType;

      // 4.2.2 Passing Lane Raycast Evaluation:
      // If opponent obstructs lane (< 35px), take explosive 2-3 steps into open passing channel!
      const unobstructed = findUnobstructedPassingTarget(player, ballCarrier, allPlayers, isAttackingUp);
      if (unobstructed.isObstructed) {
        targetX = unobstructed.targetX;
        targetY = unobstructed.targetY;
        player.isSignalingForPass = true;
        player.signalPassTimer = 35;
      }
    } else {
      // Fallback offensive runs if carrier not yet resolved
      const runsConfig = tactics?.runs || 'moderate';
      let runForwardDistance = 0;
      if (runsConfig === 'all_attack') {
        if (isForward) runForwardDistance = 160;
        else if (isMidfielder) runForwardDistance = 130;
        else if (player.role === 'LB' || player.role === 'RB') runForwardDistance = 80;
      } else if (runsConfig === 'moderate') {
        if (isForward) runForwardDistance = 140;
        else if (player.role === 'LM' || player.role === 'RM') runForwardDistance = 110;
        else if (isMidfielder) runForwardDistance = 50;
      } else if (runsConfig === 'low') {
        if (isForward) runForwardDistance = 120;
      }

      const runY = isAttackingUp ? -runForwardDistance : runForwardDistance;
      targetY += runY;
    }
  }

  // Pitch boundary clamping
  targetX = Math.max(PITCH_CONFIG.PITCH_LEFT + 30, Math.min(PITCH_CONFIG.PITCH_RIGHT - 30, targetX));
  targetY = Math.max(PITCH_CONFIG.PITCH_TOP + 40, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 40, targetY));

  // Strict boundary check: CBs never stand on the goal line!
  if (player.role === 'CB1' || player.role === 'CB2') {
    if (!isAttackingUp) targetY = Math.max(200, targetY);
    else targetY = Math.min(1080, targetY);
  }

  // Cache computed tactical target for 60 FPS locomotion
  player.targetX = targetX;
  player.targetY = targetY;

  const speed = distSqToBall < 140 * 140 ? player.stats.sprintSpeed * speedMultiplier * 0.90 : player.stats.speed * speedMultiplier;
  moveTowards(player, targetX, targetY, speed, timeScale);

  return null;
}

/**
 * Computes the optimal tactical position for a player based on role, formation, ball location, and defensive shape.
 */
export function getOptimalTacticalPosition(
  player: Player,
  allPlayers: Player[],
  ball: Ball,
  isAttackingUp: boolean,
  playstyle: TacticalPlaystyle = 'possession',
  tactics?: DetailedTactics
): { x: number; y: number } {
  const fieldW = PITCH_CONFIG.FIELD_WIDTH;
  const fieldH = PITCH_CONFIG.FIELD_HEIGHT;
  const anchorX = PITCH_CONFIG.PITCH_LEFT + player.baseX * fieldW;
  const anchorY = PITCH_CONFIG.PITCH_TOP + player.baseY * fieldH;

  const resolvedTactics = tactics || getDefaultTactics(playstyle);
  const defLineLevel = resolvedTactics.defensiveLine;
  const compLevel = resolvedTactics.compactness;

  const widthScaleMap = [1.15, 0.95, 0.78, 0.58];
  const widthScale = widthScaleMap[compLevel - 1] ?? 0.95;

  const ballShiftX = (ball.x - PITCH_CONFIG.CENTER_X) * 0.25 * widthScale;
  let targetX = PITCH_CONFIG.CENTER_X + (anchorX - PITCH_CONFIG.CENTER_X) * widthScale + ballShiftX;

  let targetY = anchorY;
  const isDefender = player.role === 'CB1' || player.role === 'CB2' || player.role === 'LB' || player.role === 'RB';

  if (!isAttackingUp) {
    const awayLevels = [230, 310, 410, 490, 570];
    const defLineY = awayLevels[defLineLevel - 1] ?? 410;
    if (isDefender) {
      targetY = Math.max(200, defLineY);
    } else {
      targetY = Math.max(260, defLineY + 90);
    }
  } else {
    const homeLevels = [1050, 970, 870, 790, 710];
    const defLineY = homeLevels[defLineLevel - 1] ?? 870;
    if (isDefender) {
      targetY = Math.min(1080, defLineY);
    } else {
      targetY = Math.min(1020, defLineY - 90);
    }
  }

  // Phase 7: Behavioral Bias Multipliers (O(1) in-place scalar arithmetic)
  if (player.playstyleId !== undefined) {
    const bias = getPlaystyleBias(player.playstyleId);

    // 1. Horizontal Cut-Inside vs Stay-Wide Touchline Bias
    if (bias.cutInsideBias > 1.15) {
      // Inverted wingers / attackers pull inside towards half-spaces
      const centerPull = (PITCH_CONFIG.CENTER_X - targetX) * 0.24 * (bias.cutInsideBias - 1.0);
      targetX += centerPull;
    } else if (bias.crossBias > 1.25) {
      // Traditional wingers hug touchlines
      const flankPush = targetX > PITCH_CONFIG.CENTER_X ? 35 : -35;
      targetX += flankPush;
    }

    // 2. Vertical Forward Run / Track-Back Bias
    const teamHasBall = allPlayers.some(p => p.team === player.team && ball.ownerId === p.id);
    if (teamHasBall) {
      const forwardDelta = (isAttackingUp ? -1 : 1) * 38 * (bias.forwardRunBias - 1.0);
      targetY += forwardDelta;
      // Box-to-Box & Shadow Strikers crash the box during attacking phases
      if (bias.boxArrivalBias > 1.25 && (isAttackingUp ? ball.y < PITCH_CONFIG.CENTER_Y + 100 : ball.y > PITCH_CONFIG.CENTER_Y - 100)) {
        const boxSurge = (isAttackingUp ? -1 : 1) * 50;
        targetY += boxSurge;
      }
    } else {
      // Defending phase: track-back or hold anchor zone
      const trackBackDelta = (isAttackingUp ? 1 : -1) * 32 * (bias.trackBackBias - 1.0);
      targetY += trackBackDelta;
      // Destroyer centerbacks step out aggressively to challenge
      if (bias.stepOutBias > 1.25 && isDefender) {
        const stepOutDelta = (isAttackingUp ? -1 : 1) * 35;
        targetY += stepOutDelta;
      }
    }
  }

  // Pitch boundary clamping
  const pad = 30;
  targetX = Math.max(PITCH_CONFIG.PITCH_LEFT + pad, Math.min(PITCH_CONFIG.PITCH_RIGHT - pad, targetX));
  targetY = Math.max(PITCH_CONFIG.PITCH_TOP + pad, Math.min(PITCH_CONFIG.PITCH_BOTTOM - pad, targetY));

  return { x: targetX, y: targetY };
}

/**
 * Calculates distance from a point (px, py) to a line segment (x1, y1) -> (x2, y2)
 */
export function distanceToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(distToSegmentSq(px, py, x1, y1, x2, y2));
}

/**
 * Moves player toward a target coordinate with realistic acceleration and facing direction
 */
export function moveTowards(player: Player, targetX: number, targetY: number, targetSpeed: number, timeScale: number = 1) {
  const dx = targetX - player.x;
  const dy = targetY - player.y;
  const distSqVal = dx * dx + dy * dy;

  if (distSqVal < 9) { // < 3px
    player.vx = 0;
    player.vy = 0;
    player.action = 'idle';
    return;
  }

  const dist = Math.sqrt(distSqVal);
  const speed = Math.min(targetSpeed, dist * 0.5);
  const targetVx = (dx / dist) * speed;
  const targetVy = (dy / dist) * speed;

  const accel = PHYSICS.ACCELERATION * timeScale;
  player.vx += (targetVx - player.vx) * accel;
  player.vy += (targetVy - player.vy) * accel;

  player.x += player.vx * timeScale;
  player.y += player.vy * timeScale;

  player.facingAngle = Math.atan2(player.vy, player.vx);
  updateFacingDirection(player);

  player.action = 'running';
  player.animTimer = (player.animTimer || 0) + 1;
  if (player.animTimer > 6) {
    player.animTimer = 0;
    player.animFrame = ((player.animFrame || 0) + 1) % 4;
  }
}

/**
 * Updates 8-way facing direction based on facing angle (or optional dx/dy vector)
 */
export function updateFacingDirection(player: Player, dx?: number, dy?: number) {
  if (dx !== undefined && dy !== undefined && (dx !== 0 || dy !== 0)) {
    player.facingAngle = Math.atan2(dy, dx);
  }

  let angle = player.facingAngle;
  while (angle < 0) angle += Math.PI * 2;
  while (angle >= Math.PI * 2) angle -= Math.PI * 2;

  const octant = Math.round((angle / (Math.PI * 2)) * 8) % 8;
  switch (octant) {
    case 0: player.facingDir = 'right'; break;
    case 1: player.facingDir = 'down-right'; break;
    case 2: player.facingDir = 'down'; break;
    case 3: player.facingDir = 'down-left'; break;
    case 4: player.facingDir = 'left'; break;
    case 5: player.facingDir = 'up-left'; break;
    case 6: player.facingDir = 'up'; break;
    case 7: player.facingDir = 'up-right'; break;
  }
}

/**
 * Offside Rule Engine:
 * Evaluates whether receiver was in an offside position at the exact frame the pass was played.
 */
export function evaluateOffside(
  passingPlayer: Player,
  receiverPlayer: Player | null,
  passTargetX: number,
  passTargetY: number,
  allPlayers: Player[],
  isAttackingUp: boolean
): { isOffside: boolean; spotX: number; spotY: number; defensiveLineY: number } {
  if (!receiverPlayer) {
    return { isOffside: false, spotX: passTargetX, spotY: passTargetY, defensiveLineY: 0 };
  }

  const receiverX = receiverPlayer.x;
  const receiverY = receiverPlayer.y;

  // 1. Must be in opponent's half
  const inOpponentHalf = isAttackingUp
    ? receiverY < PITCH_CONFIG.CENTER_Y - 5
    : receiverY > PITCH_CONFIG.CENTER_Y + 5;

  if (!inOpponentHalf) {
    return { isOffside: false, spotX: receiverX, spotY: receiverY, defensiveLineY: 0 };
  }

  // 2. Must be ahead of passing player/ball
  const ballY = passingPlayer.y;
  const isAheadOfBall = isAttackingUp
    ? receiverY < ballY - 5
    : receiverY > ballY + 5;

  if (!isAheadOfBall) {
    return { isOffside: false, spotX: receiverX, spotY: receiverY, defensiveLineY: 0 };
  }

  // 3. Find 2nd-last opponent Y coordinate
  const opponents = allPlayers.filter(p => p.team !== passingPlayer.team && !p.isRedCarded);
  if (opponents.length < 2) {
    return { isOffside: false, spotX: receiverX, spotY: receiverY, defensiveLineY: 0 };
  }

  opponents.sort((a, b) => isAttackingUp ? a.y - b.y : b.y - a.y);
  const secondLastOpponent = opponents[1];
  const defLineY = secondLastOpponent.y;

  const isAheadOfDefense = isAttackingUp
    ? receiverY < defLineY - 8
    : receiverY > defLineY + 8;

  if (isAheadOfDefense) {
    return {
      isOffside: true,
      spotX: receiverX,
      spotY: receiverY,
      defensiveLineY: defLineY,
    };
  }

  return { isOffside: false, spotX: receiverX, spotY: receiverY, defensiveLineY: defLineY };
}
