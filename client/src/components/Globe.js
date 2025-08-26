import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import styled from 'styled-components';
import { useAttacks } from '../context/AttackContext';
import AttackLine from './AttackLine';

const GlobeContainer = styled.div`
  flex: 1;
  position: relative;
  background: radial-gradient(circle at center, #0f1419 0%, #000511 100%);
`;

// Enhanced Earth component with GitHub-style globe appearance
function Earth({ isMobile, children }) {
  const earthGroupRef = useRef(); // Reference to the entire Earth group
  const atmosphereRef = useRef();
  
  // Load actual Earth textures for realistic appearance
  const earthTexture = useMemo(() => {
    const loader = new TextureLoader();
    // Using NASA's Blue Marble texture for realistic Earth
    const texture = loader.load('https://cdn.jsdelivr.net/npm/three-globe@2.24.1/example/img/earth-blue-marble.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  const bumpTexture = useMemo(() => {
    const loader = new TextureLoader();
    // Earth bump map for topographical detail
    const texture = loader.load('https://cdn.jsdelivr.net/npm/three-globe@2.24.1/example/img/earth-topology.png');
    return texture;
  }, []);

  const nightTexture = useMemo(() => {
    const loader = new TextureLoader();
    // Earth night lights texture
    const texture = loader.load('https://cdn.jsdelivr.net/npm/three-globe@2.24.1/example/img/earth-night.jpg');
    return texture;
  }, []);

  useFrame(() => {
    if (earthGroupRef.current) {
      earthGroupRef.current.rotation.y += 0.001; // Slow, realistic rotation - rotates entire group
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.0005; // Slower atmosphere
    }
  });

  const segments = isMobile ? 64 : 128; // Higher detail

  return (
    <group ref={earthGroupRef}>
      {/* Main Earth sphere with realistic NASA Blue Marble texture */}
      <mesh>
        <sphereGeometry args={[2, segments, segments]} />
        <meshLambertMaterial
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={0.05}
          color="#ffffff"
        />
      </mesh>

      {/* Night lights overlay - visible on dark side */}
      <mesh>
        <sphereGeometry args={[2.001, segments, segments]} />
        <meshBasicMaterial
          map={nightTexture}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Subtle atmospheric glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.05, 32, 32]} />
        <meshBasicMaterial
          color="#4fc3f7"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Subtle wireframe grid for cyber aesthetic */}
      <mesh>
        <sphereGeometry args={[2.008, isMobile ? 16 : 24, isMobile ? 16 : 24]} />
        <meshBasicMaterial
          color="#00bcd4"
          wireframe
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Attack points and lines as children - they will rotate with the Earth */}
      {children}
    </group>
  );
}

// Convert lat/lng to 3D coordinates
function latLngToVector3(lat, lng, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Enhanced Attack point marker with glow effect
function AttackPoint({ position, type, threatLevel, isMobile }) {
  const pointRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);

  const color = threatLevel === 'high' ? '#ff2222' : 
                threatLevel === 'medium' ? '#ff8800' : '#22ff22';

  const glowColor = threatLevel === 'high' ? '#ff6666' : 
                    threatLevel === 'medium' ? '#ffaa66' : '#66ff66';

  useFrame((state) => {
    if (pointRef.current) {
      const scale = hovered ? 2.0 : 1.0;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
      pointRef.current.scale.setScalar(scale * pulse);
    }
    if (glowRef.current) {
      const glowPulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.5;
      glowRef.current.scale.setScalar(glowPulse);
    }
  });

  const segments = isMobile ? 8 : 12;
  const size = isMobile ? 0.025 : 0.035; // Larger, more visible

  return (
    <group
      onPointerOver={() => !isMobile && setHovered(true)}
      onPointerOut={() => !isMobile && setHovered(false)}
    >
      {/* Main point */}
      <mesh ref={pointRef} position={position}>
        <sphereGeometry args={[size, segments, segments]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      {/* Glow effect */}
      <mesh ref={glowRef} position={position}>
        <sphereGeometry args={[size * 1.5, 8, 8]} />
        <meshBasicMaterial 
          color={glowColor} 
          transparent 
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// Main Globe component
function Globe({ isPaused, animationSpeed, threatFilter, isMobile }) {
  const { attacks } = useAttacks();
  const [activeAttacks, setActiveAttacks] = useState([]);

  useEffect(() => {
    // Filter attacks based on threat level
    let filteredAttacks = attacks;
    if (threatFilter !== 'all') {
      filteredAttacks = attacks.filter(attack => attack.threatLevel === threatFilter);
    }

    // Keep only recent attacks (last 5 minutes)
    const now = Date.now();
    const recentAttacks = filteredAttacks.filter(attack => {
      const attackTime = new Date(attack.timestamp).getTime();
      return (now - attackTime) < 5 * 60 * 1000; // 5 minutes
    });

    // Limit attacks on mobile for better performance
    const maxAttacks = isMobile ? 20 : 50;
    setActiveAttacks(recentAttacks.slice(0, maxAttacks));
  }, [attacks, threatFilter, isMobile]);

  return (
    <GlobeContainer>
      <Canvas
        camera={{ position: [0, 0, isMobile ? 6 : 8], fov: isMobile ? 60 : 45 }}
        style={{ background: 'transparent' }}
        performance={{ min: 0.1 }}
        dpr={isMobile ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio}
      >
        {/* Natural Earth lighting setup */}
        <ambientLight intensity={0.4} color="#ffffff" />
        <directionalLight 
          position={[5, 3, 5]} 
          intensity={1.2} 
          color="#ffffff"
          castShadow={!isMobile}
        />
        <directionalLight 
          position={[-3, 2, -4]} 
          intensity={0.3} 
          color="#87ceeb"
        />
        <pointLight position={[10, 10, 10]} intensity={0.2} color="#ffffff" />
        {!isMobile && <pointLight position={[-10, -10, -10]} intensity={0.1} color="#4169e1" />}

        {/* Realistic space background stars */}
        <Stars 
          radius={500} 
          depth={100} 
          count={isMobile ? 8000 : 20000} 
          factor={4}
          saturation={0.1}
          fade={true}
          speed={0.3}
        />

        {/* Realistic Earth with attack points rotating together */}
        <Earth isMobile={isMobile}>
          {/* Attack visualization - now inside Earth so it rotates with the globe */}
          {!isPaused && activeAttacks.map((attack, index) => {
            // Handle both coordinate formats: direct lat/lng or nested coordinates
            const sourceLat = attack.source?.coordinates?.lat || attack.source?.lat;
            const sourceLng = attack.source?.coordinates?.lng || attack.source?.lng;
            const targetLat = attack.target?.coordinates?.lat || attack.target?.lat;
            const targetLng = attack.target?.coordinates?.lng || attack.target?.lng;

            if (!sourceLat || !sourceLng || !targetLat || !targetLng) {
              console.log('Missing coordinates for attack:', attack);
              return null;
            }

            const sourcePos = latLngToVector3(sourceLat, sourceLng);
            const targetPos = latLngToVector3(targetLat, targetLng);

            return (
              <group key={attack.id || index}>
                {/* Source point */}
                <AttackPoint
                  position={sourcePos}
                  type="source"
                  threatLevel={attack.threatLevel}
                  isMobile={isMobile}
                />
                
                {/* Target point */}
                <AttackPoint
                  position={targetPos}
                  type="target"
                  threatLevel={attack.threatLevel}
                  isMobile={isMobile}
                />
                
                {/* Attack line */}
                <AttackLine
                  start={sourcePos}
                  end={targetPos}
                  threatLevel={attack.threatLevel}
                  animationSpeed={animationSpeed}
                  attackData={attack}
                  isMobile={isMobile}
                />
              </group>
            );
          })}
        </Earth>

        {/* Orbit controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          zoomSpeed={isMobile ? 1.2 : 0.6}
          rotateSpeed={isMobile ? 1.0 : 0.5}
          minDistance={isMobile ? 2.5 : 3}
          maxDistance={isMobile ? 12 : 15}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
          }}
        />
      </Canvas>
    </GlobeContainer>
  );
}

export default Globe;
