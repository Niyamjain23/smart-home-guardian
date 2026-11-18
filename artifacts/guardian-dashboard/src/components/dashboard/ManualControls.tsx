import React from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Flame, Droplets, Zap, ShieldCheck } from 'lucide-react';
import { useGuardianStore, UtilityType } from '@/lib/guardian-state';

function ManualRow({
  type,
  title,
  icon: Icon,
}: {
  type: UtilityType;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const manualOff = useGuardianStore((s) => s.manualOff[type]);
  const toggleManual = useGuardianStore((s) => s.toggleManual);
  const enabled = !manualOff;

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
        enabled ? 'bg-primary/5 border-primary/20' : 'bg-orange-500/5 border-orange-500/20'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-md flex items-center justify-center ${
            enabled ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-400'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{title}</span>
          <span
            className={`text-[10px] font-mono uppercase tracking-wider ${
              enabled ? 'text-muted-foreground' : 'text-orange-400'
            }`}
          >
            {enabled ? 'On' : 'Off'}
          </span>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={() => toggleManual(type)} />
    </div>
  );
}

export default function ManualControls() {
  return (
    <Card className="p-4 bg-card/50 border-border/50 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wider uppercase">Manual Control</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ManualRow type="gas" title="Gas Supply" icon={Flame} />
        <ManualRow type="water" title="Water Main" icon={Droplets} />
        <ManualRow type="electricity" title="Main Power Grid" icon={Zap} />
      </div>
    </Card>
  );
}
