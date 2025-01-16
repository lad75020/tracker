        const DAY_TO_SEC = 86400;
        const HOME_URL = "https://tracker.dubertrand.fr/";
        google.charts.load('upcoming', {'packages':['corechart']});

        let firstLogDate = new Date(0);
        let lastLogDate = new Date(0);
        function setInitialDates(){
            document.getElementById("last").value = lastLogDate.toISOString().slice(0,10);
            document.getElementById("from").value = firstLogDate.toISOString().slice(0,10);
        }
        async function fetchDateRange(){
            firstLogDate = new Date(0);
            lastLogDate = new Date(0);
            await fetch(`${HOME_URL}getMaxDateRange.php`)
            .then(response=> response.text())
            .then(data => { const range = JSON.parse(data); firstLogDate.setUTCSeconds(range.firstTimestamp);lastLogDate.setUTCSeconds(range.lastTimestamp);setInitialDates();});
        }
        
        let from = firstLogDate.getTime()/1000;
        let first = 0;
        let last = lastLogDate.getTime()/1000;
        let stop = false;
        let chart;
        let chartData;
        let firstSelectedDate = "";
        let secondSelectedDate = "";
        let jsonCharts;
        function getCommonObjectsById(array1, array2) { 
            const map = new Map();
            array1.forEach(item => { map.set(item._id, item); });
            const commonObjects = array2.filter(item => map.has(item._id));
            return commonObjects;
        }
        function hasNestedProperty(obj, propertyPath) {
            const properties = propertyPath.split('.');
            let currentObj = obj;
            for (const property of properties) {
                if (!currentObj || !currentObj.hasOwnProperty(property)) {
                    return false;
                }
                currentObj = currentObj[property];
            }
            return true;
        }
        function createTable(data) {
            // Créer un élément table
            const table = document.createElement('table');
            table.style.border = '2px solid black';
        
            // Parcourir chaque ligne de données
            data.forEach((rowData, index) => {
                const row = document.createElement('tr');
                if (index === 0) {
                     row.style.backgroundColor = 'darkgrey';
                    row.style.color = 'white';
                }
        
                rowData.forEach((cellData, index) => {
                    const cell = document.createElement('td');;
                    if (cellData !== undefined){
                        if (cellData instanceof Date) {
                            cell.innerText = cellData.toISOString().slice(0,10);
                        }
                        else
                            cell.innerText = cellData;
                    }
                    cell.style.border = '1px solid black';
        
                    if (index !== rowData.length - 1) {
                        row.appendChild(cell); 
                    }
                });
        
                // Ajouter la ligne à la table
                table.appendChild(row);
            });
        
            // Ajouter la table au corps du document ou à un élément spécifique
            document.getElementById('debug2').appendChild(table);
        }
        
        async function retrieveLogsByLog(log, from, to) {
          const db = await idb.openDB("TORN");
          const value1 = await db.getAllFromIndex('logs', 'logIndex', log);
          const value2 = await db.getAllFromIndex('logs', 'timestampIndex', IDBKeyRange.bound(from, to));
          const result = getCommonObjectsById(value1, value2);
          return result;
        }
        async function retrieveLogsByCrimeAction(crime_action){
            const db = await idb.openDB("TORN");
            let cursor = await db.transaction('logs').store.openCursor();
            const aLogs = new Array();
            while(cursor) {
                if(hasNestedProperty(cursor.value,'data.crime_action') && cursor.value.data.crime_action.match(crime_action)) {
                    aLogs.push(cursor.value);
                }
                cursor = await cursor.continue();
            };
            return aLogs;
        }
        async function retrieveLogsByCrime(crime){
            const db = await idb.openDB("TORN");
            let cursor = await db.transaction('logs').store.openCursor();
            const aLogs = new Array();
            while(cursor) {
                if(hasNestedProperty(cursor.value,'data.crime') && typeof(cursor.value.data.crime) == "string" && cursor.value.data.crime.match(crime)) {
                    aLogs.push(cursor.value);
                }
                cursor = await cursor.continue();
            };
            return aLogs;
        }
        function loadChartSelect(){
            const select = document.getElementById("chartSelect");
            select.innerHTML = ""; // Clear existing options
            select.options.add(new Option("Select Chart Data", "empty")); // Add default option
            jsonCharts.sort((a, b) => { if (a.name < b.name) { return -1; } if (a.name > b.name) { return 1; } return 0; });
            jsonCharts.forEach(oChart => {
                select.options.add(new Option(oChart.name, oChart.name));
            }); 
        }
        function updatePrice(){
            const itemID = document.getElementById('itemID').value;
            fetch(`${HOME_URL}updatePrice.php?id=${itemID}&key=${localStorage.getItem('TornAPIKey')}`)
            .then(response => response.text())
            .then(data => {
                document.getElementById('price').style.color = 'rgb(157, 255, 0)';
                document.getElementById('price').innerText = data;
                initAutoComplete();
            });
        }
        async function loadConfig() {
            try {
                    const response = await fetch(`${HOME_URL}config.json`);
                    if (!response.ok) { 
                        throw new Error('Network response was not ok for config fetch'); }
                    const text = await response.text();
                    document.getElementById("debug2").innerText = text;
                    jsonCharts = JSON.parse(text);
                    loadChartSelect();
                }
                catch (error) {
                    console.error('There was a problem with the config fetch operation:', error);
                }
        }  
        function insertLogs(url, highestTimestamp){
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
            request.onsuccess = (event) => {
                db = event.target.result;
                
                let count = 0;

                fetch(url+"?from="+highestTimestamp)
                    .then(response => response.json())
                    .then(async data => {
                        for(const item of data) {
                            const transaction = db.transaction(['logs'], 'readwrite');
                            const objectStore = transaction.objectStore('logs');
                            const count_id = await objectStore.count(item._id);
                            count_id.onsuccess = (event) => {
                                if (event.target.result == 0) {
                                    count++;
                                    console.log("inserting "+item._id);
                                    objectStore.put(item);
                                }
                                else{
                                    console.log("skipping "+item._id);
                                }
                            }
                        }
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
            request.onsuccess = async (event) => { 
                const db = event.target.result;
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
                cursorRequest.onerror = (event) => { reject('Error retrieving data: ' + event.target.error); };
            };
        
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const objectStore = db.createObjectStore('logs', { keyPath: '_id' });
                objectStore.createIndex('logIndex', 'log', { unique: false });
                objectStore.createIndex('timestampIndex', 'timestamp', { unique: false });
            }
        }
               
        async function fetchLogs(){
            document.getElementById('wait').style.display = 'block';
            document.getElementById('chartContainer').style.display = 'none';
            document.getElementById('date').innerText = "";
            document.getElementById('percent').innerText = "";
            await fetch(`${HOME_URL}tornAttacks.php?key=${localStorage.getItem('TornAPIKey')}`)
            .then(response=> response.text())
            .then(data => { document.getElementById("date").innerText= data });
            const eventSource = new EventSource(`${HOME_URL}torn.php?key=${localStorage.getItem('TornAPIKey')}`);
            eventSource.onmessage = (event) => { 
                document.getElementById("date").innerText = event.data;
             }
            eventSource.addEventListener('end', function(event) { 
                fetchAndStoreData(`${HOME_URL}getAllTornLogs.php`);
                fetchDateRange();
                eventSource.close();
                document.getElementById('wait').style.display = 'none';
            });
        }
        async function getObjectsByProperties(idb,oStore,properties,startTimestamp,endTimestamp,crime) {
            return new Promise((resolve, reject) => {
                // Open the IndexedDB database
                const request = indexedDB.open(idb);
        
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
                                if(crime != undefined && cursor.value.data.crime.match( crime)){
                                    results.push(cursor.value);
                                }
                                if (crime === undefined){
                                    results.push(cursor.value);
                                }
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
        
        function selectHandler() {
            const selectedItem = chart.getSelection()[0];
            const chartName = chart.options.cc[0].title;
            if (selectedItem) {
                const value = chartData.getValue(selectedItem.row, 0);
                
                if(firstSelectedDate == "" )
                    firstSelectedDate = value;
                else if (secondSelectedDate == "")
                    secondSelectedDate = value;
                if (firstSelectedDate != "" && secondSelectedDate != ""){
                    if(firstSelectedDate < secondSelectedDate){
                        const dFirst = new Date(firstSelectedDate);
                        let year = dFirst.getFullYear();
                        let month = String(dFirst.getMonth() + 1).padStart(2, '0');
                        let day = String(dFirst.getDate()).padStart(2, '0');
                        document.getElementById("from").value = `${year}-${month}-${day}`;
                        const dSecond = new Date(secondSelectedDate);
                        year = dSecond.getFullYear();
                        month = String(dSecond.getMonth() + 1).padStart(2, '0');
                        day = String(dSecond.getDate()).padStart(2, '0');
                        document.getElementById("last").value = `${year}-${month}-${day}`;
                        initDisplay();
                        drawChart(chartName);
                    }
                    else{
                        alert("First Date must be before Last Date");
                    }
                    firstSelectedDate = "";
                    secondSelectedDate = "";
                }
            }
        }    
        function initDisplay(){
            stop = false;
            data1 = [];
            progress = 0;
            if(chart)
                chart.clearChart();
            document.getElementById("chartContainer").style.display = "none";
            document.getElementById("debug").innerHTML = "";
            document.getElementById("debug2").innerHTML = "";
            document.getElementById('wait').style.display = 'block';
            document.getElementById('controls').style.display = 'none';
            document.getElementById("chartContainer").innerHTML = "";

            const fromDate = new Date(document.getElementById('from').value);
            from = fromDate.getTime()/1000;
            first = fromDate.getTime()/1000;
            const lastDate = new Date(document.getElementById('last').value);
            last = lastDate.getTime()/1000;
        }
        async function prepareData(chartName){
            const data1 = new Array();
            let total =0;
            let manual_skill =0;
            let intelligence_skill=0;
            let endurance_skill = 0;
            const headers = new Array();
            const previous = new Object();
            const currentChart = jsonCharts.find(chart => chart.name === chartName);
            if (currentChart) {
                currentChart.header.forEach(header => {
                    headers.push(header);
                });
                headers.push({ role: 'style' });
                data1.push(headers);  
            }            
            else {
                document.getElementById("debug").innerText = `${chartName} Chart not found`;
                return;
            }        

            for (t=first; t<=last; t += DAY_TO_SEC){
                if (stop) break;
                const thisDay = new Date(0);
                thisDay.setUTCSeconds(t);

                let i = [thisDay];
                let {log, crime, crime_action, category,type} = currentChart;
                if (log != 9005 && log != 5410 && log !=2290 && log!= 8731 && category != "Gym" && type != "Attack" && type != "Trains" && type != "AllSkills" && type != "graffiti" && type != "Casino"){
                    await fetch(`${HOME_URL}getTornLogCount.php?from=${t}&to=${t+DAY_TO_SEC}&log=${log}&crime_action=${crime_action}`)
                    .then(response=> response.text())
                    .then(data => { i.push ( parseInt(data));});
                    await fetch(`${HOME_URL}getTornLogCount.php?from=${t}&to=${t+DAY_TO_SEC}&log=9150&crime_action=${crime_action}`)
                    .then(response=> response.text())
                    .then(data => { i.push ( parseInt(data));});
                    for(let k = 3;k < (data1[0].length-1); k++)
                        await fetch(`${HOME_URL}getTorn${currentChart.header[k]}.php?from=${t}&to=${t+DAY_TO_SEC}&crime_action=${crime_action}`)
                        .then(response=> response.text())
                        .then(data => { total += parseInt(data);
                                        if(currentChart.header[k] == "Money")
                                            i.push(parseInt(total));
                                        if(currentChart.header[k] == "Items")
                                            i.push(parseInt(data));                                  
                                    });
                    i.push('color: blue');
                    data1.push(i);
                }
                if ( type == "graffiti"){
                    let successes = 0;
                    await fetch(`${HOME_URL}getTornLogCount.php?from=${t}&to=${t+DAY_TO_SEC}&log=9010&crime_action=${crime_action}`)
                    .then(response=> response.text())
                    .then(data => { successes += parseInt(data);});
                    await fetch(`${HOME_URL}getTornLogCount.php?from=${t}&to=${t+DAY_TO_SEC}&log=9015&crime_action=${crime_action}`)
                    .then(response=> response.text())
                    .then(data => { successes += parseInt(data);});
                    await fetch(`${HOME_URL}getTornLogCount.php?from=${t}&to=${t+DAY_TO_SEC}&log=9020&crime_action=${crime_action}`)
                    .then(response=> response.text())
                    .then(data => { successes += parseInt(data);});
                    i.push(successes);
                    let failures = 0;
                    await fetch(`${HOME_URL}getTornLogCount.php?from=${t}&to=${t+DAY_TO_SEC}&log=9150&crime_action=${crime_action}`)
                    .then(response=> response.text())
                    .then(data => { failures += parseInt(data);});
                    await fetch(`${HOME_URL}getTornLogCount.php?from=${t}&to=${t+DAY_TO_SEC}&log=9154&crime_action=${crime_action}`)
                    .then(response=> response.text())
                    .then(data => { failures += parseInt(data);});
                    i.push(failures);
                    for(let k = 3;k < (currentChart.header.length); k++)
                        await fetch(`${HOME_URL}getTorn${currentChart.header[k]}.php?from=${t}&to=${t+DAY_TO_SEC}&crime_action=${crime_action}`)
                        .then(response=> response.text())
                        .then(data => { total += parseInt(data);
                                        if(currentChart.header[k] == "Money")
                                            i.push(parseInt(total));
                                        if(currentChart.header[k] == "Items")
                                            i.push(parseInt(data));                                  
                                    });
                    i.push('color: black');
                    data1.push(i);
                }
                if (type == "Casino" && category =="Slots"){
                    let money = 0;
                    await retrieveLogsByLog(8300, t, t+DAY_TO_SEC).then(objects => {objects.forEach(object => {money += object.data.won_amount - object.data.bet_amount;})});
                    await retrieveLogsByLog(8301, t, t+DAY_TO_SEC).then(objects => {objects.forEach(object => {money -= object.data.bet_amount;})});
                    i.push(money);
                    if (money > 0)
                        i.push('color:rgb(12, 124, 59)');
                    else 
                        i.push('color:rgb(173, 20, 20)');         
                    data1.push(i);
                }
                if(type=="Attack"){
                    await fetch(`${HOME_URL}getTornAttacks.php?from=${t}&to=${t+DAY_TO_SEC}`)
                    .then(response=> response.text())
                    .then(data => { 
                        let {wins, losses,attacks,defends} = JSON.parse(data);
                        data1.push([thisDay, attacks,defends,wins,losses,'color: red']);
                    });
                }
                if(type=="Trains"){
                    await fetch(`${HOME_URL}getCompanyTrains.php?from=${t}&to=${t+DAY_TO_SEC}`)
                    .then(response=> response.text())
                    .then(data => { 
                        let {manual, intelligence, endurance, trains} = JSON.parse(data);
                        manual_skill += parseInt(manual);
                        intelligence_skill += parseInt(intelligence);
                        endurance_skill += parseInt(endurance);
                        data1.push([thisDay, manual_skill, intelligence_skill, endurance_skill, trains,'color:black']);
                    });
                }                   
                if (category == "Gym"){
                    await fetch(`${HOME_URL}getTornGymStats.php?from=${t}&to=${t+DAY_TO_SEC}}`)
                    .then(response=> response.text())
                    .then(data => {
                        if (data != "[]"){
                            const oJSON = JSON.parse(data);
                            i[1] = oJSON.speed ?? previous.speed;
                            previous.speed = oJSON.speed ?? previous.speed;
                            i[2] = oJSON.defense ?? previous.defense;
                            previous.defense = oJSON.defense ?? previous.defense;
                            i[3] = oJSON.dexterity ?? previous.dexterity;
                            previous.dexterity = oJSON.dexterity ?? previous.dexterity; 
                            i[4] = oJSON.strength ?? previous.strength;
                            previous.strength = oJSON.strength ?? previous.strength;
                            i[5] = oJSON.energy_used;
                        }
                    });
                    i.push('color: black');
                    data1.push(i);
                }
                if(log == 2290){
                    await retrieveLogsByLog(2290, t, t+DAY_TO_SEC).then(objects => {i[1] = objects.length;});
                    await retrieveLogsByLog(2291, t, t+DAY_TO_SEC).then(objects => {i[2] = objects.length;});
                    await retrieveLogsByLog(6005, t, t+DAY_TO_SEC).then(objects => {i[3] = objects[0] !== undefined ? objects[0].data.rehab_times : 0;});
                    i.push('color: green');
                    if(i[1] > 0 || i[2] > 0 || i[3] > 0)
                        data1.push(i);
                }
                if (log == 5410){
                    await retrieveLogsByLog(5410, t, t+DAY_TO_SEC).then(objects => {i[1] = objects.length;});
                    await retrieveLogsByLog(5415, t, t+DAY_TO_SEC).then(objects => {i[2] = objects.length;});
                    
                    i.push('color: red');
                    if(i[1] > 0 || i[2] > 0)
                        data1.push(i);
                }
                if (log == 8731){
                    for (const result of ['win', 'lose']){
                            await fetch(`${HOME_URL}getTornLogCount.php?from=${t}&to=${t+DAY_TO_SEC}&log=${log}&position=${result}`)
                            .then(response=> response.text())
                            .then(data => { i.push((parseInt(data)) ? parseInt(data) : 0);});
            
                    };
                    i.push('color: red');
                    if(i[1] > 0 || i[2] > 0)
                        data1.push(i);
                }
                if (crime != undefined && crime !="" && type != "AllSkills"){
                    await getObjectsByProperties('TORN','logs',{log:9005},t,t+DAY_TO_SEC, crime)
                    .then(objects => {
                        if(objects.length > 0)
                            data1.push( [ thisDay, objects[0].data.skill_level, 'color:blue']);
                    })
                    .catch(error => {
                        console.error('Error retrieving objects:', error);
                    });
                
                }
                if (type=="AllSkills"){
                    await fetch(`${HOME_URL}getAllSkills.php?from=${t}&to=${t+DAY_TO_SEC}`)
                    .then(response=> response.json())
                    .then(data => {
                        const skills = ['cracking', 'pickpocketing', 'graffiti', 'skimming', 'forgery', 'searching', 'shoplifting', 'bootlegging', 'burglary','hustling'];
                        skills.forEach(skill => {
                            const skillValue = data[skill] ?? previous[skill];
                            i.push(skillValue);
                            previous[skill] = skillValue;
                        });
                    });
                    i.push('color: black');
                    data1.push(i);              
                }
                const progress = (t - first) / (last - first) * 100;
                document.getElementById("percent").innerHTML = `${progress.toFixed(0).padStart(2, '0')}%`;
                document.getElementById("date").innerHTML =  thisDay.toISOString().slice(0,10);
                
            }
            const data2 = new Array();
            data1.forEach((item) => {
                if (item.length === data1[0].length) {
                    data2.push(item);
                }
            });
            return(data2);
        }
        async function drawChart(chartName){
            const data = await prepareData(chartName);
            const currentChart = jsonCharts.find(chart => chart.name === chartName);

            document.getElementById("wait").style.display="none";
            document.getElementById("controls").style.display="block";
            if(data.length > 1){
                document.getElementById("chartContainer").style.display="block";

                createTable(data);
                chartData = google.visualization.arrayToDataTable(data);
                chart = new google.visualization.ComboChart(document.getElementById('chartContainer'));
                google.visualization.events.addListener(chart, 'select', selectHandler);
                chart.draw(chartData, currentChart.options);
                
            }
            else{
                document.getElementById("debug").innerText = "No "+ chartName +" Found";
                document.getElementById("chartContainer").innerHTML = "";
            }
        }
        