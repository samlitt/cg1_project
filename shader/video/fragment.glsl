#extension GL_EXT_draw_buffers : require

precision mediump float;

varying vec2 v_texCoords;

uniform sampler2D u_texture;

void main() 
{
	gl_FragData[0] = texture2D(u_texture, v_texCoords);
	gl_FragData[1] = texture2D(u_texture, v_texCoords);
}