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

            this.histo = new histoPlot(this.svg, [this.width * 0.52, 0], [
                this.width * 0.45, this.height * 0.5
            ], true);


        } else {
            this.svgContainer
                .attr("width", this.pwidth)
                .attr("height", this.pheight - this.topOffset)

            // this.svg.selectAll("text,rect,path").remove();
            this.treeMap.update([0, 0], [
                this.width * 0.5, this.height * 0.5
            ]);
            this.histo.update([this.width * 0.52, 0], [
                this.width * 0.45, this.height * 0.5
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
        this.treeMap.setData(this.data, "pairs");
        this.treeMap.setSelectionCallback(this.updateHisto.bind(this));

        this.treeMap.draw();
        this.histo.draw();
    }

    updateHisto(data) {
        var stabilities = data.map(d => d.stability);
        this.histo.setSample(stabilities);
    }

    resize() {
        this._updateWidthHeight();
        this.initSvg(); //update svg size

        // if (this.treeMap) {
        //     this.treeMap.update([0, 0], [this.width * 0.5, this.height]);
        // }
        // if (this.histo) {
        //     this.histo.update([this.width * 0.55, 0], [
        //         this.width * 0.45, this.height * 0.95
        //     ]);
        // }

    }

    setupUI() {
        let fileList = ["../data/test-set-statistic.json"]
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
                this.treeMap.setData(this.data["evaluationStatistics"],
                    "All Pairs");
                // this.draw();
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
