import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import styled from 'styled-components';
import { useAttacks } from '../context/AttackContext';
import AttackLine from './AttackLine';

const GlobeContainer = styled.div`
  flex: 1;
  position: relative;
  background: linear-gradient(45deg, #000000, #0a0a0a);
`;

// Earth component
function Earth({ isMobile }) {
  const earthRef = useRef();
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002; // Slow rotation
    }
  });

  const segments = isMobile ? 32 : 64;
  const wireframeSegments = isMobile ? 16 : 32;

  return (
    <mesh ref={earthRef}>
      <sphereGeometry args={[2, segments, segments]} />
      <meshPhongMaterial
        color="#0066cc"
        transparent
        opacity={0.8}
        wireframe={false}
      />
      {/* Wireframe overlay for that tech look */}
      <mesh>
        <sphereGeometry args={[2.01, wireframeSegments, wireframeSegments]} />
        <meshBasicMaterial
          color="#00ff41"
          wireframe
          transparent
          opacity={isMobile ? 0.05 : 0.1}
        />
      </mesh>
    </mesh>
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

// Attack point marker
function AttackPoint({ position, type, threatLevel, isMobile }) {
  const pointRef = useRef();
  const [hovered, setHovered] = useState(false);

  const color = threatLevel === 'high' ? '#ff4444' : 
                threatLevel === 'medium' ? '#ffaa44' : '#44ff44';

  useFrame(() => {
    if (pointRef.current) {
      pointRef.current.scale.setScalar(hovered ? 1.5 : 1);
    }
  });

  const segments = isMobile ? 6 : 8;
  const size = isMobile ? 0.015 : 0.02;

  return (
    <mesh
      ref={pointRef}
      position={position}
      onPointerOver={() => !isMobile && setHovered(true)}
      onPointerOut={() => !isMobile && setHovered(false)}
    >
      <sphereGeometry args={[size, segments, segments]} />
      <meshBasicMaterial color={color} />
    </mesh>
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
        {/* Lighting - simplified for mobile */}
        <ambientLight intensity={isMobile ? 0.4 : 0.3} />
        <pointLight position={[10, 10, 10]} intensity={isMobile ? 0.8 : 1} />
        {!isMobile && <pointLight position={[-10, -10, -10]} intensity={0.5} />}

        {/* Background stars - reduced on mobile */}
        <Stars 
          radius={300} 
          depth={60} 
          count={isMobile ? 5000 : 20000} 
          factor={7} 
        />

        {/* Earth */}
        <Earth isMobile={isMobile} />

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

        {/* Attack visualization */}
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
      </Canvas>
    </GlobeContainer>
  );
}

export default Globe;
