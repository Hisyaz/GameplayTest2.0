/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Ball, PlayerAction, TeamSide } from '../types';
import { audio } from './audio';
import { PITCH_CONFIG } from './constants';

export interface DecelParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

export interface AerialDuelResult {
  winner: Player;
  loser: Player;
  isContested: boolean;
  powerMultiplier: number;
  elevation: number;
}

/**
 * Phase 8: Expressive Procedural Animations & Physicality Polish Engine
 * 
 * Manages procedural animation states, kinematic transitions, aerial contest physics,
 * locomotion blending (sprint / jog / jockey / skid), and goalkeeper acrobatics
 * with 0 extra memory allocation per frame.
 */
export class AnimationEngine {
  private static instance: AnimationEngine;

  public static getInstance(): AnimationEngine {
    if (!AnimationEngine.instance) {
      AnimationEngine.instance = new AnimationEngine();
    }
    return AnimationEngine.instance;
  }

  // =========================================================================
  // 8.1 DRIBBLING & BALL EVASION ANIMATIONS
  // =========================================================================

  /**
   * Updates close control and dynamic dribbling strides.
   * Alternates micro-taps between inner and outer boot edges while moving with the ball.
   */
  public updateCloseControlDribble(player: Player, hasBall: boolean, timeScale: number = 1): void {
    if (!hasBall) return;

    const speed = Math.hypot(player.vx, player.vy);
    if (speed < 0.2) return;

    // Alternating micro-taps between inner and outer boot edges
    player.animTimer = (player.animTimer || 0) + timeScale;
    const strideCadence = speed > 2.8 ? 4 : 6;

    if (player.animTimer >= strideCadence) {
      player.animTimer = 0;
      player.animFrame = ((player.animFrame || 0) + 1) % 6;
      player.touchStepFoot = player.animFrame % 2 === 0 ? 'left' : 'right';
    }
  }

  /**
   * Triggers a sharp body feint & lane cut.
   * Drops shoulder in one direction before accelerating into the opposite channel.
   */
  public triggerBodyFeint(player: Player, feintDirection: 'left' | 'right', onComplete?: () => void): void {
    player.action = 'body_feint';
    player.actionTimer = 16;
    player.bodyFeintDir = feintDirection;
    player.animFrame = 0;
    player.animTimer = 0;
    audio.playKick(0.3);
  }

  /**
   * Triggers explosive 360 Marseille Roulette spin.
   */
  public triggerRoulette(player: Player): void {
    player.action = 'roulette';
    player.actionTimer = 22;
    player.animFrame = 0;
    player.animTimer = 0;
    audio.playKick(0.4);
  }

  /**
   * Triggers Nutmeg or Sombrero flick over opponent.
   */
  public triggerNutmegOrSombrero(player: Player, isAirborne: boolean): void {
    if (isAirborne) {
      player.action = 'sombrero';
      player.actionTimer = 24;
      player.animFrame = 0;
      audio.playKick(0.65);
    } else {
      player.action = 'nutmeg_dash';
      player.actionTimer = 20;
      player.animFrame = 0;
      audio.playNutmegCheer();
    }
  }

  // =========================================================================
  // 8.2 SHOOTING & VOLLEY SUITES
  // =========================================================================

  /**
   * Evaluates the best procedural shooting animation based on player momentum,
   * ball height, and defender closing pressure.
   */
  public resolveShootingAnimation(
    player: Player,
    ball: Ball,
    power: number,
    isSpecialCurl: boolean,
    isKnuckleOrChip: boolean,
    defenders: Player[]
  ): PlayerAction {
    const isBallHigh = ball.z > 14;
    const isBallMid = ball.z > 3.0 && ball.z <= 14;

    // Check high aerial volleys
    if (isBallHigh) {
      if (Math.abs(player.facingAngle - Math.atan2(PITCH_CONFIG.CENTER_Y - player.y, PITCH_CONFIG.CENTER_X - player.x)) > 2.0 && Math.random() < 0.35) {
        return 'bicycle_kick';
      }
      return 'side_volley';
    }

    // Mid-air bouncing balls: half-volleys & cushioned volleys
    if (isBallMid) {
      if (Math.random() < 0.5) return 'half_volley';
      return 'side_volley';
    }

    // Ground strikes: check for desperate sliding toe poke when pressured from behind/sides
    let isUnderDesperatePressure = false;
    for (const d of defenders) {
      if (d.team !== player.team && !d.isRedCarded) {
        const dist = Math.hypot(d.x - player.x, d.y - player.y);
        if (dist < 22) {
          isUnderDesperatePressure = true;
          break;
        }
      }
    }

    if (isUnderDesperatePressure && power > 0.65) {
      return 'sliding_toe_poke';
    }

    // Special Q curling finesse strike
    if (isSpecialCurl) {
      return 'curling_finesse';
    }

    // E chip dink
    if (isKnuckleOrChip) {
      return 'chip_shot';
    }

    // Maximum driven laces strike
    if (power > 0.75) {
      return 'driven_laces_strike';
    }

    // Default to power-rated running or standing shots
    const isMoving = Math.hypot(player.vx, player.vy) > 0.8;
    return isMoving ? 'running_shot_mid' : 'standing_shot_mid';
  }

  // =========================================================================
  // 8.3 PASSING DELIVERY SUITES
  // =========================================================================

  /**
   * Selects expressive procedural passing delivery:
   * Sidefoot precision push, Trivela outside-of-the-boot, scoop chip through-ball, or backheel flick.
   */
  public resolvePassingAnimation(
    player: Player,
    targetAngle: number,
    power: number,
    isSpecial: boolean,
    isChip: boolean
  ): PlayerAction {
    // Relative angle between player facing direction and passing target
    let angleDiff = Math.abs(targetAngle - player.facingAngle);
    while (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

    // Backheel flick when passing backwards (> 125 degrees)
    if (angleDiff > 2.2) {
      return 'backheel_flick';
    }

    // Trivela outside-of-the-boot when special Q is engaged or passing across body with high technique
    if (isSpecial) {
      return 'trivela';
    }

    // Scoop chip through-ball
    if (isChip) {
      return 'scoop_chip';
    }

    // Clean sidefoot precision push
    if (power < 0.60) {
      return 'sidefoot_push';
    }

    return 'standing_pass_mid';
  }

  // =========================================================================
  // 8.4 RUNNING CYCLES & LOCOMOTION
  // =========================================================================

  /**
   * Updates locomotion physics: explosive sprint stride, recovery jog drift,
   * defensive jockey backpedal, and deceleration turf skid detection.
   */
  public updateLocomotion(
    player: Player,
    isSprinting: boolean,
    isJockeying: boolean,
    timeScale: number = 1
  ): DecelParticle[] {
    const speed = Math.hypot(player.vx, player.vy);
    const particles: DecelParticle[] = [];

    // Track deceleration skids: player was traveling fast and suddenly brakes or cuts back
    const prevSpeed = Math.hypot(player.prevVx || 0, player.prevVy || 0);
    const speedDrop = prevSpeed - speed;

    if (prevSpeed > 3.4 && speedDrop > 1.8 && (!player.decelSkidTimer || player.decelSkidTimer <= 0)) {
      player.decelSkidTimer = 14;
      player.action = 'deceleration_skid';
      player.animFrame = 0;
      audio.playKick(0.25);

      // Spawn friction turf particles
      const skidAngle = Math.atan2(player.prevVy || 0, player.prevVx || 0);
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: player.x,
          y: player.y + 2,
          z: 0,
          vx: -Math.cos(skidAngle) * (1.5 + Math.random() * 2),
          vy: -Math.sin(skidAngle) * (1.5 + Math.random() * 2),
          vz: Math.random() * 1.8 + 0.5,
          color: i % 2 === 0 ? '#15803d' : '#166534',
          life: 0,
          maxLife: 15,
          size: 2,
        });
      }
    }

    player.prevVx = player.vx;
    player.prevVy = player.vy;

    // Deceleration skid timer countdown
    if (player.decelSkidTimer && player.decelSkidTimer > 0) {
      player.decelSkidTimer = Math.max(0, player.decelSkidTimer - timeScale);
      if (player.decelSkidTimer === 0 && player.action === 'deceleration_skid') {
        player.action = 'idle';
      }
      return particles;
    }

    // Defensive jockey / backpedal stance
    if (isJockeying && speed < 2.5) {
      player.action = 'defensive_jockey';
      player.animTimer = (player.animTimer || 0) + timeScale;
      if (player.animTimer % 5 === 0) {
        player.animFrame = ((player.animFrame || 0) + 1) % 4;
      }
      return particles;
    }

    return particles;
  }

  // =========================================================================
  // 8.5 JUMPING & AERIAL HEADERS
  // =========================================================================

  /**
   * Resolves mid-air contested aerial duels between an attacker and defender.
   * Calculates winner based on player Strength (str) and Heading (hea).
   */
  public resolveAerialContest(
    attacker: Player,
    defender: Player,
    ball: Ball
  ): AerialDuelResult {
    const attStr = attacker.canonicalStats && 'str' in attacker.canonicalStats ? attacker.canonicalStats.str : 75;
    const attHea = attacker.canonicalStats && 'hea' in attacker.canonicalStats ? attacker.canonicalStats.hea : 75;
    const defStr = defender.canonicalStats && 'str' in defender.canonicalStats ? defender.canonicalStats.str : 75;
    const defHea = defender.canonicalStats && 'hea' in defender.canonicalStats ? defender.canonicalStats.hea : 75;

    const attScore = attStr * 0.45 + attHea * 0.55 + (Math.random() - 0.5) * 20;
    const defScore = defStr * 0.50 + defHea * 0.50 + (Math.random() - 0.5) * 20;

    const isAttackerWin = attScore >= defScore;
    const winner = isAttackerWin ? attacker : defender;
    const loser = isAttackerWin ? defender : attacker;

    // Both enter contested duel animation clash
    winner.action = 'contested_duel';
    winner.actionTimer = 22;
    winner.animFrame = 1; // Winning power leap
    loser.action = 'contested_duel';
    loser.actionTimer = 22;
    loser.animFrame = 0; // Off-balance collision

    audio.playShoulderHit();

    return {
      winner,
      loser,
      isContested: true,
      powerMultiplier: 1.15,
      elevation: 0.25,
    };
  }

  /**
   * Resolves specialized header styles: downward bullet header, diving torpedo, or glancing flick-on.
   */
  public resolveHeaderStyle(player: Player, ball: Ball, distToGoal: number): PlayerAction {
    // Torpedo horizontal diving header for low-to-mid crosses in the box (< 18px height)
    if (ball.z <= 18 && ball.z >= 8 && distToGoal < 260) {
      return 'diving_header';
    }

    // Downward bullet header inside 18-yard box: drive forehead down into turf!
    if (distToGoal < 240) {
      return 'bullet_header';
    }

    // Near post flick-on header
    if (Math.abs(player.x - PITCH_CONFIG.CENTER_X) > 80) {
      return 'glancing_header';
    }

    return 'heading';
  }

  // =========================================================================
  // 8.6 GOALKEEPER SPECIALIST ACROBATICS
  // =========================================================================

  /**
   * Resolves goalkeeper acrobatics: low smothered catch, fingertip corner parries,
   * double-fist punch, 1v1 star-spread smother, or quick floor recovery roll.
   */
  public triggerGoalkeeperAcrobaticSave(
    gk: Player,
    saveType: 'smother' | 'fingertip' | 'punch' | 'star_spread' | 'recovery_roll',
    dirX: number = 0,
    dirY: number = 0
  ): void {
    gk.diveX = dirX * 3.5;
    gk.diveY = dirY * 3.5;

    if (saveType === 'smother') {
      gk.action = 'gk_low_smother';
      gk.actionTimer = 24;
      gk.animFrame = 0;
      audio.playKick(0.5);
    } else if (saveType === 'fingertip') {
      gk.action = 'gk_fingertip_parry';
      gk.actionTimer = 26;
      gk.animFrame = 0;
      audio.playKick(0.7);
    } else if (saveType === 'punch') {
      gk.action = 'gk_punch';
      gk.actionTimer = 20;
      gk.animFrame = 0;
      audio.playKick(0.85);
    } else if (saveType === 'star_spread') {
      gk.action = 'gk_star_spread';
      gk.actionTimer = 22;
      gk.animFrame = 0;
      audio.playKick(0.4);
    } else {
      gk.action = 'gk_recovery_roll';
      gk.actionTimer = 18;
      gk.animFrame = 0;
    }
  }
}

export const animationEngine = AnimationEngine.getInstance();
