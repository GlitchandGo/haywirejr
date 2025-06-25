// Global game state object – note the addition of "difficulty"
let gameState = {
  player: null,
  enemies: [],
  companies: [],
  difficulty: "hard"  // default (will be overwritten by the difficulty selection)
};

document.addEventListener("DOMContentLoaded", () => {
  // If a saved game exists, load it (this remains unchanged)
  if (localStorage.getItem("gameState")) {
    try {
      gameState = JSON.parse(localStorage.getItem("gameState"));
      document.getElementById("difficulty-screen").style.display = "none";
      document.getElementById("tutorial-screen").style.display = "none";
      document.getElementById("main-game-screen").style.display = "block";
      UI.updateAll();
      initAI();
    } catch (e) {
      console.error("Error loading saved game", e);
    }
  }

  // The "continue" button after entering company name.
  document.getElementById("continue-btn").addEventListener("click", () => {
    const companyName = document.getElementById("company-name-input").value.trim();
    if (companyName === "") {
      alert("Please enter a company name.");
      return;
    }
    document.getElementById("player-company-name").innerText = companyName;
    // Hide the input and show instructions.
    document.getElementById("instructions").style.display = "block";
    document.getElementById("continue-btn").style.display = "none";
  });

  // Begin game button.
  document.getElementById("begin-game-btn").addEventListener("click", () => {
    startGame();
    document.getElementById("tutorial-screen").style.display = "none";
    document.getElementById("main-game-screen").style.display = "block";
    UI.updateAll();
  });

  // Listener for Terminal command input.
  document.getElementById("send-command-btn").addEventListener("click", () => {
    const input = document.getElementById("command-input").value;
    if (input.trim() !== "") {
      processCommand(gameState.player, input);
      UI.addTerminalOutput(`You entered: ${input}`);
      document.getElementById("command-input").value = "";
    }
  });
});

function createCompany(name, isPlayer) {
  return {
    name: name,
    crypto: 500,
    systems: {
      core: { gates: { A: { current: 100, max: 100 }, B: { current: 100, max: 100 } }, health: 500 },
      vault: { gates: { C: { current: 100, max: 100 }, D: { current: 100, max: 100 } }, health: 500 },
      database: { gates: { E: { current: 100, max: 100 }, F: { current: 100, max: 100 } }, health: 500 }
    },
    intel: {},
    isPlayer: isPlayer
  };
}

function startGame() {
  const playerName = document.getElementById("company-name-input").value.trim();
  gameState.player = createCompany(playerName, true);

  const enemyNames = ["ByteByteByte", "DataDorks Inc.", "GlitchGang", "CrypticCore"];
  enemyNames.forEach(name => {
    let enemy = createCompany(name, false);
    // Set AI personalities (as before)
    if (name === "ByteByteByte") {
      enemy.personality = { attack: 0.7, defend: 0.2, utilize: 0.1, system_attack_chance: 0.5, defend_targets: ["core", "vault"] };
    } else if (name === "DataDorks Inc.") {
      enemy.personality = { attack: 0.45, defend: 0.45, utilize: 0.1, system_attack_chance: 0.3, defend_targets: ["database"] };
    } else if (name === "GlitchGang") {
      enemy.personality = { attack: 0.33, defend: 0.33, utilize: 0.34, system_attack_chance: 0.3, defend_targets: ["core", "vault", "database"] };
    } else if (name === "CrypticCore") {
      enemy.personality = { attack: 0.2, defend: 0.6, utilize: 0.2, system_attack_chance: 0.1, defend_targets: ["core", "vault"] };
    }
    gameState.enemies.push(enemy);
  });

  gameState.companies = [gameState.player, ...gameState.enemies];

  // Regenerate Crypto every 30 sec.
  setInterval(() => {
    gameState.companies.forEach(comp => comp.crypto += 10);
    UI.updateCrypto();
  }, 30000);

  initAI();
  UI.saveGame();
}
