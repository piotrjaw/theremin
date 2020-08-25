import {memo, useEffect, useRef} from 'react';

const BASE_FREQUENCY = 261.63;
const DIFF_FREQUENCY = 261.62;

const VOLUME_SWITCH_DURATION = 0.2;

const Oscillator = ({ pitch }) => {
    const audioContext = useRef();
    const oscillator = useRef();
    const gain = useRef();

    useEffect(() => {
        audioContext.current = new AudioContext();
        oscillator.current = new OscillatorNode(audioContext.current);
        gain.current = audioContext.current.createGain();

        oscillator.current.connect(gain.current);
        gain.current.connect(audioContext.current.destination);
        oscillator.current.frequency.value = BASE_FREQUENCY;
        oscillator.current.start();
        gain.current.gain.exponentialRampToValueAtTime(0.00001, audioContext.current.currentTime);
    }, []);

    if (gain.current) {
        if (!!pitch) {
            gain.current.gain.exponentialRampToValueAtTime(
                0.05,
                audioContext.current.currentTime + VOLUME_SWITCH_DURATION
            );
            oscillator.current.frequency.value = BASE_FREQUENCY + pitch * DIFF_FREQUENCY;
        } else {
            gain.current.gain.exponentialRampToValueAtTime(
                0.00001,
                audioContext.current.currentTime + VOLUME_SWITCH_DURATION
            );
        }
    }

    return null;
}

export default memo(Oscillator);