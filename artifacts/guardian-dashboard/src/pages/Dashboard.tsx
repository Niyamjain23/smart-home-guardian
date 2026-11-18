import React, { useState } from 'react';
import {
  Activity,
  Sliders,
  Sparkles,
  BarChart3,
  X,
  ShieldAlert,
  Flame,
  Droplets,
  Zap,
  ChevronDown,
  Layers,
} from 'lucide-react';
import Header from '@/components/dashboard/Header';
import StatusGrid from '@/components/dashboard/StatusGrid';
import EnvironmentTiles from '@/components/dashboard/EnvironmentTiles';
import ElectricityChart from '@/components/dashboard/ElectricityChart';
import HomeControlsHub from '@/components/dashboard/HomeControlsHub';
import DeveloperSettings from '@/components/dashboard/DeveloperSettings';
import HomeScene from '@/components/scene/HomeScene';
import { useGuardianStore } from '@/lib/guardian-state';
import { motion, AnimatePresence } from 'framer-motion';

type ActivePanel = 'vitals' | 'chart' | 'controls' | 'lab' | null;

export default function Dashboard() {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [hudExpanded, setHudExpanded] = useState(false);

  // Store bindings
  const gasStatus = useGuardianStore((s) => s.gasStatus);
  const waterStatus = useGuardianStore((s) => s.waterStatus);
  const electricityStatus = useGuardianStore((s) => s.electricityStatus);
  const gasReading = useGuardianStore((s) => s.gasReading);
  const waterReading = useGuardianStore((s) => s.waterReading);
  const electricityReading = useGuardianStore((s) => s.electricityReading);

  const hasAnomaly =
    gasStatus === 'Warning' || waterStatus === 'Warning' || electricityStatus === 'Warning';
  const hasPrevented =
    gasStatus === 'Prevented' || waterStatus === 'Prevented' || electricityStatus === 'Prevented';

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel((curr) => (curr === panel ? null : panel));
  };

  return (
    <div className="relative w-screen h-[100dvh] bg-[#07090e] text-foreground overflow-hidden select-none font-sans">
      {/* 1. Immersive 3D Spatial Home (100% full screen background, zero barriers) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <HomeScene onSelectUtility={() => setActivePanel('controls')} />
      </div>

      {/* 2. Top Floating Navigation Header */}
      <Header />

      {/* 3. Floating Quick Vitals HUD (Top Left Floating Island) */}
      <div className="absolute top-20 left-3 sm:left-6 z-20 pointer-events-auto">
        <motion.div
          layout
          className="rounded-2xl border border-white/12 bg-zinc-950/65 backdrop-blur-2xl p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-2 max-w-[280px] sm:max-w-xs"
        >
          {/* HUD Header */}
          <div
            onClick={() => setHudExpanded((v) => !v)}
            className="flex items-center justify-between cursor-pointer gap-3"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  hasAnomaly
                    ? 'bg-amber-400 animate-ping'
                    : hasPrevented
                    ? 'bg-orange-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="text-xs font-semibold text-white tracking-wide">
                Live Sensor Telemetry
              </span>
            </div>
            <button className="text-muted-foreground hover:text-white transition-colors">
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  hudExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Compact Mini Pills (Always visible) */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            <div className="px-2 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-amber-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-muted-foreground uppercase leading-none">Gas</span>
                <span className="text-[11px] font-semibold text-white tabular-nums truncate">
                  {gasReading.toFixed(0)} <span className="text-[9px] text-muted-foreground">ppm</span>
                </span>
              </div>
            </div>

            <div className="px-2 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
              <Droplets className="w-3 h-3 text-cyan-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-muted-foreground uppercase leading-none">Water</span>
                <span className="text-[11px] font-semibold text-white tabular-nums truncate">
                  {waterReading.toFixed(1)} <span className="text-[9px] text-muted-foreground">L/m</span>
                </span>
              </div>
            </div>

            <div className="px-2 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-muted-foreground uppercase leading-none">Grid</span>
                <span className="text-[11px] font-semibold text-white tabular-nums truncate">
                  {electricityReading.toFixed(1)} <span className="text-[9px] text-muted-foreground">kW</span>
                </span>
              </div>
            </div>
          </div>

          {/* Expanded Environmental Vitals */}
          <AnimatePresence>
            {hudExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pt-2 border-t border-white/10"
              >
                <EnvironmentTiles />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 4. Active Hazard Banner (Slides down when anomaly occurs) */}
      <AnimatePresence>
        {hasAnomaly && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto"
          >
            <div
              onClick={() => togglePanel('lab')}
              className="px-4 py-2 rounded-2xl border border-amber-500/50 bg-amber-500/15 backdrop-blur-2xl text-amber-200 text-xs font-medium flex items-center gap-2.5 shadow-[0_0_25px_rgba(245,158,11,0.3)] cursor-pointer hover:bg-amber-500/20 transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Velocity Anomaly Detected · Guardian AI Active</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-100">
                Inspect
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Animated Floating Glass Drawer / Panel (Slides in at Bottom-Right & Stays) */}
      <AnimatePresence>
        {activePanel && (
          <div className="absolute bottom-20 right-3 sm:right-6 z-30 pointer-events-auto w-[calc(100vw-24px)] sm:w-[480px] lg:w-[520px] max-h-[calc(100dvh-170px)]">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, x: 35, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 35, y: 15, scale: 0.96 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="w-full max-h-[calc(100dvh-170px)] flex flex-col rounded-3xl border border-white/15 bg-zinc-950/80 backdrop-blur-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden"
            >
              {/* Panel Top Bar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                    {activePanel === 'vitals' && 'Telemetry Gauges & Vitals'}
                    {activePanel === 'chart' && 'Power Consumption'}
                    {activePanel === 'controls' && 'Device & Utility Control Hub'}
                    {activePanel === 'lab' && 'Interactive Scenario Lab'}
                  </span>
                </div>
                <button
                  onClick={() => setActivePanel(null)}
                  className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-muted-foreground hover:text-white transition-colors cursor-pointer"
                  title="Close panel (or click dock item again)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Panel Content (Scrollable) */}
              <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                {activePanel === 'vitals' && (
                  <>
                    <StatusGrid />
                    <div className="pt-2">
                      <EnvironmentTiles />
                    </div>
                  </>
                )}
                {activePanel === 'chart' && <ElectricityChart />}
                {activePanel === 'controls' && <HomeControlsHub />}
                {activePanel === 'lab' && <DeveloperSettings />}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Floating Glass Dock (VisionOS / Mac Style Navigation at bottom) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <motion.nav
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl border border-white/15 bg-zinc-950/65 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
        >
          {/* Vitals Tab */}
          <DockItem
            label="Vitals"
            icon={BarChart3}
            active={activePanel === 'vitals'}
            onClick={() => togglePanel('vitals')}
          />

          {/* Power Chart Tab */}
          <DockItem
            label="Load Chart"
            icon={Activity}
            active={activePanel === 'chart'}
            onClick={() => togglePanel('chart')}
          />

          {/* Controls Hub Tab */}
          <DockItem
            label="Controls"
            icon={Sliders}
            active={activePanel === 'controls'}
            onClick={() => togglePanel('controls')}
          />

          {/* Scenario Lab Tab */}
          <DockItem
            label="Scenario Lab"
            icon={Sparkles}
            active={activePanel === 'lab'}
            onClick={() => togglePanel('lab')}
            badge={hasAnomaly ? '!' : undefined}
          />
        </motion.nav>
      </div>
    </div>
  );
}

function DockItem({
  label,
  icon: Icon,
  active,
  onClick,
  badge,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
        active
          ? 'bg-white/15 text-white shadow-sm border border-white/20'
          : 'text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
      {badge && (
        <span className="w-4 h-4 rounded-full bg-amber-400 text-black font-bold text-[9px] flex items-center justify-center animate-pulse">
          {badge}
        </span>
      )}
    </button>
  );
}
