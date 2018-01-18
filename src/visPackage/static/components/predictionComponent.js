/*

the triangle vis of the prediction result

*/

class predictionComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["allSourcePairs", "allTargetPairs",
            "prediction", "allPairsPrediction"
        ]);

        this.margin = {
            top: 25,
            right: 25,
            bottom: 25,
            left: 25
        };

        this.draw();
    }

    draw() {
        // console.log(this.data);
        this._updateWidthHeight();
        this.svg = d3.select(this.div + "triangle");

        //entailment
        //neutral, Contradiction, Entailment
        //112,0 0,194 224,194
        // const trilabel = svg.append("g");

        var label = this.svg.append("g");
        label.append('text')
            // .attr("class", "trilabel")
            .attr("x", 112 - 20)
            .attr("y", -2)
            .text("Neutral")
            .style("font-size", "14px")
            .style("fill", "grey");

        //neutral
        label.append('text')
            // .attr("class", "trilabel")
            .attr("x", 0 - 10)
            .attr("y", 194 + 12)
            .text("Contradiction")
            .style("font-size", "14px")
            .style("fill", "grey");

        //contradiction
        label.append('text')
            // .attr("class", "trilabel")
            .attr("x", 224 - 55)
            .attr("y", 194 + 12)
            .text("Entailment")
            .style("font-size", "14px")
            .style("fill", "grey");
        // updateData(sdata, 0);

        this.svg.attr("width", this.pwidth)
            .attr("height", this.pheight)
            .attr("x", 0)
            .attr("y", 0);

        this.updateSelection();
    }

    resize() {
        // console.log("prediction-resize\n");
        this.draw();
    }

    updateSelection() {
        if (this.data['prediction'] !== undefined || this.data[
                "allPairsPrediction"] !== undefined) {
            // console.log(this.data);
            var data = [];
            if (this.data["allPairsPrediction"] !== undefined) {
                var allPairsPrediction = this.data["allPairsPrediction"];
                console.log(allPairsPrediction);
                for (var i = 0; i < allPairsPrediction.length; i++)
                    for (var j = 0; j < allPairsPrediction[i].length; j++) {
                        if (i >= j) {
                            data.push(allPairsPrediction[i][j].concat([i, j]));
                        }
                    }
            } else {
                data.push(this.data['prediction']);
            }
            // var index = this.data['predictionsHighlight']

            //neutral, Contradiction, Entailment
            //(112,0) (0,194) (224,194)
            if (data !== undefined) {
                console.log(data);
                this.svg.selectAll("circle").remove();
                this.svg.selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("id", (d, i) => {
                        return "circle" + i;
                    })
                    .attr("cx", d => {
                        return d[0] * 112 + d[1] *
                            0 +
                            d[2] * 224;
                    })
                    .attr("cy", d => {
                        return d[0] * 0 + d[1] *
                            194 +
                            d[2] * 194;
                    })
                    .attr("r", (d, i) => {
                        if (i == 0) return 6;
                        else return 3;
                    })
                    .style("fill", (d, i) => {
                        if (i == 0) return 'grey';
                        else return 'white';
                    })
                    .style("stroke", 'black')
                    .style("opacity", 0.7)
                    //   .style("opacity", (d,i)=>{if (i==0) return "1.0"; else return "0.5";})
                    .on("mouseover", (d, i) => {
                        var source = this.data["allSourcePairs"][d[3]];
                        var target = this.data["allTargetPairs"][d[4]];
                        this.setData("currentPair", [
                            source,
                            target
                        ]);
                    });
            }
        }
    }
}
