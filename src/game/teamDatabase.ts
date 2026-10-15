/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  TeamDefinition,
  TeamCategory,
  Confederation,
} from '../types/team';

import { MODERN_EUROPEAN_XI, CLASSIC_EUROPEAN_XI } from './teams/specialTeams';
import { MODERN_SOUTH_AMERICAN_XI, CLASSIC_SOUTH_AMERICAN_XI } from './teams/southAmericanLegends';
import { AFRICA_ALL_TIME_XI, ASIA_OCEANIA_ALL_TIME_XI, CONCACAF_LEGENDS } from './teams/otherLegends';
import { SPAIN_2026, ARGENTINA_2026 } from './teams/nationalTeams';
import { BOCA_JUNIORS_2026, RIVER_PLATE_2026, REAL_CUNDINAMARCA, BOGOTA_FC } from './teams/clubTeams';

export * from './teams/specialTeams';
export * from './teams/southAmericanLegends';
export * from './teams/otherLegends';
export * from './teams/nationalTeams';
export * from './teams/clubTeams';

/**
 * Phase 13.5: Expanded Multi-Tier Roster Database & All-Time Continental Showcase (7 Legendary Squads)
 *
 * Tiers:
 * - Tier S: All-Time Continental Showcase (93 - 98 OVR) with ⚡ Stat Breaks (7 Global Teams)
 * - Tier A: Elite International Contenders (87 OVR, Spain 2026 & Argentina 2026)
 * - Tier B: Heritage Pro Superclásico Rivals (76 - 77 OVR, Boca Juniors 2026 & River Plate 2026)
 * - Tier C: Ascenso Derby Underdogs (55 OVR, Real Cundinamarca & Bogotá FC)
 */

export const TEAM_DATABASE: TeamDefinition[] = [
  // ==========================================================================
  // TIER S — ALL-TIME CONTINENTAL SHOWCASE (7 LEGENDARY SQUADS)
  // ==========================================================================
  MODERN_EUROPEAN_XI,
  CLASSIC_EUROPEAN_XI,
  MODERN_SOUTH_AMERICAN_XI,
  CLASSIC_SOUTH_AMERICAN_XI,
  AFRICA_ALL_TIME_XI,
  ASIA_OCEANIA_ALL_TIME_XI,
  CONCACAF_LEGENDS,

  // ==========================================================================
  // TIER A — WORLD CUP HEAVYWEIGHTS (NATIONAL TEAMS)
  // ==========================================================================
  SPAIN_2026,
  ARGENTINA_2026,

  // ==========================================================================
  // TIER B — SUPERCLÁSICO RIVALS (CLUBS)
  // ==========================================================================
  BOCA_JUNIORS_2026,
  RIVER_PLATE_2026,

  // ==========================================================================
  // TIER C — ASCENSO DERBY RIVALS (CLUBS)
  // ==========================================================================
  REAL_CUNDINAMARCA,
  BOGOTA_FC,
];

/**
 * Helper Utilities for Team Querying & Hierarchical Navigation
 */

export function getAllTeams(): TeamDefinition[] {
  return TEAM_DATABASE;
}

export function getTeamById(id: string): TeamDefinition {
  // Backwards compatibility aliases for retired legacy squads
  if (id === 'ginga_all_stars' || id === 'pixel_legends') {
    return MODERN_EUROPEAN_XI;
  }
  const found = TEAM_DATABASE.find(t => t.id === id);
  if (found) return found;
  return TEAM_DATABASE[0]; // Fallback to first team
}

export function getCategories(): { id: TeamCategory; label: string; icon: string; count: number }[] {
  return [
    { id: 'club', label: 'Club Teams', icon: '🛡️', count: TEAM_DATABASE.filter(t => t.category === 'club').length },
    { id: 'national', label: 'National Teams', icon: '🌍', count: TEAM_DATABASE.filter(t => t.category === 'national').length },
    { id: 'special', label: 'Special Teams', icon: '⚡', count: TEAM_DATABASE.filter(t => t.category === 'special').length },
  ];
}

export function getConfederations(category?: TeamCategory): { id: Confederation; label: string; region: string; count: number }[] {
  const teams = category ? TEAM_DATABASE.filter(t => t.category === category) : TEAM_DATABASE;
  const confedCounts = new Map<Confederation, number>();
  teams.forEach(t => {
    confedCounts.set(t.confederation, (confedCounts.get(t.confederation) || 0) + 1);
  });

  const defs: Record<Confederation, { id: Confederation; label: string; region: string }> = {
    uefa: { id: 'uefa', label: 'UEFA', region: 'Europe' },
    conmebol: { id: 'conmebol', label: 'CONMEBOL', region: 'South America' },
    concacaf: { id: 'concacaf', label: 'CONCACAF', region: 'North, Central America & Caribbean' },
    afc: { id: 'afc', label: 'AFC', region: 'Asia' },
    caf: { id: 'caf', label: 'CAF', region: 'Africa' },
    ofc: { id: 'ofc', label: 'OFC', region: 'Oceania' },
    special: { id: 'special', label: 'Special Teams', region: 'All-Time Continental Showcase' },
  };

  return Array.from(confedCounts.keys()).map(c => ({
    ...(defs[c] || { id: c, label: c.toUpperCase(), region: c }),
    count: confedCounts.get(c) || 0,
  }));
}

export function getCountries(category: TeamCategory, confederation: Confederation): string[] {
  const teams = TEAM_DATABASE.filter(t => t.category === category && t.confederation === confederation);
  const countries = new Set<string>();
  teams.forEach(t => countries.add(t.country));
  return Array.from(countries);
}

export function getLeagues(category: TeamCategory, confederation: Confederation, country: string): string[] {
  const teams = TEAM_DATABASE.filter(
    t => t.category === category && t.confederation === confederation && t.country === country
  );
  const leagues = new Set<string>();
  teams.forEach(t => {
    if (t.league) leagues.add(t.league);
  });
  return Array.from(leagues);
}

export function getTeamsByFilter(
  category?: TeamCategory,
  confederation?: Confederation,
  country?: string,
  league?: string
): TeamDefinition[] {
  return TEAM_DATABASE.filter(t => {
    if (category && t.category !== category) return false;
    if (category === 'special') return true; // Special teams are all directly visible!
    if (confederation && t.confederation !== confederation) return false;
    if (country && t.country !== country) return false;
    if (league && t.league && t.league !== league) return false;
    return true;
  });
}

/**
 * 🎲 One-Click Instant Random Team Selector
 */
export function getRandomTeam(filter?: { category?: TeamCategory; confederation?: Confederation }): TeamDefinition {
  let pool = TEAM_DATABASE;
  if (filter?.category) {
    pool = pool.filter(t => t.category === filter.category);
  }
  if (filter?.confederation) {
    pool = pool.filter(t => t.confederation === filter.confederation);
  }
  if (pool.length === 0) pool = TEAM_DATABASE;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}
