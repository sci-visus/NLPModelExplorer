/*

add dependencyTreePlot to an existing svg
*/

class dependencyTreePlot {
    constructor(svg, orientation, pos) {
        this.svg = svg;
        this.orientation = orientation;

    }

    setCollapseHandle(func) {
        this.callback = func;

    }

    onHandleCollapse() {
        this.callback(this.sentenceMask); //[1,0,0,1]

    }


    draw() {

    }
}
