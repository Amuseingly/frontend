import "./styles/Global.scss";
import Sidebar from "./components/sidebar/Sidebar";
import "typeface-roboto";
import Header from "./components/header/Header";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Search from "./pages/Search";
import Player from "./components/player/Player";
import {useState} from "react";

function App() {
    let [playingHistory, setPlayingHistory] = useState([]);
    let [playing, setPlayingState] = useState(false);

    const setPlaying = (song) => {
        if (playing !== false) setPlayingHistory([...playingHistory,playing]);
        setPlayingState(song);
    }

    const skipBackward = () => {
        if (canSkipBackward()) {
            setPlayingState(playingHistory.pop());
        }
    }

    navigator.mediaSession.setActionHandler("previoustrack", skipBackward)

    const canSkipBackward = () => playingHistory.length > 0;

    return <main>
        <BrowserRouter>
            <Header />
            <Sidebar />

            <Switch>
                <Route path="/search">
                    <Search bar setPlaying={setPlaying} />
                </Route>

                <Route path="/">
                    <Search setPlaying={setPlaying} />
                </Route>
            </Switch>

            <Player playing={playing} setPlaying={setPlaying} skipBackward={skipBackward} canSkipBackward={canSkipBackward}  />
        </BrowserRouter>
    </main>;
}

export default App;
