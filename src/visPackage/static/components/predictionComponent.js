/*

the triangle vis of the prediction result

*/

class predictionComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);

        //subscribe to data
        this.subscribeDatabyNames(["allSourceSens", "allTargetSens",
            "prediction", "allPairsPrediction"
        ]);

        this.margin = {
            top: 25,
            right: 25,
            bottom: 25,
            left: 25
        };

        this.svgContainer = d3.select(this.div);
        this.svgSave = new svgExporter(this.svgContainer);

        this.draw();
    }

    draw() {
        // console.log(this.data);
        this._updateWidthHeight();
        this.svg = d3.select(this.div + "triangle");

        this.svgSave.updatePos([this.width, 10])
        this.svgSave.draw();

        //entailment
        //neutral, Contradiction, Entailment
        //112,0 0,194 224,194

        this.svg.select(this.div + "label").remove();
        var label = this.svg.append("g").attr("id", this.uuid + "label");
        label.append('text')
            // .attr("class", "trilabel")
            .attr("x", 112 - 20)
            .attr("y", -7)
            .text("Neutral")
            .style("font-size", "14px")
            .style("fill", "grey");

        //neutral
        label.append('text')
            // .attr("class", "trilabel")
            .attr("x", 0 - 10)
            .attr("y", 194 + 17)
            .text("Contradiction")
            .style("font-size", "14px")
            .style("fill", "grey");

        //contradiction
        label.append('text')
            // .attr("class", "trilabel")
            .attr("x", 224 - 55)
            .attr("y", 194 + 17)
            .text("Entailment")
            .style("font-size", "14px")
            .style("fill", "grey");
        // updateData(sdata, 0);

        this.svg.attr("width", this.pwidth)
            .attr("height", this.pheight)
            .attr("x", 0)
            .attr("y", 0);

        // this.updateSelection();
        // var p1 = [0.5, 0.25, 0.25];
        // var p2 = [0.25, 0.25, 0.55];
        // this.drawPredictPath([p1, p2]);
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        switch (msg["name"]) {
            case "prediction":
                this.onUpdatePrediction();
                break;
            case "allPairsPrediction":
                this.onUpdateAllPairPrediction();
                break;
        }
    }

    resize() {
        // console.log("prediction-resize\n");
        this.draw();
    }

    pred2Pos(d) {
        let x = d[1] * 112 + d[2] * 0 + d[0] * 224;
        let y = d[1] * 0 + d[2] * 194 + d[0] * 194;
        return [x, y];
    }

    onUpdatePrediction() {
        //clone prediction
        var prediction = this.data['prediction'][0].slice(0);
        //add sentence index
        prediction.concat([0, 0]);
        //reverse prediction
        // prediction = prediction.reverse();
        // console.log(prediction);
        this.drawDensityOverlay([])
        this.updatePredictDisplay([prediction]);
    }

    onUpdateAllPairPrediction() {
        var data = [];
        var allPairsPrediction = this.data["allPairsPrediction"].slice(0);
        // allPairsPrediction = allPairsPrediction.reverse();
        // console.log(allPairsPrediction);

        //the euclidean coordinate data
        var dataXY = [];
        for (var i = 0; i < allPairsPrediction.length; i++)
            for (var j = 0; j < allPairsPrediction[i].length; j++) {
                // if (i >= j) {
                data.push(allPairsPrediction[i][j].concat([i, j]));
                let d = allPairsPrediction[i][j];
                let x = d[1] * 112 + d[2] * 0 + d[0] * 224;
                let y = d[1] * 0 + d[2] * 194 + d[0] * 194;
                dataXY.push([x, y]);
                // }
            }

        // console.log(data);
        this.updatePredictDisplay(data);
        this.drawDensityOverlay(dataXY)
    }

    updatePredictDisplay(data) {
        var pLen = data.length;
        data = data.reverse();
        // console.log(this.data);
        // neutral, Contradiction, Entailment
        // Entailment, neutral, contradiction
        // (112,0) (0,194) (224,194)
        if (data !== undefined) {
            // console.log(data);
            this.svg.selectAll("circle").remove();
            this.svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("id", (d, i) => {
                    return "circle" + i;
                })
                .attr("cx", d => {
                    return d[1] * 112 + d[2] *
                        0 +
                        d[0] * 224;
                })
                .attr("cy", d => {
                    return d[1] * 0 + d[2] *
                        194 +
                        d[0] * 194;
                })
                .attr("r", (d, i) => {
                    if (i === pLen - 1) return 6;
                    else return 3;
                })
                .style("fill", (d, i) => {
                    if (i === pLen - 1) {
                        if (pLen === 1)
                            return 'grey';
                        else
                            return 'red';
                    } else {
                        return 'grey';
                    }
                })
                // .style("stroke", 'black')
                .style("opacity", 0.5)
                //   .style("opacity", (d,i)=>{if (i==0) return "1.0"; else return "0.5";})
                .on("click", (d, i) => {
                    if (this.data["allSourceSens"] !== undefined) {
                        var source = this.data["allSourceSens"][d[3]];
                        var target = this.data["allTargetSens"][d[4]];
                        this.setData("currentPair", [
                            source,
                            target
                        ]);
                        this.callFunc("updateAttention");
                    }
                });
        }
    }

    //triangle range: 224, 194
    drawDensityOverlay(dataPoints) {
        this.svg.select(this.div + "overlay").remove();
        if (dataPoints.length > 1) {
            this.svg.append("g")
                .attr("id", this.uuid + "overlay")
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 0.8)
                .attr("stroke-linejoin", "round")
                .selectAll("path")
                .data(d3.contourDensity()
                    .x(function(d) {
                        return d[0];
                    })
                    .y(function(d) {
                        return d[1];
                    })
                    .size([224, 194])
                    .bandwidth(4)
                    .thresholds(12)
                    (dataPoints))
                .enter().append("path")
                .attr("clip-path", "url(#triClip)")
                .attr("opacity", 0.6)
                .attr("d", d3.geoPath());
        }
    }

    //drawing a series of predictions
    //the old prediction circle with dotted line
    //the new prediction is solid

    drawPredictPath(path) {
        var line = [this.pred2Pos(path[0]), this.pred2Pos(path[1])];
        console.log(line);

        //draw arrow
        var d3line = d3.line()
            .x(function(d) {
                return d[0];
            })
            .y(function(d) {
                return d[1];
            });

        this.svg.append("circle")
            .attr("cx", line[0][0])
            .attr("cy", line[0][1])
            .attr("r", 5)
            .style("stroke-dasharray", ("2, 2"))
            .style('stroke', 'grey')
            .style("fill", "none");

        this.svg.append("rect")
            .attr("x", line[1][0] - 5)
            .attr("y", line[1][1] - 5)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "grey");

        this.svg.append('path')
            .attr('fill', '#999')
            .style("stroke-dasharray", ("2, 2"))
            .style('stroke', 'black')
            .attr("marker-end", "url(#arrowhead)")
            .attr("d", d => d3line(line))
            .attr();

        // this.svg.append("defs").append("marker")
        //     .attr("id", "triangle")
        //     .attr("refX", 6)
        //     .attr("refY", 6)
        //     .attr("markerWidth", 30)
        //     .attr("markerHeight", 30)
        //     .attr("orient", "auto")
        //     .append("path")
        //     .attr("d", d => d3line(line))
        //     .style("fill", "black");



    }
}
