import { useEffect, useMemo, useRef, useState } from "react";
import { geoPath, geoMercator } from 'd3-geo';
import { fetchDataJson, fetchDataSvg } from "./utils/fetch";

export default function GenerateSVG() {
  const [html, setHtml] = useState(undefined);
  const [pathElements, setPathElements] = useState(undefined);
  // const [projection, setProjection] = useState();


  const referencePoint1 = [0, 0];
  const referencePoint2 = [-74.005941, 40.712784];
  // const [projection, setProjection] = useState(undefined);

  const { width, height } = useMemo(() => {
    return {
      width: 960,
      height: 500
    }
  }, []);

  // const geoGenerator = useMemo(() => {
  //   let projection = geoMercator();
  //   // projection([-3.0026, 16.7666])

  //   return geoPath(projection)
  // }, []);

  let projection = geoMercator().scale(100);


  useEffect(() => {
    console.log('before load data');
    fetchDataJson('world_map.geojson').then((geoObject) => {
      // console.log('load data', {width, height});
      const { features } = geoObject;
      // newProjection.fitSize([width, height], geoObject);

      // setProjection(newProjection)
      // console.log('set size', newProjection);
      // console.log('test : ', newProjection([0, 0]))
      // setProjection(newProjection);

      const geoGenerator = geoPath(projection);
      // console.time('test global path');
      // const path = geoGenerator(geoObject);
      // console.timeEnd('test global path');
      const paths = features.map((d, i) => {
        console.log('process %s / %s', i + 1, features.length);
        return geoGenerator(d)
      });
      setPathElements(paths);


      console.log('done')
    })
  }, []);

  // const mapRef = useRef();

  // useEffect(() => {
  //   fetchDataSvg('world_map.svg').then(html => setHtml(html))
  // }, []);

  // useEffect(() => {
  //   if (!html || !mapRef) { return; }

  //   const svg = mapRef.current.querySelector('svg');
  //   svg.setAttribute('width', width)
  //   svg.setAttribute('height', height)
  //   svg.setAttribute('viewBox', `0 0 ${width / 2} ${height / 2}`)
  // }, [html, mapRef, width, height])

  if (!pathElements || !projection) {
    return <>Chargement en cours</>
  }

  const positionPoint1InPixels = projection(referencePoint1);
  const positionPoint2InPixels = projection(referencePoint2);
  // console.table([positionPoint1InPixels, positionPoint2InPixels])

//   console.log(`
// latitude,longitude,x,y
// ${referencePoint1[0]},${referencePoint1[1]},${positionPoint1InPixels[0]},${positionPoint1InPixels[1]}
// ${referencePoint2[0]},${referencePoint2[1]},${positionPoint2InPixels[0]},${positionPoint2InPixels[1]}
// `)

console.log('scale: ', projection.scale())

  

  return (
    <svg
      { ...{
        width,
        height
      } }
    >
      {
        pathElements.map((pathD, i) => <path stroke="black" fill="none" key={i} d={pathD}></path>)
      }
      <circle cx={positionPoint1InPixels[0]} cy={positionPoint1InPixels[1]} r={5} fill="green" />
      <circle cx={positionPoint2InPixels[0]} cy={positionPoint2InPixels[1]} r={5} fill="blue" />
    </svg>
  );
}