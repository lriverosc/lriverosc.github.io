import fs from 'node:fs';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as icons from 'react-icons/si';
import { FaWindows } from 'react-icons/fa';
import { PanelsTopLeft, Braces, Network, ScanEye, ScanSearch, Camera, Download, AudioLines, PackageOpen, Package, Component, Boxes } from 'lucide-react';
const requireNext = createRequire(import.meta.resolve('next/package.json'));
const sharp = requireNext('sharp');
// Recognizable marks without lettering, with semantic pictograms for tools
// whose available identity is a wordmark. Accessible names stay in keyboard.json.
const marks = [
  ['SiPython','#3776AB'], ['SiQt','#41CD52'], ['SiFlutter','#02569B'], ['SiDotnet','#512BD4'],
  [null,'#512BD4'], ['SiSqlite','#003B57'], [null,'#16A34A'], ['SiHtml5','#E34F26'],
  ['SiCss3','#1572B6'], ['SiJavascript','#D6AF00'], ['SiOpencv','#5C3EE8'], [null,'#9333EA'],
  [null,'#EA580C'], [null,'#16A34A'], ['SiMaplibre','#396CB2'], ['SiFfmpeg','#008000'],
  [null,'#BE123C'], [null,'#0F766E'], [null,'#2563EB'], [null,'#3776AB'],
  ['SiGit','#F05032'], ['SiGithub','#181717'], ['Windows','#0078D4'], ['SiLinux','#171717'],
];
const keys = JSON.parse(fs.readFileSync('src/data/keyboard.json','utf8'));
const symbols = { 1: Component, 3: Boxes, 4: PanelsTopLeft, 6: Network, 9: Braces, 11: ScanEye, 12: ScanSearch, 13: Camera, 16: Download, 17: AudioLines, 18: PackageOpen, 19: Package };
for (const [i,key] of keys.entries()) {
  const [name,color] = marks[i];
  const Icon = symbols[i] || (name === 'Windows' ? FaWindows : icons[name]);
  if (!Icon) throw new Error(`Missing symbol for ${key.label}`);
  const glyph = renderToStaticMarkup(React.createElement(Icon,{size:194,color,...(symbols[i] ? {strokeWidth:1.8} : {})})).replace('<svg ', '<svg x="31" y="15" ');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="224" viewBox="0 0 256 224">${glyph}</svg>`;
  fs.writeFileSync(`public${key.icon}`,svg);
  await sharp(Buffer.from(svg)).png().toFile(`public${key.icon.replace('.svg','.png')}`);
}
console.log(`Generated ${keys.length} matching SVG icons and embedded-scene textures.`);
