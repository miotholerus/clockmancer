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
    console.log(today);

    // OFÄRDIGT! Just nu dupliceras tiden för den aktuella sessionen varje gång Options-sidan visas.
    // Jag behöver tänka om. Ett oprövat förslag är att ladda in data från DB redan vid sessionens start i bakgrundsskriptet,
    // istället för att spara och ladda det först när Options visas. Frågan är när jag ska spara datan...

    fetch(url)
        .then(res => res.json())
        .then(data => {
            domainsFromDB = [...data];
            m.myDomains.forEach(sessionDomain => {
                console.log("Domain from session: ", sessionDomain.hostname);
                let reqBody = {};

                // För varje domän i sessionen - kolla om samma hostname finns i db
                let dbDomain = domainsFromDB.find(dbDomain => dbDomain.hostname === sessionDomain.hostname);

                if (dbDomain) {
                    console.log("Domain found");

                    reqBody = {...dbDomain};

                    // Domänen finns - sök efter dagens datum i db
                    const trackDate = dbDomain.trackDates.find(trackDate => matchingDates(trackDate.date, today))
                    if (trackDate) {
                        console.log("TrackDate found");
                        // Dagens datum finns i db - lägg på tiden
                        trackDate.seconds += sessionDomain.seconds; // uppdaterar detta befintligt trackDate?
                        // annars gör nån sorts put/push här
                    } else {
                        console.log("TrackDate not found");
                        // Dagens datum finns inte i domänens trackDates - lägg till det i domänens set av trackDates (datumet + sekunder)

                        reqBody.trackDates.push({
                            date: today,
                            seconds: sessionDomain.seconds
                        });

                        // PUT domain?

                    }

                    console.log("Trying PUT ", reqBody);

                    // PUT domain
                    fetch(url + "/" + dbDomain.id, {
                        method: "PUT",
                        headers: {
                            "content-type": "application/json"
                        },
                        body: JSON.stringify(reqBody)
                    })
                        .then(res => res.json())
                        .then(data => {
                            console.log("PUT'ed ", data);
                        })

                } else {
                    console.log("Domain not found");

                    reqBody = {
                        hostname: sessionDomain.hostname,
                        limited: false,
                        trackDates: [{date: today, seconds: sessionDomain.seconds}]
                    };

                    console.log("Trying POST ", reqBody);

                    // POST domain
                    fetch(url, {
                        method: "POST",
                        headers: {
                            "content-type": "application/json"
                        },
                        body: JSON.stringify(reqBody)
                    })
                        .then(res => res.json())
                        .then(data => {
                            console.log("POST'ed ", data);
                        })
                }

            });
            // TODO: Spara den sammanslagna datan i db?
        })
        .then(x => {
            // Get - Read the domains
            // Method: GET
            fetch(url)
                .then(res => res.json())
                .then(data => {
                    data.forEach(domain => {
                        if (domain.hostname.length > 0) {
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
        })

    // fetch(url, {
    //     method: "POST",
    //     headers: {
    //         "content-type": "application/json"
    //     },
    //     body: JSON.stringify({
    //
    //     })
    // })



});

// TODO: Posta nuvarande sessions data till databasen


// function readAllDomains() {
//     var data = {};
//     data[""]
// }
