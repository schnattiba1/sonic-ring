import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { AudioListener, AudioLoader, PositionalAudio } from "three";

// Scene
const scene = new THREE.Scene();

// Camera
// A perspective camera simulates the way the human eye sees the world
const camera = new THREE.PerspectiveCamera(
  75, // how wide you can see (like a wide angle lens)
  window.innerWidth / window.innerHeight, // shape of the screen (so things aren't stretched)
  0.1, // how close objects can be before disappearing
  1000, // how far objects can be before disappearing
);
camera.position.z = 205; // move the camera back so we can see the scene

// Renderer
// Drawing the scene onto the screen
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Load HDR environment map
const hdrLoader = new HDRLoader();
hdrLoader.load(
  "./static/textures/environmentMap/rolling_hills_2k.hdr",
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;

    scene.background = texture; // sets the skybox
    scene.environment = texture; // applies lighting/reflections to objects
  },
);
// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Torus and Material
const geometry = new THREE.TorusGeometry(10, 2, 16, 100);
const material = new THREE.MeshStandardMaterial({
  color: 0xffd700,
  metalness: 1,
  roughness: 0,
});
const torus = new THREE.Mesh(geometry, material);

// Multiple Torus in a grid
const torusGroup = new THREE.Group();
const gridSize = 5;
const spacing = 35;

// looping through x
for (let i = 0; i < gridSize; i++) {
  // looping through y
  for (let j = 0; j < gridSize; j++) {
    const torusClone = torus.clone();
    torusClone.position.set(
      (i - gridSize / 2) * spacing, // x position
      (j - gridSize / 2) * spacing, // y position
      0, // z position
    );
    torusGroup.add(torusClone);
  }
}

torusGroup.position.set(0, 0, 0);

scene.add(torusGroup);

// Adding the audio listener to the camera so we can hear sounds in the scene
const listener = new AudioListener();
camera.add(listener);

// Create a positional audio source and load a sound file
const sound = new PositionalAudio(listener);
const audioLoader = new AudioLoader();

audioLoader.load("./static/audio/greenhill-zone.mp3", (buffer) => {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(10);

  // Play the sound once the user interacts with the page (e.g., clicks anywhere)
  const playSound = () => {
    if (!sound.isPlaying) {
      sound.play();
    }
    // Remove the event listener after the sound starts playing
    window.removeEventListener("click", playSound);
  };

  window.addEventListener("click", playSound);
});

// Attach the sound to the torus group so it moves with the tori
torusGroup.add(sound);

// Animation loop
// Updates the scene and renders it on every frame
function animate() {
  requestAnimationFrame(animate);
  // Rotate each torus in the group
  torusGroup.children.forEach((torus) => {
    torus.rotation.y += 0.05;
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();
