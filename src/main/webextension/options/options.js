/**
 * Är hostname på options-sidan alltid 55fcf9c9-ed7a-402b-bc31-9c741b30944f ?
 * Bör jag då hindra den domänen från att läggas till i databasen?
 */

let myPort = browser.runtime.connect({name: "port-from-display"});

const url = "http://localhost:8080/domain";

const today = new Date(Date.now());
let domainsFromSession = [];
let domainsFromDB = [];
let domainsMerged = [];

const domainTable = document.querySelector(".domain-table");
let output = "";

function matchingDates(dateA, dateB) {
    console.log("Checking if the dates match")
    return dateA.substring(0, 10) === dateB.toLocaleDateString();
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

myPort.onMessage.addListener((m) => {
    console.log("*** KÖR OPTIONS MESSAGE ***")
    console.log(today);

    fetch(url)
        .then(res => res.json())
        .then(data => {
            data.forEach(domain => {
                if (domain.hostname.length > 0) {
                    // TODO: Visa alla domäner, inte bara dagens.
                    output += `
                        <tr name="domain">
                            <td>${domain.hostname}</td>
                            <td>${getTimeInfo(domain.trackDates.find(td => matchingDates(td.date, today)).seconds)}</td>
                        </tr>
                    `;
                }
            })
            domainTable.innerHTML = output;
        });
});


// function readAllDomains() {
//     var data = {};
//     data[""]
// }
