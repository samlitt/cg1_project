#extension GL_EXT_draw_buffers : require

precision mediump float;

varying vec3 v_texCoords;

uniform sampler2D u_skybox;

float pi = 3.1415926;

void main() {
	vec2 texCoords = vec2(0.0);
	texCoords.s = -atan(v_texCoords.z, v_texCoords.x) / (2.0*pi) + 0.5;
	texCoords.t = -asin(v_texCoords.y) / pi + 0.5;

	gl_FragData[0] = texture2D(u_skybox, texCoords);

	float brightness = dot(gl_FragData[0].rgb, vec3(0.2126, 0.7152, 0.0722));
   if(brightness > 0.9)
   	gl_FragData[1] = vec4(gl_FragData[0].rgb, 1.0);
   else
   	gl_FragData[1] = vec4(0.0, 0.0, 0.0, 1.0);
}
