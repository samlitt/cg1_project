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

const basicShadingProgram = await createProgram(gl, './shader/basic_shading')
const faucet = await createObject(gl, basicShadingProgram, './assets/faucet.obj')

const light = createLight(gl, basicShadingProgram, [1.0, 1.0, 1.0, 0.0], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0])
light.apply()

const material = createMaterial(gl, basicShadingProgram, [0.0, 0.0, 0.0], [0.17, 0.01, 0.01], [0.61, 0.40, 0.40], [0.73, 0.63, 0.63], 5)

camera.configure([0.0, 2.0, -8.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], toRadian(45), canvas.width / canvas.height)
camera.apply(basicShadingProgram)

const worldMatrix = new Float32Array(16)
mat4.identity(worldMatrix)

faucet.material = material
faucet.worldMatrix = worldMatrix

let rotation = 0
const rotationFactor = Math.PI / 512
function render() {
	rotation += rotationFactor

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	mat4.rotate(worldMatrix, worldMatrix, rotationFactor, [0.0, 1.0, 0.0])

	faucet.draw(camera)

	requestAnimationFrame(render)
}

requestAnimationFrame(render)
