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
                this.question = msg["data"]["data"]["sentences"][1];
                this.question = this.question.trim().split(/\s+/);
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
            let minIndex = 0

            ///FIXME duplicated code from attentionGraphComponent
            ////////// getting attention normalized //////
            let attMatrix = this.normAttention;
            var srcAtt = attMatrix.map(d => d.reduce((a, b) => a +
                b));
            let srcAttMax = Math.max(...srcAtt);
            let srcAttMin = Math.min(...srcAtt);
            this.srcAtt = srcAtt.map(d =>
                (d - srcAttMin) / (srcAttMax - srcAttMin));

            var targAtt = attMatrix[0].map((d, i) => {
                // console.log(d, i);
                var sum = 0;
                for (var j = 0; j < attMatrix.length; j++)
                    sum += attMatrix[j][i];
                return sum;
            });
            let targAttMax = Math.max(...targAtt);
            targAtt = targAtt.map(d => d / targAttMax);

            let unit = this.width * 0.85 / paragraphLen;
            for (var i = 0; i < this.segmentList.length; i++) {
                let senLen = this.segmentList[i].length;
                let size = senLen * unit;
                let maxIndex = minIndex + senLen;
                // console.log(minIndex, maxIndex);
                let atts = this.srcAtt.slice(minIndex, maxIndex +
                    1);
                let words = this.segmentList[i].slice(minIndex, maxIndex +
                    1);
                minIndex = maxIndex;
                let pixel = new pixelBar(this.svg, [pos, 15], [size, 20],
                    atts, words, this.ratio, this.colormap);

                pos += (size + 20);

                pixel.draw();
                this.pixelBars.push(pixel);
                // this.segmentList.push();
            }


            ////////////// draw question //////////////

            let targ = this.question;

            this.targPos = targ.map((d, i) => {
                return {
                    'x': this.width / (targ.length + 1) * (i + 1),
                    'y': this.height / 3 * 2.5
                };
            });

            var targWidth = this.width / (this.targWords.length + 1);
            this.rectHeight = this.height / 3.0 * 0.5;

            this.svg.selectAll(".attentionGraphComponentTargRect")
                .data(targ)
                .enter()
                .append("rect")
                .attr('class', 'attentionGraphComponentTargRect')
                .attr("x", (d, i) => this.targPos[i].x - targWidth / 2.0)
                .attr("y", (d, i) => this.targPos[i].y - this.rectHeight)
                .attr("width", targWidth)
                .attr("height", this.rectHeight)
                .attr("class", "targRect")
                .style("fill", (d, i) => this.colormap(targAtt[i]))
                // .style("opacity", (d, i) => targAtt[i])
                .on('mouseover', (d, i, nodes) => {
                    // this.highlight_and_linkAlignSrc('highlight', i,
                    //     nodes);
                })
                .on('mouseout', (d, i, nodes) => {
                    // this.highlight_and_linkAlignSrc('clean', i, nodes);
                })
                .on("click", (d, i) => {
                    this.draw();
                });

            this.targWordsText = this.svg.selectAll(
                    ".attentionGraphComponentTargText")
                .data(this.targWords)
                .enter()
                .append("text")
                .attr('class', 'attentionGraphComponentTargText')
                .text(d => d)
                .attr("x", (d, i) => this.targPos[i].x)
                .attr("y", (d, i) => this.targPos[i].y - this.rectHeight *
                    0.5)
                // .style("font-size", this.checkFontSize.bind(this))
                // .style("writing-mode", this.checkTargOrientation.bind(this))
                .style("alignment-baseline", "middle")
                .style("text-anchor", "middle")
                .style('pointer-events', 'none');
        }
    }
}
