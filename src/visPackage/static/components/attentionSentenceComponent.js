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
                    attList.push([i, j, attattMatrix[i][j]]);
                }

            // console.log(srcAtt, targAtt);

            //sentence position
            this.computeWordPosition(pair[0], pair[1]);

            //sentence mask

            //word location
            var d3line = d3.svg.line()
                .x(function(d) {
                    return d.x;
                })
                .y(function(d) {
                    return d.y;
                })
                .interpolate("linear");

            this.svg = d3.select(this.div).append("svg");
            this.svg.selectAll(".attConnect")
                .data(attList)
                .enter()
                .append("path")
                .attr("d", d => {
                    var lineData = [this.srcPos[d[0]], this.height / 3 *
                        i
                    ]
                    return d3line(lineData);
                })

        }
    }

    computeWordPosition(src, targ) {
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
}
