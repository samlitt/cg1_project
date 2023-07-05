precision mediump float;

varying vec2 v_texCoords;

uniform sampler2D u_sampler;
uniform vec2 u_size;
uniform bool u_horizontal;

float weight[5];

void main()
{             
	weight[0] = 0.227027;
	weight[1] = 0.1945946;
	weight[2] = 0.1216216;
	weight[3] = 0.054054;
	weight[4] = 0.016216;

	vec2 tex_offset = 1.0 / u_size;
	 // gets size of single texel
	vec3 result = texture2D(u_sampler, v_texCoords).rgb * weight[0]; // current fragment's contribution
	if(u_horizontal)
	{
		for(int i = 1; i < 5; ++i)
		{
			result += texture2D(u_sampler, v_texCoords + vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];
			result += texture2D(u_sampler, v_texCoords - vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];
		}
	}
	else
	{
		for(int i = 1; i < 5; ++i)
		{
			result += texture2D(u_sampler, v_texCoords + vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];
			result += texture2D(u_sampler, v_texCoords - vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];
		}
	}

	gl_FragColor = vec4(result, 1.0);
}