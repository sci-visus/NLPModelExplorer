/*
Using treemap and histogram to visualize the error sentence pairs

using:
treemapPlot
histoPlot
*/

class evaluationComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["evaluationStatistics"]);

        this.margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        };

        this.topOffset = 65;
        this.draw();
        this.setupUI();
    }

    initSvg() {
        //create svg
        if (this.svgContainer === undefined) {
            this.svgContainer = d3.select(this.div).append("svg")
                .attr("width", this.pwidth)
                .attr("height", this.pheight);
            this.svg = this.svgContainer
                .append("g")
                .attr("transform", "translate(" + this.margin.left + "," +
                    this.margin.top + ")")
                .attr("width", this.width)
                .attr("height", this.height);

            // this.svgSave = new svgExporter(this.svgContainer, [this.width -
            //     10, 10
            // ]);
            this.treeMap = new treeMapPlot(this.svg, [0, 0], [
                this.width * 0.5, this.height * 0.5
            ]);
            this.treeMap.bindSelectionCallback(this.updateHisto.bind(
                this));

            this.histo = new histoPlot(this.svg, [0, this.height * 0.5], [
                this.width * 0.5, this.height * 0.5
            ], true);
            this.histo.bindSelectionCallback(this.updateScatterplot.bind(
                this));

            this.scatter = new scatterPlot(this.svg, [this.width * 0.5, 0], [
                this.width * 0.5, this.height
            ]);
            this.scatter.bindSelectionCallback(this.senetenceSelection.bind(
                this));

        } else {
            this.svgContainer
                .attr("width", this.pwidth)
                .attr("height", this.pheight)

            // this.svg.selectAll("text,rect,path").remove();
            this.treeMap.update([0, 0], [
                this.width * 0.5, this.height * 0.5
            ]);
            this.histo.update([0, this.height * 0.6], [
                this.width * 0.5, this.height * 0.4
            ]);
            this.scatter.update([this.width * 0.5, 0], [
                this.width * 0.5, this.height
            ]);
            // this.svgSave.updatePos([this.width - 10, 10])
            // this.svgSave.draw();
        }
    }

    draw() {
        this._updateWidthHeight();
        //apply top offset
        this.pheight = this.pheight - this.topOffset;
        this.height = this.height - this.topOffset;

        this.initSvg();

        if (this.statistic) {
            this.treeMap.draw();
            this.histo.draw();
        }
    }

    updateHisto(data) {
        // var stabilities = data.map(d => d.stability);
        // console.log(stabilities);
        this.histo.setSample(data, d => d.stability);
    }

    updateScatterplot(data) {
        //index get data
        var plotData = [];
        console.log(data);

        plotData.push(data.map(d => d.stability));
        plotData.push(data.map(d => d.perturbCount));

        this.scatter.setData(plotData, ["stability", "perturbCount"], [
            0, 1
        ], [0]);
    }

    senetenceSelection(indice) {
        for (var i = 0; i < indice.length; i++) {
            // indice[i]

        }

    }

    getDataFromIndex(index) {

    }

    resize() {
        this._updateWidthHeight();
        this.initSvg(); //update svg size
    }

    setupUI() {
        let fileList = ["../data/test-set-statistic.json",
            "../data/dev-set-statistic.json"
        ]
        d3.select(this.div + "selectData")
            .selectAll('option')
            .data(fileList).enter()
            .append('option')
            .text(d => d)
            .property("value", (d, i) => i);

        d3.select(this.div + "selectData")
            .on("change", d => {
                var index = Number(d3.select(this.div + "selectData").property(
                    'value'));
                this.callFunc("loadSummaryStatistic", {
                    "filename": fileList[index]
                });
            });
        //load the data
        this.callFunc("loadSummaryStatistic", {
            "filename": fileList[0]
        });
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);

        switch (msg['name']) {
            case "evaluationStatistics":
                this.statistic = this.data["evaluationStatistics"];
                this.treeMap.setData(this.statistic, "All Pairs");
                this.draw();
                break;
        }

    }

    // parseFunctionReturn(msg) {
    //     switch (msg["func"]) {
    //         case "loadSummaryStatistic":
    //             //load data
    //             console.log(msg);
    //             break;
    //     }
    // }
}
