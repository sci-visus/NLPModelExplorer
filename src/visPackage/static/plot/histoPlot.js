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

    setSample(sample, accessor) {
        this.accessor = accessor;
        this.sample = sample;
        this.mode = "sample";
        this.draw();
    }

    setHisto(histoList) {
        this.hist = histoList;
        this.mode = "hist";
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
        // console.log(width, height);
        var binNum = 10;
        var x, y, bins;
        if (this.mode === "sample") {
            var samples = this.sample;
            if (samples.length === 0)
                return;
            // Generate a histogram using twenty uniformly-spaced bins.
            var minS = Math.min.apply(null, samples.map(this.accessor));
            var maxS = Math.max.apply(null, samples.map(this.accessor));
            // console.log("Sample range:", minS, maxS);
            x = d3.scaleLinear()
                .domain([minS, maxS])
                .range([this.pos[0], this.pos[0] + width]);
            var histogram = d3.histogram()
                .domain([minS, maxS])
                .thresholds(x.ticks(binNum))
                .value(this.accessor);
            bins = histogram(samples);
            y = d3.scaleLinear()
                .domain([0, d3.max(bins, function(d) {
                    return d.length;
                })])
                .range([height + pos[1], pos[1]]);
            // console.log(bins);
            // console.log(bins);
            var bar = this.svg.selectAll(".bar")
                .data(bins)
                .enter().append("rect")
                .attr("class", "bar")
                // .attr("x", 1)
                .attr("fill", "lightgrey")
                .attr("transform", function(d) {
                    return "translate(" + x(d.x0) + "," + y(d.length) +
                        ")";
                })
                .attr("width", function(d) {
                    var width = x(d.x1) - x(d.x0) - 1;
                    if (width < 0)
                        width == 0;
                    // console.log(width);
                    return width;
                })
                .attr("height", function(d) {
                    // console.log(pos[1] + height - y(d.length));
                    return pos[1] + height - y(d.length);
                })
                .on("click", (d, i) => {
                    this.callback(d);
                })
                .on("mouseover", function(d) {
                    d3.select(this).style("fill", "grey");
                })
                .on("mouseout", function(d) {
                    d3.select(this).style("fill", "lightgrey");
                });
        } else if (this.mode === "hist") {
            //directly provide the histogram bin size
            let barWidth = width / this.hist.length - 2;
            x = d3.scaleLinear()
                .domain([0, this.hist.length])
                .range([this.pos[0], this.pos[0] + width]);
            y = d3.scaleLinear()
                .domain([0, d3.max(this.hist)])
                .range([height + pos[1], pos[1]]);
            var bar = this.svg.selectAll(".bar")
                .data(this.hist)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("fill", "lightgrey")
                .attr("x", function(d, i) {
                    return x(i);
                })
                .attr("width", barWidth)
                .attr("y", function(d) {
                    return y(d);
                })
                .attr("height", function(d) {
                    return pos[1] + height - y(d);
                }).on("click", (d, i) => {
                    this.callback(d);
                })
                .on("mouseover", function(d) {
                    d3.select(this).style("fill", "grey");
                })
                .on("mouseout", function(d) {
                    d3.select(this).style("fill", "lightgrey");
                });
        }


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

    bindSelectionCallback(callback) {
        this.callback = callback;
    }
}
