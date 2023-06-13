'use strict'

import { mat3, mat4, toRadian, vec3 } from "./matrix.js";
import { createCamera, createContext, createLight, createMaterial, createObject, createProgram, createSkyboxSphere } from "./utils.js";

const { gl, canvas } = createContext('canvas')

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

// Objects

const faucet = await createObject(gl, sphereMappingProgram, './assets/faucet.obj')
const skybox = await createSkyboxSphere(gl, skyboxProgram, './assets/skybox.obj', '/assets/skybox.jpg')
skybox.texture.load(sphereMappingProgram, 'u_skybox')

// Lights

const light = createLight(gl, basicShadingProgram, [1.0, 1.0, 1.0, 0.0], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0])
light.apply()

// Materials

const material = createMaterial(gl, basicShadingProgram, [0.0, 0.0, 0.0], [0.17, 0.01, 0.01], [0.61, 0.40, 0.40], [0.73, 0.63, 0.63], 5)
// faucet.material = material

// Camera

const camera = createCamera(gl)

camera.configure([0.0, 2.0, -5.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], toRadian(45), canvas.height / canvas.width)
camera.apply(basicShadingProgram)
camera.apply(sphereMappingProgram)
camera.apply(skyboxProgram)

// Variables

const inverseViewMatrix = new Float32Array(9)
const camDir = new Float32Array(3)

// Render Loop

let rotation = 0
const rotationFactor = Math.PI / 512
function render() {
	rotation += rotationFactor

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	// -- Camera

	// TODO: don't apply the rotation everytime to the view matrix, 
	// because it will lead to numeral errors
	mat4.rotate(camera.viewMatrix, camera.viewMatrix, rotationFactor, [0, 1, 0]) 
	camera.apply(basicShadingProgram)
	camera.apply(sphereMappingProgram)
	camera.apply(skyboxProgram)

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

	faucet.draw(camera)

	requestAnimationFrame(render)
}

requestAnimationFrame(render)
