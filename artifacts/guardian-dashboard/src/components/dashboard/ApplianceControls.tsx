import React from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Microwave, Wind, WashingMachine, Flame } from 'lucide-react';
import { useGuardianStore, APPLIANCES, ApplianceKey } from '@/lib/guardian-state';

const ICONS: Record<ApplianceKey, React.ComponentType<{ className?: string }>> = {
  microwave: Microwave,
  ac: Wind,
  dishwasher: WashingMachine,
  oven: Flame,
};

export default function ApplianceControls() {
  const { appliances, toggleAppliance, electricityStatus } = useGuardianStore();
  const isIsolated = electricityStatus === 'Prevented';

  const totalActiveKw = APPLIANCES.reduce(
    (sum, a) => sum + (appliances[a.key] ? a.watts : 0),
    0,
  ) / 1000;

  return (
    <Card className="p-4 bg-card/50 border-border/50 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Microwave className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wider uppercase">Appliances</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
          {totalActiveKw.toFixed(2)} kW
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {APPLIANCES.map((a) => {
          const Icon = ICONS[a.key];
          const isOn = appliances[a.key] && !isIsolated;
          return (
            <div
              key={a.key}
              className={`flex items-center justify-between p-2.5 rounded-md border transition-colors ${
                isOn
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-background border-border'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isOn ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium truncate">{a.label}</span>
                  <span className="text-[9px] text-muted-foreground font-mono">
                    {isIsolated ? 'UNAVAILABLE' : `${a.watts} W`}
                  </span>
                </div>
              </div>
              <Switch
                checked={isOn}
                onCheckedChange={() => toggleAppliance(a.key)}
                disabled={isIsolated}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
