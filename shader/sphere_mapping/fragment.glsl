#extension GL_EXT_draw_buffers : require

precision mediump float;

varying vec3 v_normal;
varying vec3 v_camDir;

uniform sampler2D u_skybox;

float pi = 3.1415926;

void main() {
	vec3 camDir = -v_camDir; // "Rotate" Sphere Map 180°

	vec3 normal = normalize(v_normal);
	vec3 texCoordsDir = reflect(-camDir, normal);

	vec2 texCoords = vec2(0.0);
	texCoords.s = -atan(texCoordsDir.z, texCoordsDir.x) / (2.0*pi) + 0.5;
	texCoords.t = -asin(texCoordsDir.y) / pi + 0.5;

	gl_FragData[0] = texture2D(u_skybox, texCoords);
	
	float brightness = dot(gl_FragData[0].rgb, vec3(0.2126, 0.7152, 0.0722));
   if(brightness > 0.6)
   	gl_FragData[1] = vec4(gl_FragData[0].rgb, 1.0);
   else
   	gl_FragData[1] = vec4(0.0, 0.0, 0.0, 1.0);
}