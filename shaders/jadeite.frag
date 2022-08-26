
precision mediump float;

{{triadica_colors}}
{{triadica_noises}}

varying float v_s;
varying float v_r;
varying vec2 v_uv;
varying float v_h;

void main() {
  // float a = snoise(vec2(2.1, floor(length(v_uv) * 0.3 )));
  // vec2 direction = normalize(v_uv);

  // gl_FragColor = vec4(0.9, 0.2, 1.0, 1.0);
  gl_FragColor = vec4(hsl2rgb(v_h * 0.5 - 0.2, 0.8, 0.1 + v_h * 0.6), 1.0);
}
