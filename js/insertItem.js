async function insertItem(id, jsonObject) {
    return new Promise((resolve, reject) => {
        // Open the IndexedDB database
        const request = indexedDB.open('TORN', 2);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Create the object store if it doesn't exist
            if (!db.objectStoreNames.contains('items')) {
                db.createObjectStore('items', { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['items'], 'readwrite');
            const objectStore = transaction.objectStore('items');

            // Add the id to the JSON object
            jsonObject.id = id;

            // Insert the JSON object into the object store
            const addRequest = objectStore.put(jsonObject);

            addRequest.onsuccess = () => {
                resolve(`Item ${id} inserted successfully`);
            };

            addRequest.onerror = (event) => {
                reject('Error inserting item: ' + event.target.error + ' - ' + JSON.stringify(jsonObject));
            };
        };

        request.onerror = (event) => {
            reject('IndexedDB error: ' + event.target.error);
        };
    });
}

async function getItem(id){
    
    await fetch(`https://api.torn.com/v2/market/${id}/itemmarket?key=${localStorage.getItem('TornAPIKey')}&offset=0`)
    .then(response => response.json())
    .then(data => {
        if(data.error) {
            console.log(data.error.error);
            stop = true;
            return;
        }
        insertItem(id, {name: data.itemmarket.item.name, price: data.itemmarket.item.average_price, type: data.itemmarket.item.type})
        .then(message => {
            document.getElementById("item").innerHTML += message + "<BR/>";
        })
        .catch(error => {
            console.error(error);
        });
    });

}
