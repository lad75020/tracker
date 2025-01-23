
importScripts('/js/fetching.js');
let myInterval;
onmessage = (e) => {
    if (e.data === 'once') 
        callPeriodicFunction();
    else if (e.data === 'stop') {
        console.log('Stopping interval');
        clearInterval(myInterval);
    }
    else if (e.data === 'restart') {
        console.log('Restarting interval');
        myInterval = setInterval(callPeriodicFunction, 60*60*1000);
    }
    else 
        console.error('Unknown command: ' + e.data);
}
postMessage("visible");
fetchLogs();

function callPeriodicFunction() {
    postMessage("visible");
    fetchLogs();
}
myInterval = setInterval(callPeriodicFunction, 60*60*1000);
