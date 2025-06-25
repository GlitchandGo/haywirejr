document.addEventListener("DOMContentLoaded", () => {
  // Ensure gameState exists globally.
  if (typeof gameState === "undefined") {
    window.gameState = { player: null, enemies: [], companies: [] };
  }
  
  const btnEasy = document.getElementById("btn-easy");
  const btnHard = document.getElementById("btn-hard");
  const btnMaster = document.getElementById("btn-master");

  // Check localStorage for unlockedMaster flag.
  const unlockedMaster = localStorage.getItem("unlockedMaster") === "true";
  if (!unlockedMaster) {
    btnMaster.disabled = true;
    btnMaster.classList.add("locked");
  } else {
    btnMaster.disabled = false;
    btnMaster.classList.remove("locked");
    // Optionally, you could remove the lock icon if unlocked.
  }

  function selectDifficulty(diff) {
    gameState.difficulty = diff;
    // Hide the difficulty screen and show tutorial screen.
    document.getElementById("difficulty-screen").style.display = "none";
    document.getElementById("tutorial-screen").style.display = "block";
  }

  btnEasy.addEventListener("click", () => { selectDifficulty("easy"); });
  btnHard.addEventListener("click", () => { selectDifficulty("hard"); });
  btnMaster.addEventListener("click", () => {
    if (!btnMaster.disabled) {
      selectDifficulty("master");
    }
  });
});
