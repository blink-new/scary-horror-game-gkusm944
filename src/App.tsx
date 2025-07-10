import { Canvas } from '@react-three/fiber';
import { Player } from './components/Player';
import { Monster } from './components/Monster';
import { Environment } from './components/Environment';

function App() {
  return (
    <div className="w-screen h-screen bg-black">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Player />
        <Monster />
        <Environment />
      </Canvas>
    </div>
  );
}

export default App;