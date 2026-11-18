import React, { useRef } from 'react';
import { useSpring, animated } from '@react-spring/three';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGuardianStore } from '@/lib/guardian-state';
import { DetectionSonarRings, InterceptionBarrier } from './HazardSafeguardEffects';

// Animated semi-transparent gas cloud that pulses & expands while disaster is active.
function GasCloud({ start }: { start: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const elapsed = (Date.now() - start) / 1000;
    const grow = Math.min(1.6, 0.4 + elapsed * 0.05);
    const pulse = 1 + Math.sin(elapsed * 1.4) * 0.08;
    const s = grow * pulse;
    ref.current.scale.set(s, s * 1.2, s);
  });

  return (
    <group ref={ref} position={[0, 0.05, 0]}>
      {/* Three offset blobs to give a more "cloudy" silhouette */}
      <mesh>
        <sphereGeometry args={[0.32, 18, 18]} />
        <meshStandardMaterial
          color="#bef264"
          emissive="#65a30d"
          emissiveIntensity={0.45}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0.18, 0.1, 0.12]}>
        <sphereGeometry args={[0.22, 14, 14]} />
        <meshStandardMaterial
          color="#facc15"
          emissive="#a16207"
          emissiveIntensity={0.4}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[-0.16, 0.06, -0.1]}>
        <sphereGeometry args={[0.24, 14, 14]} />
        <meshStandardMaterial
          color="#a3e635"
          emissive="#4d7c0f"
          emissiveIntensity={0.4}
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>
      {/* Hazard glow at source */}
      <pointLight color="#facc15" intensity={2.2} distance={2.2} decay={2} />
    </group>
  );
}

export default function GasValve({ position }: { position: [number, number, number] }) {
  const status = useGuardianStore((s) => s.gasStatus);
  const manualOff = useGuardianStore((s) => s.manualOff.gas);
  const disasterStart = useGuardianStore((s) => s.disasterStart.gas);

  const isClosed = status === 'Prevented' || manualOff;
  const isCritical = status === 'Critical';

  const { rotation, color, bodyColor } = useSpring({
    rotation: isClosed ? [0, 0, Math.PI / 2] : [0, 0, 0],
    color: isCritical ? '#ef4444' : isClosed ? '#f97316' : '#dc2626',
    bodyColor: isCritical ? '#7f1d1d' : isClosed ? '#7c2d12' : '#3a1818',
    config: { mass: 1, tension: 170, friction: 26 },
  });

  return (
    <group position={position}>
      {/* AI Sensor Active Scanning Sonar Rings */}
      <DetectionSonarRings position={[0, -0.4, 0]} status={status} radius={0.65} />

      {/* Vertical pipe coming down from above */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.8, 16]} />
        <meshStandardMaterial color="#525252" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Pipe joint */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
        <meshStandardMaterial color="#3f3f3f" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Valve body */}
      <animated.mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[0.18, 0.16, 0.18]} />
        <animated.meshStandardMaterial
          color={bodyColor as any}
          emissive={isCritical ? '#dc2626' : '#000000'}
          emissiveIntensity={isCritical ? 0.6 : 0}
          metalness={0.6}
          roughness={0.4}
        />
      </animated.mesh>

      {/* Lower pipe to stove */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.2, 16]} />
        <meshStandardMaterial color="#525252" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Valve stem nut */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.06, 8]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Handle (rotates 90° when closed) */}
      <animated.group rotation={rotation as any} position={[0, 0.08, 0]}>
        <animated.mesh>
          <boxGeometry args={[0.42, 0.04, 0.06]} />
          <animated.meshStandardMaterial color={color as any} metalness={0.4} roughness={0.5} />
        </animated.mesh>
        <animated.mesh position={[0.21, 0, 0]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <animated.meshStandardMaterial color={color as any} />
        </animated.mesh>
        <animated.mesh position={[-0.21, 0, 0]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <animated.meshStandardMaterial color={color as any} />
        </animated.mesh>
      </animated.group>

      <Text
        position={[0, 0.55, 0]}
        fontSize={0.09}
        color={isCritical ? '#fca5a5' : '#fff'}
        outlineWidth={0.005}
        outlineColor="#000"
        anchorX="center"
        anchorY="middle"
      >
        {isCritical ? 'GAS LEAK' : 'Gas Valve'}
      </Text>

      {/* Proactive Safeguard Barrier when Prevented */}
      {status === 'Prevented' && (
        <InterceptionBarrier position={[0, 0, 0]} label="VALVE SEALED · LEAK PREVENTED" />
      )}

      {/* Disaster cloud only when unmitigated Critical */}
      {isCritical && disasterStart != null && <GasCloud start={disasterStart} />}
    </group>
  );
}
