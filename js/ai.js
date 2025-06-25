function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function initAI() {
  gameState.enemies.forEach(enemy => {
    let delay;
    if (gameState.difficulty === "easy") {
      delay = getRandomInt(12000, 15000);
    } else if (gameState.difficulty === "hard") {
      delay = getRandomInt(8000, 10000);
    } else if (gameState.difficulty === "master") {
      delay = getRandomInt(4000, 6000);
    } else {
      delay = getRandomInt(8000, 10000);
    }
    setInterval(() => {
      aiTakeAction(enemy);
    }, delay);
  });
}

function weightedAction(enemy) {
  let r = Math.random();
  let p = enemy.personality;
  if (r < p.attack) return "attack";
  else if (r < p.attack + p.defend) return "defend";
  else return "utilize";
}

function aiTakeAction(enemy) {
  let potentialTargets = gameState.companies.filter(c => c.name !== enemy.name);
  let target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
  let action = weightedAction(enemy);
  let cmdStr = "";

  if (action === "attack") {
    let useSystemAttack = (Math.random() < enemy.personality.system_attack_chance);
    if (useSystemAttack) {
      let systems = ["CORE", "VAULT", "DATABASE"];
      let sysChoice = systems[Math.floor(Math.random() * systems.length)];
      if (!canAttackSystem(target, sysChoice.toLowerCase())) {
        let gates = ["A", "B", "C", "D", "E", "F"];
        cmdStr = `${action} ${target.name} ${gates[Math.floor(Math.random() * gates.length)]}`;
      } else {
        cmdStr = `${action} ${target.name} ${sysChoice}`;
      }
    } else {
      let gates = ["A", "B", "C", "D", "E", "F"];
      cmdStr = `${action} ${target.name} ${gates[Math.floor(Math.random() * gates.length)]}`;
    }
  } else if (action === "defend") {
    let defendChoices = enemy.personality.defend_targets;
    let chosenSystem = defendChoices[Math.floor(Math.random() * defendChoices.length)];
    let gate = "";
    if (chosenSystem === "core")
      gate = (Math.random() < 0.5) ? "A" : "B";
    else if (chosenSystem === "vault")
      gate = (Math.random() < 0.5) ? "C" : "D";
    else if (chosenSystem === "database")
      gate = (Math.random() < 0.5) ? "E" : "F";
    cmdStr = `${action} ${gate}`;
  } else if (action === "utilize") {
    let gates = ["A", "B", "C", "D", "E", "F"];
    cmdStr = `${action} ${gates[Math.floor(Math.random() * gates.length)]}`;
  }
  processCommand(enemy, cmdStr);
  UI.addTerminalOutput(`${enemy.name} executed: ${cmdStr}`);
}
