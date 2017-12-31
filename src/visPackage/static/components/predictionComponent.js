/*

the triangle vis of the prediction result

*/

class predictionComponent extends baseComponent {
    constructor(div) {
        super(div);

    }

    draw() {
        const xScale = d3.scaleLinear()
            .domain([margin.left, margin.left + width])
            .range([0, width]);

        svg.append("g").call(d3.axisTop(xScale));

        // illustrate top/bottom margins
        const yScale = d3.scaleLinear()
            .domain([margin.top, margin.top + height])
            .range([0, height]);
        svg.append("g").call(d3.axisLeft(yScale));

        // Tip: name your selections and work with CSS classes
        const label = svg.append("g")
            .attr("class", "label");

        var trianglePoints = xScale(30) + ' ' + yScale(30) + ', ' + xScale(
            330) + ' ' + yScale(30) + ', ' + xScale(180) + ' ' + yScale(
            260);

        //entailment
        const trilabel = svg.append("g");
        trilabel.append('text')
            .attr("class", "trilabel")
            .attr("x", xScale(15))
            .attr("y", yScale(20))
            .text("entailment");

        //neutral
        trilabel.append('text')
            .attr("class", "trilabel")
            .attr("x", xScale(315))
            .attr("y", yScale(20))
            .text("neutral");

        //contradiction
        trilabel.append('text')
            .attr("class", "trilabel")
            .attr("x", xScale(155))
            .attr("y", yScale(280))
            .text("contradiction");

        // svg.append('polyline')
        //     .attr('points', trianglePoints)
        //     .style('fill', 'grey')
        //     .style('stroke', 'None');

        updateData(sdata, 0);
    }


    updateData(sdata, sIndex) {
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
