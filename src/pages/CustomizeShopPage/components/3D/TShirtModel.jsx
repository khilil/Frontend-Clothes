import React, { useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function TShirtModel({ color, viewSide, instantViewSwitch = false }) {
    // Load the model from the public folder
    const { nodes, materials } = useGLTF("/t_shirt.glb");
    const groupRef = useRef();

    // 🎯 DYNAMIC COLORING
    useEffect(() => {
        if (!materials) return;

        const newColor = new THREE.Color(color);
        Object.keys(materials).forEach((key) => {
            const material = materials[key];
            if (material) {
                // Apply the color to the material's 'color' property
                material.color.set(newColor);
                material.roughness = 0.8; // Fabric is matte
                material.metalness = 0.05; // No shimmer
                material.needsUpdate = true;
            }
        });
    }, [color, materials]);

    // 🔄 NATIVE THREE.JS ROTATION ANIMATION (Instead of framer-motion-3d)
    const targetRotationY = viewSide === "front" ? 0 : Math.PI;

    useEffect(() => {
        if (instantViewSwitch && groupRef.current) {
            groupRef.current.rotation.y = targetRotationY;
        }
    }, [instantViewSwitch, targetRotationY]);

    useFrame(() => {
        if (groupRef.current) {
            if (instantViewSwitch) {
                groupRef.current.rotation.y = targetRotationY;
                return;
            }

            // Smoothly interpolate the rotation over time
            groupRef.current.rotation.y = THREE.MathUtils.lerp(
                groupRef.current.rotation.y,
                targetRotationY,
                0.1 // Stiffness
            );
        }
    });

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <group
            ref={groupRef}
            scale={isMobile ? 4.6 : 5.4} // v7.23 Zoom-Max
            position={isMobile ? [0, -6.6, 0] : [0, -7.8, 0]} // Relocated chest to viewport center
        >
            {Object.keys(nodes).map((key) => {
                const node = nodes[key];
                // Only render meshes that have valid geometry
                if (node.isMesh && node.geometry) {
                    // Try to find the material, fallback to a default if missing
                    const materialName = node.material?.name;
                    const material = (materialName && materials[materialName]) || null;

                    return (
                        <mesh
                            key={key}
                            geometry={node.geometry}
                            material={material}
                            castShadow
                            receiveShadow
                        />
                    );
                }
                return null;
            })}
        </group>
    );
}

// Preload for zero-latency loading
useGLTF.preload("/t_shirt.glb");
