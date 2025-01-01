async function getObjectsByProperties(idb,oStore,properties,startTimestamp,endTimestamp) {
    return new Promise((resolve, reject) => {
        // Open the IndexedDB database
        const request = indexedDB.open(idb, 1);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction([oStore], 'readonly');
            const objectStore = transaction.objectStore(oStore);
            const index = objectStore.index('timestampIndex'); 
            const range = IDBKeyRange.bound(startTimestamp, endTimestamp); 
            const query = index.openCursor(range);
            const results = [];

            query.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const match = Object.keys(properties).every(key => cursor.value[key] === properties[key]);
                    if (match) {
                        results.push(cursor.value);
                    }
                    cursor.continue();
                } else {
                    resolve(results);
                }
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


