
precision mediump float;

{{triadica_noises}}
{{triadica_colors}}


varying float v_s;
varying float v_r;
varying vec2 v_colorInfo;
varying float v_time;

void main() {
  float a = snoise(vec2(v_colorInfo.x * 0.01, v_time * 0.7 + v_colorInfo.y * 0.01));
  float b = snoise(vec2(v_colorInfo.x * 0.01,  v_colorInfo.y * 0.01));
  gl_FragColor = vec4(hsl2rgb(vec3(b * 0.4 - 0.2, 0.9, 0.2 + a * 0.6)), 1.0);
  // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
