precision mediump float;

varying vec2 v_texCoords;

uniform sampler2D u_sceneSampler;
uniform sampler2D u_blurSampler;

void main() {
	vec3 sceneColor = texture2D(u_sceneSampler, v_texCoords).rgb;
	vec3 blurColor = texture2D(u_blurSampler, v_texCoords).rgb;
	gl_FragColor = vec4(sceneColor + blurColor, 1.0);
}