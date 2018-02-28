/*
Handle multiple histogram
*/

class histoPlot {
    constructor() {

    }

    draw() {
        var bar = svg.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) {
                return "translate(" + x(d.x) + "," + y(d.y) + ")";
            });

        bar.append("rect")
            .attr("x", 0)
            .attr("width", x(data[0].dx) - 3)
            .attr("height", function(d) {
                return height - y(d.y);
            })

    }
}
