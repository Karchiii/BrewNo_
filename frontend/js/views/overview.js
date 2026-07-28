$(() => {
  
  const saveButtons = document.querySelectorAll("[data-brew-save]");
  for (const saveButton of saveButtons) {
    saveButton.addEventListener("click", async () => {
      const brewId = saveButton.dataset.brewSave;
      const brewName = document.querySelector(`[data-brew-name='${brewId}']`).value;

      await fetch("/api/update-name", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          brewId,
          brewName
        })
      });
      window.location.reload();
    });
  }

  document.getElementById("last-update").innerText = "Last update " + (new Date()).toLocaleString();
});