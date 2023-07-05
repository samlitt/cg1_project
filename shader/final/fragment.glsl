precision mediump float;

varying vec2 v_texCoords;

uniform sampler2D u_sceneSampler;
// uniform sampler2D u_bloomSampler;

void main() {
	vec3 sceneColor = texture2D(u_sceneSampler, v_texCoords).rgb;
	// vec3 bloomColor = texture2D(u_bloomSampler, v_texCoords).rgb;
	gl_FragColor = vec4(sceneColor, 1.0);
}