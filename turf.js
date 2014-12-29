// Javascript module to work with combinations.
// Generate (n/k) combinations, iterate and work with them.
//
// MIT License (MIT)
// Copyright (c) 2011 daniel salvati
var combination_gen=function(){var e={};e.set=[];e.n=0;e.k=0;e.items=[];e.add=function(t){e.items.push(t);e.n=e.items.length};e.get_combination=function(){var t=[];for(var n=0;n<e.set.length;n++){if(e.set[n]){if(e.items[n])t.push(e.items[n]);else t.push("o")}}return t};e.build=function(){if(e.k>e.n){console.log("invalid. pub.k>pub.n");return}e.set=[];for(var t=0;t<e.n;t++)e.set.push(false);for(var t=0;t<e.k;t++)e.set[t]=true};e.next=function(){var e=t();if(e!==false){n(e);return true}return false};var t=function(){for(var t=e.n-1;t>0;t--)if(e.set[t-1]&&!e.set[t])return t-1;return false};var n=function(t){e.set[t]=false;e.set[t+1]=true;r(t+1)};var r=function(t){if(t>e.n-3)return false;var n=0;for(var r=t+1;r<e.n;r++){if(e.set[r]){n++;e.set[r]=false}}for(var r=0;r<n;r++){e.set[r+t+1]=true}};return e}()

function Turf() {
    this.data;
    this.k;
    this.count;
    this.combination_gen = combination_gen;
}

/**
 * @param {Array}   2-D array of firstly records and then boolean acceptance
 *                  values corresponding in order to the items
 */
Turf.prototype.replaceData = function (data) {
    this.data = data;
    this.combination_gen.items = [];
    for (var i = 0; i < data[0].length; i++) {
        this.combination_gen.add(i);
    }
};

/**
 * @param {Number}  The 0-based index of this data record
 * @param {Array}   Array of k 0-based item indexes in this combination
 */
Turf.prototype.getRecordFrequency = function (recordIndex, combo) {

    // Select this record's data
    var data = this.data[recordIndex];

    return combo

        // Get the corresponding boolean values from this record's data
        .map(function (itemIndex) {
            return data[itemIndex];
        })

        // Count the number of hits
        .reduce(function (previousValue, currentValue) {
            return previousValue + currentValue;
        });

};

/**
 * @param {Number}  The number of items desired per combination
 * @param {Number}  The number of top combinations to return
 */
Turf.prototype.getResults = function (k, count) {
    this.results = [];

    if (this.data === undefined) {
        throw new ReferenceError("No data available");
    }

    this.combination_gen.k = k;
    this.combination_gen.build();
};

var turf = new Turf();

self.addEventListener("message", function (e) {
    var stop = e.data.stop || false;
    var k = e.data.k;
    var data = e.data.data;
    var count = e.data.count;
    var results;

    if (data !== undefined) {
        turf.replaceData(data);
    }

    if (k !== undefined && count !== undefined) {
        self.postMessage({
            results: turf.getResults(k, count)
        });
    }
});
