import React, { useState } from 'react';
import {
  Flame,
  Droplets,
  Zap,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useGuardianStore, UtilityType } from '@/lib/guardian-state';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion } from 'framer-motion';

export default function DeveloperSettings() {
  const [isOpen, setIsOpen] = useState(true);
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
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl shrink-0 group hover:border-white/15 transition-all">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground/90 tracking-wide">
                Interactive Scenario Lab
              </h3>
              <span className="text-[10px] text-muted-foreground">
                Trigger Hazards & Test Proactive Mitigation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAnyActive && (
              <button
                onClick={resetAll}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset All
              </button>
            )}

            <CollapsibleTrigger asChild>
              <button className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors cursor-pointer">
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-white/5">
            {/* Mode Switcher */}
            <div className="flex items-center justify-between p-1.5 rounded-xl bg-black/40 border border-white/10">
              <button
                onClick={() => setSimMode('smart')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                  simMode === 'smart'
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 shadow-sm'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Autonomous Intercept (Protected)</span>
              </button>

              <button
                onClick={() => setSimMode('unprotected')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                  simMode === 'unprotected'
                    ? 'bg-destructive/20 border border-destructive/30 text-destructive shadow-sm'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Unprotected Hazard</span>
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {simMode === 'smart'
                ? 'Guardian AI detects anomalous sensor velocity and safely isolates the utility before threshold breach.'
                : 'Simulates what happens without smart automated prevention — hazards progress unmitigated.'}
            </p>

            {/* Scenario Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Gas Scenario */}
              <ScenarioCard
                title="Gas Leak"
                icon={Flame}
                status={gasStatus}
                activeColor="text-amber-400"
                onTrigger={() => handleTrigger('gas')}
                onReset={() => resetSystem('gas')}
              />

              {/* Water Scenario */}
              <ScenarioCard
                title="Pipe Burst"
                icon={Droplets}
                status={waterStatus}
                activeColor="text-cyan-400"
                onTrigger={() => handleTrigger('water')}
                onReset={() => resetSystem('water')}
              />

              {/* Electric Scenario */}
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
        </CollapsibleContent>
      </Collapsible>
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
  const isCritical = status === 'Critical';

  return (
    <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${activeColor}`} />
          <span className="text-xs font-semibold text-white">{title}</span>
        </div>
        <span
          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
            isSafe
              ? 'text-muted-foreground border-white/10 bg-black/20'
              : isWarning
              ? 'text-amber-300 border-amber-500/40 bg-amber-500/20 animate-pulse'
              : isPrevented
              ? 'text-orange-300 border-orange-500/40 bg-orange-500/20'
              : 'text-destructive border-destructive/40 bg-destructive/20 animate-bounce'
          }`}
        >
          {status}
        </span>
      </div>

      {isSafe ? (
        <button
          onClick={onTrigger}
          className="w-full py-1.5 px-3 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          Trigger Test
        </button>
      ) : (
        <button
          onClick={onReset}
          className="w-full py-1.5 px-3 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      )}
    </div>
  );
}
