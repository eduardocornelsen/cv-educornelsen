import { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Torus, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// The torus is the site's signature, so it stays, but it sits behind the hero
// text: thin lines, slow motion, few particles, nothing that pulls the eye away
// from the name and the headline.

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isSmallScreen = () => typeof window !== 'undefined' && window.innerWidth < 768;

function Scene({ showTorus = true, still }: { showTorus?: boolean; still: boolean }) {
  const { camera } = useThree();
  const scrollY = useRef(0);

  useEffect(() => {
    if (still) return;
    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [still]);

  useFrame(() => {
    camera.position.y = -scrollY.current * 0.002;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      {showTorus && <AnimatedTorus still={still} />}
      <FloatingParticles still={still} />
    </>
  );
}

function AnimatedTorus({ still }: { still: boolean }) {
  const torusRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (torusRef.current && !still) {
      torusRef.current.rotation.x = state.clock.getElapsedTime() * 0.02;
      torusRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <Torus ref={torusRef} args={[2.5, 0.8, 16, 32]} position={[0, 0, 0]} rotation={[0.5, 0.3, 0]}>
      <MeshDistortMaterial
        color="#10b981"
        emissive="#047857"
        emissiveIntensity={1.6}
        wireframe
        distort={still ? 0 : 0.15}
        speed={still ? 0 : 0.5}
        transparent
        opacity={0.5}
      />
    </Torus>
  );
}

function FloatingParticles({ still }: { still: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (particlesRef.current && !still) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.015;
    }
  });

  // Memoized so random positions are generated once, not on every render
  const { positions, particlesCount } = useMemo(() => {
    const count = isSmallScreen() ? 150 : 350;
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
      <pointsMaterial size={0.04} color="#34d399" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

export default function TorusField({ showTorus = true }: { showTorus?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [still] = useState(prefersReducedMotion);
  // The render loop runs only while the hero is on screen and the tab is visible.
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  // Fade in after mount so the Suspense handoff from the CSS fallback is smooth
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // A reduced-motion visitor gets one rendered frame and no loop.
  const frameloop = still ? 'demand' : onScreen && tabVisible ? 'always' : 'never';

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-700 ease-out"
      style={{ opacity: visible ? 0.6 : 0 }}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} frameloop={frameloop} dpr={[1, 1.5]}>
        <Scene showTorus={showTorus} still={still} />
      </Canvas>
    </div>
  );
}
