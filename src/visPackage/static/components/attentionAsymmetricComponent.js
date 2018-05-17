class attentionAsymmetricComponent extends attentionComponent {
    constructor(uuid) {
        super(uuid);
        // this.subscribeDatabyNames(["attention", "currentPair"]);

        //create default colormap
        this.colormap = generateColormap([0.0, 1.0], ["#253494", "#2c7fb8",
            "#41b6c4", "#a1dab4",
            "#ffffcc"
        ]);

        this.ratio = 0.5; //between 0 - 1, 1 uniform, 0 only show highest value
        this.pixelBars = [];
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        switch (msg["name"]) {
            case "attention":
                console.log(msg["data"]);
                break;
            case "currentPair":
                // console.log(msg["data"]);
                this.parseParagraph(msg["data"]["data"]["sentences"][0]);
                break;
        }
    }

    parseParagraph(paragraph) {
        this.segmentList = paragraph.trim().match(
            /([^\.!\?]+[\.!\?]+)|([^\.!\?]+$)/g);
        this.segmentList = this.segmentList.map(d => d.trim().split(/\s+/));
        // console.log(this.segmentList)
    }

    draw() {
        this._updateWidthHeight();

        if (this.rawAttention !== undefined) {
            // init svg
            this.initSvg();

            let paragraphLen = this.rawAttention.length;

            console.log("paragraphLen:", paragraphLen);
            //organize the pixelBar
            //for each text segment
            let pos = 5;
            let unit = this.width * 0.9 / paragraphLen;
            for (var i = 0; i < this.segmentList.length; i++) {
                let size = this.segmentList[i].length * unit;

                let pixel = new pixelBar(this.svg, [pos, 15], [size, 20],
                    this.ratio,
                    this.colormap);

                pos += (size + 3);

                pixel.draw();
                this.pixelBars.push(pixel);
                // this.segmentList.push();
            }
        }

        //draw
    }
}
