export async function loadFileText(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Chyba při načítání souboru: ${response.statusText}`);
    }
    return await response.text();
}
