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
Turf.prototype._getRecordFrequency = function (recordIndex, combo) {

    // Select this record's data
    var data = this.data[recordIndex];

    return combo

        // Get the corresponding boolean values from this record's data
        .map(function (itemIndex) {
            return data[itemIndex];
        });

        // Count the number of hits
        .reduce(function (previousValue, currentValue) {
            return previousValue + currentValue;
        });

};

Turf.prototype._sortResults = function (a, b) {
    return (a.reach - b.reach);
};

/**
 * @param {Array}   Array of k 0-based item indexes in this combination
 */
Turf.prototype._doComboTurf = function (combo) {
    var reach = 0;
    var frequency = 0;

    var recordFreq;

    for (var ri = 0; ri < this.data.length; ri++) {
        recordFreq = this._getRecordFrequency(ri, combo);
        reach += Number(Boolean(recordFreq));
        frequency += recordFreq;
    }

    this.results.push({
        combo: combo,
        reach: reach,
        frequency: frequency
    });

    this.results.sort(this._sortResults).slice(0, this.count);
};

Turf.prototype._checkStop() {
    if (this.stop) {
        return true;
    }
}

/**
 * @param {Number}  The number of items desired per combination
 * @param {Number}  The number of top combinations to return
 */
Turf.prototype.getResults = function (k, count) {
    var combo;
    var comboResults;

    this.results = [];

    if (this.k === undefined) {
        throw new ReferenceError("Combination size not set");
    }

    if (this.count === undefined) {
        throw new ReferenceError("Number of results not set")
    }

    if (this.data === undefined) {
        throw new ReferenceError("No data available");
    }

    this.combination_gen.k = k;
    this.combination_gen.build();

    this._doComboTurf(this.combination_gen.get_combination());
    if (this._checkStop()) {
        return null;
    }

    while (this.combination_gen.next()) {
        if (this._checkStop()) {
            return null;
        }
        this._doComboTurf(this.combination_gen.get_combination());
    }

    return this.results;

};

var turf = new Turf();

self.addEventListener("message", function (e) {
    var k = e.data.k;
    var data = e.data.data;
    var count = e.data.count;
    var results;

    this.stop = e.data.stop || false;

    if (data !== undefined) {
        turf.replaceData(data);
    }

    if (k !== undefined) {
        this.k = k;
    }

    if (count !== undefined) {
        this.count = count;
    }

    // Run analysis
    results = turf.getResults();

    // Analysis was interrupted
    if (results === null) {
        self.postMessage({
            stopped: true
        })
    }

    // Send results to main page
    self.postMessage({
        results: results
    });
});
