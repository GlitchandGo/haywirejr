// Processes commands from the player or AI. Each action costs 30 Crypto.
function processCommand(source, commandStr) {
  if (source.crypto < 30) {
    if (source.isPlayer) {
      UI.addBanner("You do not have enough Crypto to perform an action.");
    }
    return;
  }
  // Deduct cost.
  source.crypto -= 30;

  let parts = commandStr.trim().split(" ");
  if (parts.length === 0) {
    UI.addBanner("Empty command.");
    return;
  }

  const action = parts[0].toLowerCase();

  // Helper: if the argument includes "gate", warn and abort.
  function checkForGate(arg) {
    if (arg.toLowerCase().includes("gate")) {
      UI.addBanner("Only include the letter of the gate, not the word 'gate'.");
      return true;
    }
    return false;
  }

  if (action === "attack") {
    if (parts.length < 3) {
      UI.addBanner("Invalid command format for attack.");
      return;
    }
    const targetCompanyName = parts[1].toLowerCase();
    if (checkForGate(parts[2])) return;
    const targetPart = parts[2].toUpperCase();
    const target = gameState.companies.find(c => c.name.toLowerCase() === targetCompanyName);
    if (!target) {
      UI.addBanner("Target company not found.");
      return;
    }
    // Determine attack success chance.
    let successThreshold = 0.6; // default for enemy commands
    if (source.isPlayer) {
      if (gameState.difficulty === "easy") {
        successThreshold = 0.8;
      } else if (gameState.difficulty === "hard") {
        successThreshold = 0.6;
      } else if (gameState.difficulty === "master") {
        successThreshold = 0.4;
      }
    }
    if (Math.random() > successThreshold) {
      if (source.isPlayer) {
        UI.addBanner(`Your attack on ${target.name} was unsuccessful.`);
      } else if (target.isPlayer) {
        UI.addBanner(`${source.name}'s attack on your system was unsuccessful.`);
      }
      UI.updateAll();
      return;
    }
    if (["A", "B", "C", "D", "E", "F"].includes(targetPart)) {
      performAttack(source, target, targetPart);
    } else if (["CORE", "VAULT", "DATABASE"].includes(targetPart)) {
      performAttackSystem(source, target, targetPart);
    } else {
      UI.addBanner("Invalid Gate/System.");
    }
  } else if (action === "defend") {
    if (parts.length < 2) {
      UI.addBanner("Invalid command format for defend.");
      return;
    }
    if (checkForGate(parts[1])) return;
    const targetPart = parts[1].toUpperCase();
    if (["A", "B", "C", "D", "E", "F"].includes(targetPart)) {
      performDefend(source, targetPart);
    } else if (["CORE", "VAULT", "DATABASE"].includes(targetPart)) {
      performDefendSystem(source, targetPart);
    } else {
      UI.addBanner("Invalid Gate/System.");
    }
  } else if (action === "utilize") {
    if (parts.length < 2) {
      UI.addBanner("Invalid command format for utilize.");
      return;
    }
    if (checkForGate(parts[1])) return;
    const targetPart = parts[1].toUpperCase();
    if (["A", "B", "C", "D", "E", "F"].includes(targetPart)) {
      performUtilize(source, targetPart);
    } else if (["CORE", "VAULT", "DATABASE"].includes(targetPart)) {
      performUtilizeSystem(source, targetPart);
    } else {
      UI.addBanner("Invalid Gate/System.");
    }
  } else {
    UI.addBanner("Invalid command.");
  }

  UI.updateAll();
}

function canAttackSystem(target, sysName) {
  let gates = target.systems[sysName].gates;
  if (sysName === "core") {
    return (gates.A.current === 0 || gates.B.current === 0);
  } else if (sysName === "vault") {
    return (gates.C.current === 0 || gates.D.current === 0);
  } else if (sysName === "database") {
    return (gates.E.current === 0 || gates.F.current === 0);
  }
  return false;
}

function performAttack(source, target, targetPart) {
  let systemName;
  if (["A", "B"].includes(targetPart)) {
    systemName = "core";
  } else if (["C", "D"].includes(targetPart)) {
    systemName = "vault";
  } else if (["E", "F"].includes(targetPart)) {
    systemName = "database";
  }
  let gate = target.systems[systemName].gates[targetPart];
  gate.current = Math.max(gate.current - 25, 0);
  target.systems[systemName].health = Math.max(target.systems[systemName].health - 25, 0);

  if (source.isPlayer) {
    UI.addBanner(`You have attacked ${target.name}'s Gate ${targetPart}!`);
  } else if (target.isPlayer) {
    UI.addBanner(`${source.name} has attacked your Gate ${targetPart}!`);
  }

  if (systemName === "database") {
    const info = `Crypto: ${target.crypto}`;
    source.intel[target.name] = info;
    if (source.isPlayer || target.isPlayer) {
      UI.addBanner(`Database attack revealed: ${target.name} ${info}`);
    }
  }
  checkSystemStatus(target, systemName);
}

function performAttackSystem(source, target, sysStr) {
  const sysName = sysStr.toLowerCase();
  if (!canAttackSystem(target, sysName)) {
    if (source.isPlayer) {
      UI.addBanner(`Cannot attack ${target.name}'s ${sysStr} until at least one gate is down.`);
    }
    return;
  }
  target.systems[sysName].health = Math.max(target.systems[sysName].health - 25, 0);

  if (source.isPlayer) {
    UI.addBanner(`You have attacked ${target.name}'s ${sysStr}!`);
  } else if (target.isPlayer) {
    UI.addBanner(`${source.name} has attacked your ${sysStr}!`);
  }

  if (sysName === "database") {
    const info = `Crypto: ${target.crypto}`;
    source.intel[target.name] = info;
    if (source.isPlayer || target.isPlayer) {
      UI.addBanner(`Database attack revealed: ${target.name} ${info}`);
    }
  }

  // If attacking Vault, perform loot logic.
  if (sysName === "vault") {
    let vaultGates = target.systems.vault.gates;
    let lootPercent;
    if (vaultGates.C.current === 0 && vaultGates.D.current === 0) {
      lootPercent = getRandomIntInclusive(20, 75) / 100;
      UI.addBanner("Vault attack successful! (Boosted loot)");
    } else {
      lootPercent = getRandomIntInclusive(10, 50) / 100;
      UI.addBanner("Vault attack: Looting Crypto...");
    }
    let lootAmount = Math.round(target.crypto * lootPercent);
    target.crypto -= lootAmount;
    source.crypto += lootAmount;
  }
  checkSystemStatus(target, sysName);
}

function performDefend(source, targetPart) {
  let systemName;
  if (["A", "B"].includes(targetPart)) {
    systemName = "core";
  } else if (["C", "D"].includes(targetPart)) {
    systemName = "vault";
  } else if (["E", "F"].includes(targetPart)) {
    systemName = "database";
  }
  let gate = source.systems[systemName].gates[targetPart];
  gate.max += 50;
  gate.current += 50;
  if (source.isPlayer) {
    UI.addBanner(`You have defended your Gate ${targetPart}, increasing its max health!`);
  }
}

function performDefendSystem(source, sysStr) {
  const sysName = sysStr.toLowerCase();
  source.systems[sysName].health += 50;
  if (source.systems[sysName].health > 500) {
    source.systems[sysName].health = 500;
  }
  if (source.isPlayer) {
    UI.addBanner(`You have reinforced your ${sysStr}!`);
  }
}

function performUtilize(source, targetPart) {
  let systemName;
  if (["A", "B"].includes(targetPart)) systemName = "core";
  else if (["C", "D"].includes(targetPart)) systemName = "vault";
  else if (["E", "F"].includes(targetPart)) systemName = "database";
  let gate = source.systems[systemName].gates[targetPart];
  gate.current = Math.min(gate.current + 50, gate.max);
  if (source.isPlayer) {
    UI.addBanner(`You have utilized power on your Gate ${targetPart} to heal it!`);
  }
}

function performUtilizeSystem(source, sysStr) {
  const sysName = sysStr.toLowerCase();
  source.systems[sysName].health += 50;
  if (source.systems[sysName].health > 500) {
    source.systems[sysName].health = 500;
  }
  if (source.isPlayer) {
    UI.addBanner(`You have utilized power on your ${sysStr} to repair it!`);
  }
}

function checkSystemStatus(company, sysName) {
  const system = company.systems[sysName];
  if (system.health < 100 && company.isPlayer) {
    UI.addBanner(`⚠️ Warning: ${company.name}'s ${sysName} is critically low (${system.health} HP)!`);
  }
  if (system.health <= 0) {
    if (sysName === "core") {
      if (company.isPlayer) {
        UI.addBanner("Your Core has fallen! Your company is eliminated!");
      }
      removeCompany(company);
    } else if (sysName === "vault") {
      if (company.isPlayer) {
        UI.addBanner("Your Vault has been befallen! Your Crypto is now exposed.");
      }
    } else if (sysName === "database") {
      if (company.isPlayer) {
        UI.addBanner("Your Database is compromised! Secrets are leaking!");
      }
    }
  }
}

function removeCompany(company) {
  if (company.isPlayer) {
    UI.addBanner("Your company has been eliminated! GAME OVER.");
    document.getElementById("send-command-btn").disabled = true;
    document.getElementById("command-input").disabled = true;
  } else {
    gameState.companies = gameState.companies.filter(c => c.name !== company.name);
    gameState.enemies = gameState.enemies.filter(c => c.name !== company.name);
    if (gameState.enemies.length === 0) {
      UI.addBanner("All opposing companies have been eliminated! YOU WIN!");
      // If playing on Hard mode, winning unlocks Master.
      if (gameState.difficulty === "hard") {
        localStorage.setItem("unlockedMaster", "true");
      }
      document.getElementById("send-command-btn").disabled = true;
      document.getElementById("command-input").disabled = true;
    }
  }
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
