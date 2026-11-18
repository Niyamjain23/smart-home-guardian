import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { SystemStatus } from '@/lib/guardian-state';

/**
 * Animated expanding radar / sonar wave on the floor or wall
 * Demonstrates AI sensor actively scanning flow & velocity
 */
export function DetectionSonarRings({
  position,
  rotation = [-Math.PI / 2, 0, 0],
  status,
  radius = 0.6,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  status: SystemStatus;
  radius?: number;
}) {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  const isWarning = status === 'Warning';
  const isPrevented = status === 'Prevented';
  const isCritical = status === 'Critical';

  const ringColor = isCritical
    ? '#ef4444'
    : isWarning
    ? '#f59e0b'
    : isPrevented
    ? '#06b6d4'
    : '#10b981';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const speed = isWarning ? 3.5 : isCritical ? 4.0 : 1.2;

    if (ring1Ref.current) {
      const p1 = (t * speed) % 1;
      const s1 = 0.2 + p1 * radius;
      ring1Ref.current.scale.set(s1, s1, 1);
      (ring1Ref.current.material as THREE.MeshBasicMaterial).opacity = (1 - p1) * (isWarning ? 0.8 : 0.35);
    }

    if (ring2Ref.current) {
      const p2 = ((t * speed) + 0.5) % 1;
      const s2 = 0.2 + p2 * radius;
      ring2Ref.current.scale.set(s2, s2, 1);
      (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = (1 - p2) * (isWarning ? 0.7 : 0.25);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Primary expanding ring */}
      <mesh ref={ring1Ref}>
        <ringGeometry args={[0.9, 1.0, 32]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Secondary expanding ring */}
      <mesh ref={ring2Ref}>
        <ringGeometry args={[0.9, 1.0, 32]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Center anchor pulse dot */}
      <mesh>
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/**
 * Holographic Protective Interception Shield
 * Emerges when Guardian intervenes (status === 'Prevented')
 * Visually communicates that the line was clamped before damage
 */
export function InterceptionBarrier({
  position,
  label = 'SAFEGUARD ENGAGED · SUPPLY ISOLATED',
}: {
  position: [number, number, number];
  label?: string;
}) {
  const shieldRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (shieldRef.current) {
      shieldRef.current.rotation.y = t * 0.5;
    }
    if (ringRef.current) {
      const pulse = 1 + Math.sin(t * 3) * 0.05;
      ringRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group position={position}>
      {/* Holographic glowing barrier cylinder */}
      <group ref={shieldRef}>
        <mesh>
          <cylinderGeometry args={[0.32, 0.32, 0.45, 24, 1, true]} />
          <meshBasicMaterial
            color="#06b6d4"
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            depthWrite={false}
            wireframe
          />
        </mesh>
      </group>

      {/* Outer pulsing energy ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.34, 0.38, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Floating 3D Proactive Intervention Status */}
      <Text
        position={[0, 0.38, 0]}
        fontSize={0.055}
        color="#38bdf8"
        outlineWidth={0.004}
        outlineColor="#000"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}


/**
 * Smart IoT Sensor Puck mounted on walls/counters
 */
export function IoTSensorBeacon({
  position,
  label,
  status,
}: {
  position: [number, number, number];
  label: string;
  status: SystemStatus;
}) {
  const isWarning = status === 'Warning';
  const isPrevented = status === 'Prevented';
  const isCritical = status === 'Critical';

  const ledColor = isCritical
    ? '#ef4444'
    : isWarning
    ? '#f59e0b'
    : isPrevented
    ? '#06b6d4'
    : '#10b981';

  return (
    <group position={position}>
      {/* Puck Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.03, 24]} />
        <meshStandardMaterial color="#1e2430" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Active LED Halo Ring */}
      <mesh position={[0, 0.016, 0]}>
        <ringGeometry args={[0.045, 0.065, 24]} />
        <meshBasicMaterial color={ledColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 0.07, 0]}
        fontSize={0.038}
        color="#94a3b8"
        outlineWidth={0.002}
        outlineColor="#000"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

/**
 * Glowing Conduit Path representing active utility flow
 * When status is Prevented, the conduit goes dark/cold indicating flow has been stopped
 */
export function GlowingConduitPath({
  position,
  args,
  rotation = [0, 0, 0],
  status,
  color = '#10b981',
}: {
  position: [number, number, number];
  args: [number, number, number];
  rotation?: [number, number, number];
  status: SystemStatus;
  color?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const isPrevented = status === 'Prevented';
  const isWarning = status === 'Warning';
  const isCritical = status === 'Critical';

  const activeColor = isCritical
    ? '#ef4444'
    : isWarning
    ? '#f59e0b'
    : isPrevented
    ? '#1e2430'
    : color;

  useFrame((state) => {
    if (!meshRef.current || isPrevented) return;
    const t = state.clock.getElapsedTime();
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = isWarning ? 1.0 + Math.sin(t * 8) * 0.5 : 0.45 + Math.sin(t * 2) * 0.2;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={activeColor}
        emissive={isPrevented ? '#000000' : activeColor}
        emissiveIntensity={isPrevented ? 0 : 0.5}
        roughness={0.4}
        metalness={0.8}
      />
    </mesh>
  );
}


