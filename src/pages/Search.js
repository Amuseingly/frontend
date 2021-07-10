import React, {useCallback, useEffect, useState} from "react";
import "./../styles/Search.scss";
import debounce from "../libs/debounce";
import axios from "axios";
import {BACKEND_URL} from "../libs/config";
import {
    faCheck,
    faDownload,
    faExclamationTriangle,
    faPlay,
    faSpinner,
    faUserClock
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faYoutube} from "@fortawesome/free-brands-svg-icons";
const ytRegex = /^(?:https:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([A-z0-9\-_]{11})(?:&.*)?|(?:https:\/\/)?youtu.be\/([A-z0-9\-_]{11})$/;

export default function Search(props) {
    let [query, setQuery] = useState("");
    let [results, setResults] = useState([]);
    let [showDialog, setShowDialog] = useState(false);
    let [youtubeSearch, setYoutubeSearch] = useState("");
    let [ytSearchResults, setYtSearchResults] = useState([]);
    let [status, setStatus] = useState(null);
    // Debouncer
    const debouncedOnChange = useCallback(debounce(doSearch, 300), []);

    async function doSearch(q) {
        if (q !== "" || props.bar !== true) {
            let random = "";
            if (props.bar !== true) random = "true";
            try {
                const response =  await axios.get(BACKEND_URL + "/search/query", {params: {q, random}});
                if (response.data.hasOwnProperty("error")) {
                    setResults([]);
                } else {
                    setResults(response.data);
                }
            } catch (e) {
                console.error("Failed to search!");
            }
        } else {
            if (props.bar) setResults([]);
        }
    }

    const doYoutubeSearch = async () => {
        const matches = youtubeSearch.match(ytRegex);
        if (matches !== null) {
            const url = matches[1] || matches[2];

            const toFetchFrom = BACKEND_URL + "/yt/download/" + url;

            let ci = setInterval(async () => {
                let symbol = faSpinner;
                let statusText = "Loading...";
                let spin = true;

                let state;
                try {state = await axios.get(toFetchFrom);} catch (e) {}

                if (state.data.status === "error") {
                    symbol = faExclamationTriangle;
                    statusText = "An error occurred: " + state.data.error;
                    spin = false;
                    clearInterval(ci);
                } else if (state.data.status === "queued") {
                    symbol = faUserClock;
                    statusText = "Queued. Position: " + state.data.position;
                    spin = false;
                } else if (state.data.status === "processing") {
                    symbol = faSpinner;
                    statusText = "Processing";
                    spin = true;
                } else if (state.data.status === "completed") {
                    symbol = faCheck;
                    statusText = "Complete";
                    spin = false;
                    clearInterval(ci);
                    // Reload
                    setTimeout(async () => {
                        await doSearch(query);
                    }, 1000);
                }

                setStatus(<div className={"status"}>
                    <FontAwesomeIcon icon={symbol} spin={spin} />
                    <p>{statusText}</p>
                </div>);
            }, 1000);
        } else {
            // search
            if (youtubeSearch !== "") {
                let response;
                try {
                    response = await axios.get(BACKEND_URL + "/search/yt", {params: {q: youtubeSearch}});
                } catch (e) {}

                if (!response.data.error) {
                    if (response.data.results) {
                        console.log(response.data.results);
                        setYtSearchResults(response.data.results);
                    }
                }
            }
        }
    };


    // Update between home and search pages
    useEffect(() => doSearch(query), [props.bar]);

    // Run debouncer
    useEffect(() => {debouncedOnChange(query);}, [query, debouncedOnChange]);

    return <div className={"panel"}>
        {(props.bar === true) ?  <input className="searchBox" value={query} onChange={e => setQuery(e.target.value)} /> : null}

        <div className={"results"}>
            {results.map(song => <div onClick={() => props.setPlaying(song)} className={"song"} key={song._id}>
                <div className={"song-icon"} style={{backgroundImage: "url(" + BACKEND_URL + song.iconUrl + ")"}}>
                    <div className={"song-icon-play"}><FontAwesomeIcon icon={faPlay} /></div>
                </div>
                <div className={"song-title"}>{song.title}</div>
                <div className={"song-artists"}>{song.all_artists.replace(/,/g, ", ")}</div>
            </div>)}
            <div className={"song"} onClick={() => {setShowDialog(!showDialog); setYoutubeSearch(""); setStatus(null); setYtSearchResults([]);}}>
                <div className={"song-icon youtube"} >
                    <FontAwesomeIcon icon={faYoutube} />
                </div>
                <div className={"song-title"}>YouTube</div>
                <div className={"song-artists"}>Get more songs from youtube!</div>
            </div>
            {showDialog ? <div className={"dialog-background"}>
                <div className={"dialog"}>
                    <button className={"close"} onClick={() => setShowDialog(false)}>&times;</button>
                    <p className={"title"}>Get From Youtube!</p>
                    <p className={"subtitle"}>Enter a URL to a video or a search query.</p>
                    <input className={"yt-link"} value={youtubeSearch} onChange={e => setYoutubeSearch(e.target.value)} />
                    <button className={"yt-search"} onClick={doYoutubeSearch}>Search</button>
                    {status}
                    <div className={"search-results"}>
                        {ytSearchResults.map(video => <div onClick={async () => {setYoutubeSearch("https://youtu.be/" + video.id); youtubeSearch = "https://youtu.be/" + video.id; await doYoutubeSearch();}} key={video.id} className={"search-result"}>
                            <div className={"search-results-icon"} style={{backgroundImage: "url(" + video.thumbnails.high.url + ")"}}>
                                <div className={"search-results-icon-play"}><FontAwesomeIcon icon={faDownload} /></div>
                            </div>
                            <div className={"search-results-title"}>{video.title}</div>
                            <div className={"search-results-artists"}>{video.channelTitle}</div>
                        </div>)}
                    </div>
                </div>
            </div> : null}
        </div>
    </div>;
}

export function Homepage(props) {
    let p = {...props}
    p.bar = false;
    return <Search bar {...props} />;
}