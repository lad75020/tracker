async function exportObjectStoreToJSON(dbName, storeName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction([storeName], 'readonly');
            const objectStore = transaction.objectStore(storeName);
            const getAllRequest = objectStore.getAll();

            getAllRequest.onsuccess = (event) => {
                const data = event.target.result;
                const json = JSON.stringify(data, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = `${storeName}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                resolve('Export successful');
            };

            getAllRequest.onerror = (event) => {
                reject('Error retrieving data: ' + event.target.error);
            };
        };

        request.onerror = (event) => {
            reject('IndexedDB error: ' + event.target.error);
        };
    });
}

document.getElementById('export-button').addEventListener('click', () => {
    exportObjectStoreToJSON('TORN', 'items')
        .then(message => {
            console.log(message);
        })
        .catch(error => {
            console.error(error);
        });
});
