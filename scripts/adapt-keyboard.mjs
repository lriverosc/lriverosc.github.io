// Rebuild the personalized scene using the codec bundled with the installed runtime.
// The original Spline file remains intact; node scripts/adapt-keyboard.mjs regenerates the variant.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
const runtimePath = path.resolve('node_modules/@splinetool/runtime/build/runtime.js');
const runtime = fs.readFileSync(runtimePath, 'utf8');
const codecName = runtime.match(/function \w+\(\w+\)\{return \w+\.pack\(\w+\)\}\w+\.serialize=\w+;function \w+\(\w+\)\{return \w+\.unpack\(\w+\)\}[\s\S]{0,140}?\}\)\((\w+)\|\|/ )?.[1];
if (!codecName) throw new Error('Spline codec changed; inspect the installed runtime before rebuilding.');
fs.mkdirSync('.tools', { recursive: true });
const codecPath = path.resolve('.tools/spline-codec.mjs');
fs.writeFileSync(codecPath, `${runtime}\nexport { ${codecName} as codec };`);
const { codec } = await import(pathToFileURL(codecPath).href);
const scene = codec.deserialize(fs.readFileSync('public/assets/skills-keyboard.spline'));
const keys = JSON.parse(fs.readFileSync('src/data/keyboard.json', 'utf8'));
const flatten = objects => objects.flatMap(o => [o, ...flatten(o.children || [])]);
const objects = flatten(scene.scene.objects);
// Remove the decorative cat from the personalized scene, including both frames.
const cat = objects.find(o => o.data.name === 'bongo-cat');
if (cat) { cat.data.visible = false; cat.children = []; }
const template = structuredClone(objects.find(o => o.data.name === 'legend' && o.data.material?.layers?.some(l => l.data.type === 'texture')));
if (!template) throw new Error('Missing text legend template.');
let count = 0;
for (const key of keys) {
  const object = objects.find(o => o.data.name === key.name);
  if (!object) throw new Error(`Missing physical key: ${key.name}`);
  const legend = flatten(object.children || []).find(o => o.data.name === 'legend');
  if (!legend) throw new Error(`Missing legend: ${key.name}`);
  const id = legend.id;
  const fi = legend.fi;
  legend.data = structuredClone(template.data);
  legend.id = id;
  legend.fi = fi;
  legend.data.visible = true;
  const layer = legend.data.material.layers.find(l => l.data.type === 'texture');
  layer.data.texture.image = { data: fs.readFileSync(`public${key.icon.replace('.svg','.png')}`), name: `${key.label}.png` };
  legend.data.position = [0, 42, 0];
  legend.data.scale = [1, 1, 1];
  legend.data.rotation = [-90, 0, 0];
  legend.children = [];
  // Dark legends remain legible on the formerly charcoal keycaps.
  for (const cap of flatten(object.children || []).filter(o => /^keycap-(desktop|mobile)$/.test(o.data.name))) {
    const material = typeof cap.data.material === 'string' ? scene.shared.materials[cap.data.material] : cap.data.material;
    const color = material?.layers?.find(l => l.data.type === 'color')?.data.color;
    if (color && Math.max(color.r, color.g, color.b) < 0.35) Object.assign(color, { r: 0.72, g: 0.8, b: 0.88 });
  }
  count++;
}
for (const font of Object.values(scene.shared.fonts)) {
  const local = `/assets/fonts/${font.name.replaceAll(' ', '-')}.ttf`;
  if (fs.existsSync(`public${local}`)) font.url = local;
}
const binary = codec.serialize(scene);
fs.writeFileSync('public/assets/neuralcore-keyboard.spline', binary);
const version = createHash('sha256').update(binary).digest('hex').slice(0,12);
fs.writeFileSync('src/data/keyboard-scene.json', JSON.stringify({ url: `/assets/neuralcore-keyboard.spline?v=${version}` }) + '\n');
const check = codec.deserialize(fs.readFileSync('public/assets/neuralcore-keyboard.spline'));
const legends = flatten(check.scene.objects).filter(o => o.data.name === 'legend').map(o => o.data.material?.layers?.find(l => l.data.type === 'texture')?.data.texture.image.name);
for (const key of keys) if (!legends.includes(`${key.label}.png`)) throw new Error(`Icon missing after encoding: ${key.keyLabel}`);
console.log(`Verified ${count} personalized physical keys; all desktop/mobile keycaps and animation events retained.`);
