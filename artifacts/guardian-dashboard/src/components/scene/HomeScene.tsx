import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei';
import { Box, Eye, EyeOff, Pause, Play, Crosshair } from 'lucide-react';

// Minimal shape for the OrbitControls instance ref — three-stdlib type isn't hoisted.
type OrbitControlsLike = {
  object: { position: { set: (x: number, y: number, z: number) => void } };
  target: { set: (x: number, y: number, z: number) => void };
  update: () => void;
};
import GasValve from './GasValve';
import WaterMain from './WaterMain';
import ElectricalPanel from './ElectricalPanel';
import RoomLightFixture from './RoomLightFixture';
import { useGuardianStore } from '@/lib/guardian-state';
import { IoTSensorBeacon, GlowingConduitPath } from './HazardSafeguardEffects';

const WALL_COLOR = '#1c2230';     // deep slate — solid dark with strong specular bounce
const WALL_ACCENT = '#161b27';    // even deeper for the dividing wall
const FLOOR_COLOR = '#0e1219';    // near-black polished concrete
const TRIM_COLOR = '#2c3445';     // muted slate trim that catches highlights

/**
 * Recessed under-cabinet LED kick lighting on the kitchen island
 * Dynamically reacts to real-time power load & cuts off on isolation
 */
function KitchenIslandKickLight() {
  const electricityReading = useGuardianStore((s) => s.electricityReading);
  const electricityStatus = useGuardianStore((s) => s.electricityStatus);
  const manualOff = useGuardianStore((s) => s.manualOff.electricity);
  const isPowered = electricityStatus !== 'Prevented' && !manualOff;
  const intensity = isPowered ? Math.min(2.5, 0.5 + electricityReading * 0.35) : 0;

  return (
    <group position={[1.7, 0.03, -1.13]}>
      {/* LED Channel Line */}
      <mesh>
        <boxGeometry args={[2.5, 0.02, 0.015]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={intensity * 2}
        />
      </mesh>
      {/* Downward floor wash glow */}
      {isPowered && (
        <pointLight
          position={[0, 0.04, 0.08]}
          color="#38bdf8"
          intensity={intensity}
          distance={1.6}
          decay={2}
        />
      )}
    </group>
  );
}

function Furniture() {
  return (
    <group>
      {/* Living Room: Modern Low-Profile Architectural L-Sectional */}
      <group position={[-1.5, 0, 0.7]}>
        {/* Recessed black plinth base */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[1.9, 0.08, 1.4]} />
          <meshStandardMaterial color="#0c0f17" roughness={0.6} />
        </mesh>

        {/* Main Seating Cushion */}
        <mesh position={[0.2, 0.18, -0.2]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.22, 0.8]} />
          <meshStandardMaterial color="#222b3d" roughness={0.88} />
        </mesh>

        {/* Chaise / L-Lounge Extension (Left side extending forward) */}
        <mesh position={[-0.65, 0.18, 0.15]} castShadow receiveShadow>
          <boxGeometry args={[0.75, 0.22, 1.3]} />
          <meshStandardMaterial color="#222b3d" roughness={0.88} />
        </mesh>

        {/* Low Minimalist Backrest */}
        <mesh position={[0.2, 0.38, -0.55]} castShadow>
          <boxGeometry args={[1.4, 0.26, 0.18]} />
          <meshStandardMaterial color="#2a354b" roughness={0.85} />
        </mesh>
        <mesh position={[-0.95, 0.38, 0.15]} castShadow>
          <boxGeometry args={[0.18, 0.26, 1.3]} />
          <meshStandardMaterial color="#2a354b" roughness={0.85} />
        </mesh>

        {/* Designer Throw Pillows */}
        <mesh position={[-0.1, 0.34, -0.42]} rotation={[0, 0.1, -0.1]} castShadow>
          <boxGeometry args={[0.32, 0.24, 0.1]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.7} />
        </mesh>
        <mesh position={[0.4, 0.34, -0.42]} rotation={[0, -0.15, 0.1]} castShadow>
          <boxGeometry args={[0.34, 0.24, 0.1]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
      </group>

      {/* Modern Minimalist Coffee Table (Smoked Glass & Matte Steel) */}
      <group position={[-1.2, 0.14, 0.4]}>
        {/* Smoked glass top */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.75, 0.03, 0.45]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Recessed metal frame */}
        <mesh position={[0, -0.07, 0]} castShadow>
          <boxGeometry args={[0.72, 0.11, 0.42]} />
          <meshStandardMaterial color="#020617" metalness={0.8} roughness={0.3} wireframe />
        </mesh>
      </group>

      {/* Plush Designer Area Rug */}
      <mesh position={[-1.4, 0.008, 0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.2, 1.8]} />
        <meshStandardMaterial color="#172033" roughness={0.95} />
      </mesh>
      {/* Subtle Cyan Border Inset on Rug */}
      <mesh position={[-1.4, 0.009, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.85, 0.87, 4]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.35} />
      </mesh>

      {/* Kitchen counter / table (runs flush against the right side wall, no gap) */}
      <group position={[1.7, 0.45, -1.4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.9, 0.55]} />
          <meshStandardMaterial color="#f4f4f6" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.46, 0]} castShadow>
          <boxGeometry args={[2.54, 0.04, 0.58]} />
          <meshStandardMaterial color="#1a1a1e" roughness={0.25} metalness={0.3} />
        </mesh>
        {[-0.8, -0.3, 0.2, 0.7].map((x) => (
          <mesh key={x} position={[x, 0, 0.28]}>
            <boxGeometry args={[0.01, 0.85, 0.01]} />
            <meshStandardMaterial color="#c2c2c8" />
          </mesh>
        ))}
      </group>

      {/* Under-cabinet island kick light */}
      <KitchenIslandKickLight />

      {/* Stove (Solidly seated on the counter, zero overhang) */}
      <group position={[2.35, 0.94, -1.4]}>
        <mesh castShadow>
          <boxGeometry args={[0.62, 0.03, 0.48]} />
          <meshStandardMaterial color="#1a1a1e" roughness={0.35} metalness={0.6} />
        </mesh>
        {[-0.15, 0.15].map((x) =>
          [-0.12, 0.12].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.02, z]}>
              <torusGeometry args={[0.06, 0.012, 12, 24]} />
              <meshStandardMaterial color="#3a3a40" metalness={0.7} roughness={0.3} />
            </mesh>
          ))
        )}
      </group>

      {/* Modern Minimalist Dining Table & Chairs */}
      <group position={[1.1, 0, 0.6]}>
        {/* Table Top */}
        <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.95, 0.035, 0.65]} />
          <meshStandardMaterial color="#1e2430" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Four Slender Steel Legs */}
        {[-0.42, 0.42].map((x) =>
          [-0.27, 0.27].map((z) => (
            <mesh key={`dl-${x}-${z}`} position={[x, 0.19, z]} castShadow>
              <cylinderGeometry args={[0.015, 0.012, 0.38, 12]} />
              <meshStandardMaterial color="#0f131a" metalness={0.8} />
            </mesh>
          ))
        )}
        {/* Modern Dining Chairs */}
        <group position={[0, 0.22, 0.42]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.04, 0.28]} />
            <meshStandardMaterial color="#2d3748" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.18, 0.12]} castShadow>
            <boxGeometry args={[0.42, 0.32, 0.03]} />
            <meshStandardMaterial color="#2d3748" roughness={0.8} />
          </mesh>
        </group>
        <group position={[0, 0.22, -0.42]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.04, 0.28]} />
            <meshStandardMaterial color="#2d3748" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.18, -0.12]} castShadow>
            <boxGeometry args={[0.42, 0.32, 0.03]} />
            <meshStandardMaterial color="#2d3748" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* Plant */}
      <group position={[-2.6, 0.25, -1.4]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.13, 0.3, 24]} />
          <meshStandardMaterial color="#3a3a40" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.45, 0]} castShadow>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshStandardMaterial color="#3a8a4a" roughness={0.9} />
        </mesh>
        <mesh position={[0.05, 0.65, 0.02]} castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#4ba85e" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function HouseStructure() {
  return (
    <group>
      {/* Floor — polished dark concrete with strong specular bounce */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.32} metalness={0.35} envMapIntensity={1.4} />
      </mesh>

      {/* Subtle floor tile lines (lighter so they pop on the dark floor) */}
      {[-1.5, -0.5, 0.5, 1.5].map((z) => (
        <mesh key={`zl-${z}`} position={[0, 0.005, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6, 0.008]} />
          <meshBasicMaterial color="#4a5670" transparent opacity={0.28} />
        </mesh>
      ))}
      {[-2, -1, 0, 1, 2].map((x) => (
        <mesh key={`xl-${x}`} position={[x, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.008, 4]} />
          <meshBasicMaterial color="#4a5670" transparent opacity={0.28} />
        </mesh>
      ))}

      {/* Back Wall */}
      <mesh position={[0, 1.1, -1.95]} castShadow receiveShadow>
        <boxGeometry args={[6, 2.2, 0.08]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.45} metalness={0.2} envMapIntensity={1.2} />
      </mesh>

      {/* Side walls */}
      <mesh position={[-2.96, 1.1, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 2.2, 3]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.45} metalness={0.2} envMapIntensity={1.2} />
      </mesh>
      <mesh position={[2.96, 1.1, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 2.2, 3]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.45} metalness={0.2} envMapIntensity={1.2} />
      </mesh>

      {/* Dividing wall (open doorway in middle) */}
      <mesh position={[0, 1.7, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 1.0, 3]} />
        <meshStandardMaterial color={WALL_ACCENT} roughness={0.45} metalness={0.2} envMapIntensity={1.2} />
      </mesh>
      <mesh position={[0, 0.55, -1.6]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 1.1, 0.7]} />
        <meshStandardMaterial color={WALL_ACCENT} roughness={0.45} metalness={0.2} envMapIntensity={1.2} />
      </mesh>

      {/* Wall accent strip — neon-line trim along base of back wall for depth */}
      <mesh position={[0, 0.08, -1.91]}>
        <boxGeometry args={[6, 0.015, 0.005]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
      </mesh>

      {/* Windows */}
      <mesh position={[-1.6, 1.3, -1.9]}>
        <boxGeometry args={[1.2, 0.8, 0.02]} />
        <meshStandardMaterial color="#bcdcef" emissive="#9ccae0" emissiveIntensity={0.35} roughness={0.05} metalness={0.4} />
      </mesh>
      <mesh position={[-1.6, 1.3, -1.89]}>
        <boxGeometry args={[1.22, 0.04, 0.01]} />
        <meshStandardMaterial color={TRIM_COLOR} />
      </mesh>
      <mesh position={[-1.6, 1.3, -1.89]}>
        <boxGeometry args={[0.04, 0.82, 0.01]} />
        <meshStandardMaterial color={TRIM_COLOR} />
      </mesh>

      <mesh position={[1.6, 1.3, -1.9]}>
        <boxGeometry args={[1.2, 0.8, 0.02]} />
        <meshStandardMaterial color="#bcdcef" emissive="#9ccae0" emissiveIntensity={0.35} roughness={0.05} metalness={0.4} />
      </mesh>
      <mesh position={[1.6, 1.3, -1.89]}>
        <boxGeometry args={[1.22, 0.04, 0.01]} />
        <meshStandardMaterial color={TRIM_COLOR} />
      </mesh>
      <mesh position={[1.6, 1.3, -1.89]}>
        <boxGeometry args={[0.04, 0.82, 0.01]} />
        <meshStandardMaterial color={TRIM_COLOR} />
      </mesh>

      {/* Room labels — bright on the dark floor */}
      <Text position={[-1.5, 0.02, 1.6]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.16} color="#22d3ee" anchorX="center" anchorY="middle">
        LIVING ROOM
      </Text>
      <Text position={[1.5, 0.02, 1.6]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.16} color="#22d3ee" anchorX="center" anchorY="middle">
        KITCHEN
      </Text>
    </group>
  );
}

export default function HomeScene({
  onSelectUtility,
}: {
  onSelectUtility?: (type: 'gas' | 'water' | 'electricity') => void;
} = {}) {
  const showAxes = useGuardianStore((s) => s.showAxes);
  const toggleAxes = useGuardianStore((s) => s.toggleAxes);
  const gasStatus = useGuardianStore((s) => s.gasStatus);
  const waterStatus = useGuardianStore((s) => s.waterStatus);
  const electricityStatus = useGuardianStore((s) => s.electricityStatus);
  const [showHouse, setShowHouse] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredUtility, setHoveredUtility] = useState<{
    gas: boolean;
    water: boolean;
    electricity: boolean;
  }>({
    gas: false,
    water: false,
    electricity: false,
  });
  const controlsRef = useRef<OrbitControlsLike | null>(null);

  // Detect mobile/small screens once per render to scale graphics quality
  const isMobile =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 767px)').matches;
  const shadowMapSize = isMobile ? 1024 : 2048;
  const dprRange: [number, number] = isMobile ? [1, 1.5] : [1, 2];

  const defaultCamPos: [number, number, number] = isMobile ? [6, 5, 7] : [5.5, 4.5, 6.5];

  function recenterCamera() {
    const c = controlsRef.current;
    if (!c) return;
    c.object.position.set(...defaultCamPos);
    c.target.set(0, 0.4, 0);
    c.update();
  }

  return (
    <div className="absolute inset-0">
      {/* Floating viewport controls (Vertical stack on mobile, horizontal on desktop) */}
      <div className="absolute top-20 right-3 sm:right-6 z-20 flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl border border-white/12 bg-zinc-950/65 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto">
        <button
          onClick={() => setAutoRotate((v) => !v)}
          className={`w-8 h-8 sm:w-auto sm:h-auto flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            !autoRotate
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent'
          }`}
          title={autoRotate ? 'Pause camera rotation' : 'Resume auto-rotate'}
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5 text-white/80" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{autoRotate ? 'Pause' : 'Auto'}</span>
        </button>
        <button
          onClick={recenterCamera}
          className="w-8 h-8 sm:w-auto sm:h-auto flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-all cursor-pointer border border-transparent"
          title="Recenter camera to default view"
        >
          <Crosshair className="w-3.5 h-3.5 text-white/80" />
          <span className="hidden md:inline">Reset</span>
        </button>
        <button
          onClick={toggleAxes}
          className={`w-8 h-8 sm:w-auto sm:h-auto flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            showAxes
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent'
          }`}
          title="Toggle Blender-style axis & grid"
        >
          <Box className="w-3.5 h-3.5 text-white/80" />
          <span className="hidden md:inline">Axes</span>
        </button>
        <button
          onClick={() => setShowHouse((v) => !v)}
          className={`w-8 h-8 sm:w-auto sm:h-auto flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            !showHouse
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent'
          }`}
          title="Toggle house walls"
        >
          {showHouse ? <Eye className="w-3.5 h-3.5 text-white/80" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">Walls</span>
        </button>
      </div>

      {/* Camera control hint (Positioned on bottom-left, subtle) */}
      {!autoRotate && (
        <div className="absolute bottom-20 left-4 sm:left-6 z-10 px-3 py-1.5 rounded-xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl text-[10px] font-medium text-white/70 hidden sm:flex items-center gap-2.5 shadow-xl">
          <span>Drag: Orbit</span>
          <span className="text-white/20">|</span>
          <span>Right-click: Pan</span>
          <span className="text-white/20">|</span>
          <span>Scroll: Zoom</span>
        </div>
      )}

      {/* XYZ legend (visible when axes mode is on) — top-left so it doesn't collide */}
      {showAxes && (
        <div className="absolute top-3 left-3 z-10 px-3 py-2 rounded-md bg-black/40 border border-white/10 backdrop-blur-md text-[10px] font-mono uppercase tracking-wider text-white/80 flex gap-3">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />X</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Y</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Z</span>
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: defaultCamPos, fov: isMobile ? 48 : 42 }}
        dpr={dprRange}
        gl={{ antialias: !isMobile, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <color attach="background" args={[showAxes ? '#05080d' : '#080b12']} />

        {/* Bright key + cool fill — light pops off the dark slate walls */}
        <ambientLight intensity={0.45} color="#aac4ff" />
        <hemisphereLight args={['#ffffff', '#1a2030', 0.55]} />
        <directionalLight
          position={[6, 10, 5]}
          intensity={2.0}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={shadowMapSize}
          shadow-mapSize-height={shadowMapSize}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
        />
        <directionalLight position={[-4, 6, -2]} intensity={0.7} color="#7fc8ff" />
        {/* Rim light from the back to outline the walls/furniture against the dark room */}
        <pointLight position={[0, 2.2, -1.6]} intensity={1.2} color="#22d3ee" distance={5} decay={2} />

        <Environment preset="night" />

        <group position={[0, -0.5, 0]}>
          {showHouse && (
            <>
              <HouseStructure />
              <Furniture />
            </>
          )}

          <RoomLightFixture position={[-1.5, 1.95, 0]} room="livingRoom" />
          <ElectricalPanel
            position={[-2.9, 1.0, 0.3]}
            onSelect={() => onSelectUtility?.('electricity')}
            onHoverChange={(h) => setHoveredUtility((p) => ({ ...p, electricity: h }))}
          />

          <RoomLightFixture position={[1.5, 1.95, 0]} room="kitchen" />
          <GasValve
            position={[2.35, 1.05, -1.45]}
            onSelect={() => onSelectUtility?.('gas')}
            onHoverChange={(h) => setHoveredUtility((p) => ({ ...p, gas: h }))}
          />
          <WaterMain
            position={[1.0, 1.05, -1.45]}
            onSelect={() => onSelectUtility?.('water')}
            onHoverChange={(h) => setHoveredUtility((p) => ({ ...p, water: h }))}
          />

          {/* Smart IoT Beacons with Interactive Hover / Reveal Popups */}
          <IoTSensorBeacon
            position={[2.35, 1.45, -1.4]}
            label="Gas Sensor"
            status={gasStatus}
            isHoveredExternal={hoveredUtility.gas}
            onSelect={() => onSelectUtility?.('gas')}
          />
          <IoTSensorBeacon
            position={[1.0, 1.45, -1.4]}
            label="Water Sensor"
            status={waterStatus}
            isHoveredExternal={hoveredUtility.water}
            onSelect={() => onSelectUtility?.('water')}
          />
          <IoTSensorBeacon
            position={[-2.88, 1.6, 0.3]}
            label="Power Sensor"
            status={electricityStatus}
            isHoveredExternal={hoveredUtility.electricity}
            calloutOffset={[0.08, 0.05, 0]}
            onSelect={() => onSelectUtility?.('electricity')}
          />

          {/* Glowing Utility Flow Conduits */}
          <GlowingConduitPath position={[2.35, 0.2, -1.45]} args={[0.3, 0.03, 0.03]} color="#f59e0b" status={gasStatus} />
          <GlowingConduitPath position={[1.0, 0.2, -1.35]} args={[0.03, 0.03, 0.35]} color="#06b6d4" status={waterStatus} />
          <GlowingConduitPath position={[-2.88, 0.05, 0.3]} args={[0.02, 0.02, 0.8]} color="#10b981" status={electricityStatus} />

          <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={12} blur={2.4} far={3} />
        </group>

        {/* Blender-style overlay: infinite grid + axes + corner gizmo */}
        {showAxes && (
          <>
            <Grid
              position={[0, -0.499, 0]}
              args={[20, 20]}
              cellSize={0.5}
              cellThickness={0.6}
              cellColor="#3a4150"
              sectionSize={2}
              sectionThickness={1.2}
              sectionColor="#5a6480"
              fadeDistance={20}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid
            />
            <axesHelper args={[3]} />
            <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
              <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
            </GizmoHelper>
          </>
        )}

        <OrbitControls
          ref={controlsRef as any}
          enablePan
          enableZoom
          enableDamping
          dampingFactor={0.08}
          minDistance={1.8}
          maxDistance={20}
          zoomSpeed={1.1}
          panSpeed={0.9}
          rotateSpeed={0.85}
          maxPolarAngle={showAxes ? Math.PI : Math.PI / 2 - 0.02}
          autoRotate={autoRotate && !showAxes}
          autoRotateSpeed={0.4}
          target={[0, 0.4, 0]}
        />
      </Canvas>
    </div>
  );
}
