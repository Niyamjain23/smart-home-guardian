import React from 'react';
import { useGuardianStore } from '@/lib/guardian-state';
import { Activity, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function ElectricityChart() {
  const { electricityHistory, electricityStatus, electricityReading } = useGuardianStore();

  const isWarning = electricityStatus === 'Warning';
  const isPrevented = electricityStatus === 'Prevented';
  const isCritical = electricityStatus === 'Critical';

  const strokeColor = isCritical
    ? '#ef4444'
    : isWarning
    ? '#f59e0b'
    : isPrevented
    ? '#f97316'
    : '#10b981';

  const gradientId = 'powerGlowGradient';

  // Dynamic Y domain
  const values = electricityHistory.map((p) => p.value);
  const dataMax = values.length ? Math.max(...values) : 1;
  const yMax = Math.max(0.6, dataMax * 1.25);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-4.5 shrink-0 h-[240px] flex flex-col justify-between group hover:border-white/15 transition-all">
      {/* Glare highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground/90 tracking-wide">Live Load Telemetry</h3>
            <span className="text-[10px] text-muted-foreground">Rolling 60-Second Window</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span className="text-xs font-semibold text-white tabular-nums">
              {electricityReading.toFixed(2)} <span className="text-[10px] text-muted-foreground">kW</span>
            </span>
          </div>
          {isWarning && (
            <span className="text-[10px] font-medium text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full animate-pulse">
              Spike Detected
            </span>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full relative min-h-0 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={electricityHistory}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                <stop offset="90%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" domain={['dataMin', 'dataMax']} type="number" hide />
            <YAxis domain={[0, yMax]} hide />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-zinc-950/90 border border-white/15 px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-md">
                      <span className="text-xs font-semibold text-white tabular-nums">
                        {Number(payload[0].value).toFixed(2)} kW
                      </span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>

        {isPrevented && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-lg">
            <div className="px-3.5 py-1.5 rounded-xl border border-orange-500/40 bg-orange-500/15 text-orange-300 text-xs font-medium flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
              Circuit Safely Isolated (Load Cut Off)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
