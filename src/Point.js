import { useEffect, useMemo, useState } from "react";
import { geoMercator, geoCentroid, geoPath } from 'd3-geo';
import { fetchDataSvg, fetchDataJson } from "./utils/fetch";

export default function ({
    ...props
}) {
    const width = 800;
    const height = 400;

    const [html, setHtml] = useState(undefined);
    const [geoObject, setGeoObject] = useState(undefined);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [scale, setScale] = useState(150);
    const [coords, setCoords] = useState()
    // const longitude = 2.3266688; // médialab
    // const latitude = 48.8564475;
    const longitude = -74.005941; // New York
    const latitude = 40.712784;
    const range = 50;

    useEffect(() => {
        fetchDataSvg('world_map.svg').then(str => setHtml(str))
    }, []);

    useEffect(function getGeoObject() {
        fetchDataJson('world_map.geojson').then((geoObject) => {
            setGeoObject(geoObject);
        })
    }, [x, y, scale]);

    useEffect(() => {
        if (!geoObject) { return; }
        const offset = [width / 2, height / 2];
        const center = geoCentroid(geoObject)

        let path = geoMercator()
            .scale(scale)
            .center(center)
            .translate(offset)

        const bounds = path.bounds(geoObject);
        console.log(bounds);

        console.log(path(longitude, latitude));
        
        // newProjection
        //     .translate([x, y])
        //     .fitExtent([[0, 0], [width, height]], geoObject);

        // newProjection
        //     .fitSize([width, height], geoObject)
            // .center([x, y])
            // .scale(scale)
            // .translate([x, y]);
        // setCoords(newProjection([longitude, latitude]))

        // setCoords(newProjection([longitude, latitude]))
        // console.log(newProjection([longitude, latitude]));
        // newProjection.scale(scale).translate([x, y])
        // console.log(newProjection([longitude, latitude]));
    }, [geoObject, x, y, scale]);

    // useEffect(() => {
    //     if (!projection) { return }
    //     console.log(projection);
    // }, [projection])

    // const transform = useMemo(() => {
    //     return `translate(${x} ${y})`
    // }, [x, y]);

    // useEffect(() => {
    //     console.log(x);
    // }, [x])

    // https://github.com/d3/d3-geo#projection_scale
    // https://github.com/d3/d3-geo#projection_translate
    // https://stackoverflow.com/questions/62228556/reactjs-d3-how-to-zoom-in-d3-geo-world-map

    if (!html || !coords || !geoObject) {
        return <>Coucou</>;
    }

    const style = {
        position: 'fixed',
        top: '0px',
        left: '0px'
    }

    return (
        <>
            <div
                style={style}
                dangerouslySetInnerHTML={{
                    __html: html
                }}
            />

            <svg
                width={800}
                height={400}
                style={style}
            // transform={transform}
            >
                <circle cx={coords[0]} cy={coords[1]} r={2 + scale} fill='red'></circle>
            </svg>

            <div style={style}>
                <button onClick={() => setX(x + range)}>Droite</button>
                <button onClick={() => setX(x - range)}>Gauche</button>
                <button onClick={() => setY(y - range)}>Haut</button>
                <button onClick={() => setY(y + range)}>Bas</button>
                <button onClick={() => setScale(scale + range)}>Zoom</button>
                <button onClick={() => setScale(scale - range)}>De-zoom</button>
            </div>
        </>
    )
}