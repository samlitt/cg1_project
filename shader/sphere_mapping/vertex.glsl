precision mediump float;

attribute vec3 a_position;
attribute vec2 a_texCoords;
attribute vec3 a_normal;

varying vec3 v_normal;
varying vec3 v_camDir;

uniform mat4 u_matWorld;
uniform mat4 u_matView;
uniform mat4 u_matProj;

uniform mat3 u_matWorldNormal;
uniform mat3 u_matViewNormal;

uniform vec3 u_camDir;

void main()
{
	v_normal = normalize(u_matWorldNormal * a_normal);
	v_camDir = u_camDir;
	gl_Position = u_matProj * u_matView * u_matWorld * vec4(a_position, 1.0);	
}