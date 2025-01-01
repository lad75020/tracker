async function fetchAndStoreData(url, divName) {
    // Open (or create) the IndexedDB database
    let db;
    let request = indexedDB.deleteDatabase('TORN');
    request = indexedDB.open('TORN', 1);

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        // Create an object store with 'id' as the key path
        const objectStore = db.createObjectStore('logs', { keyPath: '_id' });
        objectStore.createIndex('logIndex', 'log', { unique: false });
        objectStore.createIndex('timestampIndex', 'timestamp', { unique: false });
    }
    request.onsuccess = (event) => {
        db = event.target.result;
        count = 0;
        // Fetch the JSON data from the URL
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Start a new transaction
                const transaction = db.transaction(['logs'], 'readwrite');
                const objectStore = transaction.objectStore('logs');
                // Insert each object into the object store
                data.forEach(item => {
                    count++;
                    objectStore.put(item);
                });
                
                transaction.oncomplete = () => {
                    document.getElementById(divName).innerText = 'All data has been added to the IndexedDB: ' + count + ' Items';
                    
                };
                transaction.onerror = (event) => {
                    console.error('Transaction error:', event.target.error);
                };
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    };

    request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
    };
}

