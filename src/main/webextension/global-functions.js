// Hittar än så länge inget sätt att exportera till andra skript-filer som funkar,
// behöver än så länge upprepa funktioner som används på fler ställen.
/**
 * Converting seconds to "Xh Xm Xs" string
 * @param seconds
 * @returns {string}
 */
export function getTimeInfo(seconds) {
    let time = "";
    if (seconds >= 3600) {
        time += Math.floor(seconds / 3600);
        time += "h";
    }
    if (seconds % 3600 >= 60) {
        time += " ";
        time += Math.floor((seconds % 3600) / 60);
        time += "m";
    }
    if (seconds % 60 >= 1) {
        time += " ";
        time += seconds % 60;
        time += "s";
    }
    return time;
}

/**
 * Checking if two dates match
 * @param dateA
 * @param dateB
 * @returns {boolean}
 */
export function matchingDates(dateA, dateB) {
    return dateA.substring(0, 10) === dateB.toLocaleDateString();
}