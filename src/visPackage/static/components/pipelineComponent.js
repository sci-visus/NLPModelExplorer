class pipelineComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.data["pipeline"] = [{
            "name": "encoder"
        }, {
            "name": "attention"
        }, {
            "name": "classifier"
        }];
        this.draw();
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

            this.svgSave = new svgExporter(this.svgContainer, [this.width -
                10, 10
            ]);
        } else {
            this.svgContainer
                .attr("width", this.pwidth)
                .attr("height", this.pheight)

            this.svg.selectAll("text,rect,path, defs").remove();

            this.svgSave.updatePos([this.width - 10, 10])
            this.svgSave.draw();
        }
    }

    draw() {
        this._updateWidthHeight();
        console.log("draw pipeline");
        if (this.data["pipeline"] !== undefined) {
            this.initSvg();
            this.itemSize = [];
            var pipelineData = this.data["pipeline"];

            var len = pipelineData.length;
            var size = [this.width / (len + 2), 50];
            for (var i = 0; i < pipelineData.length; i++) {
                var pos = [this.width / (len + 1) * (i + 1), this.height *
                    0.5
                ];
                var item = new pipelineItemPlot(this.svg,
                    pos, size, pipelineData[i]["name"]
                );
                item.draw();
                this.itemSize.push(item);
            }
        }

        if (this.itemSize === undefined) {} else {
            //update item position

        }

    }

    drawArraw(pos1, pos2) {

    }


}
