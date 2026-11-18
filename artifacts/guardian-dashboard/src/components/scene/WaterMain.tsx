import React, { useRef } from 'react';
import { useSpring, animated } from '@react-spring/three';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGuardianStore } from '@/lib/guardian-state';
import { DetectionSonarRings, InterceptionBarrier } from './HazardSafeguardEffects';

// A flat, growing puddle on the floor below the sink during a water disaster.
function FloodPuddle({ start }: { start: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    const elapsed = (Date.now() - start) / 1000;
    const radius = Math.min(1.6, 0.25 + elapsed * 0.18);
    ref.current.scale.set(radius, radius, 1);
  });
  // Sink center is local y = 0 (group origin). Counter is at y = -0.42.
  // The WaterMain group is at world y ~ 1.05 (in the offset house group), and floor is ~ -1.05 below.
  return (
    <mesh ref={ref} position={[0, -1.04, 0.15]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <circleGeometry args={[1, 48]} />
      <meshStandardMaterial
        color="#1d4ed8"
        emissive="#3b82f6"
        emissiveIntensity={0.35}
        transparent
        opacity={0.75}
        roughness={0.05}
        metalness={0.6}
        depthWrite={false}
      />
    </mesh>
  );
}

// A few falling water droplets / spray near the spout while disaster persists.
function FloodSpray() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      const m = child as THREE.Mesh;
      m.position.y -= dt * (0.8 + (i % 3) * 0.2);
      if (m.position.y < -0.95) {
        m.position.y = 0.05;
        m.position.x = (Math.random() - 0.5) * 0.18;
        m.position.z = 0.08 + Math.random() * 0.12;
      }
    });
  });
  return (
    <group ref={ref}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={i}
          position={[(Math.random() - 0.5) * 0.18, -Math.random() * 1, 0.08 + Math.random() * 0.12]}
        >
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshStandardMaterial
            color="#7dd3fc"
            emissive="#38bdf8"
            emissiveIntensity={0.7}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function WaterMain({
  position,
  onSelect,
}: {
  position: [number, number, number];
  onSelect?: () => void;
}) {
  const status = useGuardianStore((s) => s.waterStatus);
  const manualOff = useGuardianStore((s) => s.manualOff.water);
  const disasterStart = useGuardianStore((s) => s.disasterStart.water);
  const [hovered, setHovered] = React.useState(false);

  React.useEffect(() => {
    if (hovered) {
      document.body.style.cursor = 'pointer';
    }
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  const isClosed = (status === 'Prevented' || manualOff) && status !== 'Critical';
  const isCritical = status === 'Critical';

  const { handleRotation, handleColor, streamScale, streamOpacity } = useSpring({
    handleRotation: isClosed ? [0, Math.PI * 1.5, 0] : [0, 0, 0],
    handleColor: isCritical ? '#ef4444' : isClosed ? '#f97316' : '#3b82f6',
    streamScale: isClosed ? 0.001 : isCritical ? 1.8 : 1,
    streamOpacity: isClosed ? 0 : 0.85,
    config: { mass: 1.2, tension: 140, friction: 22 },
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Sensor Sonar Scanning Ring on floor */}
      <DetectionSonarRings position={[0, -1.04, 0.15]} status={status} radius={0.7} />
      {/* Sink basin embedded in counter */}
      <group position={[0, -0.5, 0]}>
        <mesh>
          <boxGeometry args={[0.5, 0.06, 0.4]} />
          <meshStandardMaterial color="#cfd8e0" metalness={0.7} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.42, 0.06, 0.32]} />
          <meshStandardMaterial color="#1f2228" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>

      {/* Tap base */}
      <mesh position={[0, -0.42, -0.12]}>
        <cylinderGeometry args={[0.07, 0.08, 0.05, 24]} />
        <meshStandardMaterial color="#dfe4ea" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Vertical neck */}
      <mesh position={[0, -0.22, -0.12]}>
        <cylinderGeometry args={[0.035, 0.035, 0.4, 24]} />
        <meshStandardMaterial color="#e8edf2" metalness={0.95} roughness={0.08} />
      </mesh>

      {/* Goose-neck curve */}
      <mesh position={[0, -0.02, -0.05]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.07, 0.035, 16, 16, Math.PI / 2]} />
        <meshStandardMaterial color="#e8edf2" metalness={0.95} roughness={0.08} />
      </mesh>

      {/* Horizontal spout */}
      <mesh position={[0, 0.05, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.16, 24]} />
        <meshStandardMaterial color="#e8edf2" metalness={0.95} roughness={0.08} />
      </mesh>

      {/* Aerator */}
      <mesh position={[0, 0.05, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.04, 0.04, 24]} />
        <meshStandardMaterial color="#b8c0c8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Water stream */}
      <animated.mesh
        position={[0, -0.18, 0.1]}
        scale-x={streamScale as any}
        scale-z={streamScale as any}
      >
        <cylinderGeometry args={[0.012, 0.018, 0.45, 12]} />
        <animated.meshStandardMaterial
          color="#7dd3fc"
          emissive="#38bdf8"
          emissiveIntensity={0.6}
          transparent
          opacity={streamOpacity as any}
          roughness={0.05}
          metalness={0}
        />
      </animated.mesh>

      {/* Side handle */}
      <animated.group position={[0.16, -0.05, -0.12]} rotation={handleRotation as any}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.07, 0.012, 12, 24]} />
          <animated.meshStandardMaterial color={handleColor as any} metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.14, 12]} />
          <animated.meshStandardMaterial color={handleColor as any} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.14, 12]} />
          <animated.meshStandardMaterial color={handleColor as any} />
        </mesh>
        <mesh position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.06, 12]} />
          <meshStandardMaterial color="#b8c0c8" metalness={0.9} roughness={0.2} />
        </mesh>
      </animated.group>

      <Text
        position={[0, 0.4, 0]}
        fontSize={0.09}
        color={isCritical ? '#bfdbfe' : '#fff'}
        outlineWidth={0.005}
        outlineColor="#000"
        anchorX="center"
        anchorY="middle"
      >
        {isCritical ? 'WATER LEAK' : 'Water Main'}
      </Text>

      {/* Proactive Safeguard Barrier when Prevented */}
      {status === 'Prevented' && (
        <InterceptionBarrier position={[0, -0.05, 0]} label="VALVE SHUT · FLOOD PREVENTED" />
      )}

      {/* Disaster effects */}
      {isCritical && disasterStart != null && (
        <>
          <FloodPuddle start={disasterStart} />
          <FloodSpray />
        </>
      )}
    </group>
  );
}
