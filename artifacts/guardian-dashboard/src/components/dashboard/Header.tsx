import React from 'react';
import { ShieldCheck, ShieldAlert, Lock } from 'lucide-react';
import { useGuardianStore } from '@/lib/guardian-state';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsPanel from './NotificationsPanel';

export default function Header() {
  const systemStatus = useGuardianStore((s) => s.systemStatus);

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50 shrink-0">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <h1 className="font-bold text-lg md:text-xl tracking-tight text-foreground truncate">GUARDIAN</h1>

        {/* Network security badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-500/50 bg-emerald-500/8 ml-1">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400 whitespace-nowrap">
            NETWORK: PRIVATE ISOLATED SUBNET (TLS ENCRYPTED)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <AnimatePresence mode="wait">
          {systemStatus === 'nominal' ? (
            <motion.div
              key="nominal"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-2 text-primary"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="hidden sm:inline text-xs md:text-sm font-mono tracking-wider uppercase">
                All Normal
              </span>
              <span className="sm:hidden text-xs font-mono uppercase">Normal</span>
            </motion.div>
          ) : (
            <motion.div
              key="anomaly"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-2 text-amber-500"
            >
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline text-xs md:text-sm font-mono tracking-wider uppercase">
                Anomaly Detected
              </span>
              <span className="sm:hidden text-xs font-mono uppercase">Anomaly</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hidden md:block h-6 w-px bg-border" />

        <NotificationsPanel />
      </div>
    </header>
  );
}
