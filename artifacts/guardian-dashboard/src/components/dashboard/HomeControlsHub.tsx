import React, { useState } from 'react';
import {
  Flame,
  Droplets,
  Zap,
  Lightbulb,
  Microwave,
  Wind,
  WashingMachine,
  Sliders,
} from 'lucide-react';
import {
  useGuardianStore,
  UtilityType,
  APPLIANCES,
  ApplianceKey,
} from '@/lib/guardian-state';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';

const APPLIANCE_ICONS: Record<ApplianceKey, React.ComponentType<{ className?: string }>> = {
  microwave: Microwave,
  ac: Wind,
  dishwasher: WashingMachine,
  oven: Flame,
};

type ControlTab = 'utilities' | 'lighting' | 'appliances';

export default function HomeControlsHub() {
  const [activeTab, setActiveTab] = useState<ControlTab>('utilities');

  // Store bindings
  const manualOff = useGuardianStore((s) => s.manualOff);
  const toggleManual = useGuardianStore((s) => s.toggleManual);
  const lights = useGuardianStore((s) => s.lights);
  const toggleLight = useGuardianStore((s) => s.toggleLight);
  const appliances = useGuardianStore((s) => s.appliances);
  const toggleAppliance = useGuardianStore((s) => s.toggleAppliance);
  const electricityStatus = useGuardianStore((s) => s.electricityStatus);

  const isPowerIsolated = electricityStatus === 'Prevented';

  const totalApplianceWatts = APPLIANCES.reduce(
    (sum, a) => sum + (appliances[a.key] && !isPowerIsolated ? a.watts : 0),
    0
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-4 shrink-0 flex flex-col gap-4 group hover:border-white/15 transition-all">
      {/* Glare highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Segmented Pills */}
      <div className="flex items-center p-1 rounded-2xl bg-black/40 border border-white/10 self-start">
        <button
          onClick={() => setActiveTab('utilities')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
            activeTab === 'utilities'
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-muted-foreground hover:text-white'
          }`}
        >
          Utilities
        </button>
        <button
          onClick={() => setActiveTab('lighting')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
            activeTab === 'lighting'
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-muted-foreground hover:text-white'
          }`}
        >
          Lighting
        </button>
        <button
          onClick={() => setActiveTab('appliances')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'appliances'
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-muted-foreground hover:text-white'
          }`}
        >
          <span>Appliances</span>
          {totalApplianceWatts > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'utilities' && (
          <motion.div
            key="utilities"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-2.5"
          >
            {/* Gas */}
            <UtilityRow
              title="Gas"
              icon={Flame}
              iconColor="text-amber-400"
              enabled={!manualOff.gas}
              onToggle={() => toggleManual('gas')}
            />
            {/* Water */}
            <UtilityRow
              title="Water"
              icon={Droplets}
              iconColor="text-cyan-400"
              enabled={!manualOff.water}
              onToggle={() => toggleManual('water')}
            />
            {/* Electricity */}
            <UtilityRow
              title="Power"
              icon={Zap}
              iconColor="text-emerald-400"
              enabled={!manualOff.electricity}
              onToggle={() => toggleManual('electricity')}
              isPrevented={isPowerIsolated}
            />
          </motion.div>
        )}

        {activeTab === 'lighting' && (
          <motion.div
            key="lighting"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
          >
            <LightRow
              label="Living Room"
              isOn={lights.livingRoom && !isPowerIsolated}
              disabled={isPowerIsolated}
              onToggle={() => toggleLight('livingRoom')}
            />
            <LightRow
              label="Kitchen"
              isOn={lights.kitchen && !isPowerIsolated}
              disabled={isPowerIsolated}
              onToggle={() => toggleLight('kitchen')}
            />
          </motion.div>
        )}

        {activeTab === 'appliances' && (
          <motion.div
            key="appliances"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-2.5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {APPLIANCES.map((a) => {
                const Icon = APPLIANCE_ICONS[a.key];
                const isOn = appliances[a.key] && !isPowerIsolated;

                return (
                  <div
                    key={a.key}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isOn
                        ? 'bg-white/10 border-white/20 shadow-sm'
                        : 'bg-black/20 border-white/5 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isOn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-muted-foreground'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium text-white truncate">{a.label}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {isPowerIsolated ? 'Offline' : `${a.watts} W`}
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={isOn}
                      onCheckedChange={() => toggleAppliance(a.key)}
                      disabled={isPowerIsolated}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="text-muted-foreground">Connected Appliance Load</span>
              <span className="font-semibold text-white tabular-nums">
                {totalApplianceWatts} W ({(totalApplianceWatts / 1000).toFixed(2)} kW)
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UtilityRow({
  title,
  icon: Icon,
  iconColor,
  enabled,
  onToggle,
  isPrevented,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  enabled: boolean;
  onToggle: () => void;
  isPrevented?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
        enabled
          ? 'bg-white/10 border-white/20 shadow-sm'
          : 'bg-orange-500/10 border-orange-500/20'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            enabled ? 'bg-white/10' : 'bg-orange-500/20'
          }`}
        >
          <Icon className={`w-3.5 h-3.5 ${enabled ? iconColor : 'text-orange-400'}`} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-white">{title}</span>
          <span
            className={`text-[10px] font-mono ${
              isPrevented
                ? 'text-orange-400 font-semibold'
                : enabled
                ? 'text-emerald-400'
                : 'text-muted-foreground'
            }`}
          >
            {isPrevented ? 'Auto Cutoff' : enabled ? 'Active' : 'Shut Off'}
          </span>
        </div>
      </div>
      <Switch checked={enabled && !isPrevented} onCheckedChange={onToggle} disabled={isPrevented} />
    </div>
  );
}

function LightRow({
  label,
  isOn,
  disabled,
  onToggle,
}: {
  label: string;
  isOn: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
        isOn
          ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
          : 'bg-black/20 border-white/5 opacity-80'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isOn ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 text-muted-foreground'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-white">{label}</span>
          <span className={`text-[10px] font-mono ${isOn ? 'text-amber-400' : 'text-muted-foreground'}`}>
            {disabled ? 'Power Isolated' : isOn ? 'Illuminated' : 'Off'}
          </span>
        </div>
      </div>
      <Switch checked={isOn} onCheckedChange={onToggle} disabled={disabled} />
    </div>
  );
}
