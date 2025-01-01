async function getObjectsByLog(logValue) {
    return new Promise((resolve, reject) => {
        // Open the IndexedDB database
        const request = indexedDB.open('TORN', 1);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['logs'], 'readonly');
            const objectStore = transaction.objectStore('logs');
            const index = objectStore.index('logIndex');
            const query = index.getAll(logValue);

            query.onsuccess = (event) => {
                resolve(event.target.result);
            };

            query.onerror = (event) => {
                reject(event.target.error);
            };
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Example usage
getObjectsByLog(2290)
    .then(objects => {
        console.log('Retrieved objects:', objects);
    })
    .catch(error => {
        console.error('Error retrieving objects:', error);
    });
