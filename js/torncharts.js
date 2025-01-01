        const DAY_TO_SEC = 86400;
        const HOME_URL = "https://tracker.dubertrand.fr/";
        google.charts.load('upcoming', {'packages':['corechart','line','bar']});
        let fromDate;
        const firstLogDate = new Date(0);
        const lastLogDate = new Date(0);
        function setInitialDates(){
            document.getElementById("last").value = lastDate.toISOString().slice(0,10);
            document.getElementById("from").value = fromDate.toISOString().slice(0,10);
        }
        fetch(`${HOME_URL}getMaxDateRange.php`)
        .then(response=> response.text())
        .then(data => { const range = JSON.parse(data); firstLogDate.setUTCSeconds(range.firstTimestamp);lastLogDate.setUTCSeconds(range.lastTimestamp);setInitialDates();});
        fromDate = firstLogDate;
        let from = fromDate.getTime()/1000;
        let first = 0;
        let lastDate =lastLogDate;
        let last = lastDate.getTime()/1000;
        let data1 = [];
        let chartData;
        let progress = 0;
        let stop = false;
        let chart;
        let firstSelectedDate = "";
        let secondSelectedDate = "";
        let jsonCharts;
        function loadChartSelect(){
            const select = document.getElementById("chartSelect");
            select.innerHTML = ""; // Clear existing options
            select.options.add(new Option("Select Chart Data", "empty")); // Add default option
            jsonCharts.sort((a, b) => { if (a.name < b.name) { return -1; } if (a.name > b.name) { return 1; } return 0; });
            jsonCharts.forEach(oChart => {
                select.options.add(new Option(oChart.name, oChart.name));
            }); 
        } 
        async function loadConfig() {
            try {
                const response = await fetch(`${HOME_URL}config.json`);
                if (!response.ok) { 
                    throw new Error('Network response was not ok'); }
                const text = await response.text();
                document.getElementById("debug2").innerText = text;
                jsonCharts = JSON.parse(text);
                loadChartSelect();
                }
                catch (error) {
                    console.error('There was a problem with the fetch operation:', error); } }       
        function fetchLogs(){
            document.getElementById('wait').style.display = 'block';
            document.getElementById('chartContainer').style.display = 'none';
            document.getElementById('percent').innerText = "Fetching logs...";
            document.getElementById('date').innerText = "";
            fetch(`${HOME_URL}torn.php`)
            .then(response=> response.text())
            .then(data => { document.getElementById("debug2").innerHTML += `<BR/>Logs:<BR/>${data}`; document.getElementById('wait').style.display = 'none'; });
            fetch(`${HOME_URL}tornAttacks.php`)
            .then(response=> response.text())
            .then(data => { document.getElementById("debug2").innerHTML = `<BR/>Attacks:<BR/>${data}`; });
           
        }
        function setLogDates(){
            document.getElementById('from').value = firstLogDate.toISOString().slice(0,10);
            document.getElementById('last').value = lastLogDate.toISOString().slice(0,10);
        }
        function selectHandler() {
            const selectedItem = chart.getSelection()[0];
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
                        drawChart(currentChartName);
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

            fromDate = new Date(document.getElementById('from').value);
            from = fromDate.getTime()/1000;
            first = fromDate.getTime()/1000;
            sessionStorage.setItem("FirstDate", fromDate.toISOString().slice(0,10));

            lastDate = new Date(document.getElementById('last').value);
            sessionStorage.setItem("LastDate", lastDate.toISOString().slice(0,10));         
            last = lastDate.getTime()/1000;
        }
        async function drawChart(chartName){
            currentChartName = chartName;
            let total =0;
            let manual_skill =0;
            let intelligence_skill=0;
            let endurance_skill = 0;
            let options = [];
            let headers = [];
            const previous = new Object();
            const currentChart = jsonCharts.find(chart => chart.name === chartName);
            if (currentChart) {
                options = currentChart.options;
                headers = currentChart.header;
            }            
            else {
                document.getElementById("debug").innerText = `${chartName} Chart not found`;
                return;
            }

            data1.push(headers);

            for (t=first; t<=last; t += DAY_TO_SEC){
                if (stop) break;
                const thisDay = new Date(0);
                thisDay.setUTCSeconds(t);

                let i = [thisDay];
                let {log, crime, crime_action, category,type} = currentChart;
                if (log != 9005 && log != 5410 && log !=2290 && log!= 8731 && category != "Gym" && type != "Attack" && type != "Trains" && type != "AllSkills" && type != "graffiti"){
                    await fetch(`${HOME_URL}getTornLogCount.php?from=${t}&to=${t+DAY_TO_SEC}&log=${log}&crime_action=${crime_action}`)
                    .then(response=> response.text())
                    .then(data => { i.push ( parseInt(data));});
                    await fetch(`${HOME_URL}getTornLogCount.php?from=${t}&to=${t+DAY_TO_SEC}&log=9150&crime_action=${crime_action}`)
                    .then(response=> response.text())
                    .then(data => { i.push ( parseInt(data));});
                    for(let k = 3;k < (currentChart.header.length); k++)
                        await fetch(`${HOME_URL}getTorn${currentChart.header[k]}.php?from=${t}&to=${t+DAY_TO_SEC}&crime_action=${crime_action}`)
                        .then(response=> response.text())
                        .then(data => { total += parseInt(data);
                                        if(currentChart.header[k] == "Money")
                                            i.push(parseInt(total));
                                        if(currentChart.header[k] == "Items")
                                            i.push(parseInt(data));                                  
                                    });
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
                    data1.push(i);
                }
                if(type=="Attack"){
                    await fetch(`${HOME_URL}getTornAttacks.php?from=${t}&to=${t+DAY_TO_SEC}`)
                    .then(response=> response.text())
                    .then(data => { 
                        let {wins, losses,attacks,defends} = JSON.parse(data);
                        data1.push([thisDay, attacks,defends,wins,losses]);
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
                        data1.push([thisDay, manual_skill, intelligence_skill, endurance_skill, trains]);
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
                    
                    if(i.length > 1)
                        data1.push(i);
                }
                if(log == 2290){
                    await fetch(`${HOME_URL}getTornLogCount.php?from=${t}&to=${t+DAY_TO_SEC}&log=${log}`)
                    .then(response=> response.text())
                    .then(data => { i[1] = parseInt(data);});
                    await fetch(`${HOME_URL}getTornLogCount.php?from=${t}&to=${t+DAY_TO_SEC}&log=2291`)
                    .then(response=> response.text())
                    .then(data => { i[2] = parseInt(data);});
                    data1.push(i);
                }
                if (log == 5410){
                    await fetch(`${HOME_URL}getTornLogCount.php?from=${t}&to=${t+DAY_TO_SEC}&log=${log}`)
                    .then(response=> response.text())
                    .then(data => { i.push (parseInt(data));});

                    await fetch(`${HOME_URL}getTornLogCount.php?from=${t}&to=${t+DAY_TO_SEC}&log=5415`)
                    .then(response=> response.text())
                    .then(data => { i.push(parseInt(data));});
                    
                    data1.push(i);
                }
                if (log == 8731){
                    for (const result of ['win', 'lose']){
                            await fetch(`${HOME_URL}getTornLogCount.php?from=${t}&to=${t+DAY_TO_SEC}&log=${log}&position=${result}`)
                            .then(response=> response.text())
                            .then(data => { i.push((parseInt(data)) ? parseInt(data) : 0);});
                            data1.push(i);
                    };
                }
                if (crime != undefined && crime !="" && type != "AllSkills"){
                    await fetch(`${HOME_URL}getTornSkill.php?from=${t}&to=${t+DAY_TO_SEC}&crime=${crime}`)
                    .then(response=> response.text())
                    .then(data => { if (parseInt(data) > 0) data1.push( [ thisDay, parseInt(data)]); ;});                      
                }
                if (type=="AllSkills"){
                    await fetch(`${HOME_URL}getAllSkills.php?from=${t}&to=${t+DAY_TO_SEC}`)
                    .then(response=> response.text())
                    .then(data => {
                        const parsedData = JSON.parse(data);
                        const skills = ['cracking', 'pickpocketing', 'graffiti', 'skimming', 'forgery', 'searching', 'shoplifting', 'bootlegging', 'burglary'];
                        skills.forEach(skill => {
                            const skillValue = parsedData[skill] ?? previous[skill];
                            i.push(skillValue);
                            previous[skill] = skillValue;
                        });
                    });
                    data1.push(i);              
                }
                const progress = (t - first) / (last - first) * 100;
                document.getElementById("percent").innerHTML = `${progress.toFixed(0).padStart(2, '0')}%`;
                document.getElementById("date").innerHTML =  thisDay.toISOString().slice(0,10);
                
            }
            const nbCol = data1[0].length;
            const data2 = new Array();
            data1.forEach((item) => {
                if (item.length === nbCol) {
                    data2.push(item);
                }
            });
            document.getElementById("wait").style.display="none";
            document.getElementById("controls").style.display="block";
            if(data2.length > 1){
                document.getElementById("chartContainer").style.display="block";

                document.getElementById("debug2").innerHTML = JSON.stringify(data2).replace(/\]\,/g,"],<BR/>");
                const chartData = google.visualization.arrayToDataTable(data2);
                if(currentChart.type == "AllSkills" || currentChart.type == "skill")                    
                    chart = new google.charts.Line(document.getElementById('chartContainer'));
                else if (currentChart.log == 2290)
                    chart = new google.charts.Bar(document.getElementById('chartContainer'));
                else
                    chart = new google.visualization.ComboChart(document.getElementById('chartContainer'));
                google.visualization.events.addListener(chart, 'select', selectHandler);
                chart.draw(chartData, (currentChart.type=="AllSkills" || currentChart.type == "skill" || currentChart.log == 2290) ? google.charts.Line.convertOptions(options) : options);
                
            }
            else{
                document.getElementById("debug").innerText = "No "+ chartName +" Found";
                document.getElementById("chartContainer").innerHTML = "";
            }
        }
        