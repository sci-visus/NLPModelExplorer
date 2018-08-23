class latentSpaceComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["currentPair"]);

        this.margin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        };

        this.tableEntry = null;
        this.draw();
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        // console.log(msg);

        switch (msg['name']) {
            case "currentPair":
                this.callFunc("latentStateLookup", {
                    "sentence": this.data["currentPair"][
                        "sentences"
                    ][0]
                });
        }
    }

    parseFunctionReturn(msg) {
        super.parseFunctionReturn(msg);
        switch (msg['name']) {
            case 'neighborLookup':
                this.handleNeighborLookup(msg['data']);
        }
    }

    handleNeighborLookup(neighbors) {
        console.log(neighbors);
        //convert dict to table
        let sens = neighbors["sentence"];
        let dists = neighbors["distance"];
        this.tableEntry = [];
        for (var i = 0; i < sens.length; i++) {
            this.tableEntry.push([dists[i], sens[i]]);
        }
        this.draw();
    }

    draw() {
        //////// drawing table ////////
        d3.select(this.div + "table").selectAll("*").remove();
        var thead = d3.select(this.div + "table").append('thead');
        var tbody = d3.select(this.div + "table").append('tbody');
        // console.log(thead, tbody);
        // append the header row
        let columns = ["dist", "sentence"];
        thead.append('tr')
            .selectAll('th')
            .data(columns).enter()
            .append('th')
            .text(t => t);

        if (this.tableEntry) {
            let data = this.tableEntry;
            // create a row for each object in the data
            var rows = tbody.selectAll('tr')
                .data(data)
                .enter()
                .append('tr');

            // create a cell in each row for each column
            // let colormap = ["lightgreen", "Gainsboro", "GhostWhite"];
            var cells = rows.selectAll('td')
                .data(function(row) {
                    return columns.map(function(column, i) {
                        let entry = row[i];

                        return {
                            column: column,
                            value: entry,
                            color: row[0]
                        };
                    });
                })
                .enter()
                .append('td')
                .style("background-color", d => rgba(255, 255, 255, d.color *
                    200))
                .text(d => d.value);
        }
    }

}
