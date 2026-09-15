"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { usePerfProfile } from "@/hooks/use-perf-profile";

const SOURCE = "/assets/luis/ton618.png";
const FRAGMENT = `
precision mediump float;
uniform sampler2D picture;
uniform float time;
varying vec2 uv;
void main() {
  vec3 original = texture2D(picture, uv).rgb;
  vec2 radial = (uv - vec2(0.51, 0.48)) * vec2(1.333333, 1.0);
  float radius = length(radial);
  float angle = atan(radial.y, radial.x);
  // Only the warm, luminous plasma moves. The dark core and sky stay fixed.
  float plasma = smoothstep(0.12, 0.65, original.r)
    * smoothstep(0.025, 0.18, original.r - original.b);
  float flow = sin(angle * 19.0 + radius * 85.0 - time * 1.7)
    + 0.45 * sin(angle * 37.0 - radius * 130.0 + time * 2.3);
  vec2 tangent = vec2(-radial.y, radial.x) / max(radius, 0.01);
  vec2 offset = (tangent * flow + normalize(radial + vec2(0.0001))
    * sin(angle * 27.0 + time * 2.0)) * 0.0028 * plasma;
  vec3 color = texture2D(picture, uv + offset).rgb;
  color *= 1.0 + 0.055 * plasma * sin(angle * 13.0 - time * 2.2 + radius * 60.0);
  gl_FragColor = vec4(color, 1.0);
}`;

/** Animate the original texture without rotating or resizing the event horizon. */
export default function BlackHole() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ready, disableDecorative, lowEnd, maxDpr } = usePerfProfile();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ready || disableDecorative || lowEnd) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;
    const shaders: WebGLShader[] = [];
    const shader = (type: number, source: string) => {
      const result = gl.createShader(type)!;
      shaders.push(result);
      gl.shaderSource(result, source);
      gl.compileShader(result);
      return result;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, shader(gl.VERTEX_SHADER, `
      attribute vec2 position;
      varying vec2 uv;
      void main() {
        uv = vec2((position.x + 1.0) * 0.5, (1.0 - position.y) * 0.5);
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      shaders.forEach((item) => gl.deleteShader(item));
      gl.deleteProgram(program);
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const time = gl.getUniformLocation(program, "time");
    let frame = 0;
    let visible = false;
    let loaded = false;
    let previous = 0;
    let elapsed = 0;
    const draw = (now: number) => {
      elapsed += previous ? Math.min(now - previous, 50) / 1000 : 0;
      previous = now;
      gl.uniform1f(time, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      canvas.style.opacity = "1";
      frame = requestAnimationFrame(draw);
    };
    const update = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (loaded && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const resize = new ResizeObserver(() => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * Math.min(maxDpr, 1.5)));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * Math.min(maxDpr, 1.5)));
      gl.viewport(0, 0, canvas.width, canvas.height);
    });
    resize.observe(canvas);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(canvas);
    const picture = new window.Image();
    picture.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, picture);
      loaded = true;
      update();
    };
    picture.src = SOURCE;
    const contextLost = () => {
      loaded = false;
      canvas.style.opacity = "0";
      cancelAnimationFrame(frame);
    };
    canvas.addEventListener("webglcontextlost", contextLost);
    document.addEventListener("visibilitychange", update);
    return () => {
      picture.onload = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      canvas.removeEventListener("webglcontextlost", contextLost);
      document.removeEventListener("visibilitychange", update);
      canvas.style.opacity = "0";
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      shaders.forEach((item) => gl.deleteShader(item));
    };
  }, [ready, disableDecorative, lowEnd, maxDpr]);

  return (
    <div className="pointer-events-none relative w-full overflow-hidden dark:mix-blend-screen">
      <Image src={SOURCE} alt="Agujero negro inspirado en TON 618, con un disco de plasma naranja alrededor de su centro oscuro" width={1440} height={1080} priority sizes="(min-width: 1024px) 50vw, 100vw" className="block h-auto w-full" />
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full opacity-0" />
    </div>
  );
}
