
precision mediump float;

{{triadica_colors}}
{{triadica_noises}}

varying float v_s;
varying float v_r;
varying vec2 v_uv;
varying float v_h;

void main() {
  gl_FragColor = vec4(hsl2rgb(v_h * 0.5 - 0.2, 0.8, 0.2 + v_h * 0.6), 1.0);
}
