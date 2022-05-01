import * as THREE from 'three';
import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls';
import {
  EffectComposer
} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {
  RenderPass
} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {
  UnrealBloomPass
} from 'three/examples/jsm/postprocessing/UnrealBloomPass'

const params = {
  bloomStrength: 0.78,
  bloomThreshold: 0.07,
  bloomRadius: 0
};

// Shaders from: https://github.com/dataarts/webgl-globe/blob/8d746a3dbf95e57ec3c6c2c6effe920c95135253/globe/globe.js
var Shaders = {
  'atmosphere': {
    uniforms: {},
    vertexShader: [
      'varying vec3 vNormal;',
      'void main() {',
      'vNormal = normalize( normalMatrix * normal );',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
      '}'
    ].join('\n'),
    fragmentShader: [
      'varying vec3 vNormal;',
      'void main() {',
      'float intensity = pow( 0.35 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 5.5 );',
      'gl_FragColor = vec4( 0.2509,	0.7059, 0.8784, 0.9 ) * intensity;',
      '}'
    ].join('\n')
  },
	'moon': {
		uniforms: {},
		vertexShader: [
      'varying vec3 vNormal;',
      'void main() {',
      'vNormal = normalize( normalMatrix * normal );',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
      '}'
    ].join('\n'),
    fragmentShader: [
      'varying vec3 vNormal;',
      'void main() {',
      'float intensity = pow( 0.4 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 10.0 );',
      'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
      '}'
    ].join('\n')
	}
};

// initial three.js setup
const scene = new THREE.Scene();

const fov = 75;
const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
const cameraRadius = 36;
camera.position.set(Math.sin(0) * cameraRadius, 13.1, -Math.sin(Math.PI/2) * cameraRadius);


const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#mc"),
  antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0.4, 0.85);
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

composer.addPass(bloomPass);

// these functions will be called on each gameTick, they must have the form
// (delta - change in time)
var updateFunctions = [];


// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);


// lighting setup

const ambientLight = new THREE.AmbientLight(0x404040, 0.27);
scene.add(ambientLight);

var lights = [];

// EFFECTS: Adds a pointLight to the scene, along with its corresponding
// lightHelper.
function addLight(x, y, z) {
  const pointLight = new THREE.PointLight(0xAAAAAA, 1, 300);
  pointLight.position.set(x, y, z);
  pointLight.power = 15;

  scene.add(pointLight);

  lights.push(pointLight);
  // const lightHelper = new THREE.PointLightHelper(pointLight);
  // scene.add(lightHelper);

  var lx = x;
  var ly = y;
  var lz = z;

  var timeLight = 0;
  var timeLightScale = 0.5;
  updateFunctions.push(function(deltaTime) {

    pointLight.position.x = mx + (85 * Math.sin(timeMoon * timeLightScale) - Math.PI / 2);
    pointLight.position.z = mz + (-85 * Math.sin((timeMoon * timeLightScale) + Math.PI / 2));
    pointLight.position.y = my + (20 * Math.sin((timeMoon * timeLightScale) - Math.PI / 2));

    timeLight += deltaTime;
  });
}

addLight(camera.position.x + 1, camera.position.y + 1, camera.position.z + 1);

// grid helper
// const gridHelper = new THREE.GridHelper(100, 50);
// scene.add(gridHelper);


const numStars = 120;
const starSpread = 150; // distance from origin-components that stars could be

// EFFECTS: Adds a new star at a random position
function addStar() {
  var radius = Math.random() * 0.15 + 0.05;

  const sg = new THREE.SphereGeometry(0.15, 24, 24);
  const material = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF
  });
  const star = new THREE.Mesh(sg, material);
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(starSpread));
  star.position.set(x, y, z);
  scene.add(star);
}

Array(numStars).fill().forEach(() => {
  addStar();
});

const spaceTexture = new THREE.TextureLoader().load('img/background.jpg');

const spaceGeometry = new THREE.SphereGeometry(150, 32, 32);

const spaceMaterial = new THREE.MeshStandardMaterial({
  map: spaceTexture,
  side: THREE.BackSide,
  transparent: true
})

const space = new THREE.Mesh(spaceGeometry, spaceMaterial);

scene.add(space);

// initialize moon

const moonTexture = new THREE.TextureLoader().load('img/moon.jpg');
const moonMap = new THREE.TextureLoader().load('img/normal.jpg');
const moonGeometry = new THREE.SphereGeometry(1, 32, 32);

const moon = new THREE.Mesh(
  moonGeometry,
	new THREE.MeshStandardMaterial({
		map: moonTexture,
		normalMap: moonMap
	})
);

var moonOrbitDistance = 20;

var mx = 0;
var my = 0;
var mz = 0;

moon.position.x = mx;
moon.position.y = my;
moon.position.z = mz;

scene.add(moon);

const moonGlowGeometry = new THREE.SphereGeometry(1.05, 32, 32);
const moonGlowMaterial = new THREE.ShaderMaterial({
	uniforms: Shaders.moon.uniforms,
	vertexShader: Shaders.moon.vertexShader,
	fragmentShader: Shaders.moon.fragmentShader,
	side: THREE.BackSide,
	blending: THREE.AdditiveBlending,
	transparent: true
});
const moonGlow = new THREE.Mesh(
	moonGlowGeometry,
	moonGlowMaterial
);

scene.add(moonGlow);

moonGlow.position.x = mx;
moonGlow.position.y = my;
moonGlow.position.z = mz;

var timeMoon = 0; // time in seconds for handling orbits
var timeMoonScale = 0.05;

updateFunctions.push(function(deltaTime) {
  // orbit around earth

  moon.position.x = mx + (moonOrbitDistance * Math.sin(timeMoon * timeMoonScale) - Math.PI / 2);
  moon.position.z = mz + (moonOrbitDistance * Math.sin((timeMoon * timeMoonScale) + Math.PI / 2));
  moon.position.y = my + (10 * Math.sin((timeMoon * timeMoonScale) - Math.PI / 2));

	moonGlow.position.x = mx + (moonOrbitDistance * Math.sin(timeMoon * timeMoonScale) - Math.PI / 2);
	moonGlow.position.z = mz + (moonOrbitDistance * Math.sin((timeMoon * timeMoonScale) + Math.PI / 2));
	moonGlow.position.y = my + (10 * Math.sin((timeMoon * timeMoonScale) - Math.PI / 2));

  timeMoon += deltaTime;

  moon.rotation.y += 1 / 4 * deltaTime;
})


// initialize the earth, source: https://riptutorial.com/three-js/example/28900/creating-a-model-earth

const earthTexture = new THREE.ImageUtils.loadTexture('img/earth.jpg');

// bump map gives the illusion of depth to the earth's surface
const earthBumpMap = new THREE.ImageUtils.loadTexture('img/earth-bump.jpg');

// changes the light reflection behaviour of the earth
const earthSpecularMap = new THREE.ImageUtils.loadTexture('img/earth-specular.jpg');
const earthCloudMap = new THREE.ImageUtils.loadTexture('img/earth-clouds.jpg');

const earthRadius = 4;
const earthGeometry = new THREE.SphereGeometry(earthRadius, 32, 32);
const earthMaterial = new THREE.MeshStandardMaterial({
  map: earthTexture,
  bumpMap: earthBumpMap,
  bumpScale: 0.25,
  roughness: 3
});

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.rotateX(0.40); // roughly 23 degrees in radians

scene.add(earth);

// Clouds for the earth;
const cloudTexture = new THREE.ImageUtils.loadTexture('img/earth-clouds-colored.jpg');
const cloudGeometry = new THREE.SphereGeometry(earthRadius + 0.05, 32, 32);
const cloudMaterial = new THREE.MeshPhongMaterial({
  map: cloudTexture,
  side: THREE.DoubleSide,
  opacity: 0.2,
  transparent: true,
  depthWrite: false
});
var cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(cloud);

// updaters for earth and the clouds

updateFunctions.push(function(deltaTime) {
  cloud.rotation.y += 1 / 4 * deltaTime;
  earth.rotation.y += 1 / 8 * deltaTime;
});

// Atmosphere for earth
const atmosphereColor = new THREE.Color("#48b4e0");
const atmosphereGeometry = new THREE.SphereGeometry(earthRadius + 2, 32, 32);
// const atmosphereMaterial = new THREE.MeshBasicMaterial({
//   color: atmosphereColor,
//   opacity: 0.02,
//   transparent: true
// });
//
const atmosphereMaterial = new THREE.ShaderMaterial( {

	uniforms: Shaders.atmosphere.uniforms,
	vertexShader: Shaders.atmosphere.vertexShader,
	fragmentShader: Shaders.atmosphere.fragmentShader,
	side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  transparent: true

} );

const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
atmosphere.position.set(0, 0, 0);
scene.add(atmosphere);




// Event listeners:

function moveCamera() {


  const t = document.body.getBoundingClientRect().top / 500;
  moon.rotation.x += 0.05;
  moon.rotation.y += 0.05;
  moon.rotation.z += 0.05;


	var damping = Math.pow(Math.E, t/5); // t is negative as you scroll down
	var x = Math.sin(t) * cameraRadius * damping;
	var z = - Math.sin(t + (Math.PI/2)) * cameraRadius * damping;
  camera.position.x = x;
  camera.position.z = z;

  // camera.posiiton.y = t * -0.01;
}

document.body.onscroll = moveCamera;

function resizeHandler() {
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
	finalComposer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", resizeHandler);


var lastTime = new Date().getTime();

/***
 * updates
 * @param deltaTime - in miliseconds
 */
function update(deltaTime) {
  if (Number.isNaN(deltaTime)) return;

  deltaTime /= 1000;

  // potentially variable updates
  for (var i = 0; i < updateFunctions.length; i++) {
    updateFunctions[i](deltaTime);
  }

  // Necessary updates
  controls.update();

  composer.render(scene, camera);


}

function loop(currTime) {
  var deltaTime = currTime - lastTime;

  update(deltaTime);

  lastTime = currTime;
  requestAnimationFrame(loop);
}

loop();
