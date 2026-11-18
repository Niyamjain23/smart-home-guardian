import React from 'react';
import { useGuardianStore, SystemStatus } from '@/lib/guardian-state';
import { Flame, Droplets, Zap, ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatusConfig = {
  gas: {
    max: 100,
    threshold: 40,
    accent: 'from-amber-500/20 to-orange-500/5',
    activeColor: 'text-amber-400',
    iconColor: 'text-amber-400',
  },
  water: {
    max: 25,
    threshold: 12,
    accent: 'from-cyan-500/20 to-blue-500/5',
    activeColor: 'text-cyan-400',
    iconColor: 'text-cyan-400',
  },
  electricity: {
    max: 10,
    threshold: 6.5,
    accent: 'from-violet-500/20 to-emerald-500/5',
    activeColor: 'text-emerald-400',
    iconColor: 'text-emerald-400',
  },
};

function StatusTile({
  title,
  icon: Icon,
  status,
  reading,
  unit,
  type,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  status: SystemStatus;
  reading: number;
  unit: string;
  type: 'gas' | 'water' | 'electricity';
}) {
  const resetSystem = useGuardianStore((s) => s.resetSystem);
  const cfg = StatusConfig[type];

  const isWarning = status === 'Warning';
  const isPrevented = status === 'Prevented';
  const isCritical = status === 'Critical';

  // Calculate percentage of safety limit
  const pct = Math.min(100, Math.max(5, (reading / cfg.max) * 100));

  const borderClass = isCritical
    ? 'border-destructive/60 shadow-[0_0_20px_rgba(239,68,68,0.2)] bg-destructive/10'
    : isWarning
    ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)] bg-amber-500/10'
    : isPrevented
    ? 'border-orange-500/40 bg-orange-500/5'
    : 'border-white/10 bg-zinc-900/40 hover:border-white/20';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 p-4.5 flex flex-col justify-between ${borderClass} group`}
    >
      {/* Subtle top glare highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground/90 tracking-wide">{title}</h3>
          </div>
        </div>

        {/* Live Pulse or Alert Status */}
        {isWarning && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            <ShieldAlert className="w-3 h-3" /> Warning
          </span>
        )}
        {isPrevented && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/20 text-orange-300 border border-orange-500/40">
            <ShieldCheck className="w-3 h-3" /> Intercepted
          </span>
        )}
        {isCritical && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-destructive/20 text-destructive border border-destructive/50 animate-bounce">
            Critical
          </span>
        )}
      </div>

      {/* Big Figure */}
      <div className="my-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-light tracking-tight text-white font-sans tabular-nums">
            {reading.toFixed(2)}
          </span>
          <span className="text-xs text-muted-foreground font-mono">{unit}</span>
        </div>
      </div>

      {/* Micro Safety Level Gauge */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <span>Safety Gauge</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isCritical
                ? 'bg-destructive'
                : isWarning
                ? 'bg-amber-400'
                : isPrevented
                ? 'bg-orange-400'
                : 'bg-emerald-400'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Restore Button when Prevented */}
      <AnimatePresence>
        {isPrevented && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-white/10"
          >
            <button
              onClick={() => resetSystem(type)}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-medium bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Cutoff Valve
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StatusGrid() {
  const { gasStatus, waterStatus, electricityStatus, gasReading, waterReading, electricityReading } =
    useGuardianStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
      <StatusTile
        title="Gas Pressure"
        icon={Flame}
        status={gasStatus}
        reading={gasReading}
        unit="ppm"
        type="gas"
      />
      <StatusTile
        title="Water Flow"
        icon={Droplets}
        status={waterStatus}
        reading={waterReading}
        unit="L/m"
        type="water"
      />
      <StatusTile
        title="Power Draw"
        icon={Zap}
        status={electricityStatus}
        reading={electricityReading}
        unit="kW"
        type="electricity"
      />
    </div>
  );
}
