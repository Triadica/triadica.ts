
precision mediump float;

{{triadica_colors}}
{{triadica_noises}}

varying float v_s;
varying float v_r;
varying vec2 v_uv;
varying float v_h;
varying float v_time;

void main() {
  gl_FragColor = vec4(hsl2rgb(0.20 + v_h * 0.4, 0.9, 0.6 + v_h * 0.3), 1.0);
}
