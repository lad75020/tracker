
importScripts('/js/fetching.js');
let myInterval;

onmessage = (e) => {
    if (e.data === 'once') {
        console.log('Once fetch');
        periodicFetch()
    }
    else if (e.data === 'stop') {
        console.log('Stopping interval');
        if(myInterval)
            clearInterval(myInterval);
    }
    else if (e.data === 'restart') {
        console.log('Restarting interval');
        myInterval = setInterval(periodicFetch, 60*60*1000);
    }
    else
        console.error('Unknown command: ' + e.data);
}
async function periodicFetch() {
    postMessage(new Date());
    postMessage("visible");
    fetchLogs();
}
console.log("Web worker started");
postMessage("fetching");
myInterval = setInterval(periodicFetch, 60*60*1000);
