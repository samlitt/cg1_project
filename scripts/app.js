'use strict'

import { createMainScene } from "./main_scene.js";

import {
	createContext,
	createProgram
} from "./utils.js";

const { gl, canvas } = createContext('canvas');

gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.frontFace(gl.CCW);
gl.cullFace(gl.BACK);
gl.clearColor(0.8, 0.8, 0.8, 1.0);

const ext = gl.getExtension("WEBGL_draw_buffers");

const width = canvas.width;
const height = canvas.height;

const mainScene = await createMainScene(gl, width, height);
const blurScene = await createBlurScene(gl);
const finalScene = await createFinalScene(gl);

const sceneTexture = gl.createTexture()
gl.bindTexture(gl.TEXTURE_2D, sceneTexture)

gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

const brightnessTexture = gl.createTexture()
gl.bindTexture(gl.TEXTURE_2D, brightnessTexture)

gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

const framebuffer = gl.createFramebuffer()
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
gl.framebufferTexture2D(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT0_WEBGL, gl.TEXTURE_2D, sceneTexture, 0)
gl.framebufferTexture2D(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT1_WEBGL, gl.TEXTURE_2D, brightnessTexture, 0)

ext.drawBuffersWEBGL([
	ext.COLOR_ATTACHMENT0_WEBGL, // gl_FragData[0]
	ext.COLOR_ATTACHMENT1_WEBGL, // gl_FragData[1]
]);

const depthBuffer = gl.createRenderbuffer()
gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)

gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer)

gl.bindTexture(gl.TEXTURE_2D, null)
gl.bindFramebuffer(gl.FRAMEBUFFER, null)
gl.bindRenderbuffer(gl.RENDERBUFFER, null)

let blurredTexture

function render() {

	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)

	mainScene.render()

	blurredTexture = blurScene.blur(brightnessTexture)

	gl.bindFramebuffer(gl.FRAMEBUFFER, null)

	gl.activeTexture(gl.TEXTURE31)
	gl.bindTexture(gl.TEXTURE_2D, sceneTexture)

	gl.activeTexture(gl.TEXTURE30)
	gl.bindTexture(gl.TEXTURE_2D, blurredTexture)

	finalScene.render()

	gl.bindTexture(gl.TEXTURE_2D, null)

	requestAnimationFrame(render)
}

requestAnimationFrame(render)

/**
 * @param {WebGLRenderingContext} gl
 */
async function createBlurScene(gl) {

	const framebuffer1 = gl.createFramebuffer()
	const framebuffer2 = gl.createFramebuffer()

	const texture1 = gl.createTexture()
	const texture2 = gl.createTexture()

	const setupBuffer = (framebuffer, texture) => {
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
	}

	setupBuffer(framebuffer1, texture1)
	setupBuffer(framebuffer2, texture2)

	const program = await createProgram(gl, './shader/bloom')
	const horizontalUniformLocation = gl.getUniformLocation(program, 'u_horizontal')
	const sizeUniformLocation = gl.getUniformLocation(program, 'u_size')

	gl.useProgram(program)
	gl.uniform2f(sizeUniformLocation, width, height)
	gl.useProgram(null)

	const quad = createQuad(gl, program)

	function blur(originalTexture) {
		gl.activeTexture(gl.TEXTURE0)

		let horizontal = true
		for (let i = 0; i < 10; i++) {
			gl.useProgram(program)

			gl.bindFramebuffer(gl.FRAMEBUFFER, horizontal ? framebuffer1 : framebuffer2)
			gl.bindTexture(gl.TEXTURE_2D, i === 0 ? originalTexture : horizontal ? texture2 : texture1)
			gl.uniform1i(horizontalUniformLocation, horizontal);

			quad.draw()

			horizontal = !horizontal
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, null)
		gl.bindTexture(gl.TEXTURE_2D, null)

		gl.useProgram(null)

		return horizontal ? texture2 : texture1
	}

	return {
		blur
	}
}

/**
 * @param {WebGLRenderingContext} gl
 */
async function createFinalScene(gl) {
	const program = await createProgram(gl, './shader/final')

	const sceneTextureUniformLocation = gl.getUniformLocation(program, 'u_sceneSampler')
	const blurTextureUniformLocation = gl.getUniformLocation(program, 'u_blurSampler')

	gl.useProgram(program)
	gl.uniform1i(sceneTextureUniformLocation, 31)
	gl.uniform1i(blurTextureUniformLocation, 30)
	gl.useProgram(null)

	const quad = createQuad(gl, program)

	function render() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		quad.draw()
	}

	return {
		render
	}
}

function createQuad(gl, program) {
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

	function draw() {
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
		draw
	}
}
