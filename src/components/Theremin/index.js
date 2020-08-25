import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import jsfeat from 'jsfeat';

import './Theremin.css';
import Oscillator from '../Oscillator';

const WIDTH = 640;
const HEIGHT = 480;

const EDGE_SIGNIFICANCE_THRESHOLD = 100000;

const Theremin = () => {
    const video = useRef();
    const canvas = useRef();
    const context = useRef();

    const [linePosition, setLinePosition] = useState();

    useEffect(() => {
        context.current = canvas.current.getContext('2d');
        context.current.fillStyle = 'rgb(0,255,0)';
        context.current.strokeStyle = 'rgb(0,255,0)';
        context.current.lineWidth = 3;
    }, []);

    const img_u8 = useRef(new jsfeat.matrix_t(WIDTH, HEIGHT, jsfeat.U8_t | jsfeat.C1_t));
    const img_gxgy = useRef(new jsfeat.matrix_t(WIDTH * 2, HEIGHT, jsfeat.S32C1_t));
    const y_multiply = useRef(new jsfeat.matrix_t(
        1,
        WIDTH * 2,
        jsfeat.U8C1_t,
        new jsfeat.data_t(
            WIDTH * 2,
            Array(WIDTH * 2)
                .fill(1)
                .map((_, index) => index % 2 === 0 ? 0 : 1)
        )
    ));
    const y_multiplied = useRef(new jsfeat.matrix_t(
        1,
        HEIGHT,
        jsfeat.S32C1_t
    ));

    const setupVideo = useCallback(async () => {
        video.current.srcObject = await window
            .navigator
            .mediaDevices
            .getUserMedia({ video: true });

        video.current.play();
    }, []);

    const tick = useCallback(() => {
        requestAnimationFrame(tick);

        if (video.current && video.current.readyState === video.current.HAVE_ENOUGH_DATA) {
            context.current.drawImage(video.current, 0, 0, WIDTH, HEIGHT);

            const imageData = context.current.getImageData(0, 0, WIDTH, HEIGHT);

            jsfeat.imgproc.grayscale(imageData.data, WIDTH, HEIGHT, img_u8.current);
            jsfeat.imgproc.scharr_derivatives(img_u8.current, img_gxgy.current);

            // HACK: jsfeat doesn't calculate the columns right, so in order to make
            // multiplication work correctly, we need to double the column number
            img_gxgy.current.cols = WIDTH * 2;

            jsfeat.matmath.multiply(
                y_multiplied.current,
                img_gxgy.current,
                y_multiply.current,
            );

            const y_values = y_multiplied.current.data
                .map(Math.abs);

            const max_horizontal = Math.max(...y_values);

            if (max_horizontal > EDGE_SIGNIFICANCE_THRESHOLD) {
                const y_pos = y_values.findIndex((v) => v === max_horizontal);
                context.current.strokeRect(0, y_pos, WIDTH, 1);
                setLinePosition(1 - y_pos / HEIGHT);
            } else {
                setLinePosition(null);
            }
    
        }

    }, [])

    useEffect(() => {
        setupVideo();

        requestAnimationFrame(tick);
    }, [setupVideo, tick]);

    return (
        <div className="Theremin">
            <video className="Theremin__video" width={WIDTH} height={HEIGHT} ref={video} />
            <canvas width={WIDTH} height={HEIGHT} ref={canvas} />
            <Oscillator pitch={linePosition} />
        </div>
    );
};

export default memo(Theremin);