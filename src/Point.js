import { useEffect, useMemo, useState } from "react";
import { geoMercator } from 'd3-geo';
import { fetchDataSvg, fetchDataJson } from "./utils/fetch";

export default function ({
    ...props
}) {
    const [html, setHtml] = useState(undefined);
    const [projection, setProjection] = useState(undefined);
    const [coords, setCoords] = useState()
    const longitude = 2.3266688;
    const latitude = 48.8564475;

    const { width, height } = useMemo(() => {
        return {
            width: 800,
            height: 400
        }
    }, []);

    useEffect(() => {
        fetchDataSvg('world_map.svg').then(str => setHtml(str))
    }, []);

    useEffect(() => {
        fetchDataJson('world_map.geojson').then((geoObject) => {
            let newProjection = geoMercator();
            newProjection.fitSize([width, height], geoObject);
            setCoords(newProjection([longitude, latitude]))
        })
    }, []);

    function droite() {
        console.log('à droite');
    }

    // https://github.com/d3/d3-geo#projection_scale
    // https://github.com/d3/d3-geo#projection_translate

    if (!html || !coords) {
        return null;
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
            >
                <circle cx={coords[0]} cy={coords[1]} r={2} fill='red'></circle>
            </svg>

            <div>
                <button onClick={droite}>Droite</button>
                <button>Gauche</button>
            </div>
        </>
    )
}