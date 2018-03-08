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
        console.log("draw pipeline item");
        if (this.svg.select("rect").empty()) {
            this.svg.append("rect")
                .attr("x", this.pos[0] - this.size[0] * 0.5)
                .attr("y", this.pos[1] - this.size[1] * 0.5)
                .attr("width", this.size[0])
                .attr("height", this.size[1])
                .attr("fill", "lightblue")
                .attr("stroke", "blue");
            this.svg.append("text")
                .attr("x", this.pos[0])
                .attr("y", this.pos[1])
                .text(this.label)
                .style("text-anchor", "middle");
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
            this.pos[0] + this.size[0],
            this.pos[1] + this.size[1] / 2.0
        ]
    }

    getInputPortPos() {
        return [
            this.pos[0],
            this.pos[1] + this.size[1] / 2.0
        ]
    }
}
