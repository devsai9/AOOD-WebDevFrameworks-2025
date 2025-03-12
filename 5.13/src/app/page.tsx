'use client'
import styles from "./page.module.css";
import { useEffect } from "react";

type localStorageObj = {
    name: string,
    score: number,
    speed: number,
    rate: number,
    date: Date
}

export default function Home() {
    let clickSpace: HTMLDivElement;
    let output: HTMLParagraphElement;
    let scoreboard: HTMLDivElement;
    let reset: HTMLButtonElement;
    let playerName: string;

    useEffect(() => {
        clickSpace = document.querySelector('#clickSpace') as HTMLDivElement;
        output = document.querySelector('#clicks') as HTMLParagraphElement;
        scoreboard = document.querySelector('#scoreboard') as HTMLDivElement;
        reset = document.querySelector('#reset') as HTMLButtonElement;

        playerName = prompt("Enter your username: ") || "Anonymous";

        loadScoreboard();
        toggleReset();

        (document.querySelector('#task') as HTMLParagraphElement).innerHTML = `Hello, ${playerName} 👋<br>See how many times you can click the rectangle below in ${MAX_TIME} seconds:`;

        window.addEventListener("contextmenu", (e) => {
            if (!gameOver) e.preventDefault();
        });
        
        clickSpace.addEventListener("mousedown", () => {
            if (gameOver) return;
    
            clickSpace.style.backgroundColor = "#f3f3f3";
            clickCount++;
    
            if (clickCount == 1) {
                start = new Date();
                interval = setInterval(time, 50);
            }
        });
    
        clickSpace.addEventListener("mouseup", () => {
            setTimeout(() => {
                clickSpace.style.backgroundColor = "#ffffff";
            }, 50);
        });
    
        reset.addEventListener("click", () => {
            clickCount = 0;
            timeVar = null;
            start = null;
            gameOver = false;
            clearInterval(interval);
            interval = null;
            output.innerHTML = `Clicks: 0<br>Time: 00.00`;
            toggleReset();
        });
    }, []);

    let clickCount = 0;
    let start: Date | null = null;
    let interval: any = null;
    let gameOver: boolean = false;
    let timeVar: number | null = null;
    const MAX_TIME = 10;
    const SCOREBOARD_SIZE = 10;

    function time() {
        const now = new Date();
        const diff = now.getTime() - (start as Date).getTime();
        timeVar = Math.round(diff) / 1000;

        output.innerHTML = `Clicks: ${clickCount}<br>Time: ${timeVar}`;

        if ((diff / 1000) >= MAX_TIME) {
            clearInterval(interval);
            gameOver = true;
            store();
            toggleReset();
        }
    }

    function store() {
        const obj = {
            name: playerName,
            score: clickCount,
            speed: timeVar,
            rate: clickCount / (timeVar || 10),
            date: new Date()
        }

        const current = JSON.parse(localStorage.getItem("scoreboard") as string) || [];
        current.push(obj);
        localStorage.setItem("scoreboard", JSON.stringify(current));

        loadScoreboard();
    }

    function toggleReset() {
        if (gameOver) {
            reset.style.opacity = "1";
            reset.style.pointerEvents = "all";
        } else {
            reset.style.opacity = "0";
            reset.style.pointerEvents = "none";
        }
    }

    function loadScoreboard() {
        scoreboard.innerHTML = `
        <h2>Scoreboard</h2>
        <div class="scoreboardEntry">
            <span><b>Username</b></span>
            <span><b>Click rate</b></span>
            <span><b>Clicks / Seconds</b></span>
            <span><b>Date</b></span>
        </div>
        `;
        const current = JSON.parse(localStorage.getItem("scoreboard") as string) || [];
        current.sort((a: localStorageObj, b: localStorageObj) => {
            if (b.rate === a.rate) return b.score - a.score;
            return b.rate - a.rate;
        });

        /* 
        <div class="scoreboardEntry">
            <span>Username</span>
            <span>Click rate</span>
            <span>Clicks / Seconds</span>
            <span>Time</span>
        </div>
        */
        current.forEach((element: localStorageObj) => {
            const div = document.createElement("div");
            div.classList.add("scoreboardEntry");

            const name = document.createElement("span");
            name.innerText = element.name;
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

            scoreboard.appendChild(div);
        });

        const diff = SCOREBOARD_SIZE - current.length;
        for (let i = 0; i < diff; i++) {
            const div = document.createElement("div");
            div.classList.add("scoreboardEntry");

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

            scoreboard.appendChild(div);
        }
    }

    return (
        <>
        <div className={`container ${styles.container}`}>
            <h1>Clicker Game?</h1>
            <p id={`task ${styles.task}`}></p>
            <div id={`clickSpace ${styles.clickSpace}`}></div>
            <div id={`gameInfo ${styles.gameInfo}`}>
                <p id={`clicks ${styles.clicks}`}>Clicks: 0<br />Time: 00.00</p>
                <button id={`reset ${styles.reset}`}>Reset</button>
            </div>
        </div>
        <div id={`scoreboard ${styles.scoreboard}`}></div>
        </>
    );
}
