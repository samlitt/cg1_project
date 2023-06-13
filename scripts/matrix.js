export function toRadian(angle) {
	return angle * Math.PI / 180
}

export const vec3 = (() => {
	function cross(out, a, b) {
		out[0] = a[1]*b[2] - a[2]*b[1]
		out[1] = a[2]*b[0] - a[0]*b[2]
		out[2] = a[0]*b[1] - a[1]*b[0]
	}
	
	function dot(a, b) {
		return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
	}
	
	function normalize(v) {
		let abs = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
		v[0] = v[0] / abs
		v[1] = v[1] / abs
		v[2] = v[2] / abs
	}

	function rotateY(out, point, origin, rad) {
		let p = [...point]
		
		p[0] -= origin[0]
		p[1] -= origin[1]
		p[2] -= origin[2] 
	
		out[0] = Math.cos(rad) * p[0] + Math.sin(rad) * p[2]
		out[1] = point[1]
		out[2] = -Math.sin(rad) * p[0] + Math.cos(rad) * p[2]
	
		out[0] += origin[0]
		out[1] += origin[1]
		out[2] += origin[2]
	}

	function mulMat3(out, a, mat) {
		let o1, o2, o3

		o1 = a[0] * mat[0] + a[1] * mat[3] + a[2] * mat[6]
		o2 = a[0] * mat[1] + a[1] * mat[4] + a[2] * mat[7] 
		o3 = a[0] * mat[2] + a[1] * mat[5] + a[2] * mat[8]

		out[0] = o1
		out[1] = o2
		out[2] = o3
	}

	return {
		cross,
		dot,
		normalize,
		rotateY,
		mulMat3
	}
})()

export const mat2 = (() => {
	function determinant(a) {
		return a[0]*a[3] - a[2]*a[1]
	}

	return {
		determinant
	}
})()

export const mat3 = (() => {
	function fromMat4(out, a) {
		let
			o11, o12, o13,
			o21, o22, o23,
			o31, o32, o33
		
		o11 = a[0]
		o12 = a[4]
		o13 = a[8]
		o21 = a[1]
		o22 = a[5]
		o23 = a[9]
		o31 = a[2]
		o32 = a[6]
		o33 = a[10]

		out[0] = o11
		out[1] = o21
		out[2] = o31
		out[3] = o12
		out[4] = o22
		out[5] = o32
		out[6] = o13
		out[7] = o23
		out[8] = o33
	}

	function identity(out) {
		for (let i = 0; i < 9; i++) {
			if (i % 4 === 0)
				out[i] = 1.0
			else
				out[i] = 0.0
		}
	}	

	function inverse(out, a) {
		const d = 1 / determinant(a)

		let
			o11, o12, o13,
			o21, o22, o23,
			o31, o32, o33

		o11 =  d * adjugate(a, 1, 1)
		o12 = -d * adjugate(a, 2, 1)
		o13 =  d * adjugate(a, 3, 1)
		o21 = -d * adjugate(a, 1, 2)
		o22 =  d * adjugate(a, 2, 2)
		o23 = -d * adjugate(a, 3, 2)
		o31 =  d * adjugate(a, 1, 3)
		o32 = -d * adjugate(a, 2, 3)
		o33 =  d * adjugate(a, 3, 3)

		out[0] = o11
		out[1] = o21
		out[2] = o31
		out[3] = o12
		out[4] = o22
		out[5] = o32
		out[6] = o13
		out[7] = o23
		out[8] = o33
	}

	function transpose(out, a) {
		let
			o11, o12, o13,
			o21, o22, o23,
			o31, o32, o33

		o11 = a[0]
		o12 = a[1]
		o13 = a[2]
		o21 = a[3]
		o22 = a[4]
		o23 = a[5]
		o31 = a[6]
		o32 = a[7]
		o33 = a[8]

		out[0] = o11
		out[1] = o21
		out[2] = o31
		out[3] = o12
		out[4] = o22
		out[5] = o32
		out[6] = o13
		out[7] = o23
		out[8] = o33
	}

	function inverseTranspose(out, a) {
		inverse(out, a)
		transpose(out, out)
	}

	function adjugate(a, i, j) {
		const adj = new Float32Array(4)

		let l = 0;
		for (let k = 0; k < 9; k++) {
			if ((k - (i-1)) % 3 === 0) {
				continue
			}
			if (Math.floor(k / 3) === (j-1)) {
				continue
			}

			adj[l] = a[k]
			l++
		}

		return mat2.determinant(adj)
	}

	function determinant(a) {
		return 	a[0]*a[4]*a[8] + 
					a[3]*a[7]*a[2] +
					a[6]*a[1]*a[5] -
					a[2]*a[4]*a[6] -
					a[5]*a[7]*a[0] -
					a[8]*a[1]*a[3]
	}

	return {
		fromMat4,
		identity,
		inverse,
		transpose,
		inverseTranspose,
		adjugate,
		determinant
	}
})()

export const mat4 = (() => {
	function mul(out, a, b) {
		let 
			a11, a12, a13, a14,
			a21, a22, a23, a24,
			a31, a32, a33, a34,
			a41, a42, a43, a44
		
		a11 = a[0]
		a21 = a[1]
		a31 = a[2]
		a41 = a[3]
		a12 = a[4]
		a22 = a[5]
		a32 = a[6]
		a42 = a[7]
		a13 = a[8]
		a23 = a[9]
		a33 = a[10]
		a43 = a[11]
		a14 = a[12]
		a24 = a[13]
		a34 = a[14]
		a44 = a[15]
	
		let 
			b11, b12, b13, b14,
			b21, b22, b23, b24,
			b31, b32, b33, b34,
			b41, b42, b43, b44
		
		b11 = b[0]
		b21 = b[1]
		b31 = b[2]
		b41 = b[3]
		b12 = b[4]
		b22 = b[5]
		b32 = b[6]
		b42 = b[7]
		b13 = b[8]
		b23 = b[9]
		b33 = b[10]
		b43 = b[11]
		b14 = b[12]
		b24 = b[13]
		b34 = b[14]
		b44 = b[15]
	
		let 
			o11, o12, o13, o14,
			o21, o22, o23, o24,
			o31, o32, o33, o34,
			o41, o42, o43, o44
	
		o11 = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41
		o12 = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42
		o13 = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b41
		o14 = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44
	
		o21 = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41
		o22 = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42	
		o23 = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43	
		o24 = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44
	
		o31 = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41
		o32 = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42
		o33 = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43
		o34 = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44
	
		o41 = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41
		o42 = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42
		o43 = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43
		o44 = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44
	
		out[0] = o11
		out[1] = o21
		out[2] = o31
		out[3] = o41
		out[4] = o12
		out[5] = o22
		out[6] = o32
		out[7] = o42
		out[8] = o13
		out[9] = o23
		out[10] = o33
		out[11] = o43
		out[12] = o14
		out[13] = o24
		out[14] = o34
		out[15] = o44
	}

	function identity(out) {
		for (let i = 0; i < 16; i++) {
			if (i % 5 === 0)
				out[i] = 1.0
			else
				out[i] = 0.0
		}
	}

	function translate(out, a, v) {
		let t = [
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			v[0], v[1], v[2], 1.0
		]
	
		mat4.mul(out, a, t)
	}
	
	function scale(out, a, v) {
		let s = [
			v[0], 0.0, 0.0, 0.0,
			0.0, v[1], 0.0, 0.0,
			0.0, 0.0, v[2], 0.0,
			0.0, 0.0, 0.0, 1.0
		] 
	
		mat4.mul(out, a, s)
	}
	
	function rotate(out, a, angle, v) {
		let r = [
			Math.cos(angle) + v[0]*v[0]*(1-Math.cos(angle)),      v[1]*v[0]*(1-Math.cos(angle)) + v[2]*Math.sin(angle), v[2]*v[0]*(1-Math.cos(angle)) - v[1]*Math.sin(angle), 0.0,
			v[0]*v[1]*(1-Math.cos(angle)) - v[2]*Math.sin(angle), Math.cos(angle) + v[1]*v[1]*(1-Math.cos(angle)),      v[2]*v[1]*(1-Math.cos(angle)) + v[0]*Math.sin(angle), 0.0,
			v[0]*v[2]*(1-Math.cos(angle)) + v[1]*Math.sin(angle), v[1]*v[2]*(1-Math.cos(angle)) - v[0]*Math.sin(angle), Math.cos(angle) + v[2]*v[2]*(1-Math.cos(angle)),      0.0,
			0.0, 																	0.0, 																	0.0, 																	1.0
		]
	
		mat4.mul(out, a, r)
	}
	
	function lookAt(out, eye, look, up) {
		let n = [
			eye[0] - look[0],
			eye[1] - look[1],
			eye[2] - look[2]
		]
	
		let u = new Float32Array(3)
		vec3.cross(u, up, n)
	
		let v = new Float32Array(3)
		vec3.cross(v, n, u)
	
		vec3.normalize(u)
		vec3.normalize(v)
		vec3.normalize(n)
	
		let t = [
			-vec3.dot(u, eye),
			-vec3.dot(v, eye),
			-vec3.dot(n, eye)
		]
	
		out[0] = u[0]
		out[1] = v[0]
		out[2] = n[0]
		out[3] = 0.0
		out[4] = u[1]
		out[5] = v[1]
		out[6] = n[1]
		out[7] = 0.0
		out[8] = u[2]
		out[9] = v[2]
		out[10] = n[2]
		out[11] = 0.0
		out[12] = t[0]
		out[13] = t[1]
		out[14] = t[2]
		out[15] = 1.0
	}
	
	function perspective(out, fovy, aspect, near, far) {
		const top = Math.tan(fovy / 2) * near
		const bottom = -top
	
		const right = top * aspect
		const left = -right
	
		out[0] = 2 / (right - left)
		out[1] = 0.0
		out[2] = 0.0
		out[3] = 0.0
		out[4] = 0.0
		out[5] = 2 / (top - bottom)
		out[6] = 0.0
		out[7] = 0.0
		out[8] = (right + left) / (right - left) / near
		out[9] = (top + bottom) / (top - bottom) / near
		out[10] = - (far + near) / (far - near) / near
		out[11] = - 1 / near
		out[12] = 0.0
		out[13] = 0.0
		out[14] = - 2 * far / (far - near)
		out[15] = 0.0
	}

	return {
		mul,
		identity,
		translate,
		scale,
		rotate,
		lookAt,
		perspective
	}
})()