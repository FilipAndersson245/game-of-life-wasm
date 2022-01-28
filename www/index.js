import { World, Cell } from "wasm-game-of-life";
import { memory } from "wasm-game-of-life/game_of_life_wasm_bg.wasm";

// Constants
const CELL_SIZE = 12; // px size
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const height = 64;
const width = 64;

// Create new world
const world = World.new();

const canvas = document.getElementById("game-of-life-canvas");

const ctx = canvas.getContext("2d");

canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

let animationId = null;

// Play and pause functionality.
const playPauseButton = document.getElementById("play-pause");
const isPaused = () => {
  return animationId === null;
};

const play = () => {
  playPauseButton.textContent = "⏸";
  renderLoop();
};
const pause = () => {
  playPauseButton.textContent = "▶";
  cancelAnimationFrame(animationId);
  animationId = null;
};
playPauseButton.addEventListener("click", (event) => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
});

// Clickable cells.
canvas.addEventListener("click", (event) => {
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

  world.toggle_cell(row, col);

  drawGrid();
  drawCells();
});

// Game logic
// Draw grid to canvas
const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
};

const getIndex = (row, column) => {
  return row * width + column;
};

const drawCells = () => {
  const cellsPtr = world.cells(); // Take ptr to WASM owned memory
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height); // Init JS array with that data.

  ctx.beginPath();

  for (let row = 0; row < height; row++) {
    // Iterate rows and cols.
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;

      ctx.fillRect(
        // Draw cell
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
};

const renderLoop = () => {
  world.tick();
  drawGrid();
  drawCells();

  animationId = requestAnimationFrame(renderLoop);
  return animationId;
};

play();
