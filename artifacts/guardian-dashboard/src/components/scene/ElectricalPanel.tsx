import React, { useRef, useMemo } from 'react';
import { useSpring, animated } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGuardianStore } from '@/lib/guardian-state';
import { DetectionSonarRings, InterceptionBarrier } from './HazardSafeguardEffects';

// Flickering sparks: small bright cubes that randomly relocate and pulse opacity.
const SPARK_COUNT = 18;

function SparkSwarm() {
  const sparksRef = useRef<THREE.Group>(null);
  const meta = useMemo(
    () =>
      Array.from({ length: SPARK_COUNT }).map(() => ({
        offset: Math.random() * Math.PI * 2,
        speed: 4 + Math.random() * 6,
        x: (Math.random() - 0.5) * 0.55,
        y: (Math.random() - 0.5) * 0.75,
        z: 0.09 + Math.random() * 0.05,
      })),
    [],
  );

  useFrame(() => {
    const grp = sparksRef.current;
    if (!grp) return;
    const t = performance.now() / 1000;
    for (let i = 0; i < grp.children.length && i < meta.length; i++) {
      const m = grp.children[i] as THREE.Mesh;
      const mat = m.material as THREE.MeshStandardMaterial;
      const flicker = (Math.sin(t * meta[i].speed + meta[i].offset) + 1) * 0.5;
      mat.opacity = 0.25 + flicker * 0.75;
      mat.emissiveIntensity = 2 + flicker * 4;

      // Occasionally jump to a new spark position so the swarm never feels static.
      if (Math.random() < 0.04) {
        m.position.x = (Math.random() - 0.5) * 0.55;
        m.position.y = (Math.random() - 0.5) * 0.75;
        m.position.z = 0.09 + Math.random() * 0.05;
      }
    }
  });

  return (
    <>
      <group ref={sparksRef}>
        {meta.map((spark, i) => (
          <mesh key={i} position={[spark.x, spark.y, spark.z]}>
            <boxGeometry args={[0.028, 0.028, 0.028]} />
            <meshStandardMaterial
              color="#fef9c3"
              emissive="#facc15"
              emissiveIntensity={3}
              transparent
              opacity={0.9}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      {/* Sustained electrical glow on the panel face */}
      <pointLight color="#fde047" intensity={2.4} distance={2.5} decay={2} position={[0, 0, 0.4]} />
    </>
  );
}

// Drifting smoke plumes rising up off the panel.
function SmokeCloud() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      const m = child as THREE.Mesh;
      const mat = m.material as THREE.MeshStandardMaterial;
      m.position.y += dt * (0.18 + (i % 3) * 0.05);
      const t = m.position.y;
      mat.opacity = Math.max(0, 0.45 - t * 0.4);
      const s = 1 + t * 1.6;
      m.scale.set(s, s, s);
      if (t > 1.4) {
        m.position.y = 0;
        m.position.x = (Math.random() - 0.5) * 0.3;
        m.position.z = 0.15 + Math.random() * 0.1;
        m.scale.set(1, 1, 1);
      }
    });
  });
  return (
    <group ref={ref} position={[0, 0.5, 0]}>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={i}
          position={[(Math.random() - 0.5) * 0.3, Math.random() * 1.2, 0.15 + Math.random() * 0.1]}
        >
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial
            color="#1e293b"
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function ElectricalPanel({
  position,
  onSelect,
  onHoverChange,
}: {
  position: [number, number, number];
  onSelect?: () => void;
  onHoverChange?: (hovered: boolean) => void;
}) {
  const status = useGuardianStore((s) => s.electricityStatus);
  const manualOff = useGuardianStore((s) => s.manualOff.electricity);
  const [hovered, setHovered] = React.useState(false);

  React.useEffect(() => {
    if (hovered) {
      document.body.style.cursor = 'pointer';
    }
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  const isIsolated = (status === 'Prevented' || manualOff) && status !== 'Critical';
  const isCritical = status === 'Critical';

  const { switchY } = useSpring({
    switchY: isIsolated ? -0.05 : 0.05,
    config: { mass: 1, tension: 400, friction: 15 },
  });

  const indicatorColor = isCritical ? '#ef4444' : isIsolated ? '#f97316' : '#22c55e';

  // Rapid flash for the indicator during disaster.
  const indicatorMatRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (!indicatorMatRef.current) return;
    if (isCritical) {
      const t = performance.now() / 1000;
      indicatorMatRef.current.emissiveIntensity = 1 + (Math.sin(t * 14) + 1) * 2;
    } else {
      indicatorMatRef.current.emissiveIntensity = 2.2;
    }
  });

  return (
    <group
      position={position}
      rotation={[0, Math.PI / 2, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHoverChange?.(true);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHoverChange?.(false);
      }}
    >
      {/* Sonar Sensor Scanning Ring on floor */}
      <DetectionSonarRings position={[0, -0.99, 0]} status={status} radius={0.7} />
      {/* Box */}
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.9, 0.12]} />
        <meshStandardMaterial
          color={isCritical ? '#7f1d1d' : '#cbd2da'}
          emissive={isCritical ? '#dc2626' : '#000000'}
          emissiveIntensity={isCritical ? 0.3 : 0}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* Inner Panel */}
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[0.6, 0.8, 0.01]} />
        <meshStandardMaterial color="#2c333d" />
      </mesh>

      {/* Main Breaker Area */}
      <mesh position={[0, 0.25, 0.075]}>
        <boxGeometry args={[0.24, 0.18, 0.02]} />
        <meshStandardMaterial color="#161a20" />
      </mesh>

      {/* Main Switch Lever */}
      <animated.mesh position-y={switchY as any} position={[0, 0, 0.085] as any}>
        <boxGeometry args={[0.12, 0.06, 0.05]} />
        <meshStandardMaterial color="#0a0d12" metalness={0.3} roughness={0.6} />
      </animated.mesh>

      {/* Small Breakers grid */}
      {[-0.12, 0.12].map((x) =>
        [-0.05, -0.15, -0.25].map((y) => (
          <mesh key={`${x}-${y}`} position={[x, y, 0.075]}>
            <boxGeometry args={[0.1, 0.05, 0.02]} />
            <meshStandardMaterial color="#161a20" />
          </mesh>
        ))
      )}
      {[-0.12, 0.12].map((x) =>
        [-0.05, -0.15, -0.25].map((y) => (
          <mesh key={`s-${x}-${y}`} position={[x, y, 0.087]}>
            <boxGeometry args={[0.04, 0.025, 0.015]} />
            <meshStandardMaterial color="#3a4150" />
          </mesh>
        ))
      )}

      {/* Status Indicator Light */}
      <mesh position={[0.22, 0.33, 0.075]}>
        <cylinderGeometry args={[0.025, 0.025, 0.012, 16]} />
        <meshStandardMaterial
          ref={indicatorMatRef}
          color={indicatorColor}
          emissive={indicatorColor}
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>

      {/* Proactive Safeguard Barrier when Prevented */}
      {isIsolated && (
        <InterceptionBarrier position={[0, 0, 0.1]} label="BREAKER TRIPPED · ARC MITIGATED" />
      )}

      {/* Disaster effects */}
      {isCritical && (
        <>
          <SparkSwarm />
          <SmokeCloud />
        </>
      )}
    </group>
  );
}
