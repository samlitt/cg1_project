#extension GL_EXT_draw_buffers : require

precision mediump float;

varying vec2 v_texCoords;

uniform sampler2D u_texture;

void main() 
{
	gl_FragData[0] = texture2D(u_texture, v_texCoords) * 1.3;
	gl_FragData[1] = vec4(gl_FragData[0].rgb, 1.0);
}