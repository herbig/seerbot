export function chunkArray(arr, chunkSize) {
    let result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        let chunk = arr.slice(i, i + chunkSize);
        result.push(chunk);
    }
    return result;
}

/**
 * Normalize a given string to the same identifier format that curiosa.io uses.
 */
export function curiosaSlug(name) {
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents, such as Ä
        .toLowerCase()                                           // lowercase it
        .replace(/[\s\-]+/g, '_')                                // Replace spaces or dashes with underscores
        .replace(/[^a-zA-Z0-9_]/g, '');                          // Remove non-alphabetic characters (except for underscores or numbers)
}

export function displayPower(card) {
    const attack = card?.attack ?? undefined;
    const defense = card?.defense ?? undefined;

    if (attack != null && defense != null) {
        return attack === defense || card.category.toUpperCase() === 'AVATAR' ? `${attack}` : `${attack}/${defense}`;
    }
    
    return undefined;
}
