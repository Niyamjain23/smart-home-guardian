import React, { useState } from 'react';
import {
  Flame,
  Droplets,
  Zap,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { useGuardianStore, UtilityType } from '@/lib/guardian-state';

export default function DeveloperSettings() {
  const [simMode, setSimMode] = useState<'smart' | 'unprotected'>('smart');

  const {
    gasStatus,
    waterStatus,
    electricityStatus,
    simulateAnomaly,
    simulateDisaster,
    resetSystem,
  } = useGuardianStore();

  const handleTrigger = (type: UtilityType) => {
    if (simMode === 'smart') {
      simulateAnomaly(type);
    } else {
      simulateDisaster(type);
    }
  };

  const isAnyActive =
    gasStatus !== 'Safe' || waterStatus !== 'Safe' || electricityStatus !== 'Safe';

  const resetAll = () => {
    resetSystem('gas');
    resetSystem('water');
    resetSystem('electricity');
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Mode Switcher & Reset */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-zinc-900/60 border border-white/10">
        <div className="flex items-center gap-1.5 flex-1">
          <button
            onClick={() => setSimMode('smart')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
              simMode === 'smart'
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 shadow-sm'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Protected</span>
          </button>

          <button
            onClick={() => setSimMode('unprotected')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
              simMode === 'unprotected'
                ? 'bg-destructive/20 border border-destructive/30 text-destructive shadow-sm'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Unprotected</span>
          </button>
        </div>

        {isAnyActive && (
          <button
            onClick={resetAll}
            className="px-2.5 py-1.5 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            Reset All
          </button>
        )}
      </div>

      {/* Scenario Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <ScenarioCard
          title="Gas Leak"
          icon={Flame}
          status={gasStatus}
          activeColor="text-amber-400"
          onTrigger={() => handleTrigger('gas')}
          onReset={() => resetSystem('gas')}
        />
        <ScenarioCard
          title="Pipe Burst"
          icon={Droplets}
          status={waterStatus}
          activeColor="text-cyan-400"
          onTrigger={() => handleTrigger('water')}
          onReset={() => resetSystem('water')}
        />
        <ScenarioCard
          title="Grid Surge"
          icon={Zap}
          status={electricityStatus}
          activeColor="text-emerald-400"
          onTrigger={() => handleTrigger('electricity')}
          onReset={() => resetSystem('electricity')}
        />
      </div>
    </div>
  );
}

function ScenarioCard({
  title,
  icon: Icon,
  status,
  activeColor,
  onTrigger,
  onReset,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  status: string;
  activeColor: string;
  onTrigger: () => void;
  onReset: () => void;
}) {
  const isSafe = status === 'Safe';
  const isWarning = status === 'Warning';
  const isPrevented = status === 'Prevented';

  return (
    <div className="p-3.5 rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl flex flex-col justify-between gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${activeColor}`} />
          <span className="text-xs font-semibold text-white">{title}</span>
        </div>
        {!isSafe && (
          <span
            className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
              isWarning
                ? 'text-amber-300 border-amber-500/40 bg-amber-500/20 animate-pulse'
                : isPrevented
                ? 'text-orange-300 border-orange-500/40 bg-orange-500/20'
                : 'text-destructive border-destructive/40 bg-destructive/20 animate-bounce'
            }`}
          >
            {status}
          </span>
        )}
      </div>

      {isSafe ? (
        <button
          onClick={onTrigger}
          className="w-full py-1.5 px-3 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          Trigger Test
        </button>
      ) : (
        <button
          onClick={onReset}
          className="w-full py-1.5 px-3 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      )}
    </div>
  );
}
