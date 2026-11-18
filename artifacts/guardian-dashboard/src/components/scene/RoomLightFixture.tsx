import React from 'react';
import { useGuardianStore } from '@/lib/guardian-state';

export default function RoomLightFixture({
  position,
  room,
}: {
  position: [number, number, number];
  room: 'livingRoom' | 'kitchen';
}) {
  const lights = useGuardianStore((s) => s.lights);
  const electricityStatus = useGuardianStore((s) => s.electricityStatus);
  const manualOffElec = useGuardianStore((s) => s.manualOff.electricity);

  const powerAvailable = electricityStatus !== 'Prevented' && !manualOffElec;
  const isOn = lights[room] && powerAvailable;

  const bulbColor = isOn ? '#fff8d8' : '#2a2a30';
  const bulbEmissive = isOn ? '#ffe7a0' : '#000';

  return (
    <group position={position}>
      {/* Pendant cord */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.45, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Ceiling mount */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
        <meshStandardMaterial color="#cbd2da" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Lamp shade */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.18, 0.1, 0.16, 24, 1, true]} />
        <meshStandardMaterial
          color={isOn ? '#f7e8c8' : '#7a7066'}
          emissive={isOn ? '#fff2c0' : '#000'}
          emissiveIntensity={isOn ? 0.6 : 0}
          side={2}
          roughness={0.55}
        />
      </mesh>

      {/* Bulb */}
      <mesh position={[0, -0.06, 0]}>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshStandardMaterial
          color={bulbColor}
          emissive={bulbEmissive}
          emissiveIntensity={isOn ? 2.6 : 0}
          roughness={0.2}
        />
      </mesh>

      {/* Glow halo (only when on) */}
      {isOn && (
        <mesh position={[0, -0.06, 0]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial color="#fff2c0" transparent opacity={0.08} />
        </mesh>
      )}

      {/* Light source — bright and warm */}
      {isOn && (
        <>
          <pointLight position={[0, -0.15, 0]} intensity={6} distance={5} color="#ffe7a0" decay={2} castShadow />
          <pointLight position={[0, -0.4, 0]} intensity={2} distance={2.5} color="#ffd97a" decay={2} />
        </>
      )}
    </group>
  );
}
