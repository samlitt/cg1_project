precision mediump float;

varying vec3 v_normal;
varying vec3 v_camDir;

uniform sampler2D u_skybox;

float pi = 3.1415926;

void main() {
	vec3 normal = normalize(v_normal);
	vec3 texCoordsDir = reflect(-v_camDir, normal);

	vec2 texCoords = vec2(0.0);
	texCoords.s = -atan(texCoordsDir.z, texCoordsDir.x) / (2.0*pi) + 0.5;
	texCoords.t = -asin(texCoordsDir.y) / pi + 0.5;

	gl_FragColor = texture2D(u_skybox, texCoords);
}