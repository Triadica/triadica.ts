
{{triadica_perspective}}

uniform float u_time;

attribute vec3 a_position;
attribute vec2 a_colorInfo;

varying float v_r;
varying float v_s;
varying vec2 v_colorInfo;
varying float v_time;

void main() {
  PointResult result = transform_perspective(a_position);
  vec3 pos_next = result.point;

  v_s = result.s;
  v_r = result.r;
  v_colorInfo = a_colorInfo;
  v_time = u_time;

  gl_Position = vec4(pos_next * 0.002, 1.0);
  // gl_Position = vec4(a_position/100.0, 1.0);
}