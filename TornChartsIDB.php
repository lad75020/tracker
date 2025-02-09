<?php
session_start([ 'cookie_secure' => true,'cookie_httponly' => true, 'cookie_samesite' => 'Strict'  ]);
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client())->TORN->users;

if (!isset($_SESSION['username']) || !isset($_SESSION['authkey'])) {
    header('Location: index.html');
    die();
}

if ($_SESSION['authkey'] != $collection->findOne(['username' => $_SESSION['username']])['authkey']) {
    header('Location: index.html');
    die();
}
?>
<!DOCTYPE HTML>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Torn City Charts</title>
        <link rel="stylesheet" type="text/css" href="css/torncharts.css">
        <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
        <script defer type="text/javascript" src="https://cdn.jsdelivr.net/npm/idb@8/build/umd.js"></script>
        <script type="text/javascript" src="js/tornchartsidb.js"></script>
        <script type="text/javascript" src="js/auto-complete.js"></script>
        <script type="text/javascript" src="js/jsonview.js"></script>
        <script>
            let w = new Worker('js/service-worker.js');
            w.onmessage = function(event) { 
                if (event.data == 'visible' || event.data == 'hidden') {
                    document.getElementById("logFetching").style.visibility =  event.data; 
                }
                else if (event.data == "fetching") {
                    if(new Date() - new Date(localStorage.getItem('lastFetch') >= 30*60*1000)){
                        localStorage.setItem('lastFetch', new Date().toISOString());
                        w.postMessage("once");
                    }
                }
                else if (event.data == "active") {
                    document.getElementById("logout").style.backgroundColor = "green";
                }
                else if (event.data == "inactive") {
                    location.href = "index.html";
                }
                else if(event.data instanceof Date) {
                    localStorage.setItem( "lastFetch", event.data.toISOString());
                }
                else {
                    document.getElementById("fetchStatus").innerHTML = event.data;
                }
                
            };
                
        </script>        

    </head>
    <body onload="loadConfig();fetchDateRange();initAutoComplete();">
        <header id="controls">
            <label for="from">Start date</label><input type="date" id="from" onchange ="if (this.value > document.getElementById('last').value) this.value = document.getElementById('last').value"/>
            <label for="last">End date</label><input type="date" id="last" onchange="if(this.value < document.getElementById('from').value) this.value = document.getElementById('from').value"/>
            <input type="button" id="setLogDates" title="Set max date range" value="&#x2B05;&nbsp;&#x1F4C5;&nbsp;&#x27A1;" onclick="setInitialDates()"/>
            <select id="chartSelect" onchange="this.options[0].text = 'Clear Chart' ;if (this.value != 'empty') {initDisplay();drawChart(this.value);} else {chart.clearChart();document.getElementById('debug2').innerHTML='';this.options[0].text = 'Select Chart';}"></select>
            <input type="checkbox" title="Show Data" id="showData" onchange="document.getElementById('debug2').style.display = this.checked ? 'block':'none'"/>
            <label id="lblItems" for="autocomplete-input" onclick="document.getElementById('autocomplete-input').value='';">Items</label>
            <input type="text" id="autocomplete-input" placeholder="Type to search...">&nbsp;$&nbsp;<span id="price"></span>
            <input type="hidden" id="itemID"/>
            <input type="button" id="updatePrice" title="Fetch latest price" value="&#x1F504;&nbsp;$" onclick="updatePrice();" disabled/>
            <span id="logFetching" style="display:inline;visibility:visible;z-index:100"><img src="images/wait.gif" width="20px" height="20px"/></span>
            <span id="fetchStatus" style="display:inline">&nbsp;</span>
            <input type="button" value="&#x1F50D;" title="Fetch logs once" onclick="if(new Date() - new Date(localStorage.getItem('lastFetch') >= 30*60*1000)) w.postMessage('once');"/>
            <input type="button" value="&#x1F6D1;" id="btnStop2" title="Stop automatic log fetching" onclick="w.postMessage('stop');document.getElementById('btnRestart').disabled = false;this.disabled = true;"/>
            <input type="button" value="&#x25B6;" id="btnRestart" title="Restart automatic log fetching" onclick="w.postMessage('restart');document.getElementById('btnStop2').disabled = false;this.disabled = true;" disabled/>
            <input type="button" title="Log out" id="logout" value="&#x1F6AA;" onclick="w.terminate();w=undefined;destroySession();"/>
            <div id="autocomplete-suggestions" class="autocomplete-suggestions"></div>
            <div id="debug"></div>
            <div id="Total" style="display:none;z-index:100"></div>
            <div id="Average" style="display:none;z-index:100"></div>
        </header>
        <main>
            <div id="wait">
                <div id="waitimg"><img src="images/wait.gif"/></div>
                <div id="stop"><input type="button" value="Stop" id="btnStop" onclick="stop = true;"/></div>
                    <div id="progress">
                        <span id="percent"></span>
                        &nbsp;&nbsp;&nbsp;<span id="date"></span>
                    </div>
                </div>
            <div id="chartContainer"></div>
        </main>
        <footer id="debug2"></footer>

    </body>
</html>