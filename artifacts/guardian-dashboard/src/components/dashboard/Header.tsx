import React from 'react';
import { ShieldCheck, ShieldAlert, Activity } from 'lucide-react';
import { useGuardianStore } from '@/lib/guardian-state';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsPanel from './NotificationsPanel';

export default function Header() {
  const systemStatus = useGuardianStore((s) => s.systemStatus);
  const electricityReading = useGuardianStore((s) => s.electricityReading);

  const isNominal = systemStatus === 'nominal';

  return (
    <header className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-3 pointer-events-auto relative z-30">
      <div className="h-14 px-3.5 sm:px-5 rounded-2xl border border-white/12 bg-zinc-950/65 backdrop-blur-2xl flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] shrink-0">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-background animate-pulse" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-tight text-white">
                GUARDIAN
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-medium tracking-wide uppercase rounded bg-white/5 border border-white/10 text-muted-foreground">
                3D Spatial IoT
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground hidden sm:block truncate">
              Autonomous Hazard Prevention
            </span>
          </div>
        </div>

        {/* Right side live status pills & notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Power Pill */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-medium text-white tabular-nums">
              {electricityReading.toFixed(2)} <span className="text-muted-foreground text-[10px]">kW</span>
            </span>
          </div>

          {/* Global Protection Status Pill */}
          <AnimatePresence mode="wait">
            {isNominal ? (
              <motion.div
                key="nominal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium backdrop-blur-md"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>All Normal</span>
              </motion.div>
            ) : (
              <motion.div
                key="hazard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-medium backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Anomaly Detected</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-4 w-px bg-white/10" />

          <NotificationsPanel />
        </div>
      </div>
    </header>
  );
}
