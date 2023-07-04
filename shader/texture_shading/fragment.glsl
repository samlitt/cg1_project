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

uniform vec4 u_lightPos;
uniform vec3 u_lightAmbient;
uniform vec3 u_lightDiffuse;
uniform vec3 u_lightSpecular;

uniform mat4 u_matView;

uniform float u_minColorFactor;

void main() {
  vec3 N = normalize(v_normal);

  vec4 textureColor = texture2D(u_sampler, v_texCoords);
  vec3 emissive = u_mtlEmission;
  vec3 ambient = u_lightAmbient * u_mtlAmbient;

  vec3 L = vec3(0.0);
  if (u_lightPos.w == 0.0) {
    L = normalize(vec3(u_matView * u_lightPos));
  } else {
    L = normalize(vec3(u_lightPos) - v_position);
  }
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));

  vec3 diffuse = vec3(0.0);
  float diffuseLight = max(dot(N, L), 0.0);
  if (diffuseLight > 0.0) {
    diffuse = diffuseLight * u_mtlDiffuse * u_lightDiffuse;
  }

  vec3 specular = vec3(0.0);
  float specLight = pow(max(dot(H, N), 0.0), u_mtlShininess);
  if (specLight > 0.0) {
    specular = specLight * u_mtlSpecular * u_lightSpecular;
  }

  vec3 lightingColor = emissive + ambient + diffuse + specular;
  lightingColor = mix(vec3(u_minColorFactor), vec3(1.0), lightingColor);
  gl_FragColor = vec4(lightingColor * textureColor.rgb, 1.0);
}
