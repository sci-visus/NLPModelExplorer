class pixelBar {
    constructor(svg, pos, size, att, words, ratio, colormap) {
        this.svg = svg.append("g");
        this.pos = pos;
        this.size = size;
        this.colormap = colormap;
        this.attData = att;
        this.words = words;
        //default colormap
    }

    setAttData(values) {
        this.attData = values;
    }

    setColorMap(map) {
        this.colormap = map;
    }

    //emphasis the higher values
    setEmphasisRatio(ratio) {
        this.ratio = ratio;
        this.draw();
    }

    draw() {
        this.svg.append("rect")
            .attr("class", "senBlock")
            .attr("x", this.pos[0])
            .attr("y", this.pos[1])
            .attr("width", this.size[0])
            .attr("height", this.size[1])
            .attr("fill", "white")
            .attr("stroke", "grey")
            .attr("stroke-width", 2)
            .on("mouseover", function(d) {
                // d3.selectAll(".senBlock").attr("stroke", "grey");
                // d3.select(this).attr("stroke", "lightblue");
                d3.select(this).attr("stroke-width", 8);
            })
            .on("mouseout", function(d) {
                // d3.selectAll(".senBlock").attr("stroke", "grey");
                d3.selectAll(".senBlock").attr("stroke-width", 2);
            });

        //ratio adjust

        if (this.attData) {
            // console.log(this.attData);
            //readjust bar size
            this.cellData = [];
            let unit = this.size[0] / this.attData.length;
            let unitSum = 0;
            for (var i = 0; i < this.attData.length; i++) {
                this.cellData.push([this.pos[0] + i * unit, unit]);
            }

            for (var i = 0; i < this.cellData.length; i++) {
                this.svg.append("rect")
                    .attr("x", this.cellData[i][0])
                    .attr("y", this.pos[1])
                    .attr("width", this.cellData[i][1])
                    .attr("height", this.size[1])
                    .attr("fill", this.colormap(this.attData[i]))
                    .attr("pointer-events", "none");
            }
        }
    }

    showSentence() {

    }
}
