console.log("Clockmancer started");

const url = "http://localhost:8080/domain";
let portAcrossExtension;

// Initieras vid sessionens start och startar om vid midnatt
let today = new Date();
let myDomains = [];
let newDomain = {seconds: 0, limited: false};

let count = 0;
let timer;

/**
 * Sätter upp kontakten med Display för att uppdatera vyn + skicka tillbaka användarinput från Options
 */
browser.runtime.onConnect.addListener((port) => {
    portAcrossExtension = port;
    portAcrossExtension.postMessage({
        myDomains: myDomains,
        currentHostname: newDomain.hostname,
        count: count
    });
    // Lyssnar på när information om vilken domän som ska tas bort skickas från Options
    portAcrossExtension.onMessage.addListener(m => {
        console.log(m.deleteDomain);
        let deleteIndex;

        for (let i = 0; i < myDomains.length; i++) {
            if (myDomains[i].hostname === m.deleteDomain) {
                console.log("FOUND DOMAIN TO DELETE:", myDomains[i].hostname);
                deleteIndex = i;
            }
        }

        if (deleteIndex) myDomains.splice(deleteIndex, 1);
        else console.log("Domain "+m.deleteDomain+" has not been used today.");

        // Verkar inte behövas i nuläget, men om domänen inte hinner raderas från myDomains innan Options-sidan laddar om:
        // portAcrossExtension.postMessage({reload: true});
    });
});

fetchTodayDataFromDB();

/**
 * Hämtar aktuell flik när applikationen startar
 */
let activeTab = browser.tabs.query({active: true, currentWindow: true});
activeTab.then((tabs) => {
    getDomainAndAddIfUnique(tabs[0]);
});

// Milliseconds until midnight
let millisTil00 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0) - today + 86400000;
/**
 * Startar om relevanta processer om sessionen passerar över midnatt
 * TODO: Starta om timeout när den har passerat
 * https://thewebdev.info/2021/04/18/how-to-reset-the-settimeout-timer-with-javascript/
 */
setTimeout(() => {
    let activeTabAtMidnight = browser.tabs.query({active: true, currentWindow: true});
    activeTabAtMidnight.then((tabs) => {
        addCountToDomainAndGetNew(tabs[0]);
        today = new Date();
        myDomains = [];
        newDomain = {hostname: tabs[0].hostname, seconds: 0, limited: false};
        count = 0;
    });
}, millisTil00);

/**
 * Lyssnar på när användaren byter flik eller navigerar till ny url
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("Tabs updated")
    // (Tycks alltid vara complete)
    if (tab.status == "complete") {
        addCountToDomainAndGetNew(tab);
        getDomainAndAddIfUnique(tab);
    }
});

/**
 * Lyssnar på när användaren byter fönster
 */
browser.windows.onFocusChanged.addListener(() => {
    console.log("Focus changed");
    let activeTab2 = browser.tabs.query({active: true, currentWindow: true});
    activeTab2.then((tabs) => {
        addCountToDomainAndGetNew(tabs[0]);
        getDomainAndAddIfUnique(tabs[0]);
    });
});

/**
 * Funktion som returnerar true om ett datum från databasen och ett JS-datumobjekt matchar
 */
function matchingDates(dbDateString, jsDateObject) {
    const dateFromDb = new Date(dbDateString);
    return dateFromDb.toLocaleDateString() === jsDateObject.toLocaleDateString();
}

function fetchTodayDataFromDB() {
    fetch(url)
        .then(res => res.json())
        .then(data => {
            data.forEach(dbDomain => {
                // TODO: Kan bytas ut mot getDomainsForToday-API
                const trackDateToday = dbDomain.trackDates.find(td => matchingDates(td.date, today));
                if (trackDateToday) {
                    let domainToAddToSession = {};
                    domainToAddToSession.hostname = dbDomain.hostname;
                    domainToAddToSession.limited = dbDomain.limited;
                    domainToAddToSession.seconds = trackDateToday.seconds;
                    myDomains.push(domainToAddToSession);
                }
            })
        }).then(() => {
            count = 0;
            startTimer();
        });
}

/**
 * Funktion som lägger till sekunder på den senaste domänen och hämtar den nya
 */
function addCountToDomainAndGetNew(tab) {
    const domain = myDomains.find(d => d.hostname == newDomain.hostname);
    if (domain) {
        domain.seconds += count;
        postToDatabase(domain);
    }
    count = 0;
}

/**
 * Funktion som hämtar aktuell domän och lägger till i myDomains om den är unik
 */
function getDomainAndAddIfUnique(tab) {
        
    let hostname = new URL(tab.url).hostname;
    console.log(hostname);
    newDomain.hostname = hostname;
    
    let add = true;

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

            myDomains.forEach(sessionDomain => {
                let reqBody = {};

                // Går nog att lösa på ett snyggare sätt, men funkar.
                let doPostOrPut = true;

                // För varje domän i sessionen - kolla om samma hostname finns i db
                let dbDomain = data.find(dbDomain => dbDomain.hostname == sessionDomain.hostname);

                if (dbDomain) {
                    reqBody = {...dbDomain};

                    // Domänen finns - sök efter dagens datum i db
                    const trackDate = dbDomain.trackDates.find(trackDate => matchingDates(trackDate.date, today))
                    if (trackDate) {
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
                        // Dagens datum finns inte i domänens trackDates - lägg till det i domänens set av trackDates (datumet + sekunder)
                        reqBody.trackDates.push({
                            date: today,
                            seconds: sessionDomain.seconds
                        });
                    }

                    if (sessionDomain.hostname == "" || !sessionDomain.hostname.includes(".")) {
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
                    // console.log("Domain not found");

                    // Om domännamnet är tomt eller inte innehåller punkter - posta ej
                    if (sessionDomain.hostname == "" || !sessionDomain.hostname.includes(".")) {
                        doPostOrPut = false;
                    }

                    if (doPostOrPut) {
                        reqBody = {
                            hostname: sessionDomain.hostname,
                            limited: false,
                            trackDates: [{date: today, seconds: sessionDomain.seconds}]
                        };

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
 * Räknar sekunder
 * TODO: Hitta ett sätt att pausa räknaren när fönstret inte är aktivt.
 * JS window-API fungerar inte i bakgrundsskript.
 */
function timerHandler() {
    count++;
}
function startTimer() {
    timer = setInterval(timerHandler, 1000);
}
function stopTimer() {
    clearInterval(timer);
}

// TODO: Kvarvarande buggar (background)
// - Timern fortsätter räkna när fönstret inte är aktivt
// - Vid notiser i en flik tolkas den fliken som den aktiva
// - (LÖST?) Lägger till flera trackDates av samma datum (händer strax efter tolvslaget, beror på tidszons-diff)
// - (LÖST?) Om sessionen ligger kvar från igår hämtas inte den nya dagen och tiden fortsätter lagras på gårdagen