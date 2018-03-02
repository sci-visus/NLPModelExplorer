/*
Handle multiple histogram
*/

class histoPlot {
    constructor(svg, pos, size) {
        this.svg = svg;
        this.pos = pos;
        this.size = size;
        this.sample = [10, 9, 7, 6, 7, 3, 2,
            1, 9, 3, 5, 7, 3, 2,
            8, 9, 3, 4, 6, 8, 2
        ];
    }

    update(pos, size) {
        this.pos = pos;
        this.size = size;
        this.draw();
    }

    draw() {
        var width = this.size[0];
        var height = this.size[1];
        var binNum = 6;
        var samples = this.sample;
        var x = d3.scaleLinear()
            .domain([0, 11])
            .range([this.pos[0], this.pos[0] + width]);


        // Generate a histogram using twenty uniformly-spaced bins.
        var histogram = d3.histogram()
            .domain(x.domain())
            .thresholds(x.ticks(binNum))
        var bins = histogram(samples);
        console.log(bins);

        var y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(bins, function(d) {
                return d.length;
            })]);

        var xAxis = d3.axisBottom()
            .scale(x);

        var bar = this.svg.selectAll(".bar")
            .data(bins)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", 1)
            .attr("fill", "lightblue")
            .attr("transform", function(d) {
                return "translate(" + x(d.x0) + "," + y(d.length) + ")";
            })
            .attr("width", function(d) {
                return x(d.x1) - x(d.x0) - 1;
            })
            .attr("height", function(d) {
                return height - y(d.length);
            });
        // add the x Axis
        this.svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        // add the y Axis
        this.svg.append("g")
            .attr("transform", "translate(" + this.pos[0] + ",0)")
            .call(d3.axisLeft(y));
    }
}
