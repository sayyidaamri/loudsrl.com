/* =========================================================
   Fluid — liquid-chrome background (raw WebGL, no library)
   Domain-warped fbm height field, lit with specular + fake
   environment bands. Tint lerps between pages.
   API: Fluid.init(canvas, {tint}), Fluid.setTint([r,g,b]),
        Fluid.setIntro(0..1), Fluid.setFocus(0..1)
   ========================================================= */
(function () {
  "use strict";

  var VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;",
    "uniform vec3 uTint;uniform vec3 uHi;uniform float uIntro;uniform float uLight;uniform float uFlat;",
    "float h21(vec2 p){p=fract(p*vec2(233.34,851.73));p+=dot(p,p+23.45);return fract(p.x*p.y);}",
    "float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*f*(f*(f*6.-15.)+10.);",
    " return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);}",
    "float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,-.6,.6,.8);",
    " for(int i=0;i<4;i++){v+=a*noise(p);p=r*p*1.9;a*=.45;}return v;}",
    "float field(vec2 p){float t=uTime*.035;",
    " vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,1.3)-t));",
    " vec2 r=vec2(fbm(p+4.*q+vec2(1.7,9.2)+t*.7),fbm(p+4.*q+vec2(8.3,2.8)-t*.5));",
    " return fbm(p+4.*r);}",
    "void main(){",
    " vec2 uv=gl_FragCoord.xy/uRes;vec2 p=(gl_FragCoord.xy-.5*uRes)/min(uRes.x,uRes.y);",
    " float zoom=mix(.45,1.,uIntro);p*=.58*zoom;",
    " vec2 m=(uMouse-.5)*vec2(uRes.x/uRes.y,1.);p+=m*.08;",
    " float e=.006;float h=field(p);",
    " float hx=field(p+vec2(e,0.)),hy=field(p+vec2(0.,e));",
    " vec3 n=normalize(vec3((h-hx)/e*.11,(h-hy)/e*.11,1.));",
    " vec3 v=vec3(0.,0.,1.);vec3 l=normalize(vec3(-.4,.6,.8));",
    " vec3 rf=reflect(-v,n);",
    " float env=smoothstep(.86,1.,sin(rf.x*4.+rf.y*2.5+h*3.)*.5+.5);",
    " float spec=pow(max(dot(reflect(-l,n),v),0.),36.);",
    " float fres=pow(1.-max(n.z,0.),3.);",
    " float diff=max(dot(n,l),0.)*.25;",
    " vec3 base=uTint*(mix(.12,.62,uFlat)+diff*.8+h*h*mix(.7,.5,uFlat));",
    " vec3 col=base+uHi*(env*.55+spec*.85+fres*.45)*smoothstep(.3,.75,h+.1);col=pow(col,vec3(1.35));",
    " col=mix(col,vec3(1.)-col*.15,uLight);",
    " float vig=smoothstep(1.25,.25,length(uv-.5));col*=mix(.55,1.,vig);",
    " col*=smoothstep(0.,.35,uIntro);",
    " col+=uHi*(1.-smoothstep(0.,.6,uIntro))*.35*env;",
    " gl_FragColor=vec4(col,1.);}"
  ].join("\n");

  var gl, prog, canvas, U = {}, raf, t0 = performance.now();
  var tint = [0.06, 0.06, 0.08], tintTo = tint.slice();
  var hi = [0.62, 0.62, 0.7], hiTo = hi.slice();
  var intro = 1, introTo = 1, light = 0, lightTo = 0;
  var mouse = [0.5, 0.5], mouseTo = [0.5, 0.5];
  var scale = 0.5, flat = 0;

  function compile(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  function resize() {
    var w = Math.round(innerWidth * scale), h = Math.round(innerHeight * scale);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    resize();
    for (var i = 0; i < 3; i++) { tint[i] = lerp(tint[i], tintTo[i], 0.04); hi[i] = lerp(hi[i], hiTo[i], 0.04); }
    intro = lerp(intro, introTo, 0.02); light = lerp(light, lightTo, 0.05);
    mouse[0] = lerp(mouse[0], mouseTo[0], 0.03); mouse[1] = lerp(mouse[1], mouseTo[1], 0.03);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, (now - t0) / 1000);
    gl.uniform2f(U.uMouse, mouse[0], mouse[1]);
    gl.uniform3fv(U.uTint, tint); gl.uniform3fv(U.uHi, hi);
    gl.uniform1f(U.uIntro, intro); gl.uniform1f(U.uLight, light); gl.uniform1f(U.uFlat, flat);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  window.Fluid = {
    init: function (el, opts) {
      canvas = el; opts = opts || {};
      gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, powerPreference: "high-performance" });
      if (!gl) { canvas.style.background = "#0b0b0f"; return false; }
      scale = Math.min(window.devicePixelRatio || 1, 2) * (innerWidth < 768 ? 0.45 : 0.55);
      prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog); gl.useProgram(prog);
      var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ["uRes", "uTime", "uMouse", "uTint", "uHi", "uIntro", "uLight", "uFlat"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, k); });
      if (opts.from) { tint = opts.from.tint.slice(); hi = opts.from.hi.slice(); }
      if (opts.tint) { tintTo = opts.tint.slice(); hiTo = (opts.hi || hiTo).slice(); if (!opts.from) { tint = tintTo.slice(); hi = hiTo.slice(); } }
      if (opts.intro) { intro = 0; introTo = 0; }
      flat = opts.flat || 0;
      window.addEventListener("pointermove", function (e) { mouseTo = [e.clientX / innerWidth, 1 - e.clientY / innerHeight]; }, { passive: true });
      raf = requestAnimationFrame(frame);
      return true;
    },
    setTint: function (t, h) { tintTo = t.slice(); if (h) hiTo = h.slice(); },
    getState: function () { return { tint: tint.slice(), hi: hi.slice() }; },
    setIntro: function (v) { introTo = v; },
    setLight: function (v) { lightTo = v; }
  };
})();
