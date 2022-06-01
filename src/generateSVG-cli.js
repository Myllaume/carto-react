import { geoPath, geoMercator } from 'd3-geo';

import fs from 'fs-extra';


function generateSVG(props = {}) {
  const {
    width = 960,
    height = 500,
    geoJSONPath = '../public/world_map.geojson',
    svgOutputPath = '../public/generated_world_map.svg',

  } = props;
  Promise.resolve()
  .then(() => fs.readFile(geoJSONPath, 'utf-8'))
  .then((str) => {
    let data;
    try {
      data = JSON.parse(str);
      return Promise.resolve(data)
    } catch(e) {
      console.log('JSON parsing error');
      return Promise.reject();
    }
  })
  .then(geoJSONData => {
    const {features} = geoJSONData;
    const projection = geoMercator().scale(100);
    const geoGenerator = geoPath(projection);
    const paths = features.map((d, i) => {
      console.log('process %s / %s', i + 1, features.length);
      return geoGenerator(d)
    });

    const referencePoint = [0, 0];
    const referencePointPosition = projection(referencePoint);
    console.log('reference point (null island) screen coordinates : ', referencePointPosition);
    // console.log(paths);
    const svgStr = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    ${
      paths.map((pathD, i) => `<path stroke="black" fill="none" d="${pathD}"></path>`)
    }
  </svg>
  `;
  return fs.writeFile(svgOutputPath, svgStr, 'utf-8')
  })
  .then(() => {
    console.log('file successfully written at %s', svgOutputPath)
  })
  .catch(error => {
    console.log('Error :');
    console.log(error)
  })
}

generateSVG()