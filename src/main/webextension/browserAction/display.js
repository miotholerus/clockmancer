let myPort = browser.runtime.connect({name: "port-from-display"});
// myPort.postMessage({greetingFromDisplay: "hello from display"});

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

  // Töm listan (alla tr-element med namnet "domain")
  var elements = document.getElementsByName("domain");
  for(var i = elements.length - 1; i >= 0; i--) {
    elements[i].parentNode.removeChild(elements[i]);
  }
  
  // För varje rad (domän)
  for (let i = 0; i < m.myDomains.length; i++) {
    const domain = m.myDomains[i];

    // Om hostname finns (är längre än "")
    if (domain.hostname.length > 0) {
      // Skapa en rad
      const tr = document.createElement("tr");
      tr.setAttribute("name", "domain");
      
      const td1 = document.createElement("td");
      const button = document.createElement("button");
      button.innerHTML = domain.hostname.length > 24 ?
        domain.hostname.substring(0, 21) + "... "
        : domain.hostname;
      td1.appendChild(button);

      const td2 = document.createElement("td");
      if (domain.hostname == m.currentHostname) {
        td2.innerHTML = getTimeInfo(domain.seconds + m.count);
      } else {
        td2.innerHTML = getTimeInfo(domain.seconds);
      }
      
      tr.appendChild(td1)
      tr.appendChild(td2);
      
      document.getElementById("table").appendChild(tr);
    }
  }

});