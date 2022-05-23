/**
 * Hur kan jag hindra options-domänen från att läggas till i databasen?
 * Förslag: kontrollera att domänen innehåller punkter innan den läggs till
 */

let myPort = browser.runtime.connect({name: "port-across-extension"});
const url = "http://localhost:8080/domain";
const today = new Date(Date.now());

const domainTable = document.querySelector(".stats-table");
let tableOutput = "";

/**
 * Funktion som returnerar true om ett datum från databasen och ett JS-datumobjekt matchar
 */
function matchingDates(dbDateString, jsDateObject) {
    const dateFromDb = new Date(dbDateString);
    return dateFromDb.toLocaleDateString() === jsDateObject.toLocaleDateString();
}

function getTimeInfo(seconds) {
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

fetch(url)
    .then(res => res.json())
    .then(data => {
        data.forEach(domain => {
            let trackDate = domain.trackDates.find(td => matchingDates(td.date, today));
            const timeInfo = trackDate ? getTimeInfo(trackDate.seconds) : "&nbsp;--";

            tableOutput += `
                <tr id="${domain.id}">
                    <td class="table-hostname">${domain.hostname}</td>
                    <td>${timeInfo}</td>
                    <td><button class="delete" id="delete">×</button></td>
                </tr>
            `;
        })
        domainTable.innerHTML = tableOutput;

        domainTable.addEventListener("click", (e) => {
            e.preventDefault();
            let deleteButtonIsPressed = e.target.id === "delete";

            const domainId = e.target.parentElement.parentElement.id;
            // ...dataset.id enligt tutorial, men bara id verkar funka?

            // Delete domain
            if (deleteButtonIsPressed) {
                // Denna måste hittas på ett annat sätt om fler element tillkommer längst till vänster i tabellen
                const hostname = e.target.parentElement.parentElement.firstElementChild.innerHTML.toString();

                fetch(`${url}/${domainId}`, {
                    method: "DELETE"
                }).then(() => {
                    myPort.postMessage({deleteDomain: hostname});
                    // Kommer den hinna raderas innan sidan omrenderas (och domänen isf postas på nytt)?
                }).then(() => location.reload());
            }
        })

    });