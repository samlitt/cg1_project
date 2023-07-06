import { loadImage, loadVideo } from "./load.js";
import { mat3, mat4, toRadian, vec3 } from "./matrix.js";

import {
	createCamera,
	createLight,
	createLightGroup,
	createMaterial,
	createObject,
	createObjectWithMaterials,
	createProgram,
	createSkyboxSphere,
	createTexture
} from "./utils.js";

export async function createMainScene(gl, width, height) {

	// Programs

	const basicShadingProgram = await createProgram(gl, './shader/basic_shading')
	const sphereMappingProgram = await createProgram(gl, './shader/sphere_mapping')
	const skyboxProgram = await createProgram(gl, './shader/skybox')
	const videoProgram = await createProgram(gl, './shader/video')
	const textureShadingProgram = await createProgram(gl, "./shader/texture_shading");
	const baiscTextureProgram = await createProgram(gl, './shader/basic_texture')

	// Objects

	const lime = await createObject(gl, textureShadingProgram, "./assets/lime.obj");
	const kiwi = await createObject(gl, textureShadingProgram, "./assets/kiwi.obj");
	const pomegranate = await createObject(gl, textureShadingProgram, "./assets/pomgranate.obj");

	const ipad = await createObjectWithMaterials(gl, textureShadingProgram, './assets/ipad.obj', './assets/ipad.mtl')
	ipad.material.ambient = [0.5, 0.5, 0.5]
	ipad.material.diffuse = [0.8, 0.8, 0.8]

	const ipadScreen = await createObject(gl, videoProgram, './assets/ipad_screen.obj');
	const skybox = await createSkyboxSphere(gl, skyboxProgram, './assets/skybox.obj', '/assets/the_sky_is_on_fire.jpg')
	mat4.rotate(skybox.sphere.worldMatrix, skybox.sphere.worldMatrix, toRadian(-15), [1, 0, 0])
	mat4.rotate(skybox.sphere.worldMatrix, skybox.sphere.worldMatrix, toRadian(30), [0, 1, 0])

	const counter_base = await createObjectWithMaterials(gl, textureShadingProgram, './assets/counter_base.obj', './assets/counter_base.mtl');
	counter_base.material.ambient = [0.7, 0.3, 0.2];

	const counter_top = await createObjectWithMaterials(gl, textureShadingProgram, './assets/counter_top.obj', './assets/counter_top.mtl');
	counter_top.material.ambient = [0.3, 0.3, 0.3];

	const faucet = await createObject(gl, sphereMappingProgram, './assets/faucet.obj');

	const sink = await createObjectWithMaterials(gl, basicShadingProgram, './assets/sink.obj', './assets/sink.mtl');
	sink.material.ambient = [0.25, 0.25, 0.25];
	// sink.material.diffuse = [0.6, 0.6, 0.6];
	sink.material.specular = [0.8, 0.8, 0.8];

	const cutting_board = await createObjectWithMaterials(gl, textureShadingProgram, './assets/cutting_board.obj', './assets/cutting_board.mtl');
	cutting_board.material.ambient = [0.35, 0.35, 0.35];

	const knife = await createObjectWithMaterials(gl, textureShadingProgram, './assets/kitchen_knife.obj', './assets/kitchen_knife.mtl');
	knife.material.ambient = [0.5, 0.5, 0.5];
	knife.material.diffuse = [0.5, 0.5, 0.5];
	knife.material.specular = [0.8, 0.8, 0.8]
	knife.material.shininess = 200

	const bottle = await createObject(gl, textureShadingProgram, './assets/absolut_bottle.obj');
	bottle.material = createMaterial(gl, textureShadingProgram,
		[0.0, 0.0, 0.0],
		[0.2, 0.2, 0.2],
		[1.0, 1.0, 1.0],
		[0.7, 0.7, 0.7],
		100
	)

	const wall = await createObject(gl, textureShadingProgram, './assets/wall.obj');

	const floor = await createObject(gl, textureShadingProgram, './assets/floor.obj');
	const ceil = await createObject(gl, textureShadingProgram, './assets/ceil.obj');

	const window_frame = await createObject(gl, textureShadingProgram, './assets/window.obj');
	window_frame.material = createMaterial(gl, textureShadingProgram,
		[0, 0, 0],
		[1.0, 1.0, 1.0],
		[1.0, 1.0, 1.0],
		[1.0, 1.0, 1.0],
		100
	)

	const glass = await createObject(gl, textureShadingProgram, './assets/drinking_glass.obj');
	glass.material = createMaterial(gl, textureShadingProgram,
		[0, 0, 0],
		[1.0, 1.0, 1.0],
		[1.0, 1.0, 1.0],
		[1.0, 1.0, 1.0],
		100
	)

	const shaker = await createObject(gl, sphereMappingProgram, './assets/cocktail_shaker.obj');

	const teapot = await createObject(gl, basicShadingProgram, './assets/teapot.obj')
	teapot.material = createMaterial(gl, basicShadingProgram,
		[0, 0, 0],
		[0.25, 0.20, 0.07],
		[0.75, 0.61, 0.23],
		[0.63, 0.56, 0.37],
		83.2
	)

	// Lights

	const mainLight = createLight(
		gl,
		[-1.0, 1.0, -2.0, 0.0],
		[1.0, 0.78, 0.79],
		[1.0, 0.3, 0.3],
		[0.8, 0.4, 0.4]
	);

	window.lightPos = [-0.4, 1.3, -1.4]
	const pointLight = createLight(
		gl,
		[...lightPos, 1.0],
		[1.0, 1.0, 1.0],
		[0.85, 0.85, 1.0],
		[0.9, 0.9, 1.0]
	);

	const lightGroup = createLightGroup([mainLight, pointLight])
	lightGroup.apply(basicShadingProgram)
	lightGroup.apply(textureShadingProgram)

	// Textures

	let lime_texture = createTexture(gl, await loadImage("assets/lime_albedo.jpg"), 1, true, true);
	let kiwi_texture = createTexture(gl, await loadImage("assets/kiwi.jpg"), 1, true, true);
	let pomegranate_texture = createTexture(gl, await loadImage("assets/pomegranate.jpg"), 1, true, true);
	const ipad_texture = createTexture(gl, await loadImage('assets/ipad.jpg'), 2, true, true)
	const video_texture = createTexture(gl, await loadVideo('./assets/video.mp4'), 3, false, false);
	const counter_base_texture = createTexture(gl, await loadImage("./assets/wood_counter_base.jpg"), 4, true, true);
	const counter_top_texture = createTexture(gl, await loadImage("./assets/marble_counter_top.jpg"), 5, true, true);
	const cutting_board_texture = createTexture(gl, await loadImage("./assets/cutting_board.jpg"), 6, true, true);
	const knife_texture = createTexture(gl, await loadImage("./assets/kitchen_knife.png"), 7, true, true);
	const glass_texture = createTexture(gl, await loadImage("./assets/drinking_glass.png"), 8, true, true);
	const sphereMapTexture = createTexture(gl, await loadImage('./assets/skybox.jpg'), 9, false, false)

	const floor_texture = createTexture(gl, await loadImage("./assets/weathered_planks.jpg"), 9, true, true);
	gl.bindTexture(gl.TEXTURE_2D, floor_texture.texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.bindTexture(gl.TEXTURE_2D, null)

	const wall_texture = createTexture(gl, await loadImage("./assets/wall_bricks.jpg"), 10, true, true);
	gl.bindTexture(gl.TEXTURE_2D, wall_texture.texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.bindTexture(gl.TEXTURE_2D, null)

	const ceil_texture = createTexture(gl, await loadImage("./assets/concrete_wall.jpg"), 11, true, true);
	gl.bindTexture(gl.TEXTURE_2D, ceil_texture.texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.bindTexture(gl.TEXTURE_2D, null)

	const window_texture = createTexture(gl, await loadImage("./assets/window.png"), 12, true, true)

	const absolut_bottle_texture = createTexture(gl, await loadImage("./assets/absolut_bottle.png"), 13, true, true);

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

	const basicTextureMaterial = createMaterial(
		gl,
		textureShadingProgram,
		[0.0, 0.0, 0.0], // emissive
		[0.3, 0.3, 0.3], // ambient
		[0.8, 0.8, 0.8], // diffuse
		[0.8, 0.8, 0.8], // specular
		5.0				  // shininess
	);

	lime.material = basicTextureMaterial
	kiwi.material = basicTextureMaterial
	pomegranate.material = basicTextureMaterial

	const wallMaterial = createMaterial(
		gl,
		textureShadingProgram,
		[0.0, 0.0, 0.0], // emissive
		[0.3, 0.3, 0.3], // ambient
		[0.8, 0.8, 0.8], // diffuse
		[0.8, 0.8, 0.8], // specular
		100.0
	)

	wall.material = wallMaterial
	ceil.material = wallMaterial
	floor.material = wallMaterial

	// Camera

	const cameraEye = [-1.0, 1.75, 0.5]
	const cameraLook = [-1.0, 1.0, -0.8]
	const camera = createCamera(gl, toRadian(45), width / height)
	camera.set(cameraEye, cameraLook, [0.0, 1.0, 0.0])
	camera.apply(basicShadingProgram)
	camera.apply(sphereMappingProgram)
	camera.apply(textureShadingProgram);
	camera.apply(videoProgram);
	camera.apply(baiscTextureProgram)

	const skyboxCamera = createCamera(gl, toRadian(60), width / height)
	skyboxCamera.set(cameraEye, cameraLook, [0.0, 1.0, 0.0])
	skyboxCamera.apply(skyboxProgram)

	// Camera Movement

	const cameraPos = [0.0, 0.0, 0.0]
	const cameraDir = [0.0, 0.0, 0.0]

	const rotationFactor = Math.PI / 128
	const maxRotation = 2 * Math.PI // Quarter circle
	let rotation = -0.5

	const zoomFactor = 0.1
	const maxZoom = 0.8
	const minZoom = -4
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

	// Positioning

	const identityMatrix = new Float32Array(16)
	mat4.identity(identityMatrix)

	const ipadWorldMatrix = new Float32Array(16)
	mat4.identity(ipadWorldMatrix)
	mat4.translate(ipadWorldMatrix, ipadWorldMatrix, [0, 0, 0])
	mat4.scale(ipadWorldMatrix, ipadWorldMatrix, [0.1, 0.1, 0.1])
	mat4.rotate(ipadWorldMatrix, ipadWorldMatrix, toRadian(90), [0, 0, 1])
	mat4.rotate(ipadWorldMatrix, ipadWorldMatrix, toRadian(-90), [1, 0, 0])
	// ipad.worldMatrix = ipadWorldMatrix
	// ipadScreen.worldMatrix = ipadWorldMatrix

	

	// const teapot2 = await createObject(gl, basicShadingProgram, './assets/teapot.obj')
	// teapot2.material = basicMaterial
	// mat4.translate(teapot2.worldMatrix, teapot2.worldMatrix, [-3, 0, 5])
	// mat4.scale(teapot2.worldMatrix, teapot2.worldMatrix, [0.3, 0.3, 0.3])

	// const teapot3 = await createObject(gl, basicShadingProgram, './assets/teapot.obj')
	// teapot3.material = basicMaterial
	// mat4.translate(teapot3.worldMatrix, teapot3.worldMatrix, [-2, 1, 0])
	// mat4.scale(teapot3.worldMatrix, teapot3.worldMatrix, [0.3, 0.3, 0.3])

	// const teapotCenter = await createObject(gl, basicShadingProgram, './assets/teapot.obj')
	// teapotCenter.material = basicMaterial
	// mat4.translate(teapotCenter.worldMatrix, teapotCenter.worldMatrix, [-1, 0, 3])
	// mat4.scale(teapotCenter.worldMatrix, teapotCenter.worldMatrix, [0.3, 0.3, 0.3])

	

	const counterWorldMatrix = new Float32Array(16);
	mat4.identity(counterWorldMatrix);
	mat4.translate(counterWorldMatrix, counterWorldMatrix, [-3, -1, 0]);
	mat4.scale(counterWorldMatrix, counterWorldMatrix, [1, 1, 1]);
	counter_base.worldMatrix = counterWorldMatrix;
	counter_top.worldMatrix = counterWorldMatrix;

	wall.worldMatrix = counterWorldMatrix;
	floor.worldMatrix = counterWorldMatrix;
	ceil.worldMatrix = counterWorldMatrix;
	window_frame.worldMatrix = counterWorldMatrix;
	faucet.worldMatrix = counterWorldMatrix;
	sink.worldMatrix = counterWorldMatrix;
	cutting_board.worldMatrix = counterWorldMatrix;
	knife.worldMatrix = counterWorldMatrix;
	glass.worldMatrix = counterWorldMatrix;
	bottle.worldMatrix = counterWorldMatrix;
	shaker.worldMatrix = counterWorldMatrix;
	lime.worldMatrix = counterWorldMatrix;
	kiwi.worldMatrix = counterWorldMatrix;
	pomegranate.worldMatrix = counterWorldMatrix;
	ipad.worldMatrix = counterWorldMatrix;
	ipadScreen.worldMatrix = counterWorldMatrix;

	mat4.translate(teapot.worldMatrix, teapot.worldMatrix, [0.7, 0.6, -0.6])
	mat4.rotate(teapot.worldMatrix, teapot.worldMatrix, toRadian(90), [0, 1, 0])
	mat4.scale(teapot.worldMatrix, teapot.worldMatrix, [0.15, 0.15, 0.15])

	// Variables

	const inverseViewMatrix = new Float32Array(9)
	const camDir = new Float32Array(3)

	// Render Loop

	function render() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		// pointLight.pos = [...window.lightPos, 1.0]
		// lightGroup.apply(basicShadingProgram)
		// lightGroup.apply(textureShadingProgram)

		// mat4.translate(teapot1.worldMatrix, identityMatrix, lightPos)
		// mat4.scale(teapot1.worldMatrix, teapot1.worldMatrix, [0.03, 0.03, 0.03])

		// -- Camera

		vec3.rotateY(cameraPos, cameraEye, cameraLook, -rotation)
		vec3.sub(cameraDir, cameraPos, cameraLook)
		vec3.normalize(cameraDir)
		vec3.translate(cameraPos, cameraPos, zoom, cameraDir)

		camera.set(cameraPos, cameraLook, [0.0, 1.0, 0.0])
		camera.apply(basicShadingProgram)
		camera.apply(sphereMappingProgram)
		camera.apply(textureShadingProgram)
		camera.apply(videoProgram)
		camera.apply(baiscTextureProgram)

		skyboxCamera.set(cameraPos, cameraLook, [0.0, 1.0, 0.0])
		skyboxCamera.apply(skyboxProgram)

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


		// -- Room

		wall_texture.load(textureShadingProgram, "u_sampler");
		wall.draw(camera);

		floor_texture.load(textureShadingProgram, "u_sampler");
		floor.draw(camera);

		ceil_texture.load(textureShadingProgram, "u_sampler");
		ceil.draw(camera);

		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		gl.blendEquation(gl.FUNC_ADD)

		window_texture.load(textureShadingProgram, 'u_sampler');
		window_frame.draw(camera);

		gl.disable(gl.BLEND)

		// -- Lime

		lime_texture.load(textureShadingProgram, "u_sampler");
		lime.draw(camera);

		// -- Kiwi

		kiwi_texture.load(textureShadingProgram, "u_sampler");
		kiwi.draw(camera);

		// -- Pomegranate

		pomegranate_texture.load(textureShadingProgram, "u_sampler");
		pomegranate.draw(camera);

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

		// -- Faucet, Sink and Shaker

		sphereMapTexture.load(sphereMappingProgram, 'u_skybox')
		faucet.draw(camera)
		sink.draw(camera);
		shaker.draw(camera);

		// -- Cutting Board

		cutting_board_texture.load(textureShadingProgram, 'u_sampler');
		cutting_board.draw(camera)

		// -- Knife

		knife_texture.load(textureShadingProgram, 'u_sampler');
		knife.draw(camera);

		// -- Teapot

		teapot.draw(camera)

		// -- Glass

		gl.depthMask(false)
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		gl.blendEquation(gl.FUNC_ADD)

		glass_texture.load(textureShadingProgram, 'u_sampler');
		glass.draw(camera);

		// -- Absolut Vodka Bottle

		absolut_bottle_texture.load(textureShadingProgram, 'u_sampler');
		bottle.draw(camera);

		gl.disable(gl.BLEND)
		gl.depthMask(true)

		// -- Test Teapots

		// teapot1.draw(camera)
	}

	return {
		render
	}
}
