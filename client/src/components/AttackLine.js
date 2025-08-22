import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function AttackLine({ start, end, threatLevel, animationSpeed = 2, attackData, isMobile }) {
  const lineRef = useRef();
  const [progress, setProgress] = useState(0);

  // Color based on threat level - made more vibrant
  const getColor = () => {
    switch (threatLevel) {
      case 'high': return '#ff1111';     // Bright red
      case 'medium': return '#ff8800';   // Bright orange  
      case 'low': return '#22ff22';      // Bright green
      default: return '#00ff88';         // Bright cyan
    }
  };

  // Create curved path between two points
  const createCurvedPath = (startPos, endPos) => {
    const distance = startPos.distanceTo(endPos);
    const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
    
    // Make the curve height proportional to distance
    const curveHeight = Math.max(distance * 0.3, 0.5);
    midPoint.normalize().multiplyScalar(2 + curveHeight);

    const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);
    return curve;
  };

  const curve = createCurvedPath(start, end);
  const points = curve.getPoints(isMobile ? 25 : 50); // Fewer points on mobile

  useFrame((state, delta) => {
    if (lineRef.current && progress < 1) {
      const newProgress = Math.min(progress + (delta * animationSpeed * 1.5), 1); // Faster animation
      setProgress(newProgress);

      // Update line geometry to show animation
      const animatedPoints = points.slice(0, Math.floor(newProgress * points.length));
      if (animatedPoints.length > 1) {
        const geometry = new THREE.BufferGeometry().setFromPoints(animatedPoints);
        lineRef.current.geometry.dispose();
        lineRef.current.geometry = geometry;
      }
    }
  });

  // Create initial geometry
  const geometry = new THREE.BufferGeometry().setFromPoints([start, start]);

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={getColor()}
        linewidth={isMobile ? 2 : 3}  // Thicker lines for better visibility
        transparent
        opacity={isMobile ? 0.8 : 0.9}  // More opaque for better visibility
      />
    </line>
  );
}

export default AttackLine;
