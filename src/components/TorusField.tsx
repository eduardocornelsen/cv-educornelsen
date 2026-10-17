import { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Torus, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';


function Scene({ showTorus = true }: { showTorus?: boolean }) {
  const { camera } = useThree();
  const scrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame(() => {
    // Parallax effect for the camera
    camera.position.y = -scrollY.current * 0.005;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      {showTorus && <AnimatedTorus />}
      <FloatingParticles />
    </>
  );
}

function AnimatedTorus() {
  const torusRef = useRef<THREE.Mesh>(null);
  const isDark = true;


  useFrame((state) => {
    if (torusRef.current) {
      torusRef.current.rotation.x = state.clock.getElapsedTime() * 0.05;
      torusRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <Torus ref={torusRef} args={[2.5, 0.8, 16, 32]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        color="#10b981"
        emissive="#047857"
        emissiveIntensity={isDark ? 3.5 : 0.5}
        wireframe
        distort={0.3}
        speed={1}
        transparent
        opacity={isDark ? 0.6 : 0.3}
      />
    </Torus>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const isDark = true;

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      particlesRef.current.rotation.x = state.clock.getElapsedTime() * 0.02;
    }
  });

  // Memoized so random positions are generated once, not on every render
  const { positions, particlesCount } = useMemo(() => {
    const count = 1000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 20;
    }
    return { positions: pos, particlesCount: count };
  }, []);

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#34d399" transparent opacity={isDark ? 0.7 : 0.4} sizeAttenuation />
    </points>
  );
}

export default function TorusField({ showTorus = true }: { showTorus?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Halt the render loop when the hero is scrolled out of view
  const [frameloop, setFrameloop] = useState<'always' | 'never'>('always');
  // Fade in after mount so the Suspense handoff from the CSS fallback is smooth
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setFrameloop(entry.isIntersecting ? 'always' : 'never'),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-700 ease-out"
      style={{ opacity: visible ? 0.6 : 0 }}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} frameloop={frameloop}>
        <Scene showTorus={showTorus} />
      </Canvas>
    </div>
  );
}
