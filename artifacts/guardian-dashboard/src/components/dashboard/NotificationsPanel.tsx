import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Download,
  Trash2,
  Search,
  Flame,
  Droplets,
  Zap,
  Activity,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { useGuardianStore, NotificationLog } from '@/lib/guardian-state';

type UtilityFilter = 'all' | 'gas' | 'water' | 'electricity' | 'system';
type SeverityFilter = 'all' | 'critical' | 'warning' | 'success' | 'info';

const utilityIcon = (u: NotificationLog['utility']) =>
  u === 'gas' ? Flame : u === 'water' ? Droplets : u === 'electricity' ? Zap : Activity;

const utilityLabel = (u: NotificationLog['utility']) =>
  u === 'gas' ? 'Gas' : u === 'water' ? 'Water' : u === 'electricity' ? 'Power' : 'System';

function escapeCsv(field: string) {
  if (/[",\n]/.test(field)) return `"${field.replace(/"/g, '""')}"`;
  return field;
}

function exportToCsv(rows: NotificationLog[]) {
  const header = ['timestamp_iso', 'utility', 'severity', 'message'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push([
      escapeCsv(r.timestamp.toISOString()),
      escapeCsv(r.utility),
      escapeCsv(r.severity),
      escapeCsv(r.message),
    ].join(','));
  }
  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `guardian-log-${format(new Date(), 'yyyyMMdd-HHmmss')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function NotificationsPanel() {
  const {
    notifications,
    hasUnreadNotifications,
    markNotificationsRead,
    clearNotifications,
  } = useGuardianStore();

  const [open, setOpen] = useState(false);
  const [utilityFilter, setUtilityFilter] = useState<UtilityFilter>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [search, setSearch] = useState('');

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
    markNotificationsRead();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notifications.filter((n) => {
      if (utilityFilter !== 'all' && n.utility !== utilityFilter) return false;
      if (severityFilter !== 'all' && n.severity !== severityFilter) return false;
      if (q && !n.message.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [notifications, utilityFilter, severityFilter, search]);

  const counts = useMemo(() => {
    const c = { critical: 0, warning: 0, success: 0, info: 0 } as Record<
      NotificationLog['severity'],
      number
    >;
    for (const n of notifications) c[n.severity]++;
    return c;
  }, [notifications]);

  return (
    <>
      {/* Trigger Button in Header */}
      <button
        onClick={handleOpen}
        className="relative w-8.5 h-8.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-all cursor-pointer"
        title="View System Logs"
      >
        <Bell className="w-4 h-4" />
        {hasUnreadNotifications && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        )}
      </button>

      {/* Floating Glass Log Flyout (Portaled to Body) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div className="fixed inset-0 z-50 pointer-events-auto">
                {/* Translucent blurred backdrop (3D scene stays visible) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-[3px]"
                />

                {/* Glass Panel */}
                <motion.aside
                  initial={{ opacity: 0, x: 45, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 45, scale: 0.98 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                  className="fixed top-3 bottom-3 right-3 sm:top-5 sm:bottom-5 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[460px] md:w-[490px] flex flex-col rounded-3xl border border-white/15 bg-zinc-950/85 backdrop-blur-3xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden"
                >
                  {/* Subtle top glare highlight */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                  {/* Panel Header */}
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                        System Logs
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-mono tabular-nums ml-1">
                        {notifications.length}
                      </span>
                    </div>

                    <button
                      onClick={() => setOpen(false)}
                      className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-muted-foreground hover:text-white transition-colors cursor-pointer"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Controls Strip */}
                  <div className="px-5 pt-3.5 pb-3 flex flex-col gap-3 shrink-0 border-b border-white/8">
                    {/* 1. Severity Stat Chips */}
                    <div className="grid grid-cols-4 gap-2">
                      {(['critical', 'warning', 'success', 'info'] as const).map((sev) => {
                        const isSel = severityFilter === sev;
                        const count = counts[sev];
                        const dotColor =
                          sev === 'critical'
                            ? 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                            : sev === 'warning'
                            ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                            : sev === 'success'
                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                            : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]';

                        const label =
                          sev === 'critical'
                            ? 'Crit'
                            : sev === 'warning'
                            ? 'Warn'
                            : sev === 'success'
                            ? 'Resolved'
                            : 'Info';

                        return (
                          <button
                            key={sev}
                            onClick={() => setSeverityFilter(isSel ? 'all' : sev)}
                            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition-all cursor-pointer ${
                              isSel
                                ? 'bg-white/15 border-white/30 text-white shadow-sm'
                                : 'bg-zinc-900/60 hover:bg-white/5 border-white/10 text-muted-foreground hover:text-white'
                            }`}
                          >
                            <span className="text-base font-semibold font-sans tabular-nums text-white">
                              {count}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                              <span className="text-[10px] uppercase font-mono tracking-wider">
                                {label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* 2. Utility Filter Segmented Switcher */}
                    <div className="flex items-center p-1 rounded-2xl bg-black/40 border border-white/10 overflow-x-auto">
                      {(['all', 'gas', 'water', 'electricity', 'system'] as UtilityFilter[]).map(
                        (u) => {
                          const Icon =
                            u === 'all'
                              ? Bell
                              : utilityIcon(u as NotificationLog['utility']);
                          const label =
                            u === 'all'
                              ? 'All'
                              : u === 'electricity'
                              ? 'Power'
                              : utilityLabel(u as NotificationLog['utility']);
                          const isSel = utilityFilter === u;
                          return (
                            <button
                              key={u}
                              onClick={() => setUtilityFilter(u)}
                              className={`flex-1 min-w-[50px] py-1.5 px-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                                isSel
                                  ? 'bg-white/15 text-white shadow-sm border border-white/20'
                                  : 'text-muted-foreground hover:text-white border border-transparent'
                              }`}
                            >
                              <Icon className="w-3 h-3 shrink-0" />
                              <span className="text-[11px]">{label}</span>
                            </button>
                          );
                        }
                      )}
                    </div>

                    {/* 3. Search & Actions */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search logs..."
                          className="w-full pl-8.5 pr-8 py-1.5 rounded-xl bg-zinc-900/60 border border-white/10 text-xs text-white placeholder:text-muted-foreground/70 focus:outline-none focus:border-white/30 transition-all font-sans"
                        />
                        {search && (
                          <button
                            onClick={() => setSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => exportToCsv(filtered)}
                        disabled={filtered.length === 0}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                        title="Export CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="text-xs">CSV</span>
                      </button>

                      <button
                        onClick={clearNotifications}
                        disabled={notifications.length === 0}
                        className="px-3 py-1.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-xs text-destructive flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                        title="Clear all logs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-xs">Clear</span>
                      </button>
                    </div>
                  </div>

                  {/* 4. Scrollable Logs Feed */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-2">
                    {filtered.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground mb-3">
                          {notifications.length === 0 ? (
                            <Bell className="w-5 h-5 opacity-40 text-cyan-400" />
                          ) : (
                            <Search className="w-5 h-5 opacity-40 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-white/90">
                          {notifications.length === 0
                            ? 'All Systems Nominal'
                            : 'No Matching Events'}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1 max-w-[240px]">
                          {notifications.length === 0
                            ? 'Telemetry is stable. Safety intercepts and warnings will be logged here.'
                            : 'Try adjusting your search terms or clearing the active filters.'}
                        </p>
                      </div>
                    ) : (
                      filtered.map((log) => {
                        const Icon = utilityIcon(log.utility);
                        return (
                          <div
                            key={log.id}
                            className="p-3.5 rounded-2xl border border-white/8 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-white/15 backdrop-blur-xl transition-all flex items-start gap-3 group"
                          >
                            <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                              <Icon className="w-3.5 h-3.5 text-white/90" />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-white">
                                    {utilityLabel(log.utility)}
                                  </span>
                                  <span
                                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md border ${
                                      log.severity === 'critical'
                                        ? 'border-destructive/30 bg-destructive/15 text-destructive'
                                        : log.severity === 'warning'
                                        ? 'border-amber-500/30 bg-amber-500/15 text-amber-300'
                                        : log.severity === 'success'
                                        ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                                        : 'border-blue-500/30 bg-blue-500/15 text-blue-300'
                                    }`}
                                  >
                                    {log.severity}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                                  {format(log.timestamp, 'HH:mm:ss')}
                                </span>
                              </div>

                              <p className="text-xs text-foreground/80 leading-relaxed break-words font-sans">
                                {log.message}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.aside>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
