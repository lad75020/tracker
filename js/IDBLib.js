function copyLogs(log, indexes) {
    const dbName = 'TORN';
    const sourceStoreName = 'logs';
    const targetStoreName = 'logs'+log;
    document.getElementById('wait').style.display = 'block';
    // Open the existing database
    const request = indexedDB.open(dbName,5);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create the target object store with an index on "data.crime_action"
        if (!db.objectStoreNames.contains(targetStoreName)) {
            const targetStore = db.createObjectStore(targetStoreName, { keyPath: '_id' });
            indexes.forEach(index => {
            targetStore.createIndex(index+'Index', 'index', { unique: false });
            });
        }
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        let count = 0;
        // Start a transaction to read from the source store and write to the target store
        const transaction = db.transaction([sourceStoreName, targetStoreName], 'readwrite');
        const sourceStore = transaction.objectStore(sourceStoreName);
        const targetStore = transaction.objectStore(targetStoreName);

        // Open a cursor to iterate over all items in the source store
        const cursorRequest = sourceStore.openCursor();

        cursorRequest.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                const record = cursor.value;
                if (record.log === 9005) {
                    targetStore.add(record);
                    count++;
                }
                cursor.continue();
            } else {
                document.getElementById('wait').style.display = 'none';
                document.getElementById('result').innerText = 'All matching '+ count+ ' items have been copied.';
            }
        };

        cursorRequest.onerror = (event) => {
            console.error('Error reading from source store:', event.target.error);
        };

        transaction.oncomplete = () => {
            console.log('Transaction completed successfully.');
        };

        transaction.onerror = (event) => {
            console.error('Transaction error:', event.target.error);
        };
    };

    request.onerror = (event) => {
        console.error('Error opening database:', event.target.error);
    };
}
