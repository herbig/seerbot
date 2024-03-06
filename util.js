
export function log(message) {
    if (process.env.NODE_ENV !== 'dev') return;
    console.log(message);
}

export function chunkArray(arr, chunkSize) {
    let result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        let chunk = arr.slice(i, i + chunkSize);
        result.push(chunk);
    }
    return result;
}