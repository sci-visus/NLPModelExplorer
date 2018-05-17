class pixelBar {
    constructor(svg, pos, size, ratio, colormap) {
        this.svg = svg.append("g");
        this.pos = pos;
        this.size = size;
        this.colormap = colormap;
        //default colormap
    }

    setData(values) {
        this.data = values;
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
            .attr("x", this.pos[0])
            .attr("y", this.pos[1])
            .attr("width", this.size[0])
            .attr("height", this.size[1])
            .attr("fill", "none")
            .attr("stroke", "grey");

        if (this.bars) {
            //readjust bar size
            for (var i = 0; i < this.data.length; i++) {

            }
        }
    }
}
