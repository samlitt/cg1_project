precision mediump float;

varying vec3 v_position;
varying vec3 v_normal;
varying vec2 v_texCoords;

uniform vec3 u_mtlEmission;
uniform vec3 u_mtlAmbient;
uniform vec3 u_mtlDiffuse;
uniform vec3 u_mtlSpecular;
uniform float u_mtlShininess;

uniform sampler2D u_sampler;

struct Light {
	vec4 pos;
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
};

uniform Light u_lights[2];

uniform mat4 u_matView;

vec3 calculateLight(Light light, vec3 N) {
	vec3 ambient = light.ambient * u_mtlAmbient;

	vec3 L = vec3(0.0);
	if (light.pos.w == 0.0) {
		L = normalize(vec3(u_matView * light.pos));
	} else {
		L = normalize(vec3(u_matView * light.pos) - v_position);
	}
	vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));

	vec3 diffuse = vec3(0.0);
	float diffuseLight = max(dot(N, L), 0.0);
	if (diffuseLight > 0.0) {
		diffuse = diffuseLight * u_mtlDiffuse * light.diffuse;
	}

	vec3 specular = vec3(0.0);
	float specLight = pow(max(dot(H, N), 0.0), u_mtlShininess);
	if (specLight > 0.0) {
		specular = specLight * u_mtlSpecular * light.specular;
	}

	return (ambient + diffuse + specular);
}

void main() {
  vec3 N = normalize(v_normal);

  vec4 textureColor = texture2D(u_sampler, v_texCoords);
  vec3 emissive = u_mtlEmission;
  
  vec3 light1 = calculateLight(u_lights[0], N);
	vec3 light2 = calculateLight(u_lights[1], N);

  vec3 lightingColor = emissive + light1 + light2;
  gl_FragColor = vec4(lightingColor * textureColor.rgb, 1.0);
}
