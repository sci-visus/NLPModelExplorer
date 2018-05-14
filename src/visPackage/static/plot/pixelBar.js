class pixelBar {
    constructor(svg, pos, size) {
        this.svg = svg.append("g");
        this.pos = pos;
        this.size = size;

    }

    setData(values) {
        this.data = values;

    }

    setColorMap(map) {
        this.colormap = map;
    }

    //emphasis the higher values
    setEmphasisRatio() {

    }

    draw() {

    }
}
