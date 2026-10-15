/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  Sliders,
  Check,
  X,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  Layers,
  Sparkles,
  Zap,
  Shield,
  RotateCcw,
  Box,
  Compass,
  CircleDot,
  Grid,
} from 'lucide-react';
import {
  StadiumTier,
  TimeOfDay,
  SeatColorMode,
  PitchDimensionPreset,
  TurfQuality,
  GrassLength,
  LawnMowingPattern,
  SurfaceStatus,
  WeatherCondition,
  Season,
  NetTension,
  GoalFrameType,
} from '../types';
import { audio } from '../game/audio';

export interface StadiumConfig {
  stadiumTier: StadiumTier;
  pitchPreset: PitchDimensionPreset;
  pitchLengthMeters: number;
  pitchWidthMeters: number;
  turfQuality: TurfQuality;
  mowingPattern: LawnMowingPattern;
  grassLength: GrassLength;
  surfaceStatus: SurfaceStatus;
  weather: WeatherCondition;
  season: Season;
  timeOfDay: TimeOfDay;
  seatColor: SeatColorMode;
  netTension: NetTension;
  goalFrame: GoalFrameType;
}

interface StadiumSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StadiumConfig;
  onChangeConfig: (config: StadiumConfig) => void;
  onApplyAndClose?: (config: StadiumConfig) => void;
}

export const StadiumSelectorModal: React.FC<StadiumSelectorModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onApplyAndClose,
}) => {
  const [activeTab, setActiveTab] = useState<'pitch_turf' | 'atmosphere' | 'stadium_nets'>('pitch_turf');

  if (!isOpen) return null;

  const update = <K extends keyof StadiumConfig>(key: K, value: StadiumConfig[K]) => {
    audio.playKick(0.2);
    // Automatic consistency rules:
    // Snow & Blizzard locked to Winter season
    if (key === 'weather' && (value === 'snow' || value === 'blizzard')) {
      onChangeConfig({
        ...config,
        weather: value as WeatherCondition,
        season: 'winter',
      });
      return;
    }
    // Changing away from winter unlocks weather if it was snow/blizzard
    if (key === 'season' && value !== 'winter' && (config.weather === 'snow' || config.weather === 'blizzard')) {
      onChangeConfig({
        ...config,
        season: value as Season,
        weather: 'clear',
      });
      return;
    }
    onChangeConfig({
      ...config,
      [key]: value,
    });
  };

  const handlePresetDimensions = (preset: PitchDimensionPreset) => {
    audio.playKick(0.25);
    if (preset === 'compact') {
      onChangeConfig({
        ...config,
        pitchPreset: 'compact',
        pitchLengthMeters: 100,
        pitchWidthMeters: 64,
      });
    } else if (preset === 'expansive') {
      onChangeConfig({
        ...config,
        pitchPreset: 'expansive',
        pitchLengthMeters: 110,
        pitchWidthMeters: 74,
      });
    } else if (preset === 'balanced') {
      onChangeConfig({
        ...config,
        pitchPreset: 'balanced',
        pitchLengthMeters: 105,
        pitchWidthMeters: 68,
      });
    } else {
      onChangeConfig({
        ...config,
        pitchPreset: 'custom',
      });
    }
  };

  const handleApply = () => {
    audio.playKick(0.4);
    if (onApplyAndClose) {
      onApplyAndClose(config);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-emerald-500/60 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.3)] overflow-hidden text-white font-sans">
        {/* ========================================================================= */}
        {/* 32-BIT RETRO HEADER WITH METALLIC BEVEL                                   */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-800 to-slate-950 px-4 py-3 border-b-2 border-slate-700 flex items-center justify-between shrink-0 shadow-inner">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shadow-md">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-['Press_Start_2P'] text-xs sm:text-sm text-emerald-400 tracking-wider">
                STADIUM & PITCH CUSTOMIZER
              </h2>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                32-Bit Arcade Atmosphere Suite · 3 Turf Grades · 7 Lawn Mowing Designs · IFAB Dimensions
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 32-BIT ARCADE TABS                                                        */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1 bg-slate-950 px-4 py-2 border-b border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => {
              audio.playKick(0.15);
              setActiveTab('pitch_turf');
            }}
            className={`px-3 py-1.5 text-[9px] sm:text-[10px] font-['Press_Start_2P'] rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pitch_turf'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>TURF & LAWN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playKick(0.15);
              setActiveTab('atmosphere');
            }}
            className={`px-3 py-1.5 text-[9px] sm:text-[10px] font-['Press_Start_2P'] rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'atmosphere'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>WEATHER & SKY</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playKick(0.15);
              setActiveTab('stadium_nets');
            }}
            className={`px-3 py-1.5 text-[9px] sm:text-[10px] font-['Press_Start_2P'] rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'stadium_nets'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>ARENA & GOAL</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB BODY                                                                  */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-gradient-to-b from-slate-900 to-slate-950">
          {/* TAB 1: TURF & LAWN DESIGN */}
          {activeTab === 'pitch_turf' && (
            <div className="space-y-5 animate-fade-in">
              {/* 1. THREE CALIBRATED TURF QUALITY GRADES (Section 17.2) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>TURF QUALITY GRADE (VISUAL & REALISTIC PHYSICS)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Friction & Roll calibrated
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* POOR QUALITY */}
                  <button
                    type="button"
                    onClick={() => update('turfQuality', 'poor')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      config.turfQuality === 'poor'
                        ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                        : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-['Press_Start_2P'] text-[9px] text-amber-300">
                        POOR QUALITY
                      </span>
                      {config.turfQuality === 'poor' && (
                        <Check className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-300 leading-snug">
                      Distinct arid, yellowish-green hue with visible bare soil & dry mud patches in goalmouths.
                    </p>
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2 text-[9px] font-mono text-amber-400/90">
                      <span>⚡ Micro-bounces</span>
                      <span>·</span>
                      <span>Heavy roll drag</span>
                    </div>
                  </button>

                  {/* NORMAL QUALITY */}
                  <button
                    type="button"
                    onClick={() => update('turfQuality', 'normal')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      config.turfQuality === 'normal'
                        ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg'
                        : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-['Press_Start_2P'] text-[9px] text-emerald-400">
                        NORMAL QUALITY
                      </span>
                      {config.turfQuality === 'normal' && (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-300 leading-snug">
                      Standard authentic football pitch green with natural blade sheen & balanced contrast.
                    </p>
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2 text-[9px] font-mono text-emerald-400/90">
                      <span>✓ True ball roll</span>
                      <span>·</span>
                      <span>Standard divots</span>
                    </div>
                  </button>

                  {/* PRISTINE / ELITE */}
                  <button
                    type="button"
                    onClick={() => update('turfQuality', 'pristine')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      config.turfQuality === 'pristine'
                        ? 'bg-teal-950/50 border-teal-300 ring-2 ring-teal-300/50 shadow-lg'
                        : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-['Press_Start_2P'] text-[9px] text-teal-300">
                        PRISTINE / ELITE
                      </span>
                      {config.turfQuality === 'pristine' && (
                        <Check className="w-4 h-4 text-teal-300" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-300 leading-snug">
                      Deep vibrant emerald green with razor-sharp blade highlights & zero grass gouging.
                    </p>
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2 text-[9px] font-mono text-teal-300/90">
                      <span>★ Smooth fast roll</span>
                      <span>·</span>
                      <span>Vacuum drainage</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. SEVEN AUTHENTIC LAWN MOWING PATTERNS (Section 17.2) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    <Grid className="w-3.5 h-3.5" />
                    <span>7 AUTHENTIC LAWN MOWING PATTERNS</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Real-time canvas rendering
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {[
                    {
                      id: 'plain',
                      name: 'Plain Cut',
                      tag: 'Uniform',
                      desc: 'Clean single shade',
                      icon: '🟩',
                    },
                    {
                      id: 'horizontal',
                      name: 'Horizontal',
                      tag: 'Stripes',
                      desc: 'Perpendicular width bands',
                      icon: '≡',
                    },
                    {
                      id: 'vertical',
                      name: 'Vertical',
                      tag: 'Lanes',
                      desc: 'Longitudinal goal lanes',
                      icon: '|||',
                    },
                    {
                      id: 'european_boxes',
                      name: 'European',
                      tag: 'Top-Club',
                      desc: 'UCL shaded box squares',
                      icon: '▦',
                    },
                    {
                      id: 'checkerboard',
                      name: 'Checker',
                      tag: 'Graphic',
                      desc: 'Bold alternating tiles',
                      icon: '🏁',
                    },
                    {
                      id: 'diagonal_diamonds',
                      name: 'Diagonal',
                      tag: 'Diamonds',
                      desc: '45° intersecting cross',
                      icon: '❖',
                    },
                    {
                      id: 'concentric_circles',
                      name: 'Circles',
                      tag: 'Concentric',
                      desc: 'Ripples from center spot',
                      icon: '◎',
                    },
                  ].map((p) => {
                    const isSelected = config.mowingPattern === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => update('mowingPattern', p.id as LawnMowingPattern)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-500/25 border-emerald-400 ring-2 ring-emerald-400/50 shadow-md scale-102'
                            : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xl mb-1">{p.icon}</span>
                        <div className="font-['Press_Start_2P'] text-[7.5px] text-white truncate max-w-full">
                          {p.name}
                        </div>
                        <div className="text-[7px] font-mono text-emerald-400 uppercase mt-0.5 font-bold">
                          {p.tag}
                        </div>
                        <div className="text-[7.5px] text-slate-400 leading-tight mt-1 line-clamp-2">
                          {p.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. GRASS CUT LENGTH & SURFACE DRAINAGE STATUS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Grass Length */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>GRASS LENGTH CUT</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'short', label: 'SHORT CUT', desc: 'Fast ground passing' },
                      { id: 'normal', label: 'NORMAL CUT', desc: 'Regulation pace' },
                      { id: 'long', label: 'LONG CUT', desc: 'High rolling friction' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => update('grassLength', g.id as GrassLength)}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          config.grassLength === g.id
                            ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border-slate-800'
                        }`}
                      >
                        <div className="text-[9px] font-mono font-black">{g.label}</div>
                        <div className="text-[7.5px] opacity-80 mt-0.5">{g.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Surface Status */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>SURFACE STATUS & MOISTURE</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'dry', label: 'DRY SURFACE', desc: 'Dusty, firm bounce' },
                      { id: 'normal', label: 'BALANCED', desc: 'Standard moisture' },
                      { id: 'wet', label: 'WET / SLICK', desc: 'Glossy water sheen' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => update('surfaceStatus', s.id as SurfaceStatus)}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          config.surfaceStatus === s.id
                            ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border-slate-800'
                        }`}
                      >
                        <div className="text-[9px] font-mono font-black">{s.label}</div>
                        <div className="text-[7.5px] opacity-80 mt-0.5">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. IFAB PITCH DIMENSIONS (COMPACT / BALANCED / EXPANSIVE / CUSTOM) */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5" />
                    <span>IFAB PITCH DIMENSIONS ({config.pitchLengthMeters}m × {config.pitchWidthMeters}m)</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                    {config.pitchPreset.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {[
                    { id: 'compact', label: 'IFAB COMPACT', dim: '100m × 64m', tag: 'High Pressing' },
                    { id: 'balanced', label: 'BALANCED', dim: '105m × 68m', tag: 'UEFA Standard' },
                    { id: 'expansive', label: 'EXPANSIVE', dim: '110m × 74m', tag: 'Flank Space' },
                    { id: 'custom', label: 'CUSTOM SLIDERS', dim: 'Manual Control', tag: 'Freestyle' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePresetDimensions(p.id as PitchDimensionPreset)}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        config.pitchPreset === p.id
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border-slate-800'
                      }`}
                    >
                      <div className="text-[8.5px] font-['Press_Start_2P'] truncate">{p.label}</div>
                      <div className="text-[10px] font-mono mt-1">{p.dim}</div>
                      <div className="text-[8px] opacity-75">{p.tag}</div>
                    </button>
                  ))}
                </div>

                {/* Custom Sliders if Custom preset selected */}
                {config.pitchPreset === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-300 mb-1">
                        <span>PITCH LENGTH</span>
                        <span className="text-amber-400 font-bold">{config.pitchLengthMeters} meters</span>
                      </div>
                      <input
                        type="range"
                        min={90}
                        max={120}
                        value={config.pitchLengthMeters}
                        onChange={(e) => update('pitchLengthMeters', Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-300 mb-1">
                        <span>PITCH WIDTH</span>
                        <span className="text-amber-400 font-bold">{config.pitchWidthMeters} meters</span>
                      </div>
                      <input
                        type="range"
                        min={45}
                        max={90}
                        value={config.pitchWidthMeters}
                        onChange={(e) => update('pitchWidthMeters', Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: WEATHER, SKY & ATMOSPHERE */}
          {activeTab === 'atmosphere' && (
            <div className="space-y-5 animate-fade-in">
              {/* Weather Conditions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    <Cloud className="w-3.5 h-3.5" />
                    <span>WEATHER CONDITIONS</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Snow & Blizzard auto-locks Season to Winter
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {[
                    { id: 'clear', label: 'CLEAR', icon: '☀️', desc: 'Sunny stadium sky' },
                    { id: 'cloudy', label: 'CLOUDY', icon: '☁️', desc: 'Overcast soft diffuse' },
                    { id: 'rain', label: 'RAIN', icon: '🌧️', desc: 'Slick passes & spray' },
                    { id: 'torrential', label: 'TORRENTIAL', icon: '⛈️', desc: 'Standing water puddles' },
                    { id: 'snow', label: 'SNOW', icon: '❄️', desc: '🔴 Red lines & orange ball' },
                    { id: 'blizzard', label: 'BLIZZARD', icon: '🌨️', desc: 'Heavy snow & yellow ball' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => update('weather', w.id as WeatherCondition)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                        config.weather === w.id
                          ? 'bg-sky-500/25 border-sky-400 ring-2 ring-sky-400/50 shadow-md scale-102'
                          : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800'
                      }`}
                    >
                      <span className="text-xl mb-1">{w.icon}</span>
                      <div className="font-['Press_Start_2P'] text-[8px] text-white truncate max-w-full">
                        {w.label}
                      </div>
                      <div className="text-[7.5px] text-slate-400 leading-tight mt-1">
                        {w.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time of Day */}
              <div>
                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5" />
                  <span>TIME OF DAY & SHADOW MATRIX</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'morning', label: 'MORNING / DAWN', icon: <Sunrise className="w-4 h-4 text-amber-400" />, desc: 'Long diagonal shadows' },
                    { id: 'noon', label: 'NOON', icon: <Sun className="w-4 h-4 text-yellow-400" />, desc: 'Sharp drop shadows directly below' },
                    { id: 'sunset', label: 'SUNSET (GOLDEN)', icon: <Sunset className="w-4 h-4 text-orange-400" />, desc: 'Warm golden hour raking light' },
                    { id: 'night', label: 'NIGHT (FLOODLIT)', icon: <Moon className="w-4 h-4 text-sky-400" />, desc: 'Quad floodlit directional shadows' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => update('timeOfDay', t.id as TimeOfDay)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        config.timeOfDay === t.id
                          ? 'bg-amber-500/25 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                          : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        {t.icon}
                        <span className="font-['Press_Start_2P'] text-[8px] text-white">
                          {t.label}
                        </span>
                      </div>
                      <div className="text-[8px] text-slate-300">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Season */}
              <div>
                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>SEASONAL CLIMATE</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'spring', label: 'SPRING', icon: '🌸' },
                    { id: 'summer', label: 'SUMMER', icon: '☀️' },
                    { id: 'autumn', label: 'AUTUMN', icon: '🍂' },
                    { id: 'winter', label: 'WINTER', icon: '❄️' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => update('season', s.id as Season)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        config.season === s.id
                          ? 'bg-emerald-500/25 border-emerald-400 ring-2 ring-emerald-400/50 font-bold'
                          : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="text-lg">{s.icon}</span>
                      <div className="font-['Press_Start_2P'] text-[8.5px] mt-1">{s.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ARENA ARCHITECTURE & GOAL NETS */}
          {activeTab === 'stadium_nets' && (
            <div className="space-y-5 animate-fade-in">
              {/* Stadium Architecture */}
              <div>
                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>STADIUM ARCHITECTURE & HORIZON</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'monumental',
                      name: 'MONUMENTAL GRAND ARENA',
                      sub: 'Elite 80,000 Capacity',
                      desc: 'Triple-tier curved grandstands, modern LED perimeter hoardings, distant metropolis skyline.',
                      badge: '🏛️ TIER A ARENA',
                    },
                    {
                      id: 'craven',
                      name: 'CRAVEN HERITAGE GROUND',
                      sub: 'Historic English Stadium',
                      desc: 'Authentic red-brick perimeter, timber pavilion, classic heritage river horizon.',
                      badge: '🏰 HERITAGE GROUND',
                    },
                    {
                      id: 'ascenso',
                      name: 'ASCENSO MUNICIPAL',
                      sub: 'Raw Concrete South American',
                      desc: 'Raw concrete terracing, weathered perimeter fencing, rustic mountain city horizon.',
                      badge: '⚡ ASCENSO MUNICIPAL',
                    },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => update('stadiumTier', st.id as StadiumTier)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        config.stadiumTier === st.id
                          ? 'bg-emerald-500/25 border-emerald-400 ring-2 ring-emerald-400/50 shadow-md'
                          : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800'
                      }`}
                    >
                      <div className="text-[8px] font-mono font-bold text-emerald-400 mb-1">
                        {st.badge}
                      </div>
                      <div className="font-['Press_Start_2P'] text-[9px] text-white">
                        {st.name}
                      </div>
                      <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                        {st.sub}
                      </div>
                      <p className="text-[9.5px] text-slate-300 mt-2 leading-relaxed">
                        {st.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal Frame & Net Tension */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Goal Frame Architecture */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2">
                    GOAL FRAME STRUCTURE
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        id: 'standard',
                        label: 'REGULATION FRAME',
                        desc: 'Classic European continental angled stanchions',
                      },
                      {
                        id: 'brazilian',
                        label: 'BRAZILIAN DEEP BOX',
                        desc: 'Deep box frame with suspended rear netting',
                      },
                    ].map((gf) => (
                      <button
                        key={gf.id}
                        type="button"
                        onClick={() => update('goalFrame', gf.id as GoalFrameType)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          config.goalFrame === gf.id
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border-slate-800'
                        }`}
                      >
                        <div className="text-[8.5px] font-['Press_Start_2P']">{gf.label}</div>
                        <div className="text-[8px] mt-1 opacity-80">{gf.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Net Tension & Ricochet Physics */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2">
                    GOAL NET TENSION & RICOCHET
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'hard', label: 'HARD TENSION', desc: 'Instant ricochet rebound' },
                      { id: 'moderate', label: 'MODERATE GIVE', desc: 'Balanced cushion bulge' },
                      { id: 'soft', label: 'SOFT DRAPE', desc: 'Ball caught deep in net' },
                    ].map((nt) => (
                      <button
                        key={nt.id}
                        type="button"
                        onClick={() => update('netTension', nt.id as NetTension)}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          config.netTension === nt.id
                            ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border-slate-800'
                        }`}
                      >
                        <div className="text-[8px] font-mono font-black">{nt.label}</div>
                        <div className="text-[7.5px] opacity-80 mt-0.5">{nt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* FOOTER: CONFIRM & APPLY                                                   */}
        {/* ========================================================================= */}
        <div className="bg-slate-950 px-4 py-3 border-t-2 border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[9px] sm:text-[10px] font-mono text-slate-400">
            Current Setup: <span className="text-emerald-400 font-bold">{config.stadiumTier.toUpperCase()}</span> · <span className="text-amber-400 font-bold">{config.turfQuality.toUpperCase()} TURF</span> · <span className="text-sky-400 font-bold">{config.mowingPattern.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-[9px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer border border-slate-700"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 text-[10px] font-['Press_Start_2P'] bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>CONFIRM STADIUM</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
