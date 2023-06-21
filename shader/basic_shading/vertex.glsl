precision mediump float;

attribute vec3 a_position;
attribute vec3 a_normal;

varying vec3 v_position;
varying vec3 v_normal;

uniform mat4 u_matWorld;
uniform mat4 u_matView;
uniform mat4 u_matProj;
uniform mat3 u_matViewNormal;

void main()
{
	vec4 viewPosition = u_matView * u_matWorld * vec4(a_position, 1.0);

	v_position = viewPosition.xyz / viewPosition.w;
	v_normal = normalize(u_matViewNormal * a_normal);

	gl_Position = u_matProj * viewPosition;
}
