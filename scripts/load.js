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

export function loadImage(path) {
	return new Promise((resolve, reject) => {
		const image = new Image()
		image.onload = (e) => resolve(e.target)
		image.onerror = reject
		image.src = path
	})
}