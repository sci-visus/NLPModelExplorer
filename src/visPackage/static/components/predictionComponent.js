/*

the triangle vis of the prediction result

*/

class predictionComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);

        //dict for prediction (groundTruth, p[3])
        //subscribe to data
        this.subscribeDatabyNames(["allSourceSens", "allTargetSens",
            "prediction", "allPairsPrediction",
            "predictionUpdate", "currentPair", "pipeline"
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
        this.Neutral = label.append('text')
            // .attr("class", "trilabel")
            .attr("x", 112 - 20)
            .attr("y", -7)
            .text("Neutral")
            .style("font-size", "14px")
            .style("fill", "grey");

        //neutral
        this.Contradiction = label.append('text')
            // .attr("class", "trilabel")
            .attr("x", 0 - 10)
            .attr("y", 194 + 17)
            .text("Contradiction")
            .style("font-size", "14px")
            .style("fill", "grey");

        //contradiction
        this.Entailment = label.append('text')
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
        //entail, netrual, contradict
        // var p1 = [1.0, 0.0, 0.0];
        // var p2 = [0.0, 0.0, 1.0];
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
            case "currentPair":
                this.clear();
                // console.log(this.data['currentPair']);
                this.onUpdateGroundTruth(this.data['currentPair']["label"]);
                break;
            case "predictionUpdate":
                let pred = this.data["predictionUpdate"];
                this.onUpdateOptimizedPrediction(pred);
                break;
        }
    }

    clear() {
        if (this.svg) {
            this.onUpdateGroundTruth("");
            this.svg.select(this.div + "overlay").remove();
            this.svg.selectAll("circle").remove();
            this.svg.selectAll(".dotPredPath").remove();
            this.svg.selectAll(".predPath").remove();
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

    //trigger request to reassign prediction
    onPredictionReassign(label) {

        let pipeline = this.data["pipeline"];
        console.log(pipeline);
        //call python side
        this.callFunc("predictUpdate", {
            "newLabel": label,
            "iteration": 3,
            "encoderFlag": pipeline[0]["state"],
            "attFlag": pipeline[1]["state"],
            "classFlag": pipeline[2]["state"]
        })
    }

    //trigger when python return optimized
    onUpdateOptimizedPrediction(predictionUpdate) {
        console.log(predictionUpdate, this.selectPred);
        this.drawPredictPath([this.selectPred, predictionUpdate], "solid");
    }

    onUpdateGroundTruth(label) {
        console.log(label);
        if (label === "neutral") {
            this.Neutral.style("fill", "mediumseagreen");
            this.Contradiction.style("fill", "grey");
            this.Entailment.style("fill", "grey");

            this.Neutral.style("font-weight", "bold");
            this.Contradiction.style("font-weight", "normal");
            this.Entailment.style("font-weight", "normal");
        } else if (label === "contradiction") {
            this.Neutral.style("fill", "grey");
            this.Contradiction.style("fill", "mediumseagreen");
            this.Entailment.style("fill", "grey");

            this.Neutral.style("font-weight", "normal");
            this.Contradiction.style("font-weight", "bold");
            this.Entailment.style("font-weight", "normal");
        } else if (label === "entailment") {
            this.Neutral.style("fill", "grey");
            this.Contradiction.style("fill", "grey");
            this.Entailment.style("fill", "mediumseagreen");

            this.Neutral.style("font-weight", "normal");
            this.Contradiction.style("font-weight", "normal");
            this.Entailment.style("font-weight", "bold");
        } else {
            this.Neutral.style("fill", "grey");
            this.Contradiction.style("fill", "grey");
            this.Entailment.style("fill", "grey");

            this.Neutral.style("font-weight", "normal");
            this.Contradiction.style("font-weight", "normal");
            this.Entailment.style("font-weight", "normal");
        }
    }

    onUpdatePrediction() {
        //cleanup
        this.drawPredictPath();
        this.drawDensityOverlay([]);

        //clone prediction
        var prediction = this.data['prediction'][0].slice(0);
        //add sentence index
        prediction.concat([0, 0]);
        //reverse prediction
        // prediction = prediction.reverse();
        // console.log(prediction);
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
                if (i === 0 || j === 0) {
                    data.push(allPairsPrediction[i][j].concat([i, j]));
                    let d = allPairsPrediction[i][j];
                    let x = d[1] * 112 + d[2] * 0 + d[0] * 224;
                    let y = d[1] * 0 + d[2] * 194 + d[0] * 194;
                    dataXY.push([x, y]);
                }
            }

        // console.log(data);
        this.drawDensityOverlay(dataXY)
        this.updatePredictDisplay(data);
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
            this.svg.selectAll(".predCircle").remove();
            this.svg.selectAll(".predCircle")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "predCircle")
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
                    return "#3F3F3F";
                    // if (i === pLen - 1) {
                    //     if (pLen === 1)
                    //         return '#3F3F3F';
                    //     else
                    //         return 'grey';
                    // } else {
                    //     return '#3F3F3F';
                    // }
                })
                .style("stroke", "white")
                // .style("stroke", 'black')
                .style("opacity", 0.8)
                .on("mouseover", function(d) {

                })
                .on("mouseout", function(d) {

                })
                //   .style("opacity", (d,i)=>{if (i==0) return "1.0"; else return "0.5";})
                .on("click", (d, i) => {
                    if (this.data["allSourceSens"] !== undefined) {
                        var source, target;
                        if (this.data["allSourceSens"])
                            source = this.data["allSourceSens"][d[3]];
                        else
                            source = this.data["originalPair"][0];

                        if (this.data["allTargetSens"])
                            target = this.data["allTargetSens"][d[4]];
                        else
                            target = this.data["originalPair"][1];
                        this.data["currentPair"]["sentences"] = [
                            source,
                            target
                        ];
                        //update the pair
                        console.log("update pair/att");
                        this.setData("currentPair", this.data[
                            "currentPair"]);

                        //then update the current attention
                        this.callFunc("updateAttention");
                    }
                })
                .call(d3.drag()
                    .on("start", this.dragstarted.bind(this))
                    .on("drag", this.dragged.bind(this))
                    .on("end", this.dragended.bind(this)));
        }
    }


    //triangle range: 224, 194
    drawDensityOverlay(dataPoints) {
        this.svg.select(this.div + "overlay").remove();
        if (dataPoints.length > 1) {
            this.svg.append("g")
                .attr("id", this.uuid + "overlay")
                .attr("fill", "none")
                .attr("stroke", "grey")
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
                .attr("opacity", 0.5)
                .attr("d", d3.geoPath());
        }
    }

    /////////////// drag ////////////////

    dragstarted(d) {
        // console.log("dragStarted:", d);
    }

    dragged(d) {
        var pos = this.pred2Pos(d);

        if (this.svg.select("#reassignPredict").empty()) {
            // console.log("dragged:", d);
            // var pos = [0, 0];
            var w = 20;
            var h = 15;

            var g = this.svg.append("g").attr("id", "reassignPredict");

            var entailRect = g.append("g");

            var neutralRect = g.append("g");
            var contractRect = g.append("g");
            var that = this;

            this.selectPred = d;

            ///////// N ///////////
            neutralRect.append("rect")
                .attr("x", pos[0] - w / 2)
                .attr("y", pos[1] - 20 - h / 2)
                .attr("width", w)
                .attr("height", h)
                .attr("fill", "lightgrey")
                .attr("stroke", "black")
                .on("mouseover", function(d) {
                    d3.select(this).attr("fill", "grey");
                    that.reassignedPred = [0, 1, 0];
                    that.drawCurrentAssignedPred();
                })
                .on("mouseout", function(d) {
                    d3.select(this).attr("fill", "lightgrey");
                    that.reassignedPred = undefined;
                    that.drawCurrentAssignedPred();
                })
            neutralRect.append("text")
                .attr("x", pos[0])
                .attr("y", pos[1] - 20)
                .attr("dy", ".35em")
                .attr("font-size", 10)
                .text("N")
                .style("text-anchor", "middle")
                .style("pointer-events", "none");

            ///////// E ///////////
            entailRect.append("rect")
                .attr("x", pos[0] + 20 - w / 2)
                .attr("y", pos[1] + 15 - h / 2)
                .attr("width", w)
                .attr("height", h)
                .attr("fill", "lightgrey")
                .attr("stroke", "black")
                .on("mouseover", function(d, i) {
                    d3.select(this).attr("fill", "grey");
                    that.reassignedPred = [1, 0, 0];
                    that.drawCurrentAssignedPred();
                })
                .on("mouseout", function(d) {
                    d3.select(this).attr("fill", "lightgrey");
                    that.reassignedPred = undefined;
                    that.drawCurrentAssignedPred();
                })

            entailRect.append("text")
                .attr("x", pos[0] + 20)
                .attr("y", pos[1] + 15)
                .attr("dy", ".35em")
                .attr("font-size", 10)
                .text("E")
                .style("text-anchor", "middle")
                .style("pointer-events", "none");

            ///////// C ///////////
            contractRect.append("rect")
                .attr("x", pos[0] - 20 - w / 2)
                .attr("y", pos[1] + 15 - h / 2)
                .attr("width", w)
                .attr("height", h)
                .attr("fill", "lightgrey")
                .attr("stroke", "black")
                .on("mouseover", function(d) {
                    d3.select(this).attr("fill", "grey");
                    that.reassignedPred = [0, 0, 1];
                    that.drawCurrentAssignedPred();
                })
                .on("mouseout", function(d) {
                    d3.select(this).attr("fill", "lightgrey");
                    that.reassignedPred = undefined;
                    that.drawCurrentAssignedPred();
                })

            contractRect.append("text")
                .attr("x", pos[0] - 20)
                .attr("y", pos[1] + 15)
                .attr("dy", ".35em")
                .attr("font-size", 10)
                .text("C")
                .style("text-anchor", "middle")
                .style("pointer-events", "none");
        } else {
            //draw line from the center
            // var currentPos = [d3.event.x, d3.event.y];
            // this.svg.selectAll(".dragline").remove();
            // this.svg
            //     .append("line")
            //     .attr("class", "dragline")
            //     .attr("x1", pos[0])
            //     .attr("y1", pos[1])
            //     .attr("x2", currentPos[0])
            //     .attr("y2", currentPos[1])
            //     .attr("stroke", "grey");
            // console.log("dragged:", currentPos);
        }
    }

    dragended(d) {
        // console.log("dragended", this.reassignedPred);
        //check the location
        this.svg.select("#reassignPredict").remove();
        //trigger optimizaton on the python side
        if (this.reassignedPred) {
            var i = this.reassignedPred.indexOf(Math.max(...this.reassignedPred));
            this.onPredictionReassign(i);
        }
    }


    drawCurrentAssignedPred() {
        if (this.reassignedPred) {
            this.drawPredictPath([
                this.selectPred,
                this.reassignedPred
            ], "dotted");

        } else {
            this.drawPredictPath();
        }
    }

    //drawing a series of predictions
    //the old prediction circle with dotted line
    //the new prediction is solid
    drawPredictPath(path, type = "dotted") {
        if (path === undefined) {
            this.svg.selectAll(".dotPredPath").remove();
            this.svg.selectAll(".predPath").remove();
        } else {
            var line = [this.pred2Pos(path[0]), this.pred2Pos(path[1])];
            // console.log(line);

            //draw arrow
            var d3line = d3.line()
                .x(function(d) {
                    return d[0];
                })
                .y(function(d) {
                    return d[1];
                });

            if (type === "dotted") {
                this.svg.selectAll(".dotPredPath").remove();

                this.svg.append("circle")
                    .attr("class", "dotPredPath")
                    .attr("cx", line[1][0])
                    .attr("cy", line[1][1])
                    .attr("r", 6)
                    .style("stroke-dasharray", ("2, 2"))
                    .style('stroke', 'grey')
                    .style("fill", "none");

                this.svg.append('path')
                    .attr("class", "dotPredPath")
                    .attr('fill', '#999')
                    .style("stroke-dasharray", ("2, 2"))
                    .style('stroke', 'grey')
                    .attr("marker-end", "url(#arrowhead)")
                    .attr("d", d => d3line(line));
            } else if (type === "solid") {
                // console.log("draw path line");
                this.svg.selectAll(".predCircle").remove();
                this.svg.selectAll(".predPath").remove();

                this.svg.append("circle")
                    .attr("class", "predPath")
                    .attr("cx", line[0][0])
                    .attr("cy", line[0][1])
                    .attr("r", 6)
                    // .style("stroke-dasharray", ("2, 2"))
                    .style('stroke', 'grey')
                    .style("fill", "none");

                // this.svg.append("circle")
                //     .attr("class", "predPath")
                //     .attr("cx", line[1][0])
                //     .attr("cy", line[1][1])
                //     .attr("r", 6)
                //     // .style("stroke-dasharray", ("2, 2"))
                //     .style('stroke', 'white')
                //     .attr("fill", "grey");

                this.svg.append('path')
                    .attr("class", "predPath")
                    .attr('fill', '#999')
                    .style('stroke', 'grey')
                    .attr("marker-end", "url(#arrowhead)")
                    .attr("d", d => d3line(line));

                //update prediction
                var prediction = path[1];
                //add sentence index
                prediction.concat([0, 0]);
                this.updatePredictDisplay([prediction]);
            }
        }
    }
}
