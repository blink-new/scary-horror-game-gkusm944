import { useRef } from 'react';
import * as THREE from 'three';

export const Monster = () => {
  const mesh = useRef<THREE.Mesh>(null!);

  return (
    <mesh ref={mesh} position={[5, 0.5, -10]}>
      <coneGeometry args={[1, 2, 8]} />
      <meshStandardMaterial color="darkred" />
    </mesh>
  );
};