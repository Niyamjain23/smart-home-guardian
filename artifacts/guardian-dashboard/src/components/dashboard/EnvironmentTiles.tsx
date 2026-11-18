import React from 'react';
import { Thermometer, Wind, Droplet } from 'lucide-react';
import { useGuardianStore } from '@/lib/guardian-state';

function aqiInfo(aqi: number) {
  if (aqi <= 50) return { label: 'Good', tone: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  if (aqi <= 100) return { label: 'Moderate', tone: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
  if (aqi <= 150) return { label: 'Unhealthy', tone: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
  return { label: 'Hazardous', tone: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
}

function tempInfo(c: number) {
  if (c < 20) return { label: 'Cool', tone: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
  if (c <= 25) return { label: 'Ideal', tone: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  if (c <= 28) return { label: 'Warm', tone: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
  return { label: 'High', tone: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
}

function humidityInfo(h: number) {
  if (h < 35) return { label: 'Dry', tone: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
  if (h <= 55) return { label: 'Optimal', tone: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  if (h <= 65) return { label: 'Humid', tone: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
  return { label: 'High', tone: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
}

export default function EnvironmentTiles() {
  const { temperature, airQuality, humidity } = useGuardianStore();

  const t = tempInfo(temperature);
  const a = aqiInfo(airQuality);
  const h = humidityInfo(humidity);

  return (
    <div className="grid grid-cols-3 gap-3 shrink-0">
      {/* Temp */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-3 flex flex-col justify-between group hover:border-white/20 transition-all">
        <div className="flex items-center justify-between mb-2">
          <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
            <Thermometer className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${t.tone}`}>
            {t.label}
          </span>
        </div>
        <div>
          <span className="text-xl font-light tracking-tight text-white font-sans">
            {temperature.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground ml-1">°C</span>
        </div>
      </div>

      {/* AQI */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-3 flex flex-col justify-between group hover:border-white/20 transition-all">
        <div className="flex items-center justify-between mb-2">
          <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
            <Wind className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${a.tone}`}>
            {a.label}
          </span>
        </div>
        <div>
          <span className="text-xl font-light tracking-tight text-white font-sans">
            {airQuality.toFixed(0)}
          </span>
          <span className="text-xs text-muted-foreground ml-1">AQI</span>
        </div>
      </div>

      {/* Humidity */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-3 flex flex-col justify-between group hover:border-white/20 transition-all">
        <div className="flex items-center justify-between mb-2">
          <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
            <Droplet className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${h.tone}`}>
            {h.label}
          </span>
        </div>
        <div>
          <span className="text-xl font-light tracking-tight text-white font-sans">
            {humidity.toFixed(0)}
          </span>
          <span className="text-xs text-muted-foreground ml-1">%</span>
        </div>
      </div>
    </div>
  );
}
