export async function loadShader(path) {
	const res = await fetch(path)
	const shaderText = await res.text()
	return shaderText
}

export async function loadObj(path) {
	const res = await fetch(path)
	const text = await res.text()

	const lines = text.split(/\r*\n/)

	let vertices = []
	let normals = []
	let textures = []

	let vbo = []

	for (const line of lines) {
		let items = line.trim().split(/\s+/)
		const identifier = items.shift()

		if (identifier === 'v') {
			vertices.push(items)
		}

		if (identifier === 'vn') {
			normals.push(items)
		}

		if (identifier === 'vt') {
			textures.push(items)
		}

		if (identifier === 'f') {
			for (const item of items) {
				const [vertexIndex, textureIndex, normalIndex] = item.trim().split('/').map(num => parseInt(num))

				// console.log(line);

				vbo.push(...vertices[vertexIndex - 1])

				if (!isNaN(textureIndex)) {
					vbo.push(...textures[textureIndex - 1])
				} else {
					vbo.push(0.0, 0.0)
				}

				if (!isNaN(normalIndex)) {
					vbo.push(...normals[normalIndex - 1])
				} else {
					vbo.push(0.0, 0.0, 0.0)
				}
			}
		}
	}

	return vbo.map(parseFloat)
}

export async function loadObjWithMaterials(objPath) {
	const res = await fetch(objPath)
	const objText = await res.text()

	const lines = objText.split(/\r*\n/)

	const meshes = []

	let vertices = []
	let normals = []
	let textures = []

	let vbo = []

	let currentMtl = 'default'

	for (const line of lines) {
		let items = line.trim().split(/\s+/)
		const identifier = items.shift()

		if (identifier === 'v') {
			vertices.push(items)
		}

		if (identifier === 'vn') {
			normals.push(items)
		}

		if (identifier === 'vt') {
			textures.push(items)
		}

		if (identifier === 'f') {
			for (const item of items) {
				const [vertexIndex, textureIndex, normalIndex] = item.trim().split('/').map(num => parseInt(num))

				// console.log(line);

				vbo.push(...vertices[vertexIndex - 1])

				if (!isNaN(textureIndex)) {
					vbo.push(...textures[textureIndex - 1])
				} else {
					vbo.push(0.0, 0.0)
				}

				if (!isNaN(normalIndex)) {
					vbo.push(...normals[normalIndex - 1])
				} else {
					vbo.push(0.0, 0.0, 0.0)
				}
			}
		}

		if (identifier === 'usemtl') {
			// Reset
			if (vbo.length > 0) {
				meshes.push({
					material: currentMtl,
					vbo: vbo.map(parseFloat)
				})
			}

			vbo = []

			currentMtl = items[0]
		}
	}

	meshes.push({
		material: currentMtl,
		vbo: vbo.map(parseFloat)
	})

	return meshes
}

export async function loadMtl(mtlPath) {
	const res = await fetch(mtlPath)
	const text = await res.text()

	const lines = text.split(/\r*\n/)

	const materials = {}

	let emissive = [0.0, 0.0, 0.0]
	let ambient = [0.0, 0.0, 0.0]
	let diffuse = [0.0, 0.0, 0.0]
	let specular = [0.0, 0.0, 0.0]
	let shininess = 0.0

	let currentMtl

	for (const line of lines) {
		let items = line.trim().split(/\s+/)
		const identifier = items.shift()

		if (identifier === 'newmtl') {
			if (currentMtl) {
				materials[currentMtl] = {
					emissive,
					ambient,
					diffuse,
					specular,
					shininess
				}
			}

			currentMtl = items[0]
		}

		if (identifier === 'Ke') {
			emissive = items.map(parseFloat)
		}

		if (identifier === 'Ka') {
			ambient = items.map(parseFloat)
		}

		if (identifier === 'Kd') {
			diffuse = items.map(parseFloat)
		}

		if (identifier === 'Ks') {
			specular = items.map(parseFloat)
		}

		if (identifier === 'Ns') {
			shininess = parseFloat(items[0]) * 100
		}
	}

	materials[currentMtl] = {
		emissive,
		ambient,
		diffuse,
		specular,
		shininess
	}

	return materials
}

export function loadImage(path) {
	return new Promise((resolve, reject) => {
		const image = new Image()
		image.onload = (e) => resolve(e.target)
		image.onerror = reject
		image.src = path
	})
}
