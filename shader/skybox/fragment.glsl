precision mediump float;

varying vec3 v_texCoords;

uniform sampler2D u_skybox;

float pi = 3.1415926;

void main() {
	vec2 texCoords = vec2(0.0);
	texCoords.s = -atan(v_texCoords.z, v_texCoords.x) / (2.0*pi) + 0.5;
	texCoords.t = -asin(v_texCoords.y) / pi + 0.5;

	gl_FragColor = texture2D(u_skybox, texCoords);
}