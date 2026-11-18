import React, { useState } from 'react';
import { LayoutDashboard, Box } from 'lucide-react';
import Header from '@/components/dashboard/Header';
import StatusGrid from '@/components/dashboard/StatusGrid';
import EnvironmentTiles from '@/components/dashboard/EnvironmentTiles';
import ElectricityChart from '@/components/dashboard/ElectricityChart';
import ManualControls from '@/components/dashboard/ManualControls';
import RoomLights from '@/components/dashboard/RoomLights';
import ApplianceControls from '@/components/dashboard/ApplianceControls';
import DeveloperSettings from '@/components/dashboard/DeveloperSettings';
import HomeScene from '@/components/scene/HomeScene';

type MobileTab = 'dashboard' | 'scene';

export default function Dashboard() {
  const [tab, setTab] = useState<MobileTab>('dashboard');

  return (
    <div className="h-[100dvh] bg-background text-foreground flex flex-col font-sans overflow-hidden">
      <Header />

      {/* Mobile tab switcher */}
      <div className="md:hidden border-b border-border bg-card flex shrink-0">
        <button
          onClick={() => setTab('dashboard')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-mono uppercase tracking-wider transition-colors ${
            tab === 'dashboard'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground border-b-2 border-transparent'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => setTab('scene')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-mono uppercase tracking-wider transition-colors ${
            tab === 'scene'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground border-b-2 border-transparent'
          }`}
        >
          <Box className="w-4 h-4" />
          3D Home
        </button>
      </div>

      {/* Main content area — flex-1 + min-h-0 so children can size correctly */}
      <main className="flex flex-1 min-h-0 overflow-hidden flex-col md:flex-row">
        {/* Left Dashboard column */}
        <div
          className={`w-full md:w-1/2 md:border-r border-border custom-scrollbar p-4 md:p-6 flex-col gap-4 md:gap-6 overflow-y-auto ${
            tab === 'dashboard' ? 'flex flex-1 min-h-0' : 'hidden'
          } md:flex md:flex-1 md:min-h-0`}
        >
          <StatusGrid />
          <EnvironmentTiles />
          <ElectricityChart />
          <ManualControls />
          <RoomLights />
          <ApplianceControls />
          <DeveloperSettings />
        </div>

        {/* Right 3D Scene */}
        <div
          className={`w-full md:w-1/2 relative bg-black touch-none ${
            tab === 'scene' ? 'flex flex-1 min-h-0' : 'hidden'
          } md:flex md:flex-1 md:min-h-0`}
        >
          <HomeScene />
        </div>
      </main>
    </div>
  );
}
