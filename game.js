// UI Elements
const ui = {
    loading: document.getElementById("loading-screen"),
    home: document.getElementById("home-screen"),
    tutorials: document.getElementById("tutorials-screen"),
    mapSelect: document.getElementById("map-select-screen"),
    game: document.getElementById("game-screen"),
    canvas: document.getElementById("gameCanvas"),
    status: document.getElementById("status"),
    themeTitle: document.getElementById("theme-title")
};

const ctx = ui.canvas.getContext("2d");

// Navigation Logic
setTimeout(() => switchScreen('home'), 1500); // Simulate loading

document.getElementById("btn-play").onclick = () => switchScreen('mapSelect');
document.getElementById("btn-tutorials").onclick = () => switchScreen('tutorials');
document.getElementById("btn-back-home").onclick = () => switchScreen('home');
document.getElementById("btn-back-map").onclick = () => switchScreen('mapSelect');

document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.onclick = (e) => {
        setTheme(e.target.dataset.theme);
        switchScreen('game');
    };
});

function switchScreen(screen) {
    Object.values(ui).forEach(el => {
        if(el && el.classList) el.classList.add("hidden");
    });
    if (screen === 'home') ui.home.classList.remove("hidden");
    if (screen === 'tutorials') ui.tutorials.classList.remove("hidden");
    if (screen === 'mapSelect') ui.mapSelect.classList.remove("hidden");
    if (screen === 'game') ui.game.classList.remove("hidden");
}

// Game State & Themes
const GRID_SIZE = 15;
const TILE_SIZE = 30;
let currentTheme = "space";
let colors = {
    bg: "#000000", p1: "blue", p2: "red", macro: "gold"
};

function setTheme(theme) {
    currentTheme = theme;
    if (theme === "space") {
        colors = { bg: "#0a0a2a", p1: "#00ffff", p2: "#ff00ff", macro: "white" };
        ui.themeTitle.innerText = "Space Arena";
    } else if (theme === "underwater") {
        colors = { bg: "#001f3f", p1: "#00ff00", p2: "#ff4500", macro: "#ffcc00" };
        ui.themeTitle.innerText = "Underwater Trench";
    } else if (theme === "desert") {
        colors = { bg: "#d2b48c", p1: "#8b4513", p2: "#800000", macro: "#000000" };
        ui.themeTitle.innerText = "Desert Ruins";
    }
    draw(); // update canvas
}

// Minimal Engine
const MAX_TURNS = 400;
let gameLoop;
let currentTurn = 0;
let state = {};

function initGame() {
    state = {
        p1: { macros: 0, ships: [{ x: 0, y: 7 }] },
        p2: { macros: 0, ships: [{ x: 14, y: 7 }] },
        macrosOnBoard: [{ x: 7, y: 7, amount: 50 }, { x: 7, y: 3, amount: 20 }, { x: 7, y: 11, amount: 20 }]
    };
    currentTurn = 0;
    ui.status.innerText = "Status: Game Running...";
    clearInterval(gameLoop);
    
    try {
        state.p1Func = new Function("gameState", document.getElementById("p1-code").value);
        state.p2Func = new Function("gameState", document.getElementById("p2-code").value);
    } catch (e) {
        ui.status.innerText = "Syntax Error!";
        return;
    }
    gameLoop = setInterval(runTurn, 500);
}

function runTurn() {
    if (currentTurn >= MAX_TURNS) { endGame(); return; }
    
    // Simple execution
    try {
        let a1 = state.p1Func({ myShips: state.p1.ships, myMacros: state.p1.macros });
        if (a1 && a1.command === "move") state.p1.ships[0].x = Math.max(0, Math.min(GRID_SIZE - 1, a1.x));
    } catch(e) {}

    try {
        let a2 = state.p2Func({ myShips: state.p2.ships, myMacros: state.p2.macros });
        if (a2 && a2.command === "move") state.p2.ships[0].x = Math.max(0, Math.min(GRID_SIZE - 1, a2.x));
    } catch(e) {}

    currentTurn++;
    draw();
}

function draw() {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, ui.canvas.width, ui.canvas.height);

    ctx.fillStyle = colors.macro;
    (state.macrosOnBoard || []).forEach(m => {
        ctx.fillRect(m.x * TILE_SIZE + 5, m.y * TILE_SIZE + 5, TILE_SIZE - 10, TILE_SIZE - 10);
    });

    ctx.fillStyle = colors.p1;
    (state.p1?.ships || []).forEach(s => ctx.fillRect(s.x * TILE_SIZE, s.y * TILE_SIZE, TILE_SIZE, TILE_SIZE));

    ctx.fillStyle = colors.p2;
    (state.p2?.ships || []).forEach(s => ctx.fillRect(s.x * TILE_SIZE, s.y * TILE_SIZE, TILE_SIZE, TILE_SIZE));
}

function endGame() {
    clearInterval(gameLoop);
    ui.status.innerText = "Game Over!";
}

document.getElementById("start-btn").addEventListener("click", initGame);
draw();
