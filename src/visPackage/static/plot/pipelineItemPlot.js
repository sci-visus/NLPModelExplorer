class pipelineItemPlot {
    constructor(svg, pos, size, label, state = "enable") {
        this.svg = svg.append("g");
        this.pos = pos;
        this.size = size;
        this.label = label;
    }

    setState(state) {
        this.state = state;
        this.draw();
    }

    draw() {
        // console.log("draw pipeline item");
        if (this.svg.select("rect").empty()) {
            this.svg.append("rect")
                .attr("x", this.pos[0] - this.size[0] * 0.5)
                .attr("y", this.pos[1] - this.size[1] * 0.5)
                .attr("width", this.size[0])
                .attr("height", this.size[1])
                .attr("fill", "lightblue")
                .attr("stroke", "lightgrey")
                .on("click", function() {
                    // console.log(d3.select(this).attr("fill"));
                    if (d3.select(this).attr("fill") ===
                        "lightblue")
                        d3.select(this).attr("fill",
                            "url(#stripe)");
                    else
                        d3.select(this).attr("fill",
                            "lightblue");
                });

            let hiddenLayerBoxPos = [this.pos[0] - this.size[0] * 0.5,
                this.pos[1] + this.size[1] * 0.5
            ];
            let hiddenLayerBoxSize = [this.size[0],
                this.size[1] * 2
            ];

            this.svg.append("rect")
                .attr("x", hiddenLayerBoxPos[0])
                .attr("y", hiddenLayerBoxPos[1])
                .attr("width", hiddenLayerBoxSize[0])
                .attr("height", hiddenLayerBoxSize[1])
                .attr("fill", "white")
                .attr("stroke", "lightgrey");

            this.svg.append("text")
                .attr("x", this.pos[0])
                .attr("y", this.pos[1] + 5)
                .text(this.label)
                .style("text-anchor", "middle")
                .style("pointer-events", "none");

            this.svg.append("text")
                .attr("x", this.pos[0])
                .attr("y", this.pos[1] + 2.30 * this.size[1])
                .text("layer")
                .style("text-anchor", "middle")
                .style("pointer-events", "none");

            //create histogram to disable distribution of value update
            let hist = new histoPlot(this.svg, [
                hiddenLayerBoxPos[0] + 2.5,
                hiddenLayerBoxPos[1] + 2.5
            ], [
                hiddenLayerBoxSize[0] - 5,
                hiddenLayerBoxSize[1] - 30
            ]);

        } else {
            this.svg.select("rect")
                .attr("x", this.pos[0] - this.size[0] * 0.5)
                .attr("y", this.pos[1] - this.size[1] * 0.5)
                .attr("width", this.size[0])
                .attr("height", this.size[1]);
        }
    }

    getOutputPortPos() {
        return [
            this.pos[0] + this.size[0] * 0.5,
            this.pos[1] + this.size[1] * 1.5
        ]
    }

    getInputPortPos() {
        return [
            this.pos[0] - this.size[0] * 0.5,
            this.pos[1]
        ]
    }
}
