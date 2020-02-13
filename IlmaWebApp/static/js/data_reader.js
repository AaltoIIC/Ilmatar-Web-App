/*
Unused code!

Unfinished datareader class that is could be the only
object that reads data from Ilmatar. This minimizes
the queries sent to the OPC UA server's GraphQL wrapper.

However, the way this is done asynchronously adds slight
latency to the data, which could possibly be fixed via some
kind of subscription of this objects this.result variable.
*/

let queryGetStatus = `
    {
        watchdogFault: node(server: "${server}", nodeId: "${nodeIdWDF}") {variable{value}}
        readingControls: node(server: "${server}", nodeId: "${nodeIdRC}") {variable{value}}
    }
`;

class Datareader {
    constructor(apiUrl, interval=250) {
        this.url = apiUrl;
        this.query = '{}';
        this.interval = interval;
        this.response = null;
        this.xhr = new XMLHttpRequest();
        this.xhr.onload = function(){
            this.response = this.xhr.response.json()
        }
    }

    read() {
        if (query != '{}'){
            this.xhr.open('POST', this.url);
            this.xhr.setRequestHeader('Content-Type', 'application/json');
            this.xhr.send(JSON.stringify({query}));

        }
    }

    addToQuery(node) {
        query = this.query.slice(0, -1);
        this.query = query + node + '}';
    }

    removeFromQuery(node) {
        this.query = this.query.replace(node, '');
    }


    query = queryGetStatus;

    /* if (statusQuery.readyState === 4 || statusQuery.readyState === 0) {
        statusQuery.open('POST', apiUrl);
        statusQuery.setRequestHeader('Content-Type', 'application/json');
        statusQuery.onload = function() {
            res = JSON.parse(statusQuery.response);

            if (res.errors) {
                console.log(res);
                readingControls = false;
            } else if (statusQuery.status === 200) {
                data = res.data;
                if (data.watchdogFault.variable.value === true) {
                    console.log("Watchdog fail");
                }
                if (data.readingControls.variable.value === true && readingControls == false) {
                    console.log("Reading controls");
                    readingControls = true;
                } else if (data.readingControls.variable.value === false && readingControls == true) {
                    console.log("Not reading controls");
                    readingControls = false;
                }
            } else {
                console.log("Connection to API failed");
                readingControls = false;
            }
        };
        statusQuery.send(JSON.stringify({query}));

        if (webWorker === true) {
            self.postMessage(readingControls);
        } else {
            if (readingControls === true) {
                $("#readingControl").css("background-color", "lightgreen");
            } else {
                $("#readingControl").css("background-color", "lightcoral");
            }
        }
    } */
}


setInterval(read, 250);