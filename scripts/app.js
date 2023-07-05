'use strict'

import { loadImage, loadVideo } from "./load.js";
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

// Programs

const basicShadingProgram = await createProgram(gl, './shader/basic_shading')
const sphereMappingProgram = await createProgram(gl, './shader/sphere_mapping')
const skyboxProgram = await createProgram(gl, './shader/skybox')
const videoProgram = await createProgram(gl, './shader/video')
const textureShadingProgram = await createProgram(gl, "./shader/texture_shading");

// Objects

const lime = await createObject(gl, textureShadingProgram, "./assets/lime.obj");

const ipad = await createObjectWithMaterials(gl, textureShadingProgram, './assets/ipad.obj', './assets/ipad.mtl')
ipad.material.ambient = [0.2, 0.2, 0.2]
ipad.material.diffuse = [0.8, 0.8, 0.8]

const ipadScreen = await createObject(gl, videoProgram, './assets/ipad_screen.obj')
const skybox = await createSkyboxSphere(gl, skyboxProgram, './assets/skybox.obj', '/assets/skybox.jpg')

const counter_base = await createObjectWithMaterials(gl, textureShadingProgram, './assets/counter_base.obj', './assets/counter_base.mtl');
counter_base.material.ambient = [0.7, 0.3, 0.2];

const counter_top = await createObjectWithMaterials(gl, textureShadingProgram, './assets/counter_top.obj', './assets/counter_top.mtl');
counter_top.material.ambient = [0.5, 0.5, 0.5];

const faucet = await createObject(gl, sphereMappingProgram, './assets/faucet.obj');

const sink = await createObjectWithMaterials(gl, basicShadingProgram, './assets/sink.obj', './assets/sink.mtl');
sink.material.ambient = [0.25, 0.25, 0.25];
// sink.material.diffuse = [0.6, 0.6, 0.6];
sink.material.specular = [0.8, 0.8, 0.8];

const cutting_board = await createObjectWithMaterials(gl, textureShadingProgram, './assets/cutting_board.obj', './assets/cutting_board.mtl');
cutting_board.material.ambient = [0.5, 0.5, 0.5]

skybox.texture.load(sphereMappingProgram, 'u_skybox')

// Lights

const mainLight = createLight(
	gl,
	[0.0, 0.0, -1.0, 0.0],
	[1.0, 1.0, 1.0],
	[0.0, 0.0, 1.0],
	[0.0, 0.0, 1.0]
);

const pointLight = createLight(
	gl,
	[-1, 0, 3, 1.0],
	[1.0, 1.0, 1.0],
	[1.0, 0.0, 0.0],
	[1.0, 0.0, 0.0]
);

const lightGroup = createLightGroup([mainLight, pointLight])
lightGroup.apply(basicShadingProgram)
lightGroup.apply(textureShadingProgram)

// Textures

let lime_texture = createTexture(gl, await loadImage("assets/lime_albedo.jpg"), 1, true, true);
const ipad_texture = createTexture(gl, await loadImage('assets/ipad.jpg'), 2, true, true)
const video_texture = createTexture(gl, await loadVideo('./assets/video.mp4'), 3, false, false);
const counter_base_texture = createTexture(gl, await loadImage("./assets/wood_counter_base.jpg"), 4, true, true);
const counter_top_texture = createTexture(gl, await loadImage("./assets/marble_counter_top.jpg"), 5, true, true);
const cutting_board_texture = createTexture(gl, await loadImage("./assets/cutting_board.jpg"), 6, true, true);

// Materials

const basicMaterial = createMaterial(
	gl,
	basicShadingProgram,
	[0.0, 0.0, 0.0],
	[0.1, 0.1, 0.1],
	[0.8, 0.8, 0.8],
	[1.0, 1.0, 1.0],
	20.0
)

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

const cameraEye = [2.0, 2.0, 1.2]
const cameraLook = [-1, 1, -1]
const camera = createCamera(gl, toRadian(45), canvas.width / canvas.height)
camera.set(cameraEye, cameraLook, [0.0, 1.0, 0.0])
camera.apply(basicShadingProgram)
camera.apply(sphereMappingProgram)
camera.apply(skyboxProgram)
camera.apply(textureShadingProgram);
camera.apply(videoProgram)

// Camera Movement

const cameraPos = [0.0, 0.0, 0.0]
const cameraDir = [0.0, 0.0, 0.0]

const rotationFactor = Math.PI / 128
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
mat4.translate(ipadWorldMatrix, ipadWorldMatrix, [0, 0, 0])
mat4.scale(ipadWorldMatrix, ipadWorldMatrix, [0.1, 0.1, 0.1])
mat4.rotate(ipadWorldMatrix, ipadWorldMatrix, toRadian(90), [0, 0, 1])
mat4.rotate(ipadWorldMatrix, ipadWorldMatrix, toRadian(-90), [1, 0, 0])
// ipad.worldMatrix = ipadWorldMatrix
// ipadScreen.worldMatrix = ipadWorldMatrix

const teapot1 = await createObject(gl, basicShadingProgram, './assets/teapot.obj')
teapot1.material = basicMaterial
mat4.translate(teapot1.worldMatrix, teapot1.worldMatrix, cameraLook)
mat4.scale(teapot1.worldMatrix, teapot1.worldMatrix, [0.3, 0.3, 0.3])

const teapot2 = await createObject(gl, basicShadingProgram, './assets/teapot.obj')
teapot2.material = basicMaterial
mat4.translate(teapot2.worldMatrix, teapot2.worldMatrix, [-3, 0, 5])
mat4.scale(teapot2.worldMatrix, teapot2.worldMatrix, [0.3, 0.3, 0.3])

const teapot3 = await createObject(gl, basicShadingProgram, './assets/teapot.obj')
teapot3.material = basicMaterial
mat4.translate(teapot3.worldMatrix, teapot3.worldMatrix, [-2, 1, 0])
mat4.scale(teapot3.worldMatrix, teapot3.worldMatrix, [0.3, 0.3, 0.3])

const teapotCenter = await createObject(gl, basicShadingProgram, './assets/teapot.obj')
teapotCenter.material = basicMaterial
mat4.translate(teapotCenter.worldMatrix, teapotCenter.worldMatrix, [-1, 0, 3])
mat4.scale(teapotCenter.worldMatrix, teapotCenter.worldMatrix, [0.3, 0.3, 0.3])

const counterWorldMatrix = new Float32Array(16);
mat4.identity(counterWorldMatrix);
mat4.translate(counterWorldMatrix, counterWorldMatrix, [-3, -1, 0]);
mat4.scale(counterWorldMatrix, counterWorldMatrix, [1, 1, 1]);
// mat4.rotate(counterWorldMatrix, counterWorldMatrix, toRadian(-45), [0, 1, 0]);
counter_base.worldMatrix = counterWorldMatrix;
counter_top.worldMatrix = counterWorldMatrix;

faucet.worldMatrix = counterWorldMatrix;
sink.worldMatrix = counterWorldMatrix;
cutting_board.worldMatrix = counterWorldMatrix;
lime.worldMatrix = counterWorldMatrix;
ipad.worldMatrix = counterWorldMatrix;
ipadScreen.worldMatrix = counterWorldMatrix;

// Render Loop

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	// -- Camera

	vec3.rotateY(cameraPos, cameraEye, cameraLook, -rotation)
	vec3.sub(cameraDir, cameraPos, cameraLook)
	vec3.normalize(cameraDir)
	vec3.translate(cameraPos, cameraPos, zoom, cameraDir)

	camera.set(cameraPos, cameraLook, [0.0, 1.0, 0.0])
	camera.apply(basicShadingProgram)
	camera.apply(sphereMappingProgram)
	camera.apply(skyboxProgram)
	camera.apply(textureShadingProgram)
	camera.apply(videoProgram)

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


	// -- Lime

	lime_texture.load(textureShadingProgram, "u_sampler");
	lime.draw(camera);

	// -- iPad

	ipad_texture.load(textureShadingProgram, 'u_sampler')
	ipad.draw(camera)
	video_texture.update()
	video_texture.load(videoProgram, 'u_texture')
	ipadScreen.draw(camera)


	// -- Counter

	counter_base_texture.load(textureShadingProgram, 'u_sampler');
	counter_base.draw(camera)
	counter_top_texture.load(textureShadingProgram, 'u_sampler');
	counter_top.draw(camera);

	// -- Faucet and Sink

	faucet.draw(camera)
	sink.draw(camera);

	// -- Cutting Board

	cutting_board_texture.load(textureShadingProgram, 'u_sampler');
	cutting_board.draw(camera)

	// -- Knife



	// -- Test Teapots

	teapot1.draw(camera)

	requestAnimationFrame(render);
}

requestAnimationFrame(render)
