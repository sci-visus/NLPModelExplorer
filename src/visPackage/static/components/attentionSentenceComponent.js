/*

Matrix representation of attention


*/

class attentionSentenceComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["attention", "currentPair"]);

        this.margin = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        };


        this.draw();
    }

    draw() {
        this._updateWidthHeight();

        if (this.data["attention"] !== undefined) {
            //draw your stuff here
            //the dimension of the panel is this.width, this.height
            //the attention is store at this.data["attention"]
            console.log("attention:", this.data["attention"]);
            console.log("currentPair:", this.data["currentPair"]);

            var pair = this.data["currentPair"];
            //draw attention
            var attMatrix = this.data["attention"];
            // console.log(attMatrix);

            var srcAtt = attMatrix.map(d => d.reduce((a, b) => a + b));
            var targAtt = attMatrix[0].map((d, i) => {
                // console.log(d, i);
                var sum = 0;
                for (var j = 0; j < attMatrix.length; j++)
                    sum += attMatrix[j][i];
                return sum;
            });

            var attList = [];
            for (var i = 0; i < attMatrix.length; i++)
                for (var j = 0; j < attMatrix[i].length; j++) {
                    attList.push([i, j, attMatrix[i][j]]);
                }

            // console.log(srcAtt, targAtt);
            //parse the sentence
            this.callFunc("parseSentence", {
                "sentence": pair[0]
            });
            this.callFunc("parseSentence", {
                "sentence": pair[1]
            });

            //sentence position
            this.computeWordPosition(pair[0].match(/\S+/g),
                pair[1].match(/\S+/g));
            this.srcWords = pair[0].match(/\S+/g).push("\<s\>");
            this.targWords = pair[1].match(/\S+/g).push("\<s\>");
            console.log(this.srcWords, this.targWords);

            //sentence mask

            //word location
            var d3line = d3.svg.line()
                .x(function(d) {
                    return d[0];
                })
                .y(function(d) {
                    return d[1];
                })
                .interpolate("linear");

            this.svg = d3.select(this.div).append("svg")
                .attr("width", this.width)
                .attr("height", this.height);

            this.srcDepTree = new dependencyTreePlot(this.svg);
            this.srcDepTree.setCollapseHandle(this.redraw.bind(
                this));

            this.svg.selectAll(".attConnect")
                .data(attList)
                .enter()
                .append("path")
                .attr("d", d => {
                    var lineData = [
                        [
                            this.srcPos[d[0]],
                            this.height / 3 * 1
                        ],

                        [
                            this.targPos[d[1]],
                            this.height / 3 * 2
                        ]
                    ];
                    // console.log(d, lineData);
                    return d3line(lineData);
                })
                .attr("class", "attConnect")
                .style("stroke-width", d => d[2] * 5)
                .style("stroke", "blue")
                .style("opacity", d => 0.1 + d[2])
                .style("fill", "none");
            //drawing sentence
            this.svg.selectAll(".sourceWord")
                .data(this.srcWords)
                .enter()
                .append("rect")
                .attr("x", this.srcPos[d[0]])
                .attr("y", this.height / 3 * 0.5)
                .attr("width", this.width / (this.srcPos.length + 1))
                .attr("height", this.height / 3 * 0.5)
                .style("fill", "grey");
        }
    }

    computeWordPosition(src, targ) {
        src.push("\<s\>");
        targ.push("\<s\>");

        console.log(src, targ);
        this.srcPos = src.map((d, i) => {
            return this.width / (src.length + 1) * i
        });
        this.targPos = targ.map((d, i) => {
            return this.width / (targ.length + 1) * i
        });
    }

    resize() {

        //you can redraw or resize your vis here
        this.draw();
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        switch (msg["name"]) {
            case "attention":
                //if attention is updated, redraw attention
                this.draw();
                break;
        }
    }

    parseFunctionReturn(msg) {
        switch (msg["func"]) {
            case "parseSentence":
                this.handleParsedSentence(msg["data"]);
        }
    }

    /////////////// handler /////////////////
    handleParsedSentence(parseResult) {
        console.log(parseResult);
        if (parseResult["sentence"] == this.data["currentPair"][0]) {
            //draw structure

        }
    }
}
