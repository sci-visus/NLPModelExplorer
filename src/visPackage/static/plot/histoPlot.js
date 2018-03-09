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
        //test
        this.sample = [0.94730704, 0.75570595, 1.04833995, 1.02091421,
            1.16964189,
            1.03239289, 0.96945242, 0.94827707, 0.98014499, 0.94032951,
            1.13757828, 1.00233845, 1.02400165, 1.00644869, 0.97566681,
            0.8901842, 1.13481633, 1.12769476, 1.15863126, 0.9975381,
            1.17535003, 1.0087086, 0.90590525, 1.00881098, 1.06949063,
            0.98143087, 1.06897607, 0.86997559, 0.9940238, 1.07588494,
            0.89581051, 1.289578, 1.01025173, 0.81186338, 1.27348234,
            0.8860519, 1.06439216, 0.76662852, 0.96265176, 0.90530348,
            1.01573581, 0.87071627, 1.07567422, 0.97794084, 1.13179942,
            1.17110518, 0.87492484, 0.94010494, 1.04530149, 1.00661835,
            1.01373182, 1.08800803, 1.13411997, 0.94453149, 0.97182142,
            0.93605238, 0.96964846, 1.09438055, 0.99253712, 0.97329954,
            1.06140383, 0.94356468, 0.84329654, 0.95901532, 0.89717107,
            1.09053105, 0.96214181, 0.84536403, 0.85180228, 0.93995897,
            1.04565858, 1.18255193, 1.01202157, 0.90368176, 1.08386434,
            0.9783522, 0.91865573, 1.03107484, 0.92470622, 0.9394817,
            1.11214042, 1.03319468, 1.03667173, 1.04183199, 1.0778483,
            0.90532318, 0.88664182, 0.94542484, 0.95792604, 0.82343386,
            0.96568179, 0.94849427, 1.05604402, 0.91473536, 1.16073268,
            0.94655138, 0.75952766, 1.06981115, 0.93425475, 0.85494389,
            1.05084552, 0.93743081, 0.84859501, 1.01268434, 0.99934958,
            0.8800553, 1.09907463, 0.79709132, 1.03809753, 0.99771513,
            1.16681637, 1.00340892, 1.04267746, 1.1101374, 0.99368662,
            1.0511391, 0.97925389, 1.07418086, 1.02346573, 0.96140464,
            1.14283674, 0.87345285, 0.99941265, 0.79194897, 1.02877582,
            1.08525525, 1.12419984, 1.09473166, 1.00301042, 0.88748335,
            1.17019612, 1.0560525, 1.02844961, 1.05461137, 1.01773338,
            0.98026732, 0.95395652, 0.91813001, 1.00552369, 0.87664915,
            0.95943567, 0.87176338, 1.06239578, 1.17819823, 0.94858799,
            0.98299624, 1.32396254, 0.88821873, 0.96870007, 0.87265886,
            0.91418724, 0.88420442, 0.79763671, 1.00261875, 1.17428477,
            1.0628608, 1.00453297, 0.95973561, 0.91616546, 1.21687791,
            1.0282977, 0.98958636, 0.8903052, 1.08077723, 1.11678633,
            0.92800018, 1.03162272, 1.20118096, 1.13239263, 0.8610372,
            1.09324444, 0.88663342, 1.04360986, 1.03228809, 0.90499408,
            1.0805823, 1.08070645, 1.04890644, 1.04455348, 1.04831661,
            0.91509841, 1.0473699, 1.14791957, 1.12303154, 0.92878909,
            0.86219537, 1.03415156, 0.8070393, 0.86218602, 1.0095473,
            1.14605264, 0.96321585, 1.06466384, 1.1622033, 1.02584338,
            0.9834155, 0.92504859, 1.18731438, 1.18251753, 1.06469274
        ];
        this.draw();
    }

    update(pos, size) {
        this.pos = pos;
        this.size = size;
        this.draw();
    }

    generateHisto(sample) {


    }

    draw() {
        this.svg.selectAll("*").remove();
        var pos = this.pos;
        var width = this.size[0];
        var height = this.size[1];
        var binNum = 10;
        var x, y, bins;
        if (this.mode === "sample") {
            var samples = this.sample;
            // Generate a histogram using twenty uniformly-spaced bins.
            var minS = Math.min.apply(null, samples);
            var maxS = Math.max.apply(null, samples);
            console.log("Sample range:", minS, maxS);
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

            console.log(bins);
        } else {


        }

        var xAxis = d3.axisBottom()
            .scale(x);

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
        if (this.axisYflag) {
            this.svg.append("g")
                .attr("transform", "translate(0," + height + ")")
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
