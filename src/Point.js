/* eslint import/no-anonymous-default-export : 0 */
import { useEffect, useMemo, useState, useRef } from "react";
import { geoMercator, geoCentroid, geoPath } from 'd3-geo';
import { fetchDataSvg, fetchDataJson, fetchDataCsv } from "./utils/fetch";

export default function ({
    ...props
}) {
    const width = 800;
    const height = 400;

    const longitude = -74.005941; // New York
    const latitude = 40.712784;

    const newyorkCoords = [-74.005941, 40.712784]
    // const newyorkCoords = [0, 0]

    const [html, setHtml] = useState(undefined);
    const [geoObject, setGeoObject] = useState(undefined);
    const [cameraX, setCameraX] = useState(longitude);
    const [cameraY, setCameraY] = useState(latitude);
    const [cameraScale, setCameraScale] = useState(100);
    const [cameraRotation, setCameraRotation] = useState(0);
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
          setHtml(str);
          console.log('got html')
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


    const svgContent = useMemo(() => {
      if (html) {
        const domElement = new DOMParser().parseFromString(html, 'text/xml');
        return Array.from(domElement.children[0].children).map(c => c.outerHTML).join('\n');
      }
      
    }, [html]);

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

    if (!html || !geoObject) {
    // if (!html || !geoObject || !referencePositions) {
        return <>Coucou</>;
    }

    const style = {
        position: 'fixed',
        top: '0px',
        left: '0px'
    }

    const geoGenerator = geoPath(projection);

    const INITIAL_SCALE = 100;
    const initialX = 480,
          initialY = 250,
          referenceLatitude = 0,
          referenceLongitude = 0;
          
    // uncomment if use of CSV
    // const firstPointReference = referencePositions[0];
    // const {x: initialX, y: initialY, latitude: referenceLatitude, longitude: referenceLongitude} = firstPointReference;
    const [newX, newY] = projectionWithoutRotation([referenceLatitude, referenceLongitude]);
    const scaleFactor = cameraScale / INITIAL_SCALE;

    const svgTransform = `rotate(${-cameraRotation})translate(${newX - initialX}, ${newY - initialY})scale(${scaleFactor})`;
    // console.log('dom element', Array.from(domElement.children[0].children).map(c => c.outerHTML).join('\n'))

    return (
        <>
            <div
                style={style}
                ref={svgRef}
            >
              <svg width={960} height={500}
              transform={svgTransform}

                dangerouslySetInnerHTML={{
                  __html: svgContent
                }}

              />
            </div>


            <svg
                width={960}
                height={500}
                // viewBox="0 0 960 500"
                style={style}
            // transform={transform}
            >
              <rect x={0} y={0} width={960} height={500} fill="none" stroke="red" />
                {
                  geoObject.features.map((feature, featureIndex) => {
                    return <path key={featureIndex} d={geoGenerator(feature)} fill="none" stroke="red" />
                  })
                }
                <circle cx={projection(newyorkCoords)[0]} cy={projection(newyorkCoords)[1]} r={5 +  1 / cameraScale} fill='blue'></circle>
                <circle cx={projection([0, 0])[0]} cy={projection([0, 0])[1]} r={5 +  1 / cameraScale} fill='green'></circle>
            </svg>

            <div style={style}>
              <button onClick={() => setCameraX(cameraX + range * 10)}>Gauche</button>
                <button onClick={() => setCameraX(cameraX - range * 10)}>Droite</button>
                <button onClick={() => setCameraY(cameraY + range * 10)}>Haut</button>
                <button onClick={() => setCameraY(cameraY - range * 10)}>Bas</button>
                <button onClick={() => setCameraScale(cameraScale + range)}>Zoom</button>
                <button onClick={() => setCameraScale(cameraScale - range)}>De-zoom</button>
                <button onClick={() => setCameraRotation(cameraRotation + 1)}>Pivoter vers la gauche</button>
                <button onClick={() => setCameraRotation(cameraRotation - 1)}>Pivoter vers la droite</button>
                <ul>
                  <li>centre de la  projection (ln/lg) : [{cameraX}, {cameraY}]</li>
                  <li>scale de la projection : {cameraScale}</li>
                  <li>rotation : {cameraRotation}°</li>
                  <li>Transform : <code>{svgTransform}</code></li>
                </ul>
            </div>
        </>
    )
}