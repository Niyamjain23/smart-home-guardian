import React from 'react';
import { useGuardianStore, SystemStatus } from '@/lib/guardian-state';
import { Flame, Droplets, Zap, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const StatusColors = {
  Safe: 'text-primary',
  Warning: 'text-amber-500',
  Prevented: 'text-orange-500',
  Critical: 'text-destructive',
};

const StatusBg = {
  Safe: 'bg-primary/10 border-primary/20',
  Warning: 'bg-amber-500/10 border-amber-500/20',
  Prevented: 'bg-orange-500/10 border-orange-500/20',
  Critical: 'bg-destructive/10 border-destructive/20',
};

function StatusTile({ 
  title, 
  icon: Icon, 
  status, 
  reading, 
  unit, 
  type,
}: { 
  title: string; 
  icon: React.ComponentType<{ className?: string }>; 
  status: SystemStatus; 
  reading: number; 
  unit: string;
  type: 'gas' | 'water' | 'electricity';
}) {
  const resetSystem = useGuardianStore(s => s.resetSystem);
  const colorClass = StatusColors[status];
  const bgClass = StatusBg[status];

  return (
    <Card className={`relative overflow-hidden transition-colors duration-500 ${bgClass} border`}>
      <div className="p-4 flex flex-col h-full gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wider uppercase">{title}</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${colorClass.replace('text-', 'bg-')} ${status === 'Warning' ? 'animate-ping' : ''}`} />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-light text-foreground">
              {reading.toFixed(2)}
            </span>
            <span className="text-sm font-mono text-muted-foreground">{unit}</span>
          </div>
          
          <div className="h-6 flex items-center">
            <AnimatePresence mode="wait">
              {status !== 'Safe' && (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className={`text-sm font-medium ${colorClass} flex items-center gap-1.5`}
                >
                  {status === 'Warning' && <ShieldAlert className="w-4 h-4 animate-pulse" />}
                  {status === 'Prevented' && <ShieldCheck className="w-4 h-4" />}
                  <span>
                    {status === 'Warning' ? 'Analyzing Pattern...' : 
                     status === 'Prevented' ? 'MITIGATED' : 'CRITICAL'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {status === 'Prevented' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs font-mono border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-500"
                onClick={() => resetSystem(type)}
              >
                RESTORE SYSTEM
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

export default function StatusGrid() {
  const { gasStatus, waterStatus, electricityStatus, gasReading, waterReading, electricityReading } = useGuardianStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 shrink-0">
      <StatusTile 
        title="Gas Monitor" 
        icon={Flame} 
        status={gasStatus} 
        reading={gasReading} 
        unit="ppm" 
        type="gas"
      />
      <StatusTile 
        title="Water Main" 
        icon={Droplets} 
        status={waterStatus} 
        reading={waterReading} 
        unit="L/m" 
        type="water"
      />
      <StatusTile 
        title="Power Load" 
        icon={Zap} 
        status={electricityStatus} 
        reading={electricityReading} 
        unit="kW" 
        type="electricity"
      />
    </div>
  );
}