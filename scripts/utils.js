import { loadShader, loadObj, loadImage } from "./load.js"
import { mat4, mat3 } from './matrix.js'

export function createContext(canvasId) {
	/** @type {HTMLCanvasElement} */
	const canvas = document.getElementById(canvasId)
	const gl = canvas.getContext('webgl')
	return { gl, canvas }
}

/**
 * @param {WebGLRenderingContext} gl
 */
export async function createProgram(gl, path) {
	const vertexShaderText = await loadShader(`${path}/vertex.glsl`);
	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexShaderText);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		throw new Error(`ERROR compiling vertex shader: ${gl.getShaderInfoLog(vertexShader)}`);
	}

	const fragmentShaderText = await loadShader(`${path}/fragment.glsl`);
	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentShaderText);
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		throw new Error(`ERROR compiling fragment shader: ${gl.getShaderInfoLog(fragmentShader)}`);
	}

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(`ERROR linking program: ${gl.getProgramInfoLog(program)}`);
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		throw new Error(`ERROR validating program: ${gl.getProgramInfoLog(program)}`);
	}

	return program
}

/**
 * @param {WebGLRenderingContext} gl
 */
export function createTexture(gl, image, textureId, createMipmap, createAnisotropy) {
	const ext =
	gl.getExtension("EXT_texture_filter_anisotropic") ||
	gl.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
	gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");

	const texture = gl.createTexture();

	update();

	gl.activeTexture(gl.TEXTURE0 + textureId);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	if (createMipmap) {
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	} else {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}

	if (createAnisotropy) {
		const max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
		gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);
	}

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.bindTexture(gl.TEXTURE_2D, null);

	function update() {
		gl.activeTexture(gl.TEXTURE0 + textureId);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	function load(program, uniform) {
		gl.activeTexture(gl.TEXTURE0 + textureId);
		gl.bindTexture(gl.TEXTURE_2D, texture);

		const samplerUniformLocation = gl.getUniformLocation(program, uniform);
		gl.useProgram(program);
		gl.uniform1i(samplerUniformLocation, textureId);
		gl.useProgram(null);
	}

	update();

	return {
		update,
		load,
	}
}

/**
 * @param {WebGLRenderingContext} gl
 */
export function createLight(gl, pos, ambient, diffuse, specular) {
	
	function apply(program) {
		const posUniformLocation = gl.getUniformLocation(program, 'u_lightPos');
		const ambientUniformLocation = gl.getUniformLocation(program, 'u_lightAmbient');
		const diffuseUniformLocation = gl.getUniformLocation(program, 'u_lightDiffuse');
		const specularUniformLocation = gl.getUniformLocation(program, 'u_lightSpecular');

		gl.useProgram(program);

		gl.uniform4fv(posUniformLocation, pos);
		gl.uniform3fv(ambientUniformLocation, ambient);
		gl.uniform3fv(diffuseUniformLocation, diffuse);
		gl.uniform3fv(specularUniformLocation, specular);

		gl.useProgram(null);
	}

	return {
		apply
	}
}

/**
 * @param {WebGLRenderingContext} gl
 */
export function createMaterial(gl, program, emission, ambient, diffuse, specular, shininess) {
	const emissionUniformLocation = gl.getUniformLocation(program, 'u_mtlEmission')
	const ambientUniformLocation = gl.getUniformLocation(program, 'u_mtlAmbient')
	const diffuseUniformLocation = gl.getUniformLocation(program, 'u_mtlDiffuse')
	const specularUniformLocation = gl.getUniformLocation(program, 'u_mtlSpecular')
	const shininessUniformLocation = gl.getUniformLocation(program, 'u_mtlShininess')

	function apply() {
		gl.useProgram(program)

		gl.uniform3fv(emissionUniformLocation, emission);
		gl.uniform3fv(ambientUniformLocation, ambient);
		gl.uniform3fv(diffuseUniformLocation, diffuse);
		gl.uniform3fv(specularUniformLocation, specular);
		gl.uniform1f(shininessUniformLocation, shininess * 4);

		gl.useProgram(null)
	}

	return {
		apply
	}
}

/**
 * @param {WebGLRenderingContext} gl
 */
export function createCamera(gl) {
	const viewMatrix = new Float32Array(16)
	const projMatrix = new Float32Array(16)

	const viewNormalMatrix = new Float32Array(9)

	function configure(eye, look, up, fovy, aspect) {
		mat4.lookAt(viewMatrix, eye, look, up)
		mat4.perspective(projMatrix, fovy, aspect, 0.1, 1000.0);
	}

	function apply(program) {
		const matViewUniformLocation = gl.getUniformLocation(program, 'u_matView')
		const matProjUniformLocation = gl.getUniformLocation(program, 'u_matProj')
		const matViewNormalUniformLocation = gl.getUniformLocation(program, 'u_matViewNormal')

		gl.useProgram(program)

		gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
		gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

		mat3.fromMat4(viewNormalMatrix, viewMatrix)
		mat3.inverseTranspose(viewNormalMatrix, viewNormalMatrix)
		gl.uniformMatrix3fv(matViewNormalUniformLocation, gl.FALSE, viewNormalMatrix)

		gl.useProgram(null)
	}

	return {
		viewMatrix,
		projMatrix,
		configure,
		apply
	}
}

/**
 * @param {WebGLRenderingContext} gl
 */
export async function createObject(gl, program, objPath) {
	const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
	const texCoordsAttributeLocation = gl.getAttribLocation(program, 'a_texCoords')
	const normalAttributeLocation = gl.getAttribLocation(program, 'a_normal')

	const matWorldUniformLocation = gl.getUniformLocation(program, 'u_matWorld')
	const matWorldNormalUniformLocation = gl.getUniformLocation(program, 'u_matWorldNormal')
	const matViewNormalUniformLocation = gl.getUniformLocation(program, 'u_matViewNormal')

	const worldMatrix = new Float32Array(16)
	mat4.identity(worldMatrix)
	const worldViewMatrix = new Float32Array(16)
	const worldNormalMatrix = new Float32Array(9)
	const viewNormalMatrix = new Float32Array(9)

	const vertices = await loadObj(objPath)

	const vbo = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
	gl.bindBuffer(gl.ARRAY_BUFFER, null)

	function draw(camera) {
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo)

		vertexAttribPointer(
			positionAttributeLocation,
			3,
			8 * Float32Array.BYTES_PER_ELEMENT,
			0 * Float32Array.BYTES_PER_ELEMENT
		)

		vertexAttribPointer(
			texCoordsAttributeLocation,
			2,
			8 * Float32Array.BYTES_PER_ELEMENT,
			3 * Float32Array.BYTES_PER_ELEMENT
		)

		vertexAttribPointer(
			normalAttributeLocation,
			3,
			8 * Float32Array.BYTES_PER_ELEMENT,
			5 * Float32Array.BYTES_PER_ELEMENT
		)

		gl.bindBuffer(gl.ARRAY_BUFFER, null)

		enableVertexAttribArray(positionAttributeLocation);
		enableVertexAttribArray(texCoordsAttributeLocation)
		enableVertexAttribArray(normalAttributeLocation);

		if (this.material) {
			this.material.apply()
		}

		gl.useProgram(program)

		if (this.worldMatrix) {
			gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, this.worldMatrix)

			mat3.fromMat4(worldNormalMatrix, this.worldMatrix)
			mat3.inverseTranspose(worldNormalMatrix, worldNormalMatrix)
			gl.uniformMatrix3fv(matWorldNormalUniformLocation, gl.FALSE, worldNormalMatrix)

			if (camera) {
				mat4.mul(worldViewMatrix, camera.viewMatrix, this.worldMatrix)
				mat3.fromMat4(viewNormalMatrix, worldViewMatrix)
				mat3.inverseTranspose(viewNormalMatrix, viewNormalMatrix)
				gl.uniformMatrix3fv(matViewNormalUniformLocation, gl.FALSE, viewNormalMatrix)
			}
		}

		gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8)

		gl.useProgram(null)

		disableVertexAttribArray(positionAttributeLocation)
		disableVertexAttribArray(texCoordsAttributeLocation)
		disableVertexAttribArray(normalAttributeLocation)
	}

	function vertexAttribPointer(location, size, stride, offset) {
		if (location === -1) return

		gl.vertexAttribPointer(
			location,
			size,
			gl.FLOAT,
			gl.FALSE,
			stride,
			offset
		)
	}

	function enableVertexAttribArray(location) {
		if (location === -1) return

		gl.enableVertexAttribArray(location)
	}

	function disableVertexAttribArray(location) {
		if (location === -1) return

		gl.disableVertexAttribArray(location)
	}

	return {
		material: null,
		worldMatrix,
		draw
	}
}

/**
 * @param {WebGLRenderingContext} gl
 */
 export async function createCubemap(gl, path, textureId) {
	const cubemapTexture = gl.createTexture()
	gl.activeTexture(gl.TEXTURE0 + textureId)
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture)

	const cubemapImages = [
		{
			position: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
			image: 'right.jpg'
		},
		{
			position: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
			image: 'left.jpg'
		},
		{
			position: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
			image: 'front.jpg'
		},
		{
			position: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
			image: 'back.jpg'
		},
		{
			position: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
			image: 'top.jpg'
		},
		{
			position: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
			image: 'bottom.jpg'
		},
	].map(async info => {
		const image = await loadImage(path + info.image)
		gl.texImage2D(info.position, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
	})

	await Promise.all(cubemapImages)

	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)

	function load(program, uniform) {
		gl.activeTexture(gl.TEXTURE0 + textureId)
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture)

		const samplerUniformLocation = gl.getUniformLocation(program, uniform)
		gl.useProgram(program)
		gl.uniform1i(samplerUniformLocation, textureId)
		gl.useProgram(null)
	}

	return {
		load
	}
}

/**
 * @param {WebGLRenderingContext} gl
 */
export async function createSkybox(gl, program, cubemapTexture) {
	const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')

	const vertices =
	[ 	// X, Y, Z
		// Top
		-1.0, 1.0, -1.0,
		-1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, -1.0,

		// Left
		-1.0, 1.0, 1.0,
		-1.0, -1.0, 1.0,
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0,

		// Right
		1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, -1.0, -1.0,
		1.0, 1.0, -1.0,

		// Front
		1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,
		-1.0, -1.0, 1.0,
		-1.0, 1.0, 1.0,

		// Back
		1.0, 1.0, -1.0,
		1.0, -1.0, -1.0,
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0,

		// Bottom
		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, -1.0, -1.0,
	];

	const indices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];

	const vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	const ibo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	function draw() {
		gl.disable(gl.DEPTH_TEST)
		gl.disable(gl.CULL_FACE)

		gl.bindBuffer(gl.ARRAY_BUFFER, vbo)

		gl.vertexAttribPointer(
			positionAttributeLocation,
			3,
			gl.FLOAT,
			gl.FALSE,
			3 * Float32Array.BYTES_PER_ELEMENT,
			0
		)

		gl.bindBuffer(gl.ARRAY_BUFFER, null)

		gl.enableVertexAttribArray(positionAttributeLocation)

		cubemapTexture.load(program, 'u_skybox')

		gl.useProgram(program)

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)

		gl.useProgram(null)
		gl.disableVertexAttribArray(positionAttributeLocation)

		gl.enable(gl.CULL_FACE)
		gl.enable(gl.DEPTH_TEST)
	}

	return {
		draw
	}
}

/**
 * @param {WebGLRenderingContext} gl
 */
export async function createSkyboxSphere(gl, program, spherePath, texturePath) {
	const sphere = await createObject(gl, program, spherePath)
	const image = await loadImage(texturePath)
	const texture = createTexture(gl, image, 0, false)

	function draw() {
		gl.disable(gl.DEPTH_TEST)
		gl.disable(gl.CULL_FACE)

		texture.load(program, 'u_skybox')
		sphere.draw()

		gl.enable(gl.CULL_FACE)
		gl.enable(gl.DEPTH_TEST)
	}

	return {
		texture,
		draw
	}
}

/**
 * @param {WebGLRenderingContext} gl
 */
export function createCube(gl, program, colors) {
	if (!colors) {
		colors = {
			top: [0.5, 0.5, 0.5],
			left: [0.75, 0.25, 0.5],
			right: [0.25, 0.25, 0.75],
			front: [1.0, 0.0, 0.15],
			back: [0.0, 1.0, 0.15],
			bottom: [0.5, 0.5, 1.0]
		}
	} else if (Array.isArray(colors)) {
		colors = {
			top: [...colors],
			left: [...colors],
			right: [...colors],
			front: [...colors],
			back: [...colors],
			bottom: [...colors]
		}
	}

	const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
	const colorAttributeLocation = gl.getAttribLocation(program, 'a_color')

	const vertices =
	[ 	// X, Y, Z           R, G, B
		// Top
		-1.0, 1.0, -1.0,   ...colors.top,
		-1.0, 1.0, 1.0,    ...colors.top,
		1.0, 1.0, 1.0,     ...colors.top,
		1.0, 1.0, -1.0,    ...colors.top,

		// Left
		-1.0, 1.0, 1.0,    ...colors.left,
		-1.0, -1.0, 1.0,   ...colors.left,
		-1.0, -1.0, -1.0,  ...colors.left,
		-1.0, 1.0, -1.0,   ...colors.left,

		// Right
		1.0, 1.0, 1.0,    ...colors.right,
		1.0, -1.0, 1.0,   ...colors.right,
		1.0, -1.0, -1.0,  ...colors.right,
		1.0, 1.0, -1.0,   ...colors.right,

		// Front
		1.0, 1.0, 1.0,    ...colors.front,
		1.0, -1.0, 1.0,    ...colors.front,
		-1.0, -1.0, 1.0,    ...colors.front,
		-1.0, 1.0, 1.0,    ...colors.front,

		// Back
		1.0, 1.0, -1.0,    ...colors.back,
		1.0, -1.0, -1.0,    ...colors.back,
		-1.0, -1.0, -1.0,    ...colors.back,
		-1.0, 1.0, -1.0,    ...colors.back,

		// Bottom
		-1.0, -1.0, -1.0,   ...colors.bottom,
		-1.0, -1.0, 1.0,    ...colors.bottom,
		1.0, -1.0, 1.0,     ...colors.bottom,
		1.0, -1.0, -1.0,    ...colors.bottom,
	];

	const indices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];

	const vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	const ibo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	function draw() {
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo)

		gl.vertexAttribPointer(
			positionAttributeLocation,
			3,
			gl.FLOAT,
			gl.FALSE,
			6 * Float32Array.BYTES_PER_ELEMENT,
			0
		)

		gl.vertexAttribPointer(
			colorAttributeLocation,
			3,
			gl.FLOAT,
			gl.FALSE,
			6 * Float32Array.BYTES_PER_ELEMENT,
			3 * Float32Array.BYTES_PER_ELEMENT
		)

		gl.bindBuffer(gl.ARRAY_BUFFER, null)

		gl.enableVertexAttribArray(positionAttributeLocation)
		gl.enableVertexAttribArray(colorAttributeLocation)

		gl.useProgram(program)

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

		gl.useProgram(null)
		gl.disableVertexAttribArray(positionAttributeLocation)
		gl.disableVertexAttribArray(colorAttributeLocation)
	}

	return {
		draw
	}
}

/**
 * @param {WebGLRenderingContext} gl
 */
export function createWorldMatrix(gl, program) {
	const matWorldUniformLocation = gl.getUniformLocation(program, 'u_matWorld')
	const matrix = new Float32Array(16)
	mat4.identity(matrix)

	function apply() {
		gl.useProgram(program)
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, this.matrix)
		gl.useProgram(null)
	}

	return {
		matrix,
		apply
	}
}
