class pipelineComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);

        this.subscribeDatabyNames(["pipeline"]);

        this.margin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        };

        this.draw();
    }

    initSvg() {
        //create svg
        if (this.svgContainer === undefined) {
            this.svgContainer = d3.select(this.div).append("svg")
                .attr("width", this.pwidth)
                .attr("height", this.pheight);
            //add stripe pattern
            this.defs = this.svgContainer.append("defs");
            this.defs.append("pattern")
                .attr("id", "stripe")
                .attr("patternUnits", "userSpaceOnUse")
                .attr("width", 20)
                .attr("height", 20)
                .attr("patternTransform", "rotate(45)")
                .append("line")
                .attr("x1", 15)
                .attr("y1", 0)
                .attr("x2", 15)
                .attr("y2", 20)
                .attr("stroke", "lightgrey")
                .attr("stroke-width", 10);

            this.defs.append("marker")
                .attr("id", "arrow")
                // .attr("markerUnits", "strokeWidth")
                .attr("markerWidth", 5)
                .attr("markerHeight", 5)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 5)
                .attr("refY", 0)
                .attr("orient", "auto")
                // .attr({
                //     "id": "arrow",
                //     "viewBox": "0 -5 10 10",
                //     "refX": 5,
                //     "refY": 0,
                //     "markerWidth": 4,
                //     "markerHeight": 4,
                //     "orient": "auto"
                // })
                .append("path")
                .attr("d", "M0,-5L10,0L0,5")
                // .attr("class", "arrowHead")
                .style("fill", "grey");

            // this.defs.append("marker")
            //     .attr("id", "arrow")
            //     .attr("markerUnits", "strokeWidth")
            //     .attr("markerWidth", "10")
            //     .attr("markerHeight", "10")
            //     .attr("viewBox", "0 0 10 10")
            //     .attr("refX", "6")
            //     .attr("refY", "6")
            //     .attr("orient", "auto")
            //     .append("path")
            //     .attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2")
            //     .style("fill", "grey");

            //draw legend
            this.legend = this.svgContainer.append("g").attr("id", "legend");

            //reset
            this.reset = this.svgContainer.append("g");
            this.reset.append("rect")
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("x", 20)
                .attr("y", 20)
                .attr("width", 50)
                .attr("height", 30)
                .attr("fill", "lightgrey")
                .on("click", this.resetPipeline.bind(this))
                .on("mouseover", function(d) {
                    d3.select(this).attr("fill", "grey");
                })
                .on("mouseout", function(d) {
                    d3.select(this).attr("fill", "lightgrey");

                });
            this.reset.append("text")
                .text("reset")
                .attr("x", 20 + 25)
                .attr("y", 20 + 15)
                .style("text-anchor", "middle")
                .style("alignment-baseline", "middle")
                .style("pointer-events", "none");

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

            this.svg.selectAll("text,rect,path").remove();

            this.svgSave.updatePos([this.width - 10, 10])
            this.svgSave.draw();
        }
    }

    resetPipeline() {
        console.log("reset model");
        let pipeline = this.data["pipeline"];
        for (let i = 0; i < pipeline.length; i++) {
            pipeline[i]["hist"] = undefined;
        }
        console.log(pipeline);
        this.setData("pipeline", pipeline);
        this.draw();
        this.callFunc("reloadModel");
    }

    resize() {
        this.draw();
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        switch (msg["name"]) {
            case "pipeline":
                // states = this.data["pipelineState"]
                // this.updatePipelineState(states)
                this.draw();
                break
        }
    }

    updatePipelineState(index, state) {
        let pipeline = this.data["pipeline"];
        pipeline[index]["state"] = state;
        // console.log("updatePipeline: ", index, state, pipeline);
        this.setData("pipeline", pipeline);
        // if (this.items) {
        //     for (var i = 0; this.items.length; i++) {
        //         this.items[i].setState(states[i] === 0 ? false : true);
        //     }
        // }
    }

    draw() {
        this._updateWidthHeight();
        // console.log("draw pipeline");
        if (this.data["pipeline"] !== undefined) {
            this.initSvg();
            this.drawLegend();
            this.items = [];
            var pipelineData = this.data["pipeline"];
            console.log(pipelineData);

            // if (this.items === undefined) {
            var len = pipelineData.length;
            var size = [this.width / (len + 1), 45];
            for (var i = 0; i < pipelineData.length; i++) {
                var pos = [this.width / (len) * (i + 0.5), this.height *
                    0.5
                ];
                var item = new pipelineItemPlot(this.svg,
                    pos, size, pipelineData[i]["index"], pipelineData[i]
                    ["name"], pipelineData[i]["state"]
                );
                item.bindSelectionCallback(this.updatePipelineState.bind(
                    this));
                if (pipelineData[i]["hist"]) {
                    item.setGraidentHisto(pipelineData[i]["hist"],
                        pipelineData[i]["histName"]);
                }
                item.draw();
                this.items.push(item);
            }
            for (var i = 0; i < pipelineData.length; i++) {
                let arrows = pipelineData[i]["arrow"];
                for (let j = 0; j < arrows.length; j++) {
                    let start = this.items[i].getOutputPortPos();
                    let end = this.items[arrows[j]].getInputPortPos();
                    this.drawArrow(start, end);
                }
            }
            // }
            // else {
            //     //update pipeline
            //     for(let i=0; i<this.items.length; i++){
            //         this.items[i]
            //     }
            // }
        }
    }

    drawArrow(start, end) {
        // console.log("drawArrow", start, end)
        //align the arrow head with rect
        end[0] = end[0] - 4;
        //draw curved arrow
        let start1 = [start[0] + (end[0] - start[0]) * 0.2, start[1]];
        let end1 = [start[0] + (end[0] - start[0]) * 0.8, end[1]];
        var pathData = [start, start1, end1, end];
        let curveGen = d3.line()
            // .curve(d3.curveCatmullRomOpen)
            .curve(d3.curveMonotoneX)
            .x(d => d[0])
            .y(d => d[1]);

        this.svg.append("path")
            .attr("d", curveGen(pathData))
            .attr("stroke-width", 2)
            .attr("stroke", "grey")
            .attr("fill", "none")
            .attr("marker-end", "url(#arrow)");
    }

    drawLegend() {
        this.legend.selectAll("*").remove();
        this.legend.append("rect")
            .attr("fill", "lightblue")
            .attr("stroke", "grey")
            .attr("x", this.width - 90)
            .attr("y", 10)
            .attr("width", 70)
            .attr("height", 30);
        this.legend.append("text")
            .attr("x", this.width - 100)
            .attr("y", 25)
            .attr("font-size", 14)
            .text("Allow Update")
            .style("text-anchor", "end")
            .style("alignment-baseline", "middle");

        this.legend.append("rect")
            .attr("fill", "url(#stripe)")
            .attr("stroke", "grey")
            .attr("x", this.width - 90)
            .attr("y", 50)
            .attr("width", 70)
            .attr("height", 30);
        this.legend.append("text")
            .attr("x", this.width - 100)
            .attr("y", 65)
            .attr("font-size", 14)
            .text("Freeze Update")
            .style("text-anchor", "end")
            .style("alignment-baseline", "middle");
    }


}
