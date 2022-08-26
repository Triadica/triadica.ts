
{{triadica_perspective}}
{{triadica_noises}}

// uniform float u_time;

attribute vec3 a_position;

varying float v_r;
varying float v_s;
varying vec2 v_uv;
varying float v_h;

void main() {
  v_uv = vec2(a_position.x, a_position.z);
  float a = snoise(vec2(1.1, floor(length(v_uv) * 0.02 )));
  vec2 direction = normalize(vec2(a_position.x, a_position.z));
  float b = snoise(direction + vec2(0.0, 0.0));

  vec3 p = a_position / (0.8 + pow(b, 2.0) * 0.16 );
  // vec3 p = a_position;
  p.y += a * 200.0 - 40.0;
  v_h = a;

  PointResult result = transform_perspective(p);

  v_s = result.s;
  v_r = result.r;

  gl_Position = vec4(result.point * 0.002, 1.0);
  // gl_Position = vec4(a_position/100.0, 1.0);
}
