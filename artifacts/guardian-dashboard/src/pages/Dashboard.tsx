import React, { useState } from 'react';
import { LayoutDashboard, Box } from 'lucide-react';
import Header from '@/components/dashboard/Header';
import StatusGrid from '@/components/dashboard/StatusGrid';
import EnvironmentTiles from '@/components/dashboard/EnvironmentTiles';
import ElectricityChart from '@/components/dashboard/ElectricityChart';
import HomeControlsHub from '@/components/dashboard/HomeControlsHub';
import DeveloperSettings from '@/components/dashboard/DeveloperSettings';
import HomeScene from '@/components/scene/HomeScene';

type MobileTab = 'dashboard' | 'scene';

export default function Dashboard() {
  const [tab, setTab] = useState<MobileTab>('dashboard');

  return (
    <div className="h-[100dvh] bg-[#090b10] text-foreground flex flex-col font-sans overflow-hidden">
      <Header />

      {/* Mobile tab switcher */}
      <div className="md:hidden border-b border-white/10 bg-zinc-950/80 backdrop-blur-md flex shrink-0 z-20">
        <button
          onClick={() => setTab('dashboard')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium tracking-wide transition-colors ${
            tab === 'dashboard'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-muted-foreground border-b-2 border-transparent'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => setTab('scene')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium tracking-wide transition-colors ${
            tab === 'scene'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-muted-foreground border-b-2 border-transparent'
          }`}
        >
          <Box className="w-4 h-4" />
          3D Simulation
        </button>
      </div>

      {/* Main content area */}
      <main className="flex flex-1 min-h-0 overflow-hidden flex-col md:flex-row relative">
        {/* Left Dashboard column */}
        <div
          className={`w-full md:w-1/2 md:border-r border-white/10 custom-scrollbar p-3.5 md:p-5 flex-col gap-3.5 md:gap-4 overflow-y-auto ${
            tab === 'dashboard' ? 'flex flex-1 min-h-0' : 'hidden'
          } md:flex md:flex-1 md:min-h-0`}
        >
          <StatusGrid />
          <EnvironmentTiles />
          <ElectricityChart />
          <HomeControlsHub />
          <DeveloperSettings />
        </div>

        {/* Right 3D Scene */}
        <div
          className={`w-full md:w-1/2 relative bg-[#07090e] touch-none ${
            tab === 'scene' ? 'flex flex-1 min-h-0' : 'hidden'
          } md:flex md:flex-1 md:min-h-0`}
        >
          <HomeScene />
        </div>
      </main>
    </div>
  );
}
