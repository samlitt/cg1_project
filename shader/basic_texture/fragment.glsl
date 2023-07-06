#extension GL_EXT_draw_buffers : require

precision mediump float;

varying vec2 v_texCoords;

uniform sampler2D u_texture;

void main()
{
	gl_FragData[0] = texture2D(u_texture, v_texCoords);

	float brightness = dot(gl_FragData[0].rgb, vec3(0.2126, 0.7152, 0.0722));
   if(brightness > 1.0)
   	gl_FragData[1] = vec4(gl_FragData[0].rgb, 1.0);
   else
   	gl_FragData[1] = vec4(0.0, 0.0, 0.0, 1.0);
}
