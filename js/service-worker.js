
const HOME_URL = "https://tracker.dubertrand.fr/";
let myInterval;
async function insertLogs(url, highestTimestamp){
    const request = indexedDB.open('TORN');
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('logs')) {
            const targetStore = db.createObjectStore('logs', { keyPath: '_id' });
            targetStore.createIndex('logIndex', 'log', { unique: false });
            targetStore.createIndex('timestampIndex', 'timestamp', { unique: false });
            targetStore.createIndex('crime_actionIndex', 'data.crime_action', { unique: false });
            targetStore.createIndex('crimeIndex', 'data.crime', { unique: false });
        }
    };
    request.onsuccess = async (event) => {
        db = event.target.result;
        
        let count = 0;

        await fetch(url+"?from="+highestTimestamp)
            .then(response => response.json())
            .then(async data => {
                for(const item of data) {
                    const transaction = db.transaction(['logs'], 'readwrite');
                    const objectStore = transaction.objectStore('logs');
                    const count_id = await objectStore.count(item._id);
                    count_id.onsuccess = (event) => {
                        if (event.target.result == 0) {
                            postMessage(++count);
                            const date = new Date();
                            console.log(`inserting ${item._id} from ${item.timestamp} at ${date.toUTCString()}`);
                            objectStore.put(item);
                        }
                        else{
                            console.log("skipping "+item._id);
                        }
                    }

                    count_id.onerror = (event) => {
                        console.error('Error counting id:', event.target.error);
                    }
                }
                postMessage("hidden");
                postMessage("&nbsp;");
            })
            .catch(error => {
                console.error('Mongo Logs Fetch error:', error);
            });
    };

    request.onerror = (event) => {
        console.error('Creation of IndexedDB error:', event.target.error);
    };
}

async function fetchAndStoreData(url) {
    const request = indexedDB.open('TORN');
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('logs')) {
            const targetStore = db.createObjectStore('logs', { keyPath: '_id' });
            targetStore.createIndex('logIndex', 'log', { unique: false });
            targetStore.createIndex('timestampIndex', 'timestamp', { unique: false });
            targetStore.createIndex('crime_actionIndex', 'data.crime_action', { unique: false });
            targetStore.createIndex('crimeIndex', 'data.crime', { unique: false });
        }
    };
    request.onsuccess = async (event) => { 
        const db = event.target.result;
        if (!db.objectStoreNames.contains('logs')) {
            const targetStore = db.createObjectStore('logs', { keyPath: '_id' });
            targetStore.createIndex('logIndex', 'log', { unique: false });
            targetStore.createIndex('timestampIndex', 'timestamp', { unique: false });
            targetStore.createIndex('crime_actionIndex', 'data.crime_action', { unique: false });
            targetStore.createIndex('crimeIndex', 'data.crime', { unique: false });
            insertLogs(url, 0);
        }
        else{
            const transaction = db.transaction(['logs'], 'readonly');
            const objectStore = transaction.objectStore('logs');
            const index = objectStore.index('timestampIndex');
            const cursorRequest = await index.openCursor(null, 'prev');
            cursorRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const record = cursor.value;
                    insertLogs(url, record.timestamp);
                }
            };
            cursorRequest.onerror = (event) => {  reject('Error retrieving data: ' + event.target.error); };
        }
    };

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const objectStore = db.createObjectStore('logs', { keyPath: '_id' });
        objectStore.createIndex('logIndex', 'log', { unique: false });
        objectStore.createIndex('timestampIndex', 'timestamp', { unique: false });
    }
}
        
async function fetchLogs(){
    const eventSource = new EventSource(`${HOME_URL}tornAttacks.php`);
    eventSource.onmessage = async (event) => { 
        postMessage(event.data);
    };
    eventSource.addEventListener('end', async (event) => { 
        postMessage("Attacks done");
        eventSource.close();
    });

    const eventSource2 = new EventSource(`${HOME_URL}torn.php`);
    eventSource2.onmessage = async (event) => { 
        postMessage(event.data);
    };
    eventSource2.addEventListener('end', async (event) => { 
        fetchAndStoreData(`${HOME_URL}getAllTornLogs.php`);
        eventSource2.close();
    });
}
async function checkSession() {
    try {
      const response = await fetch('https://tracker.dubertrand.fr/checkSession.php');
      const data = await response.json();
  
      if (data.session_active) {
        postMessage('active');
      } else {
        postMessage('inactive');
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  }
  
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
        console.error(`Unknown command: ${e.data}`);
}
async function periodicFetch() {
    postMessage(new Date());
    postMessage("visible");
    await fetchLogs();
}
console.log("Web worker started");
postMessage("fetching");
myInterval = setInterval(periodicFetch, 60*60*1000);
setInterval(checkSession, 60*1000);
fetch(`${HOME_URL}insertNetworth.php`);
