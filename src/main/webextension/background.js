console.log("My Addon is running!")

var myDomains = [{seconds: 3723, minutesAllowed: 0, onWatchlist: true, hostname: "www.test.com"}];
var newDomain = {seconds: 0, minutesAllowed: 0, onWatchlist: false};

var count = 0;
var timer;

startTimer();

let portFromDisplay;

/**
 * Sätter upp kontakten med Display för att uppdatera vyn + skicka tillbaka användarinput
 */
browser.runtime.onConnect.addListener((port) => {
    portFromDisplay = port;
    portFromDisplay.postMessage({
        myDomains: myDomains,
        currentHostname: newDomain.hostname,
        count: count
    });
    portFromDisplay.onMessage.addListener(m => {
        myDomains[m.index].minutesAllowed = m.minutesAllowed;
        myDomains[m.index].onWatchlist = m.onWatchlist;
    });
});

/**
 * Funktion som hämtar aktuell domän och lägger till i myDomains om den är unik
 */
function getDomainAndAddIfUnique(tab) {
        
    let hostname = new URL(tab.url).hostname;
    console.log(hostname);
    newDomain.hostname = hostname;
    
    var add = true;
    
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

/**
 * Funktion som lägger till sekunder på den senaste domänen och hämtar den nya
 */
 function addCountToDomainAndGetNew(tab) {
    myDomains.forEach(domain => {
        if (domain.hostname == newDomain.hostname) {
            domain.seconds += count;
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
    count++
    console.log(count);
}
function startTimer() {
    console.log("Focus");
    timer = setInterval(timerHandler, 1000);
}
function stopTimer() {
    clearInterval(timer);
}