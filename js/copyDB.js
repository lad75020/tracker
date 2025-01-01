async function copyIndexedDB(sourceDBName, targetDBName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(sourceDBName);

        request.onsuccess = async (event) => {
            const sourceDB = event.target.result;
            const targetRequest = indexedDB.open(targetDBName, 1);

            targetRequest.onupgradeneeded = (event) => {
                const targetDB = event.target.result;



                    const storeName = 'items';
                    const sourceStore = sourceDB.transaction([storeName], 'readonly').objectStore(storeName);
                    const targetStore = targetDB.createObjectStore(storeName, { keyPath: 'id' });
                    targetStore.createIndex('nameIndex', 'name', { unique: false});


            };

            targetRequest.onsuccess = (event) => {
                const targetDB = event.target.result;
                    const storeName = 'items';
                    const sourceTransaction = sourceDB.transaction([storeName], 'readonly');
                    const sourceStore = sourceTransaction.objectStore(storeName);

                    const allRecords = sourceStore.getAll();
                    const targetTransaction = targetDB.transaction([storeName], 'readwrite');
                    const targetStore = targetTransaction.objectStore(storeName);

                    allRecords.onsuccess = (event) => { event.target.result.forEach((record) => { targetStore.put(record); }); };      

            };

            targetRequest.onerror = (event) => {
                reject('Error opening target database: ' + event.target.error);
            };
        };

        request.onerror = (event) => {
            reject('Error opening source database: ' + event.target.error);
        };
    });
}



