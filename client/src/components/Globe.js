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
  background: linear-gradient(45deg, #0a0a0a, #1a1a1a, #0f0f0f);
`;

// Enhanced Earth component with realistic textures
function Earth({ isMobile, children }) {
  const earthGroupRef = useRef(); // Reference to the entire Earth group
  const atmosphereRef = useRef();
  
  // Load stylized Earth textures - monochromatic with raised continents
  const earthTexture = useMemo(() => {
    const loader = new TextureLoader();
    // Using a clean topographical map for continent definition
    const texture = loader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  const displacementTexture = useMemo(() => {
    const loader = new TextureLoader();
    // Height map to make continents raised
    const texture = loader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

    // Create enhanced texture with better continent/ocean contrast
    const simpleTexture = useMemo(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const context = canvas.getContext('2d');
      
      // Create stronger gradient for better continent definition
      const gradient = context.createLinearGradient(0, 0, 0, 256);
      gradient.addColorStop(0, '#0a0a0a');    // Very dark ocean
      gradient.addColorStop(0.2, '#1a1a1a');  // Deep ocean
      gradient.addColorStop(0.5, '#2a2a2a');  // Shallow ocean/coast
      gradient.addColorStop(0.7, '#4a4a4a');  // Continental shelf
      gradient.addColorStop(1, '#6a6a6a');    // High elevation land
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 512, 256);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
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
      {/* Main Earth sphere with prominent continents */}
      <mesh>
        <sphereGeometry args={[2, segments, segments]} />
        <meshPhongMaterial
          map={simpleTexture}
          displacementMap={earthTexture}
          displacementScale={0.25}  // Much stronger continent elevation
          bumpMap={displacementTexture}
          bumpScale={0.15}  // Enhanced bump mapping
          shininess={5}
          color="#4a4a4a"  // Lighter base to show details better
          transparent={false}
        />
      </mesh>

      {/* Subtle atmospheric glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.02, 32, 32]} />
        <meshBasicMaterial
          color="#666666"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Subtle wireframe overlay - reduced opacity to show continents */}
      <mesh>
        <sphereGeometry args={[2.008, isMobile ? 24 : 48, isMobile ? 24 : 48]} />
        <meshBasicMaterial
          color="#00ff88"
          wireframe
          transparent
          opacity={isMobile ? 0.02 : 0.03}  // Much more subtle
        />
      </mesh>

      {/* Enhanced continent outline effect for better country visibility */}
      <mesh>
        <sphereGeometry args={[2.003, segments, segments]} />
        <meshBasicMaterial
          map={earthTexture}
          transparent
          opacity={0.4}  // More visible
          color="#bbbbbb"  // Lighter color for better contrast
          blending={THREE.AdditiveBlending}  // Better blending mode
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
        {/* Clean, neutral lighting for dark aesthetic */}
        <ambientLight intensity={0.4} color="#ffffff" />
        <directionalLight 
          position={[5, 3, 5]} 
          intensity={1.0} 
          color="#ffffff"
          castShadow={!isMobile}
        />
        <directionalLight 
          position={[-3, 2, -4]} 
          intensity={0.6} 
          color="#f0f0f0"
        />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#ffffff" />
        {!isMobile && <pointLight position={[-10, -10, -10]} intensity={0.3} color="#e0e0e0" />}

        {/* Enhanced background stars with neutral colors */}
        <Stars 
          radius={400} 
          depth={100} 
          count={isMobile ? 8000 : 30000} 
          factor={5}
          saturation={0.1}
          fade={true}
        />

        {/* Realistic Earth with attack points rotating together */}
        <Earth isMobile={isMobile}>
          {/* Attack visualization - now inside Earth so it rotates with the globe */}
          {!isPaused && activeAttacks.map((attack, index) => {
            if (!attack.source?.coordinates || !attack.target?.coordinates) {
              return null;
            }

            const sourcePos = latLngToVector3(
              attack.source.coordinates.lat,
              attack.source.coordinates.lng
            );
            const targetPos = latLngToVector3(
              attack.target.coordinates.lat,
              attack.target.coordinates.lng
            );

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
