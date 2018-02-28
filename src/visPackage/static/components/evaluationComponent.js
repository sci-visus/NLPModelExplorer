/*
Using treemap and histogram to visualize the error sentence pairs

using:
treemapPlot
histoPlot
*/

class evaluationComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["evaluationSummary"]);

        this.margin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        };

        this.data = [{
            "key": "United States Virgin Islands",
            "region": "Americas",
            "subregion": "Caribbean",
            "value": 106405
        }, {
            "key": "Uruguay",
            "region": "Americas",
            "subregion": "South America",
            "value": 3286314
        }, {
            "key": "Uzbekistan",
            "region": "Asia",
            "subregion": "Central Asia",
            "value": 30183400
        }, {
            "key": "Vanuatu",
            "region": "Oceania",
            "subregion": "Melanesia",
            "value": 264652
        }, {
            "key": "Venezuela",
            "region": "Americas",
            "subregion": "South America",
            "value": 28946101
        }, {
            "key": "Vietnam",
            "region": "Asia",
            "subregion": "South-Eastern Asia",
            "value": 90388000
        }, {
            "key": "Wallis and Futuna",
            "region": "Oceania",
            "subregion": "Polynesia",
            "value": 13135
        }, {
            "key": "Western Sahara",
            "region": "Africa",
            "subregion": "Northern Africa",
            "value": 567000
        }, {
            "key": "Yemen",
            "region": "Asia",
            "subregion": "Western Asia",
            "value": 24527000
        }, {
            "key": "Zambia",
            "region": "Africa",
            "subregion": "Eastern Africa",
            "value": 13092666
        }, {
            "key": "Zimbabwe",
            "region": "Africa",
            "subregion": "Eastern Africa",
            "value": 12973808
        }];

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
                    this.margin.top + ")");

            // this.svgSave = new svgExporter(this.svgContainer, [this.width -
            //     10, 10
            // ]);
            this.treeMap = new treeMapPlot(this.svg);
            this.treeMap.setData(this.data);

        } else {
            this.svgContainer
                .attr("width", this.pwidth)
                .attr("height", this.pheight)

            this.svg.selectAll("text,rect,path").remove();

            // this.svgSave.updatePos([this.width - 10, 10])
            // this.svgSave.draw();
        }
    }

    draw() {
        this.initSvg();
        this.treeMap.draw();

    }
}
