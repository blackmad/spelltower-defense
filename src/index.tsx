// import ReactDOM from 'react-dom';
// import React from 'react';

// import App from './components/App';

// ReactDOM.render(<App name="World" />, document.querySelector('#container'));

import Matter, { Bodies, Body, Svg, Vertices, World } from 'matter-js';
import TextToSVG from 'text-to-svg';
// import computeLayout from 'opentype-layout'

import makerjs from 'makerjs';
import * as opentype from 'opentype.js';
import { getSVGOutline } from './letters';

function select(root: Element, selector: string) {
  return Array.prototype.slice.call(root.querySelectorAll(selector));
}

const decomp = require('poly-decomp');

(window as any).decomp = decomp.decomp;
(window as any).quickDecomp = decomp.quickDecomp;

function makeSVGText(text: string, font: opentype.Font) {
  // // var svg = makerjs.exporter.toSVG(examples);
  // const

  // // sample from https://github.com/Jam3/opentype-layout
  // const scale = (1 / font.unitsPerEm) * fontSize;
  // const layoutOptions = {
  //   align,
  //   lineHeight: lineHeight * font.unitsPerEm,
  //   width: width / scale,
  // };

  // const layout = computeLayout(font, text, layoutOptions);

  // layout.glyphs.forEach((glyph, i) => {
  //   const character = makerjs.models.Text.glyphToModel(glyph.data, fontSize);
  //   character.origin = makerjs.point.scale(glyph.position, scale);
  //   makerjs.model.addModel(this, character, i);
  // });

  const size = 14;
  const union = true;
  const bezierAccuracy = 0;

  const textModel = new makerjs.models.Text(
    font,
    text,
    size,
    union,
    true,
    bezierAccuracy
  );
  return makerjs.exporter.toSVG(textModel);
}

function splitPathsOnZ(path: SVGPathElement): SVGPathElement[] {
  const d = path.getAttribute('d')!;
  const parts = d.split('Z ');
  return parts.map((part, index) => {
    let partD = part;
    if (index !== parts.length - 1) {
      partD += 'Z';
    }
    const parser = new DOMParser();
    // const newPath = parser
    //   .parseFromString(`<path d="${partD}"/>`, 'text/html')
    //   .getElementsByTagName('path')[0];
    const newPath = path.cloneNode() as SVGPathElement;
    newPath.setAttribute('d', partD);
    return newPath;
  });
}

async function makeGame(font: opentype.Font, textToSVG: TextToSVG) {
  const engine = Matter.Engine.create();
  const render = Matter.Render.create({
    element: document.body,
    engine,
  });

  // parms: x,y,width,height,options

  const topWall = Bodies.rectangle(400, 50, 720, 20, { isStatic: true });
  const leftWall = Bodies.rectangle(50, 210, 20, 300, { isStatic: true });
  const rightWall = Bodies.rectangle(750, 210, 20, 300, { isStatic: true });
  const bottomWall = Bodies.rectangle(400, 350, 720, 20, { isStatic: true });

  const walls = [topWall, leftWall, rightWall, bottomWall];
  walls.forEach(w => {
    w.restitution = 1.0;
    w.friction = 0.0;
    w.frictionStatic = 0.0;
  });

  Matter.World.add(engine.world, walls);

  const boxA = Matter.Bodies.rectangle(400, 200, 80, 80);
  boxA.restitution = 1.0;
  boxA.friction = 0.0;
  boxA.frictionStatic = 0.0;
  boxA.frictionAir = 0.0;

  const boxB = Matter.Bodies.rectangle(450, 50, 80, 80);

  const mouse = Matter.Mouse.create(render.canvas);
  const mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse,
    constraint: {
      render: { visible: true },
    } as any,
  });
  (render as any).mouse = mouse;
  engine.world.gravity.y = 0;

  Body.setVelocity(boxA, { x: 10, y: -10 });

  // const svgString = textToSVG.getSVG('e');
  // const svgString =
  //   '<svg width="207.7" height="75.2" viewBox="0 0 207.7 75.2" xmlns="http://www.w3.org/2000/svg"><g id="svgGroup" stroke-linecap="round" fill-rule="evenodd" font-size="9pt" stroke="#000" stroke-width="0.25mm" fill="none" style="stroke:#000;stroke-width:0.25mm;fill:none"><path d="M 25.7 74 L 0 6.5 L 9.3 2.9 L 31.3 63.6 L 53.4 3.2 L 62 6.5 L 36.4 74 L 25.7 74 Z" id="0" vector-effect="non-scaling-stroke"/><path d="M 108.6 51.7 L 72.2 51.7 A 24.088 24.088 0 0 0 73.339 56.725 Q 74.675 60.538 77.3 63.1 Q 81.5 67.2 88.4 67.2 Q 92.9 67.2 96.5 66.25 Q 100.1 65.3 103.4 63.8 L 105.5 71.5 A 35.406 35.406 0 0 1 100.681 73.342 A 44.267 44.267 0 0 1 97.4 74.2 A 40.711 40.711 0 0 1 92.308 74.98 A 54.607 54.607 0 0 1 87.3 75.2 A 29.178 29.178 0 0 1 81.504 74.647 A 23.608 23.608 0 0 1 77.2 73.35 Q 72.7 71.5 69.55 68.05 A 22.127 22.127 0 0 1 65.904 62.55 A 27.574 27.574 0 0 1 64.7 59.55 A 31.581 31.581 0 0 1 63.349 53.593 A 42.813 42.813 0 0 1 63 48 A 34.878 34.878 0 0 1 63.804 40.403 A 30.597 30.597 0 0 1 64.7 37.2 A 27.699 27.699 0 0 1 67.514 31.251 A 24.152 24.152 0 0 1 69.5 28.55 Q 72.6 24.9 76.9 22.85 Q 81.2 20.8 86.5 20.8 A 27.908 27.908 0 0 1 91.404 21.211 A 20.619 20.619 0 0 1 96.3 22.7 Q 100.5 24.6 103.3 27.9 Q 106.1 31.2 107.5 35.6 A 30.348 30.348 0 0 1 108.897 44.442 A 34.055 34.055 0 0 1 108.9 44.9 A 75.204 75.204 0 0 1 108.609 51.597 A 69.426 69.426 0 0 1 108.6 51.7 Z M 72.1 44.4 L 100.6 44.4 A 24.355 24.355 0 0 0 100.196 39.815 Q 99.7 37.231 98.596 35.207 A 12.422 12.422 0 0 0 96.8 32.7 A 12.488 12.488 0 0 0 89.839 28.924 A 18.395 18.395 0 0 0 86.3 28.6 Q 80.4 28.6 76.65 32.6 A 14.739 14.739 0 0 0 73.857 37.005 Q 73.032 38.961 72.552 41.361 A 32.287 32.287 0 0 0 72.1 44.4 Z" id="1" vector-effect="non-scaling-stroke"/><path d="M 151.8 21.4 L 149.1 30.7 A 9.763 9.763 0 0 0 146.955 30.088 Q 145.859 29.9 144.6 29.9 Q 141.8 29.9 139.15 31.1 A 13.202 13.202 0 0 0 135.038 34.049 A 15.59 15.59 0 0 0 134.45 34.7 Q 132.461 37.029 131.225 40.628 A 26.039 26.039 0 0 0 131.15 40.85 A 22.895 22.895 0 0 0 130.253 44.662 Q 129.966 46.554 129.912 48.697 A 40 40 0 0 0 129.9 49.7 L 129.9 74 L 120.9 74 L 120.9 22 L 129.6 22 L 129.6 33.3 Q 130.5 30.9 132 28.6 Q 133.5 26.3 135.55 24.6 A 16.676 16.676 0 0 1 139.391 22.23 A 19.32 19.32 0 0 1 140.3 21.85 Q 143 20.8 146.3 20.8 Q 147.8 20.8 149.25 20.95 A 19.695 19.695 0 0 1 150.452 21.11 Q 151.044 21.209 151.564 21.338 A 11.443 11.443 0 0 1 151.8 21.4 Z" id="2" vector-effect="non-scaling-stroke"/><path d="M 160.8 74 L 160.8 0 L 169.8 0 L 169.8 27.4 A 17.447 17.447 0 0 1 170.771 26.418 Q 171.285 25.936 171.888 25.436 A 29.965 29.965 0 0 1 172.3 25.1 A 19.429 19.429 0 0 1 174.969 23.315 A 22.041 22.041 0 0 1 175.65 22.95 A 18.788 18.788 0 0 1 178.138 21.899 A 23.04 23.04 0 0 1 179.8 21.4 A 18.56 18.56 0 0 1 183.071 20.865 A 22.623 22.623 0 0 1 184.8 20.8 Q 189.3 20.8 193.45 22.6 Q 197.6 24.4 200.75 27.8 A 23.706 23.706 0 0 1 204.346 32.952 A 29.885 29.885 0 0 1 205.8 36.2 Q 207.7 41.2 207.7 47.5 A 33.315 33.315 0 0 1 207.013 54.388 A 27.75 27.75 0 0 1 205.7 58.8 A 30.149 30.149 0 0 1 202.692 64.609 A 25.829 25.829 0 0 1 200.4 67.55 Q 197.1 71.2 192.85 73.2 A 20.584 20.584 0 0 1 186.254 75.09 A 19.225 19.225 0 0 1 184.2 75.2 A 22.394 22.394 0 0 1 176.277 73.805 A 21.462 21.462 0 0 1 175.75 73.6 Q 171.8 72 169.2 69.7 L 169.2 74 L 160.8 74 Z M 169.8 35.4 L 169.8 63.2 A 17.99 17.99 0 0 0 173.43 65.385 A 21.802 21.802 0 0 0 175.2 66.1 A 19.462 19.462 0 0 0 181.364 67.196 A 22.039 22.039 0 0 0 181.8 67.2 A 16.26 16.26 0 0 0 187.618 66.166 A 15.526 15.526 0 0 0 188.5 65.8 Q 191.6 64.4 193.8 61.85 A 17.95 17.95 0 0 0 196.542 57.514 A 21.678 21.678 0 0 0 197.25 55.75 A 21.806 21.806 0 0 0 198.322 50.996 A 27.857 27.857 0 0 0 198.5 47.8 Q 198.5 43.3 197.25 39.75 Q 196 36.2 193.85 33.7 Q 191.7 31.2 188.85 29.9 Q 186 28.6 182.8 28.6 A 14.741 14.741 0 0 0 177.173 29.663 A 14.054 14.054 0 0 0 175.05 30.75 Q 171.6 32.9 169.8 35.4 Z" id="3" vector-effect="non-scaling-stroke"/></g></svg>';

  // const svgString = makeSVGText('e', font);
  

  const svgString = await getSVGOutline('A');
  console.log(svgString);

  const svg = new window.DOMParser().parseFromString(
    svgString,
    'image/svg+xml'
  );

  console.log(svg);

  const parentPath = select(svg as any, 'path')[0];
  // const subPaths = select(svg as any, 'path').flatMap(splitPathsOnZ);
  // console.log(subPaths);

  const vertexSets = select(svg as any, 'path').map(function(p) {
    const path = p;
    // const subPaths = splitPathsOnZ(path);
    // console.log(subPaths);
    // console.log(sub);
    return Vertices.scale(Svg.pathToVertices(path, 50), 10, 10, undefined as any);
  });

  console.log(vertexSets);

  const color = '#f19648';

  const svgBody = Bodies.fromVertices(
    0,
    0,
    vertexSets,
    {
      render: {
        fillStyle: color,
        strokeStyle: color,
        lineWidth: 10,
      },
    },
    true
  );
  Body.setVelocity(svgBody, { x: 10, y: 10 });
  Body.translate(svgBody, { x: 100, y: 200 });
  // svgBody.position.y = 200;
  // svgBody.position.x = -200;

  World.add(engine.world, [svgBody]);

  // Matter.World.add(engine.world, [boxA, boxB, mouseConstraint as any]);

  Matter.Engine.run(engine);
  Matter.Render.run(render);
}

const url = '/assets/AllertaStencil-Regular.ttf';
TextToSVG.load('/assets/AllertaStencil-Regular.otf', function(err, textToSVG) {
  if (err) {
    window.alert(err);
    return;
  }
  opentype.load(url, (err, font) => {
    if (err) {
      window.alert(err);
      return;
    }
    makeGame(font!, textToSVG!);
  });
});

if (module && module.hot) {
  module.hot.accept();

  module.hot.addStatusHandler(status => {
    if (status === 'prepare') console.clear();
  });
}
