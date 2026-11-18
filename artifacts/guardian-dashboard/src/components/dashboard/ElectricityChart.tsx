import React from 'react';
import { Card } from '@/components/ui/card';
import { useGuardianStore } from '@/lib/guardian-state';
import { Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function ElectricityChart() {
  const { electricityHistory, electricityStatus, electricityReading } = useGuardianStore();

  const isWarning = electricityStatus === 'Warning';
  const isPrevented = electricityStatus === 'Prevented';

  const strokeColor = isPrevented ? 'hsl(var(--orange-500))' : isWarning ? 'hsl(var(--amber-500))' : 'hsl(var(--primary))';

  // Dynamic Y domain — pad above max so small light loads (~0.065 kW each) are visible,
  // while big anomaly spikes (8–13 kW) still fit cleanly.
  const values = electricityHistory.map((p) => p.value);
  const dataMax = values.length ? Math.max(...values) : 1;
  const yMax = Math.max(0.6, dataMax * 1.25);

  return (
    <Card className="flex flex-col p-4 bg-card/50 border-border/50 shadow-none shrink-0 h-[240px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wider uppercase">Live Load Monitoring</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-foreground tabular-nums">
            {electricityReading.toFixed(2)} <span className="text-muted-foreground">kW</span>
          </span>
          {isWarning && <span className="text-xs text-amber-500 font-mono animate-pulse">SPIKE DETECTED</span>}
          <div className="text-xs font-mono text-muted-foreground">60s WINDOW</div>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={electricityHistory}>
            <XAxis 
              dataKey="time" 
              domain={['dataMin', 'dataMax']} 
              type="number" 
              hide 
            />
            <YAxis
              domain={[0, yMax]}
              hide
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border border-border p-2 rounded shadow-xl">
                      <p className="font-mono text-sm">{Number(payload[0].value).toFixed(2)} kW</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="stepAfter" 
              dataKey="value" 
              stroke={strokeColor} 
              strokeWidth={1.5} 
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
        {isPrevented && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
            <span className="font-mono text-sm text-orange-500 border border-orange-500/30 bg-orange-500/10 px-3 py-1 rounded">CIRCUIT ISOLATED</span>
          </div>
        )}
      </div>
    </Card>
  );
}