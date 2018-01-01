/*

the triangle vis of the prediction result

*/

class predictionComponent extends baseComponent {
    constructor(div) {
        super(div);

        this.margin = {
            top: 25,
            right: 25,
            bottom: 25,
            left: 25
        };

        this.draw();
    }

    draw() {
        this._updateWidthHeight();

        this.svg = d3.select(this._div + "triangle");

        // const xScale = d3.scaleLinear()
        //     .domain([this.margin.left, this.width])
        //     .range([0, this.width]);
        //
        // // illustrate top/bottom margins
        // const yScale = d3.scaleLinear()
        //     .domain([this.margin.top, this.height])
        //     .range([0, this.height]);

        // const label = svg.append("g")
        //     .attr("class", "label");

        // var trianglePoints = xScale(30) + ' ' + yScale(30) + ', ' + xScale(
        //     330) + ' ' + yScale(30) + ', ' + xScale(180) + ' ' + yScale(
        //     260);

        //entailment
        //112,0 0,194 224,194
        // const trilabel = svg.append("g");
        var label = this.svg.append("g");
        label.append('text')
            // .attr("class", "trilabel")
            .attr("x", 112 - 20)
            .attr("y", -2)
            .text("Neutral");

        //neutral
        label.append('text')
            // .attr("class", "trilabel")
            .attr("x", 0 - 10)
            .attr("y", 194 + 12)
            .text("Contradiction");

        //contradiction
        label.append('text')
            // .attr("class", "trilabel")
            .attr("x", 224 - 55)
            .attr("y", 194 + 12)
            .text("Entailment");
        // updateData(sdata, 0);

        this.svg.attr("width", this.pwidth)
            .attr("height", this.pheight)
            .attr("x", 0)
            .attr("y", 0);
    }

    resize() {
        // console.log("prediction-resize\n");
        this.draw();
    }

    updateSelection(sdata, sIndex) {
        var data = [sdata[sIndex]["src"], sdata[sIndex]["targ"][0], sdata[
            sIndex]["targ"][0]];

        svg.selectAll("circle").remove();
        svg.selectAll("circle")
            .data(sdata[sIndex]["pred"])
            .enter()
            .append("circle")
            .attr("id", (d, i) => {
                return "circle" + i;
            })
            .attr("cx", d => {
                return xScale(d["entailment"] * 30 + d["neutral"] * 330 +
                    d[
                        "contradiction"] * 180)
            })
            .attr("cy", d => {
                return yScale(d["entailment"] * 30 + d["neutral"] * 30 +
                    d[
                        "contradiction"] * 260)
            })
            .attr("r", (d, i) => {
                if (i == 0) return 6;
                else return 3;
            })
            .style("fill", (d, i) => {
                if (i == 0) return 'red';
                else return 'white';
            })
            .style("stroke", 'black')
            .style("opacity", 0.7)
            //   .style("opacity", (d,i)=>{if (i==0) return "1.0"; else return "0.5";})
            .on("mouseover", (d, i) => {
                var data = [sdata[sIndex]["src"], sdata[sIndex]["targ"]
                    [i],
                    sdata[sIndex]["targ"][0]
                ];
                updateLabel(data, i);
            });
        updateTargetList(sdata[sIndex]["targ"], sIndex);
        updateLabel(data, 0);
    }

    updateTargetList(data, sIndex) {
        var htmlList = '';
        for (var i = 0; i < data.length; i++) {
            if (i === 0)
                htmlList += "<option value=" + i + " selected>" + data[i] +
                "</option>";
            else
                htmlList += "<option value=" + i + ">" + data[i] +
                "</option>";
        }

        // console.log(texthtml);
        d3.select("#tList").html(htmlList);
        d3.select("#tList").html(htmlList).on('change', d => {
            var index = Number(d3.select("#tList").node().value);
            updateLabel([sdata[sIndex]["src"], sdata[sIndex]["targ"]
                [
                    index
                ], sdata[sIndex]["targ"][0]
            ], index);
        });
    }
}
