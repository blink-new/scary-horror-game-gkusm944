export const Environment = () => {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0, 2.5, -20]}>
        <boxGeometry args={[100, 5, 1]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[0, 2.5, 20]}>
        <boxGeometry args={[100, 5, 1]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[-50, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[100, 5, 1]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[50, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[100, 5, 1]} />
        <meshStandardMaterial color="#666" />
      </mesh>
    </>
  );
};