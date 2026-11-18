import React from 'react';
import { Card } from '@/components/ui/card';
import { Thermometer, Wind, Droplet } from 'lucide-react';
import { useGuardianStore } from '@/lib/guardian-state';
import { motion } from 'framer-motion';

function aqiLabel(aqi: number) {
  if (aqi <= 50) return { label: 'Good', tone: 'text-emerald-400' };
  if (aqi <= 100) return { label: 'Moderate', tone: 'text-amber-400' };
  if (aqi <= 150) return { label: 'Unhealthy', tone: 'text-orange-400' };
  return { label: 'Hazardous', tone: 'text-red-400' };
}

function tempLabel(c: number) {
  if (c < 20) return { label: 'Cool', tone: 'text-sky-400' };
  if (c <= 25) return { label: 'Comfortable', tone: 'text-emerald-400' };
  if (c <= 28) return { label: 'Warm', tone: 'text-amber-400' };
  return { label: 'Hot', tone: 'text-orange-400' };
}

function humidityLabel(h: number) {
  if (h < 35) return { label: 'Dry', tone: 'text-amber-400' };
  if (h <= 55) return { label: 'Optimal', tone: 'text-emerald-400' };
  if (h <= 65) return { label: 'Humid', tone: 'text-sky-400' };
  return { label: 'Saturated', tone: 'text-orange-400' };
}

function EnvTile({
  title,
  icon: Icon,
  value,
  unit,
  badge,
  tone,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  unit: string;
  badge: string;
  tone: string;
}) {
  return (
    <Card className="p-4 bg-card/50 border-border/50 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wider uppercase">{title}</span>
        </div>
        <span className={`text-[10px] font-mono uppercase tracking-wider ${tone}`}>{badge}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <motion.span
          key={value}
          initial={{ opacity: 0.6, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-3xl font-mono font-light text-foreground"
        >
          {value}
        </motion.span>
        <span className="text-sm font-mono text-muted-foreground">{unit}</span>
      </div>
    </Card>
  );
}

export default function EnvironmentTiles() {
  const { temperature, airQuality, humidity } = useGuardianStore();

  const t = tempLabel(temperature);
  const a = aqiLabel(airQuality);
  const h = humidityLabel(humidity);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
      <EnvTile
        title="Temperature"
        icon={Thermometer}
        value={temperature.toFixed(1)}
        unit="°C"
        badge={t.label}
        tone={t.tone}
      />
      <EnvTile
        title="Air Index"
        icon={Wind}
        value={airQuality.toFixed(0)}
        unit="AQI"
        badge={a.label}
        tone={a.tone}
      />
      <EnvTile
        title="Humidity"
        icon={Droplet}
        value={humidity.toFixed(0)}
        unit="%"
        badge={h.label}
        tone={h.tone}
      />
    </div>
  );
}
