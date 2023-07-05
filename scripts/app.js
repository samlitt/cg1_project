'use strict'

import { loadImage, loadVideo } from "./load.js";
import { createMainScene } from "./main_scene.js";
import { mat3, mat4, toRadian, vec3 } from "./matrix.js";

import {
	createCamera,
	createContext,
	createLight,
	createLightGroup,
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

const ext = gl.getExtension("WEBGL_draw_buffers");

const mainScene = await createMainScene(gl, canvas)
const quadScene = await createQuadScene(gl)

const textureWidth = canvas.width
const textureHeight = canvas.height

const sceneTexture = gl.createTexture()
gl.bindTexture(gl.TEXTURE_2D, sceneTexture)

gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureWidth, textureHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

const brightnessTexture = gl.createTexture()
gl.bindTexture(gl.TEXTURE_2D, brightnessTexture)

gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureWidth, textureHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

const frameBuffer = gl.createFramebuffer()
gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
gl.framebufferTexture2D(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT0_WEBGL, gl.TEXTURE_2D, sceneTexture, 0)
gl.framebufferTexture2D(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT1_WEBGL, gl.TEXTURE_2D, brightnessTexture, 0)

ext.drawBuffersWEBGL([
	ext.COLOR_ATTACHMENT0_WEBGL, // gl_FragData[0]
	ext.COLOR_ATTACHMENT1_WEBGL, // gl_FragData[1]
]);

const depthBuffer = gl.createRenderbuffer()
gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)

gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, textureWidth, textureHeight)
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer)

gl.bindTexture(gl.TEXTURE_2D, null)
gl.bindFramebuffer(gl.FRAMEBUFFER, null)
gl.bindRenderbuffer(gl.RENDERBUFFER, null)

function render() {

	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
	gl.viewport(0, 0, textureWidth, textureHeight)

	mainScene.render()

	gl.bindFramebuffer(gl.FRAMEBUFFER, null)
	gl.viewport(0, 0, canvas.width, canvas.height)
	gl.activeTexture(gl.TEXTURE31)
	gl.bindTexture(gl.TEXTURE_2D, brightnessTexture)

	quadScene.render()

	gl.bindTexture(gl.TEXTURE_2D, null)

	requestAnimationFrame(render)
}

requestAnimationFrame(render)

/**
 * @param {WebGLRenderingContext} gl 
 */
async function createQuadScene(gl) {
	const program = await createProgram(gl, './shader/final')

	const textureUniformLocation = gl.getUniformLocation(program, 'u_sceneSampler')
	gl.useProgram(program)
	gl.uniform1i(textureUniformLocation, 31)
	gl.useProgram(null)

	const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
	const texCoordsAttributeLocation = gl.getAttribLocation(program, 'a_texCoords')

	const vertices = [
		// X, Y, Z, 		U, V,
		-1.0, 1.0, 0.0, 0.0, 1.0,
		-1.0, -1.0, 0.0, 0.0, 0.0,
		1.0, 1.0, 0.0, 1.0, 1.0,
		1.0, -1.0, 0.0, 1.0, 0.0
	]
	const vbo = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
	gl.bindBuffer(gl.ARRAY_BUFFER, null)

	function render() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		gl.bindBuffer(gl.ARRAY_BUFFER, vbo)

		gl.vertexAttribPointer(
			positionAttributeLocation,
			3,
			gl.FLOAT,
			gl.FALSE,
			5 * Float32Array.BYTES_PER_ELEMENT,
			0 * Float32Array.BYTES_PER_ELEMENT
		)

		gl.vertexAttribPointer(
			texCoordsAttributeLocation,
			2,
			gl.FLOAT,
			gl.FALSE,
			5 * Float32Array.BYTES_PER_ELEMENT,
			3 * Float32Array.BYTES_PER_ELEMENT
		)

		gl.enableVertexAttribArray(positionAttributeLocation)
		gl.enableVertexAttribArray(texCoordsAttributeLocation)

		gl.useProgram(program)

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / 5)

		gl.bindBuffer(gl.ARRAY_BUFFER, null)
		gl.disableVertexAttribArray(positionAttributeLocation)
		gl.disableVertexAttribArray(texCoordsAttributeLocation)
		gl.useProgram(null)
	}

	return {
		render
	}
}