// UI functions to update game stats, display terminal output, banners, and save state.
var UI = {
  addBanner: function(message) {
    const banner = document.getElementById("banner");
    banner.innerText = message;
  },
  addTerminalOutput: function(message) {
    const outputDiv = document.getElementById("terminal-output");
    outputDiv.innerHTML += message + "<br>";
    outputDiv.scrollTop = outputDiv.scrollHeight;
  },
  updateCrypto: function() {
    document.getElementById("player-crypto").innerText = gameState.player.crypto;
    const enemyPanel = document.getElementById("enemy-stats");
    enemyPanel.innerHTML = "";
    gameState.enemies.forEach(enemy => {
      // Display enemy crypto only if intel is available.
      const intel = gameState.player.intel[enemy.name];
      let cryptoDisplay = intel ? enemy.crypto : "----";
      const div = document.createElement("div");
      div.className = "company-stats";
      div.innerHTML = `
        <h4>${enemy.name}</h4>
        <p>Crypto: ${cryptoDisplay}</p>
        <p>Core: ${enemy.systems.core.health}</p>
        <p>Vault: ${enemy.systems.vault.health}</p>
        <p>Database: ${enemy.systems.database.health}</p>
      `;
      enemyPanel.appendChild(div);
    });
  },
  updatePlayerStats: function() {
    document.getElementById("player-company-name").innerText = gameState.player.name;
    document.getElementById("player-crypto").innerText = gameState.player.crypto;
    
    // Update Core stats.
    const coreDiv = document.getElementById("player-core");
    const coreGates = coreDiv.querySelectorAll(".health");
    coreGates[0].innerText = `${gameState.player.systems.core.gates.A.current}/${gameState.player.systems.core.gates.A.max}`;
    coreGates[1].innerText = `${gameState.player.systems.core.gates.B.current}/${gameState.player.systems.core.gates.B.max}`;
    coreDiv.querySelector(".sys-health").innerText = gameState.player.systems.core.health;
    
    // Update Vault stats.
    const vaultDiv = document.getElementById("player-vault");
    const vaultGates = vaultDiv.querySelectorAll(".health");
    vaultGates[0].innerText = `${gameState.player.systems.vault.gates.C.current}/${gameState.player.systems.vault.gates.C.max}`;
    vaultGates[1].innerText = `${gameState.player.systems.vault.gates.D.current}/${gameState.player.systems.vault.gates.D.max}`;
    vaultDiv.querySelector(".sys-health").innerText = gameState.player.systems.vault.health;
    
    // Update Database stats.
    const dbDiv = document.getElementById("player-database");
    const dbGates = dbDiv.querySelectorAll(".health");
    dbGates[0].innerText = `${gameState.player.systems.database.gates.E.current}/${gameState.player.systems.database.gates.E.max}`;
    dbGates[1].innerText = `${gameState.player.systems.database.gates.F.current}/${gameState.player.systems.database.gates.F.max}`;
    dbDiv.querySelector(".sys-health").innerText = gameState.player.systems.database.health;
  },
  updateAll: function() {
    this.updateCrypto();
    this.updatePlayerStats();
    this.saveGame();
  },
  saveGame: function() {
    localStorage.setItem("gameState", JSON.stringify(gameState));
  }
};
