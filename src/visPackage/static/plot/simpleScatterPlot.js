class simpleScatterplot {
    constructor(svg, pos, size, axisX = true, axisY = true) {
        this.svg = svg.append("g");
        this.pos = pos;
        this.size = size;
        this.axisXflag = axisX;
        this.axisYflag = axisY
    }

    draw() {

    }

    update(pos, size) {
        this.pos = pos;
        this.size = size;
        this.draw();
    }

    setData(data, names, domain, range) {

    }

}
