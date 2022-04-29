import "./style.css";
import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';

// initial three.js setup
const scene = new THREE.Scene();

const fov = 75;
const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-30, 20, 85);


const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#mc")
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

// these functions will be called on each gameTick, they must have the form
// (delta - change in time)
var updateFunctions = [];


// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);


// lighting setup



// const ambientLight = new THREE.AmbientLight(0xFFFFFF);
// scene.add(ambientLight);

var lights = [];

// EFFECTS: Adds a pointLight to the scene, along with its corresponding
// lightHelper.
function addLight(x, y, z) {
  const pointLight = new THREE.PointLight(0xFFFFFF, 2, 0);
  pointLight.position.set(x, y, z);
  pointLight.power = 20;

  scene.add(pointLight);

  lights.push(pointLight);
  const lightHelper = new THREE.PointLightHelper(pointLight);
  scene.add(lightHelper);

  var lx = x;
  var ly = y;
  var lz = z;

  var timeLight = 0;
  var timeLightScale = 0.5;
  updateFunctions.push(function(deltaTime) {

      pointLight.position.x = mx + (85 * Math.sin(timeMoon * timeLightScale) - Math.PI/2);
      pointLight.position.z = mz + (-30 * Math.sin((timeMoon * timeLightScale) + Math.PI/2));
      pointLight.position.y = my + (20 * Math.sin((timeMoon * timeLightScale) - Math.PI/2));

      timeLight += deltaTime;
  });
}

addLight(camera.position.x + 1, camera.position.y + 1, camera.position.z + 1);

// grid helper
// const gridHelper = new THREE.GridHelper(200, 50);
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

const spaceTexture = new THREE.TextureLoader().load('img/space.jpg');
scene.background = spaceTexture;

// initialize moon

const moonTexture = new THREE.TextureLoader().load('img/moon.jpg');
const moonMap = new THREE.TextureLoader().load('img/normal.jpg');
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial( {
     map: moonTexture,
     normalMap: moonMap
}));

scene.add(moon);

moon.rotateX(0.1);

var moonOrbitDistance = 50;

var mx = 0;
var my = 0;
var mz = 0;

moon.position.x = mx;
moon.position.y = my;
moon.position.z = mz;

var timeMoon = 0; // time in seconds for handling orbits
var timeMoonScale = 0.05;

updateFunctions.push(function(deltaTime) {
  // orbit around earth

  moon.position.x = mx + (moonOrbitDistance * Math.sin(timeMoon * timeMoonScale) - Math.PI/2);
  moon.position.z = mz + (moonOrbitDistance * Math.sin((timeMoon * timeMoonScale) + Math.PI/2));
  moon.position.y = my + (10 * Math.sin((timeMoon * timeMoonScale) - Math.PI/2));

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
const earthMaterial = new THREE.MeshPhongMaterial({
  map: earthTexture,
  bumpMap: earthBumpMap,
  bumpScale: 0.25,
  specularMap: earthSpecularMap,
  specular: new THREE.Color("grey")
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



function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  moon.rotation.x += 0.05;
  moon.rotation.y += 0.05;
  moon.rotation.z += 0.05;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.01;
  camera.posiiton.y = t * -0.01;
}

document.body.onscroll = moveCamera;

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
    renderer.render(scene, camera);


}

function loop(currTime) {
  var deltaTime = currTime - lastTime;

  update(deltaTime);

  lastTime = currTime;
  requestAnimationFrame(loop);
}

loop();
