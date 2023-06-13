'use strict'

import { loadImage } from "./load.js";
import { mat4, toRadian } from "./matrix.js";
import { createCamera, createContext, createCube, createLight, createMaterial, createObject, createProgram, createWorldMatrix } from "./utils.js";

const { gl, canvas } = createContext('canvas')

gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.frontFace(gl.CCW);
gl.cullFace(gl.BACK);
gl.clearColor(0.8, 0.8, 0.8, 1.0);

const camera = createCamera(gl)

const teapotProgram = await createProgram(gl, './shader/teapot')
const teapot = await createObject(gl, teapotProgram, './assets/teapot.obj')

const light = createLight(gl, teapotProgram, [1.0, 1.0, 1.0, 0.0], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0])
const material = createMaterial(gl, teapotProgram, [0.0, 0.0, 0.0], [0.17, 0.01, 0.01], [0.61, 0.40, 0.40], [0.73, 0.63, 0.63], 5)

camera.configure([0.0, 2.0, -8.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 45, canvas.height / canvas.width)
camera.apply(teapotProgram)

const worldMatrix = new Float32Array(16)
mat4.identity(worldMatrix)

teapot.material = material
teapot.worldMatrix = worldMatrix

let rotation = 0
const rotationFactor = Math.PI / 512
function render() {
	rotation += rotationFactor

	gl.clearColor(0.0, 0.0, 0.0, 1.0)
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	mat4.rotate(worldMatrix, worldMatrix, rotationFactor, [0.0, 1.0, 0.0])

	light.apply()

	teapot.draw(camera)

	requestAnimationFrame(render)
}

requestAnimationFrame(render)
