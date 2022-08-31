
{{triadica_perspective}}
{{triadica_noises}}

uniform float u_time;

attribute vec3 a_position;

varying float v_r;
varying float v_s;
varying vec2 v_uv;
varying float v_h;
varying float v_time;

float bend_snoise(vec2 xy) {
  return 2.0 * abs(0.5 - snoise(xy));
}

float bend2_snoise(vec2 xy) {
  return 2.0 * abs(0.5 - bend_snoise(xy));
}

float bend3_snoise(vec2 xy) {
  return 2.0 * abs(0.5 - bend2_snoise(xy));
}

#define product(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)

void main() {
  v_uv = vec2(a_position.x, a_position.z);
  float a = snoise(vec2(2.3, floor(length(v_uv) * 0.006 )));
  vec2 direction = normalize(vec2(a_position.x, a_position.z));
  float b = bend2_snoise(direction * 1.4 + vec2(20.0, 10.0));
  float l = length(v_uv);

  // vec3 p = a_position / (1.2 + pow(b, 1.0) * 0.04 );
  vec3 p = a_position;
  p /= (1.2 + pow(b, 1.0) * 0.2 );
  p.y = l / (1.2 + pow(b, 1.0) * 0.2 );
  // vec2 xy = vec2(p.x, p.y);
  // float angle = l * 0.0001;
  // vec2 rot2 = vec2(cos(angle), sin(angle));
  // xy = product(xy, rot2);
  // p.x = xy.x;
  // p.y = xy.y;

  // vec3 p = a_position;
  p.y += a * 40.0 - 40.0;
  v_h = a;

  PointResult result = transform_perspective(p);

  v_s = result.s;
  v_r = result.r;
  v_time = u_time;

  gl_Position = vec4(result.point * 0.002, 1.0);
  // gl_Position = vec4(a_position/100.0, 1.0);
}
