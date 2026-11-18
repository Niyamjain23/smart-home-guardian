import React from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Lightbulb } from 'lucide-react';
import { useGuardianStore } from '@/lib/guardian-state';

export default function RoomLights() {
  const { lights, toggleLight, electricityStatus } = useGuardianStore();
  const isIsolated = electricityStatus === 'Prevented';

  return (
    <Card className="p-4 bg-card/50 border-border/50 shrink-0">
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <Lightbulb className="w-4 h-4" />
        <span className="text-xs font-bold tracking-wider uppercase">Environmental Controls</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={`flex items-center justify-between p-3 rounded-md border ${lights.livingRoom && !isIsolated ? 'bg-primary/5 border-primary/20' : 'bg-background border-border'} transition-colors`}>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Living Room</span>
            <span className="text-xs text-muted-foreground font-mono">{isIsolated ? 'UNAVAILABLE' : (lights.livingRoom ? 'ON' : 'OFF')}</span>
          </div>
          <Switch 
            checked={lights.livingRoom && !isIsolated} 
            onCheckedChange={() => toggleLight('livingRoom')} 
            disabled={isIsolated}
          />
        </div>

        <div className={`flex items-center justify-between p-3 rounded-md border ${lights.kitchen && !isIsolated ? 'bg-primary/5 border-primary/20' : 'bg-background border-border'} transition-colors`}>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Kitchen</span>
            <span className="text-xs text-muted-foreground font-mono">{isIsolated ? 'UNAVAILABLE' : (lights.kitchen ? 'ON' : 'OFF')}</span>
          </div>
          <Switch 
            checked={lights.kitchen && !isIsolated} 
            onCheckedChange={() => toggleLight('kitchen')} 
            disabled={isIsolated}
          />
        </div>
      </div>
    </Card>
  );
}