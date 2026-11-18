import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Flame, Droplets, Zap, ShieldCheck, Fingerprint } from 'lucide-react';
import { useGuardianStore, UtilityType } from '@/lib/guardian-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Types that require administrator authentication before toggling
const AUTH_REQUIRED: UtilityType[] = ['electricity', 'water'];

function AdminAuthModal({
  open,
  utilityLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  utilityLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [passcode, setPasscode] = useState('');

  const handleConfirm = () => {
    onConfirm();
    setPasscode('');
  };

  const handleCancel = () => {
    onCancel();
    setPasscode('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleCancel(); }}>
      <DialogContent className="sm:max-w-md bg-card border-border/60">
        <DialogHeader className="gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 mx-auto">
            <Fingerprint className="w-6 h-6 text-amber-400" />
          </div>
          <DialogTitle className="text-center text-base font-semibold tracking-tight">
            🔒 Administrator Security Authentication Required
          </DialogTitle>
          <DialogDescription className="text-center text-xs font-mono text-muted-foreground">
            Toggling <span className="text-foreground font-semibold">{utilityLabel}</span> requires elevated privileges.
            Authenticate to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="relative">
            <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Enter Admin Passcode or Scan Fingerprint"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && passcode) handleConfirm(); }}
              className="pl-10 font-mono text-sm bg-black/30 border-border/50 placeholder:text-muted-foreground/50"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-xs border-border/40 text-muted-foreground hover:text-foreground"
              onClick={handleCancel}
            >
              CANCEL
            </Button>
            <Button
              size="sm"
              className="font-mono text-xs bg-amber-500/90 hover:bg-amber-500 text-black"
              onClick={handleConfirm}
              disabled={!passcode}
            >
              AUTHENTICATE & PROCEED
            </Button>
          </div>

          <p className="text-center text-[10px] font-mono text-muted-foreground/60 tracking-wide uppercase">
            Biometric scanner active · Touch sensor to proceed
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ManualRow({
  type,
  title,
  icon: Icon,
  requiresAuth,
  onAuthRequest,
}: {
  type: UtilityType;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
  onAuthRequest?: (type: UtilityType) => void;
}) {
  const manualOff = useGuardianStore((s) => s.manualOff[type]);
  const toggleManual = useGuardianStore((s) => s.toggleManual);
  const enabled = !manualOff;

  const handleToggle = () => {
    if (requiresAuth && onAuthRequest) {
      onAuthRequest(type);
    } else {
      toggleManual(type);
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
        enabled ? 'bg-primary/5 border-primary/20' : 'bg-orange-500/5 border-orange-500/20'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-md flex items-center justify-center ${
            enabled ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-400'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{title}</span>
          <span
            className={`text-[10px] font-mono uppercase tracking-wider ${
              enabled ? 'text-muted-foreground' : 'text-orange-400'
            }`}
          >
            {enabled ? (requiresAuth ? 'Live · Auth Required' : 'Live') : 'Manually Off'}
          </span>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={handleToggle} />
    </div>
  );
}

export default function ManualControls() {
  const toggleManual = useGuardianStore((s) => s.toggleManual);
  const [pendingAuthType, setPendingAuthType] = useState<UtilityType | null>(null);

  const utilityLabel = (t: UtilityType) =>
    t === 'electricity' ? 'Main Power Grid' : t === 'water' ? 'Water Main' : 'Gas Supply';

  const handleAuthRequest = (type: UtilityType) => {
    setPendingAuthType(type);
  };

  const handleAuthConfirm = () => {
    if (pendingAuthType) toggleManual(pendingAuthType);
    setPendingAuthType(null);
  };

  const handleAuthCancel = () => {
    setPendingAuthType(null);
  };

  return (
    <>
      <Card className="p-4 bg-card/50 border-border/50 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wider uppercase">Manual Utility Control</span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Privacy Override
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ManualRow type="gas" title="Gas Supply" icon={Flame} />
          <ManualRow
            type="water"
            title="Water Main"
            icon={Droplets}
            requiresAuth
            onAuthRequest={handleAuthRequest}
          />
          <ManualRow
            type="electricity"
            title="Main Power Grid"
            icon={Zap}
            requiresAuth
            onAuthRequest={handleAuthRequest}
          />
        </div>
      </Card>

      <AdminAuthModal
        open={pendingAuthType !== null}
        utilityLabel={pendingAuthType ? utilityLabel(pendingAuthType) : ''}
        onConfirm={handleAuthConfirm}
        onCancel={handleAuthCancel}
      />
    </>
  );
}
