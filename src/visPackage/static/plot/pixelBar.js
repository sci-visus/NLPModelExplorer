class pixelBar {
    constructor(svg, pos, size, colormap) {
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
        if (this.bars) {
            //readjust bar size
            for (var i = 0; i < this.data.length; i++) {

            }
        }
    }
}
