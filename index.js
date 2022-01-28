import { World } from "wasm-game-of-life";

const pre = document.getElementById("game-of-life-canvas");
const world = World.new();

const renderLoop = () => {
  pre.textContent = world.render();
  world.tick();

  requestAnimationFrame(renderLoop);
};

requestAnimationFrame(renderLoop);
