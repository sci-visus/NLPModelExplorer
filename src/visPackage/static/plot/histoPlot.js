/*
Handle multiple histogram
*/

class histoPlot {
    constructor(svg, pos, size, axisX = false, axisY = false,
        hist = [], sample = [], mode = "sample") {
        this.svg = svg.append("g");

        this.mode = mode;
        this.pos = pos;
        this.size = size;
        this.axisXflag = axisX;
        this.axisYflag = axisY;
        this.hist = hist;
        this.sample = sample;

        this.leftOffset = 10;
        this.bottomOffset = 18;

        this.draw();
    }

    setSample(sample) {
        this.sample = sample;
        this.draw();
    }

    update(pos, size) {
        this.pos = pos;
        this.size = size;
        this.draw();
    }

    draw() {
        this.svg.selectAll("*").remove();
        var pos = this.pos;
        var width = this.size[0] - (this.axisYflag ? this.leftOffset : 0);
        var height = this.size[1] - (this.axisXflag ? this.bottomOffset : 0);
        console.log(width, height);
        var binNum = 10;
        var x, y, bins;
        if (this.mode === "sample") {
            var samples = this.sample;
            if (samples.length === 0)
                return;
            // Generate a histogram using twenty uniformly-spaced bins.
            var minS = Math.min.apply(null, samples);
            var maxS = Math.max.apply(null, samples);
            // console.log("Sample range:", minS, maxS);
            x = d3.scaleLinear()
                .domain([minS, maxS])
                .range([this.pos[0], this.pos[0] + width]);
            var histogram = d3.histogram()
                .domain([minS, maxS])
                .thresholds(x.ticks(binNum))
            bins = histogram(samples);
            y = d3.scaleLinear()
                .domain([0, d3.max(bins, function(d) {
                    return d.length;
                })])
                .range([height + pos[1], pos[1]]);
            // console.log(bins);
        } else if (this.mode === "hist") {
            //directly provide the histogram bin size
        }

        // var xAxis = d3.axisBottom()
        //     .scale(x);


        var bar = this.svg.selectAll(".bar")
            .data(bins)
            .enter().append("rect")
            .attr("class", "bar")
            // .attr("x", 1)
            .attr("fill", "grey")
            .attr("transform", function(d) {
                return "translate(" + x(d.x0) + "," + y(d.length) + ")";
            })
            .attr("width", function(d) {
                let width = x(d.x1) - x(d.x0) - 1.0;
                if (width < 0)
                    width == 0;
                return width;
            })
            .attr("height", function(d) {
                return pos[1] + height - y(d.length);
            });
        // add the x Axis
        if (this.axisXflag) {
            this.svg.append("g")
                .attr("transform", "translate(0," + (pos[1] + height) +
                    ")")
                .call(d3.axisBottom(x));
        }
        // add the y Axis
        if (this.axisYflag) {
            this.svg.append("g")
                .attr("transform", "translate(" + this.pos[0] + ",0)")
                .call(d3.axisLeft(y));
        }
    }
}
