console.log("Clockmancer started")

const today = new Date(Date.now());
const url = "http://localhost:8080/domain";

let portFromDisplay;

let domainsFromDB = [];
var myDomains = [/* {seconds: 3723, limited: true, hostname: "www.test.com"} */];
var newDomain = {seconds: 0, limited: false};

var count = 0;
var timer;

function matchingDates(dateA, dateB) {
    // console.log("Checking if the dates match")
    return dateA.substring(0, 10) === dateB.toLocaleDateString();
}

fetchTodayDataFromDB();

function fetchTodayDataFromDB() {
    fetch(url)
        .then(res => res.json())
        .then(data => {
            data.forEach(dbDomain => {
                const trackDateToday = dbDomain.trackDates.find(td => matchingDates(td.date, today));
                if (trackDateToday) {
                    let domainToAddToSession = {};
                    domainToAddToSession.hostname = dbDomain.hostname;
                    domainToAddToSession.limited = dbDomain.limited;
                    domainToAddToSession.seconds = trackDateToday.seconds;
                    myDomains.push(domainToAddToSession);
                }
            })
        }).then(x => startTimer());
}

/**
 * Sätter upp kontakten med Display för att uppdatera vyn (+ skicka tillbaka användarinput)
 */
browser.runtime.onConnect.addListener((port) => {
    portFromDisplay = port;
    portFromDisplay.postMessage({
        myDomains: myDomains,
        currentHostname: newDomain.hostname,
        count: count
    });
    // Om jag vill skicka tillbaka information från display (eller options), gör så här:
    // portFromDisplay.onMessage.addListener(m => {
    //     myDomains[m.index].limited = m.limited;
    // });
});

/**
 * Funktion som hämtar aktuell domän och lägger till i myDomains om den är unik
 */
function getDomainAndAddIfUnique(tab) {
        
    let hostname = new URL(tab.url).hostname;
    console.log(hostname);
    newDomain.hostname = hostname;
    
    var add = true;

    // TODO: Refaktorera till find()
    myDomains.forEach(domain => {
        if (domain.hostname == newDomain.hostname) {
            add = false;
            console.log("Domain already found");
        }
    });

    if (add) {
        myDomains.push({...newDomain});
    }
}

// TODO: Refaktorera (doPostOrPut borde kunna undvikas)
function postToDatabase(domain) {
    fetch(url)
        .then(res => res.json())
        .then(data => {
            // Kan jag lika gärna använda data direkt?
            domainsFromDB = data;

            myDomains.forEach(sessionDomain => {
                // console.log("Domain from session: ", sessionDomain.hostname);
                let reqBody = {};

                // Går att lösa på ett snyggare sätt, men funkar.
                let doPostOrPut = true;

                // För varje domän i sessionen - kolla om samma hostname finns i db
                let dbDomain = domainsFromDB.find(dbDomain => {
                    // console.log(dbDomain.hostname, sessionDomain.hostname);
                    return dbDomain.hostname == sessionDomain.hostname;
                });

                if (dbDomain) {
                    // console.log("Domain found");

                    reqBody = {...dbDomain};

                    // Domänen finns - sök efter dagens datum i db
                    const trackDate = dbDomain.trackDates.find(trackDate => matchingDates(trackDate.date, today))
                    if (trackDate) {
                        // console.log("Domain has been visited today");
                        // Dagens datum finns i db - uppdatera tiden om den är annorlunda
                        if (trackDate.seconds == sessionDomain.seconds) {
                            doPostOrPut = false
                        } else {
                            trackDate.seconds = sessionDomain.seconds;
                        }
                        // TODO: Persist trackDate
                        // Just nu sparas trackDates enbart i domänobjekten med id null och inte också i TrackDate-samlingen
                        // Osäker på hur det görs så att det länkas på ett korrekt sätt (eller behöver jag det?)
                    } else {
                        // console.log("Domain has not been visited today");
                        // Dagens datum finns inte i domänens trackDates - lägg till det i domänens set av trackDates (datumet + sekunder)

                        reqBody.trackDates.push({
                            date: today,
                            seconds: sessionDomain.seconds
                        });
                    }

                    // console.log("Trying PUT ", reqBody);
                    if (sessionDomain.hostname == "") {
                        doPostOrPut = false;
                    }

                    // PUT domain
                    if (doPostOrPut) {
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
                    }

                } else {
                    console.log("Domain not found");

                    if (sessionDomain.hostname == "") {
                        doPostOrPut = false;
                    }

                    if (doPostOrPut) {
                        reqBody = {
                            hostname: sessionDomain.hostname,
                            limited: false,
                            trackDates: [{date: today, seconds: sessionDomain.seconds}]
                        };

                        // console.log("Trying POST ", reqBody);

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

                }

            });
        })
}

/**
 * Funktion som lägger till sekunder på den senaste domänen och hämtar den nya
 */
 function addCountToDomainAndGetNew(tab) {
     // TODO: Refaktorera till find()
    myDomains.forEach(domain => {
        if (domain.hostname == newDomain.hostname) {
            domain.seconds += count;
            postToDatabase(domain);
        }
    });
    count = 0;
    getDomainAndAddIfUnique(tab);
}

/**
 * Hämtar aktuell flik när applikationen startar
 */
var activeTab = browser.tabs.query({active: true, currentWindow: true});
    activeTab.then((tabs) => {

    getDomainAndAddIfUnique(tabs[0]);

});

/**
 * Lyssnar på när användaren byter flik eller navigerar till ny url
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("Tabs updated")
    // (Tycks alltid vara complete)
    if (tab.status == "complete") {
        addCountToDomainAndGetNew(tab);
    }
});

/**
 * Lyssnar på när användaren byter fönster
 */
browser.windows.onFocusChanged.addListener(() => {
    console.log("Focus changed");
    var activeTab2 = browser.tabs.query({active: true, currentWindow: true});
        activeTab2.then((tabs) => {
            addCountToDomainAndGetNew(tabs[0]);
    });
})

/**
 * Räknar sekunder
 * TODO: Hitta ett sätt att pausa räknaren när fönstret inte är aktivt.
 * JS window-API fungerar inte i bakgrundsskript.
 */
function timerHandler() {
    count++;
    // console.log(count);
}
function startTimer() {
    console.log("Focus");
    timer = setInterval(timerHandler, 1000);
}
function stopTimer() {
    clearInterval(timer);
}

// TODO: Kvarvarande buggar
// - Timern fortsätter räkna när fönstret inte är aktivt
// - Vid notiser i en flik tolkas den fliken som den aktiva