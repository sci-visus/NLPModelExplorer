/*


*/

class sentenceComponent extends baseComponent {
    constructor(div) {
        super(div);

    }

    draw() {

    }

    updateLabel(data, index) {
        var texthtml = '<p class=\'label\'>' + "Source: " + data[0] +
            '</p>\n';
        if (data[2] != data[1])
            texthtml += '<p class=\'label\'>' + "Perturbed (Target): " +
            data[1] +
            '</p>';
        texthtml += '<p class=\'label\'>' + "Target: " + data[2] + '</p>\n';
        // console.log(texthtml);
        d3.select("#textPair").html(texthtml);

        svg.selectAll("circle")
            .attr("r", 3)
            .style("fill", "white");

        svg.select("#circle" + index)
            .attr("r", 6)
            .style("fill", "red");

        //   label.selectAll(".label").remove();
        //   label.selectAll(".label")
        // .data(data)
        // .enter()
        // .append("text")
        // .attr("class", "label")
        // .text(d => d)
        // .attr("x", 10)
        // .attr("y", (d, i) => height * 0.8 + (i * 25))
        // .attr("text-anchor", "left");
    }
}
