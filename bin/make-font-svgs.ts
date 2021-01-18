// import TextToSVG from 'text-to-svg';
// import paper from 'paper-jsdom';
import * as opentype from 'opentype.js';
import makerjs from 'makerjs';
import * as _ from 'lodash';
import { sys } from 'typescript';
import * as fs from 'fs';
import paper from 'paper';

const paperJsDom = require('paper-jsdom');

function letterToSVG(text: string, font: opentype.Font) {
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

function loadSVGStringAndGetPath(letter: string, svgData: string) {
  const svgItem = paperJsDom.project.importSVG(svgData) as paper.Item; //, {insert: false})

  const outlineSVGString = paperJsDom.project.exportSVG({
    asString: true,
    bounds: 'content',
  });
  //   console.log(outlineSVGString);
  fs.writeFileSync(`${letter}.svg`, outlineSVGString);

  // show(svgItem, 'black');
  const path = svgItem.children[1];
  //   console.log('num children', svgItem.children.length);
  let actualPath = path;
  if (path.children) {
    // eslint-disable-next-line prefer-destructuring
    actualPath = _.sortBy(
      path.children,
      innerPath => -(innerPath as any).length
    )[0];
    if (actualPath.children?.length > 1) {
      // eslint-disable-next-line prefer-destructuring
      actualPath = _.sortBy(
        actualPath.children,
        innerPath => -(innerPath as any).length
      )[0];
    }
    // console.log(actualPath);
    // console.log('APc', actualPath.children.length);
    // console.log('num children children', path.children.length);
    // actualPath = path.children[0];
  }

  svgItem.remove();
  paper.project.activeLayer.addChild(actualPath);

  return actualPath as paper.Path;
}

function doLetter(letter: string, font: opentype.Font) {
  const svgString = letterToSVG(letter, font);
  //   console.log(svgString);
  const outline = loadSVGStringAndGetPath(letter, svgString);
  // console.log(outline);
  const outlineSVGString = paperJsDom.project.exportSVG({
    asString: true,
    bounds: 'content',
  });
  //   console.log(outlineSVGString);
  fs.writeFileSync(`${letter}-outline.svg`, outlineSVGString);
}

function init() {
  const fontFile = 'src/assets/Arial.ttf';
  opentype.load(fontFile, (err, font) => {
    if (err || !font) {
      console.error(err);
      return;
    }

    const letters = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ];

    letters.forEach(letter => {
      doLetter(letter, font);
    });
  });
}

paperJsDom.setup([10, 10]);
init();
