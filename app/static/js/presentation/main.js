"use strict";
async function loadFileText(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Chyba při načítání souboru: ${response.statusText}`);
    }
    return await response.text();
}
loadFileText("/static/assets/turing-sets.txt")
    .then(program => {
    console.log("Načtený program:", program);
    // můžeš ho vložit do textarea např.
    const textarea = document.querySelectorAll("textarea")[0];
    if (textarea)
        textarea.value = program;
})
    .catch(error => {
    console.error("Nepodařilo se načíst soubor:", error);
});
