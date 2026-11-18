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
import SceneSimControls from './SceneSimControls';
import { useGuardianStore } from '@/lib/guardian-state';

const WALL_COLOR = '#1c2230';     // deep slate — solid dark with strong specular bounce
const WALL_ACCENT = '#161b27';    // even deeper for the dividing wall
const FLOOR_COLOR = '#0e1219';    // near-black polished concrete
const TRIM_COLOR = '#2c3445';     // muted slate trim that catches highlights

function Furniture() {
  return (
    <group>
      {/* Living Room: sofa */}
      <group position={[-1.6, 0.25, 0.9]}>
        <mesh castShadow>
          <boxGeometry args={[1.4, 0.45, 0.6]} />
          <meshStandardMaterial color="#3e5a7e" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.35, -0.22]} castShadow>
          <boxGeometry args={[1.4, 0.35, 0.18]} />
          <meshStandardMaterial color="#4a6a92" roughness={0.85} />
        </mesh>
        <mesh position={[-0.4, 0.3, 0.05]} castShadow>
          <boxGeometry args={[0.5, 0.12, 0.4]} />
          <meshStandardMaterial color="#5a7eaa" roughness={0.9} />
        </mesh>
        <mesh position={[0.4, 0.3, 0.05]} castShadow>
          <boxGeometry args={[0.5, 0.12, 0.4]} />
          <meshStandardMaterial color="#5a7eaa" roughness={0.9} />
        </mesh>
      </group>

      {/* Coffee table */}
      <group position={[-1.6, 0.18, 0.05]}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.04, 0.4]} />
          <meshStandardMaterial color="#2c2c30" roughness={0.4} metalness={0.2} />
        </mesh>
        {[-0.3, 0.3].map((x) =>
          [-0.16, 0.16].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, -0.09, z]} castShadow>
              <boxGeometry args={[0.04, 0.18, 0.04]} />
              <meshStandardMaterial color="#1a1a1e" />
            </mesh>
          ))
        )}
      </group>

      {/* Rug — soft accent on grey floor */}
      <mesh position={[-1.6, 0.011, 0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.0, 1.4]} />
        <meshStandardMaterial color="#5a8c9b" roughness={1} />
      </mesh>

      {/* Kitchen counter */}
      <group position={[1.55, 0.45, -1.4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.9, 0.5]} />
          <meshStandardMaterial color="#f4f4f6" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.46, 0]} castShadow>
          <boxGeometry args={[2.25, 0.04, 0.55]} />
          <meshStandardMaterial color="#1a1a1e" roughness={0.25} metalness={0.3} />
        </mesh>
        {[-0.7, 0, 0.7].map((x) => (
          <mesh key={x} position={[x, 0, 0.26]}>
            <boxGeometry args={[0.01, 0.85, 0.01]} />
            <meshStandardMaterial color="#c2c2c8" />
          </mesh>
        ))}
      </group>

      {/* Stove */}
      <group position={[2.5, 0.95, -1.4]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.05, 0.5]} />
          <meshStandardMaterial color="#1a1a1e" roughness={0.35} metalness={0.6} />
        </mesh>
        {[-0.15, 0.15].map((x) =>
          [-0.12, 0.12].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.03, z]}>
              <torusGeometry args={[0.06, 0.012, 12, 24]} />
              <meshStandardMaterial color="#3a3a40" metalness={0.7} roughness={0.3} />
            </mesh>
          ))
        )}
      </group>

      {/* Dining table */}
      <group position={[1.0, 0.36, 0.6]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.04, 32]} />
          <meshStandardMaterial color="#e8e8ec" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.18, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.07, 0.36, 16]} />
          <meshStandardMaterial color="#2c2c30" />
        </mesh>
        <mesh position={[0, -0.36, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.03, 24]} />
          <meshStandardMaterial color="#2c2c30" />
        </mesh>
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

export default function HomeScene() {
  const showAxes = useGuardianStore((s) => s.showAxes);
  const toggleAxes = useGuardianStore((s) => s.toggleAxes);
  const [showHouse, setShowHouse] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
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
      {/* Floating viewport controls (Blender-style) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          onClick={() => setAutoRotate((v) => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-mono uppercase tracking-wider border backdrop-blur-md transition-colors ${
            !autoRotate
              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
              : 'bg-black/40 border-white/10 text-white/70 hover:text-white hover:border-white/20'
          }`}
          title={autoRotate ? 'Pause camera rotation — free look mode' : 'Resume auto-rotate'}
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{autoRotate ? 'Pause' : 'Auto'}</span>
        </button>
        <button
          onClick={recenterCamera}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-mono uppercase tracking-wider border backdrop-blur-md transition-colors bg-black/40 border-white/10 text-white/70 hover:text-white hover:border-white/20"
          title="Recenter camera to default view"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
        <button
          onClick={toggleAxes}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-mono uppercase tracking-wider border backdrop-blur-md transition-colors ${
            showAxes
              ? 'bg-primary/20 border-primary/60 text-primary'
              : 'bg-black/40 border-white/10 text-white/70 hover:text-white hover:border-white/20'
          }`}
          title="Toggle axis & grid view"
        >
          <Box className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Axes</span>
        </button>
        <button
          onClick={() => setShowHouse((v) => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-mono uppercase tracking-wider border backdrop-blur-md transition-colors ${
            !showHouse
              ? 'bg-primary/20 border-primary/60 text-primary'
              : 'bg-black/40 border-white/10 text-white/70 hover:text-white hover:border-white/20'
          }`}
          title="Toggle house geometry"
        >
          {showHouse ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">House</span>
        </button>
      </div>

      {/* Camera control hint — appears briefly when free-look is engaged */}
      {!autoRotate && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-md bg-black/60 border border-white/10 backdrop-blur-md text-[10px] font-mono uppercase tracking-wider text-white/70 hidden sm:flex gap-3">
          <span>Drag · Orbit</span>
          <span className="text-white/30">|</span>
          <span>Right-click · Pan</span>
          <span className="text-white/30">|</span>
          <span>Scroll · Zoom</span>
        </div>
      )}

      {/* XYZ legend (visible when axes mode is on) — top-left so it doesn't collide with mobile sim controls */}
      {showAxes && (
        <div className="absolute top-3 left-3 z-10 px-3 py-2 rounded-md bg-black/40 border border-white/10 backdrop-blur-md text-[10px] font-mono uppercase tracking-wider text-white/80 flex gap-3">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />X</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Y</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Z</span>
        </div>
      )}

      {/* Mobile-only quick simulation controls overlaid on the 3D pane */}
      <SceneSimControls />

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
          <ElectricalPanel position={[-2.9, 1.0, 0.3]} />

          <RoomLightFixture position={[1.5, 1.95, 0]} room="kitchen" />
          <GasValve position={[2.6, 1.05, -1.45]} />
          <WaterMain position={[1.0, 1.05, -1.45]} />

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
