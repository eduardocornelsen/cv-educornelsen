import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Torus, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useScroll } from 'framer-motion';

function TorusModel() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);
  const { scrollY } = useScroll();

  useFrame((state, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;
    const scroll = scrollY.get();
    
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.15 + scroll * 0.005;
      meshRef.current.rotation.y = t * 0.2 + scroll * 0.005;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.x = t * 0.15 + scroll * 0.005;
      wireframeRef.current.rotation.y = t * 0.2 + scroll * 0.005;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.x = t * 0.15 + scroll * 0.005;
      particlesRef.current.rotation.y = t * 0.2 + scroll * 0.005;
      particlesRef.current.rotation.z = t * 0.1 + scroll * 0.002;
    }
  });

  // Generate particles for magnetic field effect
  const particleCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const radius = 1.5;
    const tube = 0.8;

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      
      // Torus parametric equations with some noise
      const r = radius + tube * Math.cos(v) + (Math.random() - 0.5) * 0.8;
      const x = r * Math.cos(u);
      const y = r * Math.sin(u);
      const z = tube * Math.sin(v) + (Math.random() - 0.5) * 0.8;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    return pos;
  }, []);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      {/* Solid inner core */}
      <Torus ref={meshRef} args={[1.5, 0.5, 32, 64]}>
        <meshStandardMaterial 
          color="#064e3b" 
          roughness={0.2}
          metalness={0.8}
        />
      </Torus>
      {/* Glowing wireframe outer shell representing magnetic field */}
      <Torus ref={wireframeRef} args={[1.5, 0.52, 16, 100]}>
        <meshStandardMaterial 
          color="#10b981" 
          wireframe={true}
          emissive="#10b981"
          emissiveIntensity={1}
          transparent
          opacity={0.2}
        />
      </Torus>
      {/* Magnetic field particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#34d399"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </Float>
  );
}

export default function AboutTorus() {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={2} color="#34d399" />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#059669" />
        <TorusModel />
      </Canvas>
    </div>
  );
}
