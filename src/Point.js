/* eslint import/no-anonymous-default-export : 0 */
import { useEffect, useMemo, useState, useRef } from "react";
import { geoMercator, geoPath } from 'd3-geo';
import { fetchDataSvg, fetchDataJson/*, fetchDataCsv*/ } from "./utils/fetch";
import { useSpring, animated } from 'react-spring'


export const Path = ({ children, className, onClick, ...inputProps }) => {
  const props = useSpring(inputProps);
  return (
    <animated.path className={className} onClick={onClick} {...props}>
      {children}
    </animated.path>
  )
}
export const G = ({ children, className, onClick, ...inputProps }) => {
  const props = useSpring(inputProps);
  return (
    <animated.g className={className} onClick={onClick} {...props}>
      {children}
    </animated.g>
  )
}


export default function ({
  ...props
}) {
  const width = 800;
  const height = 400;

  const longitude = -74.005941; // New York
  const latitude = 40.712784;

  const newyorkCoords = [-74.005941, 40.712784]
  // const newyorkCoords = [0, 0]

  const [svgData, setSVGData] = useState(undefined);
  const [geoObject, setGeoObject] = useState(undefined);
  const [cameraX, setCameraX] = useState(longitude);
  const [cameraY, setCameraY] = useState(latitude);
  const [cameraScale, setCameraScale] = useState(100);
  const [cameraRotation, setCameraRotation] = useState(0);
  const [controlVisible, setControlVisible] = useState(false);
  // const [referencePositions, setReferencePositions] = useState();
  const svgRef = useRef(null);
  // const [coords, setCoords] = useState()
  // const longitude = 2.3266688; // médialab
  // const latitude = 48.8564475;

  const range = 1;

  useEffect(() => {
    console.log('before load data');
    fetchDataJson('world_map.geojson').then((geoObject) => {
      console.log('set geo object');
      setGeoObject(geoObject)
    })
  }, []);

  useEffect(() => {
    fetchDataSvg('world_map_960x500.svg')
      .then(str => {
        setSVGData(str);
        // uncomment if reference point csv is used
        // return fetchDataCsv('reference_positions.csv')
      })
    // .then(csv => {
    //   const cleanCsv = csv.map(obj => Object.entries(obj).reduce((res, [key, val]) => ({
    //     ...res,
    //     [key]: +val
    //   }), {}));
    //   setReferencePositions(cleanCsv)
    // })
  }, []);

  useEffect(function getGeoObject() {
    fetchDataJson('world_map.geojson').then((geoObject) => {
      setGeoObject(geoObject);
    })
  }, [cameraX, cameraY, cameraScale]);

  const style = {
    position: 'fixed',
    top: '0px',
    left: '0px'
  }

  /**
   * Actual industrializable code starts here
   */

  /**
   * We will use directly the content of the svg
   */
   const svgContent = useMemo(() => {
    const extractSVGContentRegexp = /<svg[^>]+>([\s\S]*)<\/svg>/gm;
    if (svgData) {
       const match = extractSVGContentRegexp.exec(svgData);
       if (match) {
         return match[1].trim()
       }
     }
 
   }, [svgData]);
  /**
   * Compute projection with actual parameters
   * We have to compute two projections because we need to 
   * use one without rotation params as it is simpler to handle rotation
   * directly with a "rotate" transform equal to the "angle" projection params.
   * Alternative would be to use a two-reference-points strategy
   * that would probably include polar-to-cartesian operations.
   */
  const [projection, projectionWithoutRotation] = useMemo(() => {
    const newProjection = geoMercator()
      .angle(cameraRotation)
      .scale(cameraScale)
      .center([cameraX, cameraY]);
    const newProjectionWithoutRotation = geoMercator()
      .scale(cameraScale)
      .center([cameraX, cameraY])

    return [newProjection, newProjectionWithoutRotation];
  }, [cameraX, cameraY, cameraScale, cameraRotation])
   const geoGenerator = geoPath(projection);
   // scale as set in the svg generation step
   const INITIAL_SCALE = 100;
   // position of the null island in the background svg
   // x, y in pixels
   const initialX = 480,
     initialY = 250,
     // latitude and longitude of the null island
     referenceLatitude = 0,
     referenceLongitude = 0;
 
   // uncomment if use of the reference points CSV !
   // It is commented as we actually need only one ref point, so its data is hard-coded above (initialX, ...)
   // const firstPointReference = referencePositions[0];
   // const {x: initialX, y: initialY, latitude: referenceLatitude, longitude: referenceLongitude} = firstPointReference;
   
   // 1. we compute new screen coordinates of the null island
   const [newX, newY] = projectionWithoutRotation([referenceLatitude, referenceLongitude]);
   // we will add a translate transform to the svg to match the displacement between original and new position of the null island
   const svgTranslateX = newX - initialX;
   const svgTranslateY = newY - initialY;
 
   // we will add a scale equal to the ratio between initial svg projection scale and new scale
   const scaleFactor = cameraScale / INITIAL_SCALE;
   // svg transform includes the camera rotation (in °) and the translation + scaling
   const svgTransform = `rotate(${-cameraRotation})translate(${svgTranslateX}, ${svgTranslateY})scale(${scaleFactor})`; 

  if (!svgContent || !geoObject) {
    return <>Loading</>;
  }

  
  return (
    <>
      <div
        style={style}
        ref={svgRef}
      >
        <svg width={960} height={500}
        >
          <G
            transform={svgTransform}
            transform-origin={'center'}
            dangerouslySetInnerHTML={{
              __html: svgContent
            }}
          />
          {/* control objects */}
          {
            controlVisible ?
            <>
              <rect x={0} y={0} width={960} height={500} fill="none" stroke="red" />
              {
                geoObject.features.map((feature, featureIndex) => {
                  return <path key={featureIndex} d={geoGenerator(feature)} fill="none" stroke="red" />
                })
              }
              <circle cx={projection(newyorkCoords)[0]} cy={projection(newyorkCoords)[1]} r={5 + 1 / cameraScale} fill='blue'></circle>
              <circle cx={projection([0, 0])[0]} cy={projection([0, 0])[1]} r={5 + 1 / cameraScale} fill='green'></circle>
            </>
            : null
          }
          
        </svg>

      </div>

      <div style={style}>
        <button onClick={() => setCameraX(cameraX + range * 10)}>Gauche</button>
        <button onClick={() => setCameraX(cameraX - range * 10)}>Droite</button>
        <button onClick={() => setCameraY(cameraY + range * 10)}>Haut</button>
        <button onClick={() => setCameraY(cameraY - range * 10)}>Bas</button>
        <button onClick={() => setCameraScale(cameraScale + range)}>Zoom</button>
        <button onClick={() => setCameraScale(cameraScale - range)}>De-zoom</button>
        <button onClick={() => setCameraRotation(cameraRotation + 1)}>Pivoter vers la gauche</button>
        <button onClick={() => setCameraRotation(cameraRotation - 1)}>Pivoter vers la droite</button>
        <button onClick={() => setControlVisible(!controlVisible)}>{controlVisible ? 'cacher le contrôle' : 'montrer le contrôle'}</button>
        {
          controlVisible ?
          <ul>
            <li>centre de la  projection (ln/lg) : [{cameraX}, {cameraY}]</li>
            <li>scale de la projection : {cameraScale}</li>
            <li>rotation : {cameraRotation}°</li>
            <li>Transform : <code>{svgTransform}</code></li>
          </ul>
          : null
        }
        
      </div>
    </>
  )
}