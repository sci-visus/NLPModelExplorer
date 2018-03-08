class pipelineComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
    }

    draw() {
        this._updateWidthHeight();
        this.itemSize = [];
        var item = new pipelineItemPlot();
        this.itemSize.push(item);


    }

    drawArraw(pos1, pos2) {

    }


}
