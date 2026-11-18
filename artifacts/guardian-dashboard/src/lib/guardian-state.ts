import { create } from 'zustand';

export type SystemStatus = 'Safe' | 'Warning' | 'Prevented' | 'Critical';
export type UtilityType = 'gas' | 'water' | 'electricity';

export type ApplianceKey = 'microwave' | 'ac' | 'dishwasher' | 'oven';

export interface ApplianceSpec {
  key: ApplianceKey;
  label: string;
  watts: number; // continuous draw when on
}

export const APPLIANCES: ApplianceSpec[] = [
  { key: 'microwave', label: 'Microwave', watts: 1200 },
  { key: 'ac', label: 'A/C Unit', watts: 2500 },
  { key: 'dishwasher', label: 'Dishwasher', watts: 1800 },
  { key: 'oven', label: 'Oven', watts: 2400 },
];

export interface NotificationLog {
  id: string;
  timestamp: Date;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  utility: UtilityType | 'system';
  read: boolean;
}

export interface GuardianState {
  gasStatus: SystemStatus;
  waterStatus: SystemStatus;
  electricityStatus: SystemStatus;

  // Time when each utility entered Critical (disaster) state — used for visual effect ramps.
  disasterStart: { gas: number | null; water: number | null; electricity: number | null };

  gasReading: number; // ppm
  waterReading: number; // flow rate L/m
  electricityReading: number; // kW

  electricityHistory: { time: number; value: number }[];

  // Environmental sensors (live values)
  temperature: number; // °C
  airQuality: number;  // AQI
  humidity: number;    // %

  lights: {
    livingRoom: boolean;
    kitchen: boolean;
  };

  appliances: Record<ApplianceKey, boolean>;

  // Manual privacy/override switches — when true, that utility is shut off by the user.
  manualOff: {
    gas: boolean;
    water: boolean;
    electricity: boolean;
  };

  notifications: NotificationLog[];
  hasUnreadNotifications: boolean;

  systemStatus: 'nominal' | 'anomaly';

  // 3D viewport: Blender-style axis/grid overlay
  showAxes: boolean;

  // Actions
  toggleLight: (room: 'livingRoom' | 'kitchen') => void;
  toggleAppliance: (key: ApplianceKey) => void;
  toggleManual: (type: UtilityType) => void;
  toggleAxes: () => void;
  simulateAnomaly: (type: UtilityType) => void;
  simulateDisaster: (type: UtilityType) => void;
  resetSystem: (type: UtilityType) => void;
  updateReadings: () => void;
  markNotificationsRead: () => void;
  clearNotifications: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const labelFor = (type: UtilityType) =>
  type === 'gas' ? 'Gas' : type === 'water' ? 'Water' : 'Electricity';

// Smooth bounded random walk
const drift = (current: number, target: number, jitter: number, min: number, max: number) => {
  const pull = (target - current) * 0.05;
  const noise = (Math.random() - 0.5) * jitter;
  return Math.min(max, Math.max(min, current + pull + noise));
};

export const useGuardianStore = create<GuardianState>((set, get) => ({
  gasStatus: 'Safe',
  waterStatus: 'Safe',
  electricityStatus: 'Safe',

  disasterStart: { gas: null, water: null, electricity: null },

  gasReading: 0,
  waterReading: 0,
  electricityReading: 0.35,

  electricityHistory: Array.from({ length: 60 }).map((_, i) => ({
    time: Date.now() - (60 - i) * 500,
    value: 0.35 + (Math.random() * 0.08 - 0.04),
  })),

  temperature: 22.5,
  airQuality: 38,
  humidity: 46,

  lights: {
    livingRoom: false,
    kitchen: false,
  },

  appliances: {
    microwave: false,
    ac: false,
    dishwasher: false,
    oven: false,
  },

  manualOff: {
    gas: false,
    water: false,
    electricity: false,
  },

  notifications: [],
  hasUnreadNotifications: false,

  systemStatus: 'nominal',

  showAxes: false,

  toggleAxes: () => set((state) => ({ showAxes: !state.showAxes })),

  toggleLight: (room) => set((state) => ({
    lights: {
      ...state.lights,
      [room]: !state.lights[room],
    },
  })),

  toggleAppliance: (key) => set((state) => ({
    appliances: { ...state.appliances, [key]: !state.appliances[key] },
  })),

  toggleManual: (type) => {
    const state = get();
    const wasOff = state.manualOff[type];
    const nowOff = !wasOff;

    const note: NotificationLog = {
      id: generateId(),
      timestamp: new Date(),
      message: nowOff
        ? `${labelFor(type)} manually shut off by user (privacy mode).`
        : `${labelFor(type)} manually turned back on by user.`,
      severity: nowOff ? 'warning' : 'info',
      utility: type,
      read: false,
    };

    set({
      manualOff: { ...state.manualOff, [type]: nowOff },
      notifications: [note, ...state.notifications],
      hasUnreadNotifications: true,
    });
  },

  markNotificationsRead: () => set((state) => ({
    hasUnreadNotifications: false,
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
  })),

  clearNotifications: () => set({ notifications: [], hasUnreadNotifications: false }),

  updateReadings: () => set((state) => {
    const now = Date.now();
    let newElec = state.electricityReading;
    let newGas = state.gasReading;
    let newWater = state.waterReading;

    // ---- Electricity ----
    if (state.manualOff.electricity || state.electricityStatus === 'Prevented') {
      newElec = 0;
    } else if (state.electricityStatus === 'Critical') {
      // Bypassed system: erratic, dangerous spikes with brief brownout dropouts.
      const base = 12 + Math.random() * 8;
      const dropout = Math.random() < 0.18 ? 0 : 1;
      newElec = base * dropout;
    } else if (state.electricityStatus === 'Warning') {
      newElec = 8 + (Math.random() * 5);
    } else {
      // Safe — idle baseline + lights + appliances
      const idle = 0.35;
      const lightLoad =
        (state.lights.livingRoom ? 0.065 : 0) +
        (state.lights.kitchen ? 0.065 : 0);
      const applianceLoad = APPLIANCES.reduce(
        (sum, a) => sum + (state.appliances[a.key] ? a.watts / 1000 : 0),
        0,
      );
      const noise = Math.random() * 0.04 - 0.02;
      newElec = idle + lightLoad + applianceLoad + noise;
    }

    // ---- Gas ----
    if (state.manualOff.gas || state.gasStatus === 'Prevented') {
      newGas = Math.max(0, newGas - 5);
    } else if (state.gasStatus === 'Critical') {
      // Bypassed — gas keeps rising toward catastrophic levels (LEL ~ 50 000 ppm but visualised at 800).
      newGas = Math.min(900, newGas + 18 + Math.random() * 10);
    } else if (state.gasStatus === 'Warning') {
      newGas = 150 + (Math.random() * 50);
    } else {
      newGas = Math.max(0, newGas + (Math.random() * 0.2 - 0.1));
    }

    // ---- Water ----
    if (state.manualOff.water || state.waterStatus === 'Prevented') {
      newWater = 0;
    } else if (state.waterStatus === 'Critical') {
      // Bypassed — sustained burst flow.
      newWater = 18 + Math.random() * 4;
    } else if (state.waterStatus === 'Warning') {
      newWater = 12 + (Math.random() * 3);
    } else {
      newWater = Math.max(0, newWater + (Math.random() * 0.1 - 0.05));
    }

    const newHistory = [...state.electricityHistory, { time: now, value: newElec }].slice(-60);

    // Environmental sensors — slow random walk, but air quality degrades during gas disaster.
    const aqiTarget = state.gasStatus === 'Critical' ? Math.min(220, 80 + state.gasReading * 0.18) : 40;
    const aqiJitter = state.gasStatus === 'Critical' ? 4 : 1.6;
    const tempTarget = state.electricityStatus === 'Critical' ? 32 : 22.5;
    const humTarget = state.waterStatus === 'Critical' ? Math.min(85, 55 + Math.random() * 5) : 47;

    const newTemperature = drift(state.temperature, tempTarget, 0.18, 18, 35);
    const newAirQuality = drift(state.airQuality, aqiTarget, aqiJitter, 12, 240);
    const newHumidity = drift(state.humidity, humTarget, 0.7, 30, 90);

    return {
      electricityReading: newElec,
      electricityHistory: newHistory,
      gasReading: newGas,
      waterReading: newWater,
      temperature: newTemperature,
      airQuality: newAirQuality,
      humidity: newHumidity,
    };
  }),

  simulateAnomaly: (type) => {
    const statusKey = `${type}Status` as keyof GuardianState;

    // Step 1 — SENSE: Spike sensor reading immediately (gas → 450 ppm with jitter)
    const sensorSpike: Partial<GuardianState> = {
      [statusKey]: 'Warning',
      systemStatus: 'anomaly',
    };
    if (type === 'gas') {
      (sensorSpike as any).gasReading = 450 + (Math.random() * 30 - 15);
    } else if (type === 'water') {
      (sensorSpike as any).waterReading = 12 + Math.random() * 3;
    } else {
      (sensorSpike as any).electricityReading = 8 + Math.random() * 5;
    }
    set(sensorSpike as Partial<GuardianState>);

    // Step 2 — ANALYZE: 1.5 s processing window (Warning badge shows "Analyzing Pattern…")
    // Step 3 — ACT: auto-actuate the hardware valve/relay, set MITIGATED BEFORE any alert
    setTimeout(() => {
      set((s) => ({
        [statusKey]: 'Prevented',
        systemStatus: 'nominal',
        // Reset reading to safe level now that the valve is closed
        gasReading: type === 'gas' ? Math.max(0, (s.gasReading ?? 0) * 0.05) : s.gasReading,
        waterReading: type === 'water' ? 0 : s.waterReading,
      } as Partial<GuardianState>));

      // Step 4 — ALERT: push ATEX notification only AFTER actuation completes
      const atexMsg =
        type === 'gas'
          ? 'Anomalous sensor drift detected. ATEX Intrinsically Safe Solenoid Valve isolated automatically.'
          : type === 'water'
          ? 'Anomalous sensor drift detected. ATEX Intrinsically Safe Solenoid Valve isolated automatically.'
          : 'Anomalous sensor drift detected. Circuit breaker relay isolated automatically.';

      const newNotification: NotificationLog = {
        id: generateId(),
        timestamp: new Date(),
        message: atexMsg,
        severity: 'critical',
        utility: type,
        read: false,
      };

      set((s) => ({
        notifications: [newNotification, ...s.notifications],
        hasUnreadNotifications: true,
      } as Partial<GuardianState>));
    }, 1500);
  },

  simulateDisaster: (type) => {
    const statusKey = `${type}Status` as keyof GuardianState;

    const disasterCopy: Record<UtilityType, string> = {
      gas: 'BYPASSED — Gas leak in progress. Combustion risk rising. Air quality degrading.',
      water: 'BYPASSED — Water main rupture. Sustained flooding from kitchen tap.',
      electricity: 'BYPASSED — Electrical fault unmitigated. Sparks and smoke at panel.',
    };

    const note: NotificationLog = {
      id: generateId(),
      timestamp: new Date(),
      message: disasterCopy[type],
      severity: 'critical',
      utility: type,
      read: false,
    };

    set((s) => ({
      [statusKey]: 'Critical',
      systemStatus: 'anomaly',
      disasterStart: { ...s.disasterStart, [type]: Date.now() },
      notifications: [note, ...s.notifications],
      hasUnreadNotifications: true,
      // If user previously had it manually off, ensure it's "live" so disaster can render
      manualOff: { ...s.manualOff, [type]: false },
    } as Partial<GuardianState>));
  },

  resetSystem: (type) => {
    const statusKey = `${type}Status` as keyof GuardianState;

    const newNotification: NotificationLog = {
      id: generateId(),
      timestamp: new Date(),
      message: `System manually reset by user (${type}).`,
      severity: 'info',
      utility: type,
      read: false,
    };

    set((s) => {
      const allOthersSafe = (['gas', 'water', 'electricity'] as UtilityType[])
        .filter((t) => t !== type)
        .every((t) => {
          const st = s[`${t}Status` as keyof GuardianState] as SystemStatus;
          return st === 'Safe';
        });

      return {
        [statusKey]: 'Safe',
        // Reset disaster start clock and the relevant reading.
        disasterStart: { ...s.disasterStart, [type]: null },
        gasReading: type === 'gas' ? 0 : s.gasReading,
        waterReading: type === 'water' ? 0 : s.waterReading,
        notifications: [newNotification, ...s.notifications],
        hasUnreadNotifications: true,
        systemStatus: allOthersSafe ? 'nominal' : 'anomaly',
      } as Partial<GuardianState>;
    });
  },
}));
