import React, { useMemo, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Bell, Download, Trash2, Search, Flame, Droplets, Zap, Activity, X } from 'lucide-react';
import { format } from 'date-fns';
import { useGuardianStore, NotificationLog } from '@/lib/guardian-state';

type UtilityFilter = 'all' | 'gas' | 'water' | 'electricity' | 'system';
type SeverityFilter = 'all' | 'critical' | 'warning' | 'success' | 'info';

const SEVERITY_ORDER: Record<NotificationLog['severity'], number> = {
  critical: 0, warning: 1, success: 2, info: 3,
};

const dotFor = (sev: NotificationLog['severity']) =>
  sev === 'critical' ? 'bg-destructive'
  : sev === 'warning' ? 'bg-amber-500'
  : sev === 'success' ? 'bg-primary' : 'bg-blue-400';

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
  const { notifications, hasUnreadNotifications, markNotificationsRead, clearNotifications } = useGuardianStore();

  const [open, setOpen] = useState(false);
  const [utilityFilter, setUtilityFilter] = useState<UtilityFilter>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [search, setSearch] = useState('');

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
    const c = { critical: 0, warning: 0, success: 0, info: 0 } as Record<NotificationLog['severity'], number>;
    for (const n of notifications) c[n.severity]++;
    return c;
  }, [notifications]);

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) markNotificationsRead();
      }}
    >
      <SheetTrigger asChild>
        <button
          className="relative outline-none hover:bg-white/5 p-2 rounded-full transition-colors"
          title="View full system log"
        >
          <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
          {hasUnreadNotifications && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background animate-pulse" />
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] p-0 flex flex-col bg-card border-border"
      >
        <SheetHeader className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Bell className="w-4 h-4 text-primary" />
              System Logs
              <Badge variant="secondary" className="font-mono text-xs ml-1">
                {notifications.length}
              </Badge>
            </SheetTitle>
          </div>

          {/* Severity counters strip */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {(['critical', 'warning', 'success', 'info'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(severityFilter === sev ? 'all' : sev)}
                className={`flex flex-col items-center gap-1 px-1.5 py-2 rounded-md border transition-colors ${
                  severityFilter === sev
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-border/40 hover:border-border bg-black/20'
                }`}
              >
                <span className="text-base font-mono font-light text-foreground">{counts[sev]}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${dotFor(sev)}`} />
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{sev}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Utility filter */}
          <ToggleGroup
            type="single"
            value={utilityFilter}
            onValueChange={(v) => v && setUtilityFilter(v as UtilityFilter)}
            className="grid grid-cols-5 gap-1 w-full"
          >
            {(['all', 'gas', 'water', 'electricity', 'system'] as UtilityFilter[]).map((u) => {
              const Icon = u === 'all' ? Bell : utilityIcon(u as NotificationLog['utility']);
              const label = u === 'all' ? 'All' : u === 'electricity' ? 'Power' : utilityLabel(u as NotificationLog['utility']);
              return (
                <ToggleGroupItem
                  key={u}
                  value={u}
                  className="text-xs h-8 data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:border-primary/40 border border-transparent"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  <span className="text-[10px] uppercase tracking-wider">{label}</span>
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search log messages…"
              className="pl-8 h-8 text-xs bg-black/30 border-border/50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs gap-1.5 font-mono"
              onClick={() => exportToCsv(filtered)}
              disabled={filtered.length === 0}
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV ({filtered.length})
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5 font-mono text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={clearNotifications}
              disabled={notifications.length === 0}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {notifications.length === 0
                ? 'No system events recorded yet.'
                : 'No logs match the current filters.'}
            </div>
          ) : (
            <div className="flex flex-col">
              {filtered.map((log) => {
                const Icon = utilityIcon(log.utility);
                return (
                  <div
                    key={log.id}
                    className="px-4 py-3 border-b border-border/50 hover:bg-white/5 transition-colors flex gap-3 text-sm"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotFor(log.severity)}`} />
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        <span>{format(log.timestamp, 'HH:mm:ss.SSS')}</span>
                        <span className="text-border">·</span>
                        <span className="flex items-center gap-1">
                          <Icon className="w-3 h-3" />
                          {utilityLabel(log.utility)}
                        </span>
                        <span className="text-border">·</span>
                        <span className={
                          log.severity === 'critical' ? 'text-destructive'
                          : log.severity === 'warning' ? 'text-amber-500'
                          : log.severity === 'success' ? 'text-primary'
                          : 'text-blue-400'
                        }>
                          {log.severity}
                        </span>
                      </div>
                      <span className="text-foreground leading-snug break-words">{log.message}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
