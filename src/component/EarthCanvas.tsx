// components/EarthCanvas.tsx
"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Location } from "@/types/location";

// --- Helper function to convert lat/lon to 3D coordinates ---
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

// Define props for the component
type EarthCanvasProps = {
    onMarkerClick: (location: Location) => void;
};

const EarthCanvas = ({ onMarkerClick }: EarthCanvasProps) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Capture the mount point. It's safer to use a variable.
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // --- Scene, Camera, and Renderer ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // --- Textures ---
    const textureLoader = new THREE.TextureLoader();
    const earthDayMap = textureLoader.load("/textures/8k_earth_daymap.jpg");
    const earthNormalMap = textureLoader.load("/textures/8k_earth_normal_map.jpg");
    const starMap = textureLoader.load("/textures/8k_stars.jpg");

    // --- Meshes and Materials ---
    const EARTH_RADIUS = 6;
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthDayMap,
      normalMap: earthNormalMap,
      metalness: 0.4,
      roughness: 0.7,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    // --- Location Markers ---
    const locations: Location[] = [
      { name: "Hazaribagh, India", lat: 23.99, lon: 85.36  , servername: "HazaribaghServer" , organizationName: "Hazaribagh Organization" },
      { name: "New York, USA", lat: 40.71, lon: -74.0 , servername: "NewYorkServer" , organizationName: "New York Organization" },
      { name: "Tokyo, Japan", lat: 35.68, lon: 139.69 , servername: "TokyoServer" , organizationName: "Tokyo Organization" },
      { name: "Sydney, Australia", lat: -33.86, lon: 151.2 , servername: "SydneyServer" , organizationName: "Sydney Organization" },
      { name: "London, UK", lat: 51.5, lon: -0.12 , servername: "LondonServer" , organizationName: "London Organization" },
    ];
    const markerGeometry = new THREE.SphereGeometry(0.07, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const markers: THREE.Mesh[] = []; // Array to hold markers for raycasting

    locations.forEach((location) => {
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      const position = latLonToVector3(location.lat, location.lon, EARTH_RADIUS);
      marker.position.copy(position);
      marker.userData = location; // Attach location data to the marker object
      earthMesh.add(marker);
      markers.push(marker); // Add marker to the array
    });

    // --- Stars Background ---
    const starGeometry = new THREE.SphereGeometry(400, 64, 64);
    const starMaterial = new THREE.MeshStandardMaterial({
      map: starMap,
      side: THREE.BackSide,
    });
    const starMesh = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(starMesh);

    // --- Balanced Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 2.0);
    pointLight.position.set(10, 5, 15);
    scene.add(pointLight);

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;
    
    // --- ZOOM FIX ---
    controls.enableZoom = true; // Ensure zoom is enabled
    controls.minDistance = 8;   // Set a minimum zoom distance (just outside the Earth)
    controls.maxDistance = 50;  // Set a maximum zoom distance

    // --- Raycasting for Click Detection ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(markers);

        if (intersects.length > 0) {
            const clickedMarker = intersects[0].object;
            if (clickedMarker.userData) {
                onMarkerClick(clickedMarker.userData as Location);
            }
        }
    };
    
    renderer.domElement.addEventListener('click', handleCanvasClick);

    // --- Responsive Canvas with ResizeObserver ---
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(currentMount);

    // --- Animation Loop ---
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update(); // Still needed for damping and zoom to work
      renderer.render(scene, camera);
    };
    animate();

    // --- Cleanup Function ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      currentMount.removeChild(renderer.domElement);

      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      earthDayMap.dispose();
      earthNormalMap.dispose();
      starMap.dispose();
      renderer.dispose();
    };
  }, [onMarkerClick]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};

export default EarthCanvas;
