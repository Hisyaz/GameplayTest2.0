/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  TeamDefinition,
  TeamRosterPlayer,
  CanonicalOutfieldStats,
  CanonicalGoalkeeperStats,
  Player,
  PlayerRole,
} from '../types';
import {
  TEAM_DATABASE,
  getAllTeams,
  getTeamById,
  getCategories,
  getConfederations,
  getCountries,
  getLeagues,
  getTeamsByFilter,
  getRandomTeam,
} from './teamDatabase';
import { createStatsBuffer, calculateInitialMaxStamina } from './playerStats';
import { applyPositionalHierarchyToPlayer } from './playstyles';
import { applyFormationToPlayers, HOME_FORMATIONS, getAwayFormationPositions } from './formations';
import { PITCH_CONFIG } from './constants';
import type { MatchEngine } from './engine';

export * from './teamDatabase';

/**
 * Calculates a player's dynamic Overall Rating (OVR) based on canonical stats and tactical role
 */
export function calculatePlayerOvr(
  stats: CanonicalOutfieldStats | CanonicalGoalkeeperStats,
  role: PlayerRole | string
): number {
  if (role === 'GK' || 'sav' in stats) {
    const gk = stats as CanonicalGoalkeeperStats;
    // Weighted GK formula
    const weighted =
      gk.sav * 0.25 +
      gk.ref * 0.25 +
      gk.han * 0.15 +
      gk.gpo * 0.15 +
      gk.oneOnOne * 0.10 +
      gk.aer * 0.05 +
      gk.dis * 0.05;
    return Math.round(weighted);
  }

  const out = stats as CanonicalOutfieldStats;
  const isDef = role === 'CB1' || role === 'CB2' || role === 'LB' || role === 'RB';
  const isMid = role === 'CM1' || role === 'CM2' || role === 'LM' || role === 'RM';
  const isAtt = role === 'ST1' || role === 'ST2';

  if (isDef) {
    const weighted =
      out.tck * 0.20 +
      out.int * 0.18 +
      out.mrk * 0.16 +
      out.sld * 0.10 +
      out.str * 0.10 +
      out.pos * 0.10 +
      out.pac * 0.08 +
      out.cmp * 0.08;
    return Math.round(weighted);
  }

  if (isMid) {
    const weighted =
      out.spa * 0.18 +
      out.lpa * 0.14 +
      out.bcl * 0.14 +
      out.dri * 0.12 +
      out.ret * 0.10 +
      out.int * 0.10 +
      out.cmp * 0.10 +
      out.sta * 0.06 +
      out.sho * 0.06;
    return Math.round(weighted);
  }

  if (isAtt) {
    const weighted =
      out.sho * 0.24 +
      out.pos * 0.16 +
      out.bcl * 0.14 +
      out.dri * 0.14 +
      out.pac * 0.12 +
      out.lsh * 0.08 +
      out.hea * 0.06 +
      out.cmp * 0.06;
    return Math.round(weighted);
  }

  // Fallback average
  const sum =
    out.pac + out.sta + out.str + out.bcl + out.ret + out.dri +
    out.spa + out.lpa + out.cro + out.sho + out.hea + out.lsh +
    out.tck + out.sld + out.int + out.mrk + out.pos + out.cmp + out.rea;
  return Math.round(sum / 19);
}

/**
 * Applies a full team definition (roster, attributes, tactical identity, and kits) to the MatchEngine
 */
export function applyTeamToEngine(
  engine: MatchEngine,
  side: 'home' | 'away',
  team: TeamDefinition
) {
  if (side === 'home') {
    (engine as any).homeTeam = team;
    // Update kit
    engine.homeKit = { ...team.kit };
    engine.homeFormation = team.preferredFormation;
    engine.homePlaystyle = team.tacticalPlaystyle;
    engine.homeTactics = { ...team.tactics };
  } else {
    (engine as any).awayTeam = team;
    // Update kit
    engine.awayKit = { ...team.kit };
    engine.awayFormation = team.preferredFormation;
    engine.awayPlaystyle = team.tacticalPlaystyle;
    engine.awayTactics = { ...team.tactics };
  }

  // Apply roster to engine players on this side
  const teamPlayers = team.players;
  for (const rp of teamPlayers) {
    const targetPlayer = engine.players.find(p => p.team === side && p.role === rp.role);
    if (!targetPlayer) continue;

    targetPlayer.name = rp.name;
    targetPlayer.number = rp.number;
    targetPlayer.subPos = rp.subPosition;
    targetPlayer.playstyle = rp.playstyle;
    targetPlayer.scale = rp.scale ?? 1.0;
    targetPlayer.appearance = { ...rp.appearance };
    targetPlayer.canonicalStats = { ...rp.canonicalStats };

    const isGK = rp.role === 'GK';
    const sta = ('sta' in rp.canonicalStats) ? (rp.canonicalStats as CanonicalOutfieldStats).sta : 85;
    const initialMax = calculateInitialMaxStamina(sta);
    targetPlayer.stamina = initialMax;
    targetPlayer.staminaMax = initialMax;
    targetPlayer.staminaInitialMax = initialMax;

    // Zero-allocation buffer sync
    targetPlayer.statsBuffer = createStatsBuffer(
      !isGK ? (rp.canonicalStats as CanonicalOutfieldStats) : undefined,
      isGK ? (rp.canonicalStats as CanonicalGoalkeeperStats) : undefined
    );

    // Sync legacy approximation stats for secondary checks
    if (!isGK) {
      const out = rp.canonicalStats as CanonicalOutfieldStats;
      targetPlayer.stats = {
        speed: 2.0 + (out.pac - 40) * 0.015,
        sprintSpeed: 3.3 + (out.pac - 40) * 0.02,
        shotPower: 3.5 + (out.sho - 40) * 0.03,
        passing: 3.5 + (out.spa - 40) * 0.03,
        tackling: 3.0 + (out.tck - 40) * 0.03,
        heading: 3.0 + (out.hea - 40) * 0.03,
        dribbling: 3.0 + (out.dri - 40) * 0.03,
      };
    } else {
      const gk = rp.canonicalStats as CanonicalGoalkeeperStats;
      targetPlayer.stats = {
        speed: 2.1,
        sprintSpeed: 3.3,
        shotPower: 4.5,
        passing: 3.8 + (gk.dis - 40) * 0.02,
        tackling: 4.2,
        heading: 4.0,
      };
    }

    applyPositionalHierarchyToPlayer(targetPlayer, side === 'home' ? engine.homeFormation : engine.awayFormation);
  }

  // Re-apply formation layout base positions
  const formation = side === 'home' ? engine.homeFormation : engine.awayFormation;
  applyFormationToPlayers(
    engine.players,
    side,
    formation,
    PITCH_CONFIG.FIELD_WIDTH,
    PITCH_CONFIG.FIELD_HEIGHT,
    PITCH_CONFIG.PITCH_LEFT,
    PITCH_CONFIG.PITCH_TOP
  );

  engine.setBanner(`${team.name.toUpperCase()} LOADED (${team.ratingTier}-TIER · ${team.averageOvr} OVR)`, 90);
}
