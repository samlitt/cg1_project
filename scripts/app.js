'use strict'

import { loadImage } from "./load.js";
import { mat3, mat4, toRadian, vec3 } from "./matrix.js";

import {
	createCamera,
	createContext,
	createLight,
	createMaterial,
	createObject,
	createObjectWithMaterials,
	createProgram,
	createSkyboxSphere,
	createTexture
} from "./utils.js";

const { gl, canvas } = createContext('canvas');

gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.frontFace(gl.CCW);
gl.cullFace(gl.BACK);
gl.clearColor(0.8, 0.8, 0.8, 1.0);

// Programs

const basicShadingProgram = await createProgram(gl, './shader/basic_shading')
const sphereMappingProgram = await createProgram(gl, './shader/sphere_mapping')
const skyboxProgram = await createProgram(gl, './shader/skybox')
const textureShadingProgram = await createProgram(gl, "./shader/texture_shading");

// Objects

const faucet = await createObject(gl, sphereMappingProgram, './assets/faucet.obj')
const lime = await createObject(gl, textureShadingProgram, "./assets/lime.obj");
const ipad = await createObjectWithMaterials(gl, basicShadingProgram, './assets/ipad.obj', './assets/ipad.mtl')
const skybox = await createSkyboxSphere(gl, skyboxProgram, './assets/skybox.obj', '/assets/skybox.jpg')
skybox.texture.load(sphereMappingProgram, 'u_skybox')

// Lights

const light = createLight(
gl,
[0.0, 0.0, 1.0, 0.0],
[1.0, 1.0, 1.0],
[1.0, 1.0, 1.0],
[1.0, 1.0, 1.0]);
light.apply(textureShadingProgram)
light.apply(basicShadingProgram)

// Textures

let lime_texture = createTexture(gl, await loadImage("assets/lime_albedo.jpg"), 1, true, true);
lime_texture.load(textureShadingProgram, "u_sampler");

// Materials

const limeMaterial = createMaterial(
	gl,
	textureShadingProgram,
	[0.0, 0.0, 0.0], // emissive
	[0.4, 0.4, 0.4], // ambient
	[0.4, 0.4, 0.4], // diffuse
	[0.5, 0.5, 0.5], // specular
	1.0				  // shininess
);

lime.material = limeMaterial;

// Camera

const camera = createCamera(gl)

camera.configure([0.0, 2.0, -5.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], toRadian(45), canvas.width / canvas.height)
camera.apply(basicShadingProgram)
camera.apply(sphereMappingProgram)
camera.apply(skyboxProgram)
camera.apply(textureShadingProgram);

// Camera Movement

const originalViewMatrix = new Float32Array(camera.viewMatrix)

const rotationFactor = Math.PI / 256
const maxRotation = 2 * Math.PI // Quarter circle
let rotation = 0

const zoomFactor = 0.1
const maxZoom = 1
const minZoom = -6
let zoom = 0

window.addEventListener('keydown', (event) => {
	if (event.key === 'd' && rotation > -maxRotation) {
		rotation -= rotationFactor
	}

	if (event.key === 'a' && rotation < maxRotation) {
		rotation += rotationFactor
	}

	if (event.key === 'w' && zoom < maxZoom) {
		zoom += zoomFactor
	}

	if (event.key === 's' && zoom > minZoom) {
		zoom -= zoomFactor
	}
})

// Variables

const inverseViewMatrix = new Float32Array(9)
const camDir = new Float32Array(3)

const ipadWorldMatrix = new Float32Array(16)
mat4.identity(ipadWorldMatrix)
mat4.translate(ipadWorldMatrix, ipadWorldMatrix, [0, -1, 0])
mat4.scale(ipadWorldMatrix, ipadWorldMatrix, [8, 8, 8])
mat4.rotate(ipadWorldMatrix, ipadWorldMatrix, toRadian(-45), [0, 1, 0])
ipad.worldMatrix = ipadWorldMatrix

// Render Loop

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	// -- Camera

	mat4.translate(camera.viewMatrix, originalViewMatrix, [0, 0, -zoom])
	mat4.rotate(camera.viewMatrix, camera.viewMatrix, rotation, [0, 1, 0])
	camera.apply(basicShadingProgram)
	camera.apply(sphereMappingProgram)
	camera.apply(skyboxProgram)
	camera.apply(textureShadingProgram)

	// Calculate Cam Direction
	mat3.fromMat4(inverseViewMatrix, camera.viewMatrix)
	mat3.inverse(inverseViewMatrix, inverseViewMatrix)
	vec3.mulMat3(camDir, [0, 0, 1], inverseViewMatrix)

	const camDirUniformLocation = gl.getUniformLocation(sphereMappingProgram, 'u_camDir')
	gl.useProgram(sphereMappingProgram)
	gl.uniform3fv(camDirUniformLocation, camDir)
	gl.useProgram(null)

	// -- Skybox

	skybox.draw()

	// -- Faucet

	// faucet.draw(camera)

	// -- Lime

	// lime.draw(camera);

	ipad.draw(camera)

	requestAnimationFrame(render);
}

requestAnimationFrame(render)
