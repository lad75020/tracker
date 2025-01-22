
importScripts('/js/fetching.js');

postMessage("inline");
fetchLogs();
postMessage("none");
function callPeriodicFunction() {
    postMessage("inline");
    fetchLogs();
    postMessage("none");
}

setInterval(callPeriodicFunction, 60*60*1000);
