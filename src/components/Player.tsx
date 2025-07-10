import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboard } from '../hooks/useKeyboard';
import * as THREE from 'three';

const PLAYER_SPEED = 5;

export const Player = () => {
  const mesh = useRef<THREE.Mesh>(null!);
  const keys = useKeyboard();

  useFrame((_, delta) => {
    if (!mesh.current) return;

    const velocity = new THREE.Vector3();

    if (keys['KeyW']) {
      velocity.z -= 1;
    }
    if (keys['KeyS']) {
      velocity.z += 1;
    }
    if (keys['KeyA']) {
      velocity.x -= 1;
    }
    if (keys['KeyD']) {
      velocity.x += 1;
    }

    velocity.normalize().multiplyScalar(PLAYER_SPEED * delta);

    mesh.current.position.add(velocity);
  });

  return (
    <mesh ref={mesh} position={[0, 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="royalblue" />
    </mesh>
  );
};