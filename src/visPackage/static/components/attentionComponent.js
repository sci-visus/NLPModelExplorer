/*

Matrix representation of attention


*/

//beside margin matrix will take 2/3 width and 2/3 height space
class attentionComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["attention", "currentPair"]);

        this.margin = {
            top: 25,
            right: 25,
            bottom: 25,
            left: 25
        };


    }

    draw() {
        this._updateWidthHeight();

        if (this.data["attention"] !== undefined && this.data["currentPair"] !==
            undefined && this.data['targ_depTree'] !== undefined && this.data[
                'src_depTree'] !== undefined) {

            //clear all
            if (this.svg)
                d3.select(this.div).html('');

            //attention matrix
            let attMatrix = this.data['attention'];

            //init svg
            this.svg = d3.select(this.div).append("svg")
                .attr("width", this.pwidth)
                .attr("height", this.pheight)
                .append("g")
                .attr("transform", "translate(" + this.margin.left + "," +
                    this.margin.top + ")");

            //data
            this.attList = [];
            for (let i = 0; i < attMatrix.length; i++)
                for (let j = 0; j < attMatrix[i].length; j++) {
                    this.attList.push(attMatrix[i][j])
                }

            //location of words
            this.computeWordPosition(this.srcWords, this.targWords);

            //matrix
            let rectw = (this.width * 3 / 4) / this.targWords.length,
                recth = (this.height * 3 / 4) / this.srcWords.length;

            this.svg.selectAll('.attentionComponent_matrix_rect').data(this
                    .attList)
                .enter()
                .append('rect')
                .attr('class', 'attentionComponent_matrix_rect')
                .attr('x', (d, i) => {
                    return this.width * 1 / 4 + (i % this.targWords.length) *
                        rectw;
                })
                .attr('y', (d, i) => {
                    return this.height * 1 / 4 + Math.floor(i / this.targWords
                        .length) * recth;
                })
                .attr('width', rectw)
                .attr('height', recth)
                .style('stroke', 'black')
                .style('stroke-width', '1px')
                .style('fill', d => {
                    return d3.interpolateRdBu(1 - d);
                });

            //Draw targ text
            //text
            this.targ_dep = new dependencyTreePlot(this.svg, 'h-top', this.targWords,
                this.targPos, this.data['targ_depTree'], this.width,
                this.height);
            this.svg.selectAll('.attentionComponent_targWords')
                .data(this.targWords)
                .enter()
                .append('text')
                .text(d => d)
                .attr('x', (d, i) => this.targPos[i].x)
                .attr("y", (d, i) => this.targPos[i].y)
                .attr("transform", (d, i) => {
                    return "rotate(-45, " + this.targPos[i].x + ' , ' +
                        this.targPos[i].y + ')';
                })
                .style("font-size", 10)
                .style("alignment-baseline", "middle")
                .style("text-anchor", "middle")
                .on('click', (d, i) => {
                    this.targ_dep.collapse(i);
                });

            //Draw src text
            this.src_dep = new dependencyTreePlot(this.svg, 'v-left', this.srcWords,
                this.srcPos, this.data['src_depTree'], this.width, this
                .height);
            this.svg.selectAll('.attentionCompoentn_srcWords')
                .data(this.srcWords)
                .enter()
                .append('text')
                .text(d => d)
                .attr('x', (d, i) => this.srcPos[i].x)
                .attr("y", (d, i) => this.srcPos[i].y)
                .style("alignment-baseline", "middle")
                .style("font-size", 10)
                .style("text-anchor", "middle")
                .on('click', (d, i) => {
                    this.src_dep.collapse(i);
                });

            //Draw color scale bar
            let linearGradient = this.svg.append('defs').append(
                    'linearGradient')
                .attr('id', 'attention_heatmap_gradient')
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '0%');

            //color gradient break point
            for (let i = 0; i <= 10; i++) {
                linearGradient.append('stop')
                    .attr('offset', (i * 10) + '%')
                    .attr('stop-color', d3.interpolateRdBu(i / 10));
            }

            linearGradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', d3.interpolateRdBu(1));

            //render color scale map
            this.svg.append('rect')
                .attr('x', this.margin.left)
                .attr('y', this.margin.top)
                .attr('width', this.width * 1 / 6)
                .attr('height', this.height / 10)
                .style('fill', 'url(#attention_heatmap_gradient)');

            //color scale ticks
            let ticks = [1, 0.5, 0];

            let ticksdata = ticks.map((d, i) => {
                return {
                    'text': d,
                    'x': this.margin.left + i * this.width / 12,
                    'y': this.margin.top
                };
            });

            this.svg.selectAll('.attention_heatmap_gradient_ticks')
                .data(ticksdata)
                .enter()
                .append('text')
                .attr('x', d => d.x)
                .attr('y', d => d.y)
                .text(d => d.text)
                .style("alignment-baseline", "middle")
                .style("font-size", 12)
                .style("text-anchor", "middle");
        }
    }

    computeWordPosition(src, targ) {
        // console.log(src, targ);
        this.srcPos = this.srcWords.map((d, i) => {
            return {
                'y': (this.height * 0.75) / this.srcWords.length *
                    (i + 0.5) + this.height / 4,
                'x': this.width * 1 / 4 - this.margin.left
            };
        });

        this.targPos = this.targWords.map((d, i) => {
            return {
                'x': (this.width * 0.75) / this.targWords.length *
                    (i + 0.5) + this.width / 4,
                'y': this.height * 1 / 4 - this.margin.top
            };
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
            case "currentPair":
                let pair = msg["data"]["data"];

                this.srcWords = ["\<s\>"].concat(pair[0].match(/\S+/g));
                this.targWords = ["\<s\>"].concat(pair[1].match(/\S+/g));

                //parse the sentence
                this.callFunc("parseSentence", {
                    "sentence": pair[0]
                });
                this.callFunc("parseSentence", {
                    "sentence": pair[1]
                });
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

        if (parseResult.data["sentence"] == this.data["currentPair"][0]) {
            this.data['src_depTree'] = parseResult.data.depTree;
        } else if (parseResult.data["sentence"] == this.data["currentPair"]
            [1]) {
            this.data['targ_depTree'] = parseResult.data.depTree;
        } else {
            throw Error(
                'unknow sentence in attention Component handle parsedSentence'
            );
        }

        this.draw();
    }

}
