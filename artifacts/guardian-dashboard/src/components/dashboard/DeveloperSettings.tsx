import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, Flame, Droplets, Zap, ShieldOff, RotateCcw, AlertTriangle } from 'lucide-react';
import { useGuardianStore, UtilityType, SystemStatus } from '@/lib/guardian-state';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SimRowProps {
  type: UtilityType;
  label: string;
  cmd: string;
  icon: React.ComponentType<{ className?: string }>;
  status: SystemStatus;
}

function PredictiveRow({ type, label, cmd, icon: Icon, status }: SimRowProps) {
  const simulateAnomaly = useGuardianStore((s) => s.simulateAnomaly);
  const resetSystem = useGuardianStore((s) => s.resetSystem);

  const isPrevented = status === 'Prevented';
  const isWarning = status === 'Warning';

  const onClick = () => {
    if (isPrevented) resetSystem(type);
    else if (status === 'Safe') simulateAnomaly(type);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`w-full justify-start gap-2 font-mono text-xs h-8 bg-transparent ${
        isPrevented
          ? 'border-orange-500/40 text-orange-400 hover:bg-orange-500/10'
          : 'border-muted-foreground/20 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30'
      }`}
      onClick={onClick}
      disabled={isWarning || status === 'Critical'}
    >
      {isPrevented ? <RotateCcw className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
      {'>'} {isPrevented ? `reset_${type}()` : cmd}
    </Button>
  );
}

function DisasterRow({ type, label, cmd, icon: Icon, status }: SimRowProps) {
  const simulateDisaster = useGuardianStore((s) => s.simulateDisaster);
  const resetSystem = useGuardianStore((s) => s.resetSystem);

  const isCritical = status === 'Critical';
  const isWarning = status === 'Warning';
  const isPrevented = status === 'Prevented';

  const onClick = () => {
    if (isCritical) resetSystem(type);
    else if (status === 'Safe') simulateDisaster(type);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`w-full justify-start gap-2 font-mono text-xs h-8 bg-transparent ${
        isCritical
          ? 'border-destructive/60 text-destructive hover:bg-destructive/15 animate-pulse'
          : 'border-destructive/20 text-destructive/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40'
      }`}
      onClick={onClick}
      disabled={isWarning || isPrevented}
    >
      {isCritical ? <RotateCcw className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
      {'>'} {isCritical ? `contain_${type}()` : cmd}
    </Button>
  );
}

export default function DeveloperSettings() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { gasStatus, waterStatus, electricityStatus } = useGuardianStore();

  return (
    <Card className="mt-auto shrink-0 bg-black/40 border-dashed border-border/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between hover:bg-white/5 font-mono text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              SIMULATION CONTROLS
            </div>
            <span>{isOpen ? '[-]' : '[+]'}</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-dashed border-border/50">
            {/* Predictive (smart system active) */}
            <div className="p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-amber-500/80 mb-1">
                <Terminal className="w-3 h-3" />
                Smart System Active
                <span className="text-muted-foreground/60 normal-case lowercase tracking-normal">— Guardian intervenes</span>
              </div>
              <PredictiveRow type="gas"         label="Gas"   cmd="trigger_gas_leak()"     icon={Flame}    status={gasStatus} />
              <PredictiveRow type="water"       label="Water" cmd="trigger_water_burst()"  icon={Droplets} status={waterStatus} />
              <PredictiveRow type="electricity" label="Power" cmd="trigger_power_surge()"  icon={Zap}      status={electricityStatus} />
            </div>

            {/* Disaster (bypassed) */}
            <div className="p-3 border-t border-dashed border-destructive/30 bg-destructive/5 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-destructive">
                <ShieldOff className="w-3 h-3" />
                Bypassed System
                <span className="text-destructive/60 normal-case lowercase tracking-normal">— no Guardian</span>
              </div>
              <div className="flex items-start gap-1.5 text-[10px] text-destructive/70 leading-snug mb-1">
                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>Visualises a real disaster with no smart intervention.</span>
              </div>
              <DisasterRow type="gas"         label="Gas"   cmd="REAL_gas_leak()"        icon={Flame}    status={gasStatus} />
              <DisasterRow type="water"       label="Water" cmd="REAL_water_flood()"     icon={Droplets} status={waterStatus} />
              <DisasterRow type="electricity" label="Power" cmd="REAL_electrical_fire()" icon={Zap}      status={electricityStatus} />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
