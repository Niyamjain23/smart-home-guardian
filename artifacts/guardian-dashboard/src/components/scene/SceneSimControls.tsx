import React, { useState } from 'react';
import { Flame, Droplets, Zap, RotateCcw, Terminal, ShieldCheck, ShieldOff } from 'lucide-react';
import { useGuardianStore, UtilityType, SystemStatus } from '@/lib/guardian-state';

type SimMode = 'smart' | 'bypassed';

interface RowProps {
  type: UtilityType;
  label: string;
  icon: React.ElementType;
  status: SystemStatus;
  mode: SimMode;
}

function SimRow({ type, label, icon: Icon, status, mode }: RowProps) {
  const simulateAnomaly = useGuardianStore((s) => s.simulateAnomaly);
  const simulateDisaster = useGuardianStore((s) => s.simulateDisaster);
  const resetSystem = useGuardianStore((s) => s.resetSystem);

  const isPrevented = status === 'Prevented';
  const isWarning = status === 'Warning';
  const isCritical = status === 'Critical';
  const isSafe = status === 'Safe';

  let tone = '';
  let action: () => void = () => {};
  let actionLabel = '';

  if (isPrevented) {
    tone = 'text-orange-400 border-orange-500/40 bg-orange-500/10';
    action = () => resetSystem(type);
    actionLabel = 'Reset';
  } else if (isWarning) {
    tone = 'text-amber-400 border-amber-500/40 bg-amber-500/10 animate-pulse';
    actionLabel = 'Active';
  } else if (isCritical) {
    tone = 'text-destructive border-destructive/50 bg-destructive/15 animate-pulse';
    action = () => resetSystem(type);
    actionLabel = 'Contain';
  } else if (mode === 'smart') {
    tone = 'text-white/80 border-white/15 bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400';
    action = () => simulateAnomaly(type);
    actionLabel = 'Trigger';
  } else {
    tone = 'text-destructive/80 border-destructive/30 bg-destructive/5 hover:bg-destructive/15 hover:border-destructive/50 hover:text-destructive';
    action = () => simulateDisaster(type);
    actionLabel = 'Trigger';
  }

  return (
    <button
      onClick={action}
      disabled={isWarning || (mode === 'smart' && isCritical) || (mode === 'bypassed' && isPrevented)}
      className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 px-2 rounded-md border backdrop-blur-md transition-colors min-w-0 ${tone} disabled:opacity-50`}
      title={`${actionLabel} ${label}`}
    >
      <div className="flex items-center gap-1.5">
        {(isPrevented || isCritical) ? <RotateCcw className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
        <span className="text-[10px] font-mono uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-[9px] font-mono uppercase tracking-wider opacity-70">{actionLabel}</span>
    </button>
  );
}

export default function SceneSimControls() {
  const [mode, setMode] = useState<SimMode>('smart');

  const gasStatus = useGuardianStore((s) => s.gasStatus);
  const waterStatus = useGuardianStore((s) => s.waterStatus);
  const electricityStatus = useGuardianStore((s) => s.electricityStatus);

  return (
    <div className="absolute bottom-3 left-3 right-3 z-10 md:hidden">
      <div className="px-3 pt-2 pb-2 rounded-lg bg-black/55 border border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-white/60">
            <Terminal className="w-3 h-3" />
            <span className="text-[10px] font-mono uppercase tracking-wider">Simulation</span>
          </div>
          {/* Mode toggle */}
          <div className="flex items-center bg-black/40 rounded-md border border-white/10 overflow-hidden">
            <button
              onClick={() => setMode('smart')}
              className={`flex items-center gap-1 px-2 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors ${
                mode === 'smart' ? 'bg-primary/20 text-primary' : 'text-white/50 hover:text-white/80'
              }`}
            >
              <ShieldCheck className="w-2.5 h-2.5" />
              Smart
            </button>
            <button
              onClick={() => setMode('bypassed')}
              className={`flex items-center gap-1 px-2 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors ${
                mode === 'bypassed' ? 'bg-destructive/25 text-destructive' : 'text-white/50 hover:text-white/80'
              }`}
            >
              <ShieldOff className="w-2.5 h-2.5" />
              Bypassed
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <SimRow type="gas"         label="Gas"   icon={Flame}    status={gasStatus}         mode={mode} />
          <SimRow type="water"       label="Water" icon={Droplets} status={waterStatus}       mode={mode} />
          <SimRow type="electricity" label="Power" icon={Zap}      status={electricityStatus} mode={mode} />
        </div>
      </div>
    </div>
  );
}
