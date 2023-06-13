precision mediump float;

attribute vec3 a_position;

varying vec3 v_texCoords;

uniform mat4 u_matView;
uniform mat4 u_matProj;

void main()
{
	v_texCoords = a_position;
	vec3 viewPos = (u_matView * vec4(a_position, 0.0)).xyz;
	gl_Position = u_matProj * vec4(viewPos, 1.0);	
}