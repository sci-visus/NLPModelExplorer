class sliderPlot {
    constructor(svg, pos, size) {
        this.svg = svg.append("g");
        this.pos = pos;
        this.size = size;
    }

    draw() {

        //draw background quad
        this.svg.append("rect");

        //draw for ground quad
        this.svg.append("rect");

        this.svg.append('text');

    }

}
