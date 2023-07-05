precision mediump float;

attribute vec3 a_position;
attribute vec2 a_texCoords;

varying vec2 v_texCoords;

uniform mat4 u_matWorld;
uniform mat4 u_matView;
uniform mat4 u_matProj;

void main()
{
	v_texCoords = a_texCoords;

	gl_Position = u_matProj * u_matView * u_matWorld * vec4(a_position, 1.0);;
}
