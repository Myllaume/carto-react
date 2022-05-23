import { useEffect, useMemo, useRef, useState } from "react";
import { geoPath, geoMercator } from 'd3-geo';
import { fetchDataJson, fetchDataSvg } from "./utils/fetch";

export default function App() {
  const [html, setHtml] = useState(undefined);
  const [pathElements, setPathElements] = useState(undefined);
  // const [projection, setProjection] = useState(undefined);

  const { width, height } = useMemo(() => {
    return {
      width: 800,
      height: 400
    }
  }, []);

  // const geoGenerator = useMemo(() => {
  //   let projection = geoMercator();
  //   // projection([-3.0026, 16.7666])

  //   return geoPath(projection)
  // }, []);

  useEffect(() => {
    console.log('before load data');
    fetchDataJson('world_map.geojson').then((geoObject) => {
      console.log('load data', {width, height});
      let newProjection = geoMercator();
      const { features } = geoObject;
      newProjection.fitSize([width, height], geoObject);
      console.log('set size', newProjection);
      console.log('test : ', newProjection([0, 0]))
      // setProjection(newProjection);

      const geoGenerator = geoPath(newProjection);
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

  if (!pathElements) {
    return <>Chargement en cours</>
  }

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
    </svg>
  );
}