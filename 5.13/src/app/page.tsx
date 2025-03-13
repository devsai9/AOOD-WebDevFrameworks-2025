'use client'
import { Chart } from "./components/chart/charts";
import styles from "./page.module.css";
import { useEffect, useRef, useState } from "react";

type localStorageObj = {
    name: string,
    score: number,
    speed: number,
    rate: number,
    date: Date
}

export default function Home() {
    const [playerName, setPlayerName] = useState("Anonymous");
    const clickSpace = useRef<HTMLDivElement | null>(null);
    const scoreboard = useRef<HTMLDivElement | null>(null);
    const reset = useRef<HTMLButtonElement | null>(null);

    const [clickCount, setClickCount] = useState(0);
    const start = useRef<Date>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [timeVar, setTimeVar] = useState(0.00);

    const [modalOpen, setModalOpen] = useState(false);
    const [xNum, setXNum] = useState(0);
    const [yData, setYData] = useState<number[]>([])

    const MAX_TIME = 10;
    const SCOREBOARD_SIZE = 10;

    useEffect(() => {
        setPlayerName(prompt("Enter your username:") || "Anonymous");
        loadScoreboard();
        toggleResetButton();

        window.addEventListener("contextmenu", (e) => {
            if (!gameOver) e.preventDefault();
        });
    }, []);

    useEffect(() => {
        if (gameOver) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            store();
            toggleResetButton();
        }
    }, [gameOver]);

    function registerClick() {
        if (gameOver) return;
    
        (clickSpace.current as HTMLDivElement).style.backgroundColor = "#727272";
    
        setClickCount((prevClickCount) => {
            if (prevClickCount === 0) {
                start.current = new Date();
                clearInterval(intervalRef.current);
                intervalRef.current = setInterval(time, 50);
            }
            return prevClickCount + 1;
        });
    }
    
    function handleReset() {
        setClickCount(0);
        setTimeVar(0);
        setGameOver(false);
        start.current = null;
        toggleResetButton(false);
    }

    function time() {
        if (gameOver || !start.current) return;

        const now = new Date();
        const diff = now.getTime() - (start.current as Date).getTime();
        const newTime = Math.round(diff) / 1000;

        if (newTime >= MAX_TIME) {
            setGameOver(true);
            return;
        }

        setTimeVar(newTime);
    }

    function store() {
        const finalClickCount = clickCount;
        const finalTimeVar = timeVar;

        const obj = {
            name: playerName,
            score: finalClickCount,
            speed: finalTimeVar,
            rate: finalClickCount / (finalTimeVar || 10),
            date: new Date()
        };

        const current = JSON.parse(localStorage.getItem("scoreboard") as string) || [];
        current.push(obj);
        localStorage.setItem("scoreboard", JSON.stringify(current));

        loadScoreboard();
    }

    function toggleResetButton(customOverride?: boolean) {
        if (customOverride || (customOverride == null && gameOver)) {
            (reset.current as HTMLButtonElement).style.opacity = "1";
            (reset.current as HTMLButtonElement).style.pointerEvents = "all";
        } else {
            (reset.current as HTMLButtonElement).style.opacity = "0";
            (reset.current as HTMLButtonElement).style.pointerEvents = "none";
        }
    }

    function loadScoreboard() {
        (scoreboard.current as HTMLDivElement).innerHTML = `
        <h2>Scoreboard</h2>
        <div class="${styles.scoreboardEntry}">
            <span><b>Username</b></span>
            <span><b>Click rate</b></span>
            <span><b>Clicks / Seconds</b></span>
            <span><b>Date</b></span>
        </div>
        `;

        const current = (JSON.parse(localStorage.getItem("scoreboard") as string) || [])
            .sort((a: localStorageObj, b: localStorageObj) => {
                if (b.rate === a.rate) return b.score - a.score;
                return b.rate - a.rate;
            });

        current.forEach((element: localStorageObj, index: number) => {
            if (index >= SCOREBOARD_SIZE) return;

            const div = document.createElement("div");
            div.classList.add(styles.scoreboardEntry);

            const name = document.createElement("div");

            const nameP = document.createElement("p");
            nameP.innerText = element.name;
            name.appendChild(nameP);

            const dataOpener = document.createElement("span");
            dataOpener.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi-file-earmark-bar-graph-fill" viewBox="0 0 16 16">
                <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1m.5 10v-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5m-2.5.5a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5zm-3 0a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5z"/>
            </svg>
            `;
            dataOpener.title = "Open Player Data";
            dataOpener.addEventListener('click', () => openGraph(element.name));
            name.appendChild(dataOpener);

            div.appendChild(name);

            const rate = document.createElement("span");
            rate.innerText = element.rate.toFixed(2);
            div.appendChild(rate);

            const speed = document.createElement("span");
            speed.innerText = element.score + " / " + element.speed.toFixed(2);
            div.appendChild(speed);

            const time = document.createElement("span");
            const d = new Date(element.date);
            time.innerText = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
            div.appendChild(time);

            (scoreboard.current as HTMLDivElement).appendChild(div);
        });

        const diff = SCOREBOARD_SIZE - current.length;
        for (let i = 0; i < diff; i++) {
            const div = document.createElement("div");
            div.classList.add(styles.scoreboardEntry);

            const name = document.createElement("span");
            name.innerText = "-";
            div.appendChild(name);

            const rate = document.createElement("span");
            rate.innerText = "-";
            div.appendChild(rate);

            const speed = document.createElement("span");
            speed.innerText = "-";
            div.appendChild(speed);

            const time = document.createElement("span");
            time.innerText = "-";
            div.appendChild(time);

            (scoreboard.current as HTMLDivElement).appendChild(div);
        }
    }

    function openGraph(username: string) {
        const current = (JSON.parse(localStorage.getItem("scoreboard") as string) || [])
            .filter((entry: localStorageObj) => entry.name === username)
            .sort((a: localStorageObj, b: localStorageObj) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setXNum(current.length);
        setYData(current.map((entry: localStorageObj) => entry.rate.toFixed(2)));

        setModalOpen(true);
    }

    return (
        <>
            <div className="wrapper">
                <div className={`container ${styles.container}`}>
                    <h1>Clicker Game?</h1>
                    <p id={styles.task}>Hello, {playerName} 👋<br />See how many times you can click the rectangle below in {MAX_TIME} seconds:</p>
                    <div
                        id={styles.clickSpace}
                        ref={clickSpace}
                        onMouseDown={registerClick}
                        onMouseUp={() => {
                            setTimeout(() => {
                                if (clickSpace.current) {
                                    clickSpace.current.style.backgroundColor = "var(--background)";
                                }
                            }, 50);
                        }}
                    ></div>
                    <div id={styles.gameInfo}>
                        <p id={styles.clicks}>Clicks: {clickCount}<br />Time: {timeVar}</p>
                        <button 
                            id={styles.reset} 
                            ref={reset} 
                            type="button" 
                            onClick={handleReset}
                        >
                            Reset
                        </button>
                    </div>
                </div>
                <div id={styles.scoreboard} ref={scoreboard}></div>
            </div>
            {modalOpen && 
            <div id={styles.modal}>
                <Chart xNum={xNum} yData={yData} />
                <svg 
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className={styles.bi}
                    onClick={() => setModalOpen(false)}>
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
                </svg>
            </div>}
        </>
    );
}