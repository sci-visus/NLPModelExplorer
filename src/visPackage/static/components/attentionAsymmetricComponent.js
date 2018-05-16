class attentionAsymmetricComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);

        //create default colormap
        this.colormap = generateColormap([0.0, 1.0], ["#253494", "#2c7fb8",
            "#41b6c4", "#a1dab4",
            "#ffffcc"
        ]);

        this.pixelBars = [];
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        switch (msg["name"]) {
            case "attention":
                break;
            case "source":
                break;
        }
    }

    // initSvg() {
    //
    // }

    draw() {
        //organize the pixelBar
        //for each text segment
        for (var i = 0; i < this.segmentList.length; i++) {
            let pixel = new pixelBar(this.svg);
            this.pixelBars.append(pixel);
            // this.segmentList.push();
        }
    }
}
