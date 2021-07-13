import "./styles/Player.scss";
import {BACKEND_URL} from "../../libs/config";
import ReactAudioPlayer from "react-audio-player";
import React, {useEffect, useState} from "react";
import {faPause, faPlay, faRandom, faRedoAlt, faStepBackward, faStepForward} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import axios from "axios";

async function getRandom() {
    try {
        const response = await axios.get(BACKEND_URL + "/search/query", {params: {random: "true"}});
        if (response.data.hasOwnProperty("error")) {
            return [];
        } else {
            return response.data;
        }
    } catch (e) {
        return [];
    }
}

export default function Player(props) {
    let [length, setLength] = useState(0);
    let [position, setPosition] = useState(0);
    let [playing, setPlaying] = useState(false);
    let [loop, setLoop] = useState(false);
    let [shuffle, setShuffle] = useState(true);
    let [random, setRandom] = useState([]);
    let rap = false;

    const getShuffle = async () => setRandom(await getRandom());

    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        getShuffle();
    }, []);

    const onLoadedMetadata = (e) => setLength(e.target.duration);
    const onListen = (e) => setPosition(e);
    const onSeeked = (e) => setPosition(e.target.currentTime);
    const onEnd = () => {
        setPlaying(false);
        if (!loop && shuffle) {
            next();
        }
    };
    const next = () => {
        if (random.length !== 0) {
            props.setPlaying(random[Math.floor(Math.random() * random.length)]);
        }
    }

    // Update Media Overlay
    useEffect(() => {
        if (props.playing !== false) {
	    try {
            document.title = props.playing.title + " | Amuseing";
            navigator.mediaSession.metadata = new window.MediaMetadata({
                title: props.playing.title,
                artist: props.playing.all_artists.split(",").join(", "),
                artwork: [{src: BACKEND_URL + props.playing.iconUrl}]
            });
            } catch (ignored) {}
        }
    }, [props.playing]);

    try {navigator.mediaSession.setActionHandler("nexttrack", next);} catch (ignored) {}

    const onError = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    const togglePlaying = () => {
        if (rap.audioEl.current.paused) {
            rap.audioEl.current.play();
        } else {
            rap.audioEl.current.pause();
        }
    }

    const toggleLoop = () => setLoop(!loop);
    const toggleShuffle = () => setShuffle(!shuffle);

    useEffect(() => {
        setLength(0);
        setPosition(0);
    }, [props.playing]);

    const getTime = (seconds) => {
        seconds = Math.floor(seconds);
        let secondsActual = seconds % 60;
        let minutes = (seconds - secondsActual) / 60;
        return minutes.toFixed(0) + ":" + secondsActual.toFixed(0).padStart(2, "0");
    }


    if (props.playing) {
        return <div className="player">
            <div className="track-info">
                <div className={"track-icon"} style={{backgroundImage: "url(" + BACKEND_URL + props.playing.iconUrl + ")"}} />
                <div className={"track-title"}>{props.playing.title}</div>
                <div className={"track-artists"}>{props.playing.all_artists.replace(/,/g, ", ")}</div>
            </div>

            <ReactAudioPlayer src={BACKEND_URL + props.playing.audioUrl} ref={e => rap = e} autoPlay loop={loop} listenInterval={1000} onListen={onListen} onSeeked={onSeeked} onLoadedMetadata={onLoadedMetadata} onPause={onPause} onPlay={onPlay} onError={onError} onEnded={onEnd} />
            <div className="controls">
                <div className="shuffle" onClick={toggleShuffle}>
                    <FontAwesomeIcon icon={faRandom} className={shuffle ? "icon-enabled" : ""} />
                </div>
                <div className={"skip back" + (props.canSkipBackward() ? "" : " disabled")} onClick={props.skipBackward}>
                    <FontAwesomeIcon icon={faStepBackward} className={shuffle ? "icon-enabled" : ""} />
                </div>
                <div className="playPause" onClick={togglePlaying}>
                    {playing ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}
                </div>
                <div className="skip" onClick={next}>
                    <FontAwesomeIcon icon={faStepForward} className={shuffle ? "icon-enabled" : ""} />
                </div>
                <div className="repeat" onClick={toggleLoop}>
                    <FontAwesomeIcon icon={faRedoAlt} className={loop ? "icon-enabled" : ""} />
                </div>
            </div>
            <div className="trackInfoProgress">
                <p>{getTime(position)}</p>
                <div className="progressBar">
                    <div className="progressBar-progress" style={{width: length === 0 ? 0 : (position/length * 100).toFixed(2) + "%"}} />
                </div>
                <p>{getTime(length)}</p>
            </div>
        </div>;
    } else return <div className="player" />;
}
