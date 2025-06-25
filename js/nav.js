// Handles navigation between Terminal, Stats, and Commands views, plus Reset functionality.
document.addEventListener("DOMContentLoaded", () => {
  const btnTerminal = document.getElementById("btn-terminal");
  const btnStats = document.getElementById("btn-stats");
  const btnCommands = document.getElementById("btn-commands");
  const btnReset = document.getElementById("btn-reset");

  const viewTerminal = document.getElementById("view-terminal");
  const viewStats = document.getElementById("view-stats");
  const viewCommands = document.getElementById("view-commands");
  
  function hideAllViews() {
    viewTerminal.style.display = "none";
    viewStats.style.display = "none";
    viewCommands.style.display = "none";
  }
  
  btnTerminal.addEventListener("click", () => {
    hideAllViews();
    viewTerminal.style.display = "block";
  });
  
  btnStats.addEventListener("click", () => {
    hideAllViews();
    viewStats.style.display = "block";
    UI.updateAll();
  });
  
  btnCommands.addEventListener("click", () => {
    hideAllViews();
    viewCommands.style.display = "block";
  });
  
  btnReset.addEventListener("click", () => {
    localStorage.clear();
    window.location.reload();
  });
});
