class treeMapPlot {
    constructor(svg, pos, size) {
        this.svg = svg.append("g");
        this.pos = pos;
        this.size = size;
    }

    generateNestData(data, levelTag, rootName) {

        var nestData;
        if (levelTag.length === 1) {
            nestData = d3.nest().key(d => d[levelTag[0]]).entries(data);

        } else { //only generate tree with depth 2
            nestData = d3.nest().key(d => {
                return d[levelTag[0]];
            }).key(d => {
                return d[levelTag[1]];
            }).entries(data);
        }

        var data = {
            key: rootName,
            values: nestData
        }

        // console.log(data);
        return data;
    }

    setData(treeData, rootName) {
        //test data
        this.data = this.generateNestData(treeData, ["region",
            "subregion"
        ], rootName);
    }

    update(pos, size) {
        this.pos = pos;
        this.size = size;
        this.draw();
    }

    draw() {
        this.drawSimple();
    }

    drawSimple() {
        this.svg.selectAll("*").remove();
        var width = this.size[0];
        var height = this.size[1];

        var data = this.data;
        var svg = this.svg;
        const color = d3.scaleOrdinal().range(d3.schemeCategory20c);
        const treemap = d3.treemap().size([width, height]);

        // d3.json("flare.json", function(error, data) {
        //     if (error) throw error;

        const root = d3.hierarchy(data, d => d.values)
            .sum(d => d.value)
            .sort(function(a, b) {
                return a.value - b.value;
            });

        // console.log(root);
        const tree = treemap(root);
        // console.log(tree.leaves());

        const node = svg.selectAll(".node")
            .data(tree.leaves())
            .enter().append("rect")
            .attr("class", "node")
            .attr("x", (d) => d.x0)
            .attr("y", (d) => d.y0)
            .attr("width", (d) => Math.max(0, d.x1 - d.x0 - 1))
            .attr("height", (d) => Math.max(0, d.y1 - d.y0 - 1))
            .attr("fill", (d) => {
                // console.log(d);
                return color(d.data.key);
            });
        // .text((d) => d.data.name);

        d3.selectAll("input").on("change", function change() {
            const value = this.value === "count" ? (d) => {
                return d.size ? 1 : 0;
            } : (d) => {
                return d.size;
            };

            const newRoot = d3.hierarchy(data, (d) => d
                    .children)
                .sum(value);

            node.data(treemap(newRoot).leaves())
                .transition()
                .duration(1500)
                .style("left", (d) => d.x0 + "px")
                .style("top", (d) => d.y0 + "px")
                .style("width", (d) => Math.max(0, d.x1 -
                    d.x0 - 1) + "px")
                .style("height", (d) => Math.max(0, d.y1 -
                    d.y0 - 1) + "px")
        });
        // });
    }

    drawComplex() {
        var formatNumber = d3.format("d");

        var svg = this.svg;
        var data = this.data

        // var width = +this.svg.attr("width");
        // var height = +this.svg.attr("height");
        var width = 400;
        var height = 400;

        // var color = d3.scale.category20c();
        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var x = d3.scaleLinear()
            .domain([0, width])
            .range([0, width]);

        var y = d3.scaleLinear()
            .domain([0, height])
            .range([0, height]);

        const root = d3.hierarchy(data, d => d.values)
            .sum(d => d.value)
            .sort(function(a, b) {
                return a.value - b.value;
            });

        // root.children((d, depth) => {
        //     return depth ? null : d._children;
        // })

        var treemap = d3.treemap(root)
            .size([width, height])
            .round(false);

        // treemap(root.sum(function(d) {
        //         return d.value;
        //     }).sort(function(a, b) {
        //         return a.value - b.value;
        //     }))
        // .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
        // .round(false);

        // var svg = d3.select("#chart").append("svg")
        //     .attr("width", width + margin.left + margin.right)
        //     .attr("height", height + margin.bottom + margin.top)
        //     .style("margin-left", -margin.left + "px")
        //     .style("margin.right", -margin.right + "px")
        //     .append("g")
        //     .attr("transform", "translate(" + margin.left + "," + margin.top +
        //         ")")
        //     .style("shape-rendering", "crispEdges");

        var grandparent = svg.append("g")
            .attr("class", "grandparent");

        grandparent.append("rect")
            .attr("y", 0)
            .attr("width", width)
            .attr("height", 0);

        grandparent.append("text")
            .attr("x", 6)
            .attr("y", 6)
            .attr("dy", ".75em");


        // console.log(root);
        initialize(root);
        accumulate(root);
        layout(root);
        console.log(root);
        display(root);

        function initialize(root) {
            root.x = root.y = 0;
            root.dx = width;
            root.dy = height;
            root.depth = 0;
        }

        // Aggregate the values for internal nodes. This is normally done by the
        // treemap layout, but not here because of our custom implementation.
        // We also take a snapshot of the original children (_children) to avoid
        // the children being overwritten when when layout is computed.
        function accumulate(d) {
            return (d._children = d.values) ? d.value = d.values.reduce(
                function(p,
                    v) {
                    return p + accumulate(v);
                }, 0) : d.value;
        }

        // Compute the treemap layout recursively such that each group of siblings
        // uses the same size (1×1) rather than the dimensions of the parent cell.
        // This optimizes the layout for the current zoom state. Note that a wrapper
        // object is created for the parent node for each group of siblings so that
        // the parent’s dimensions are not discarded as we recurse. Since each group
        // of sibling was laid out in 1×1, we must rescale to fit using absolute
        // coordinates. This lets us use a viewport to zoom.
        function layout(d) {
            if (d._children) {
                treemap.nodes({
                    _children: d._children
                });
                d._children.forEach(function(c) {
                    c.x = d.x + c.x * d.dx;
                    c.y = d.y + c.y * d.dy;
                    c.dx *= d.dx;
                    c.dy *= d.dy;
                    c.parent = d;
                    layout(c);
                });
            }
        }

        function display(d) {
            grandparent
                .datum(d.parent)
                .on("click", transition)
                .select("text")
                .text(name(d));

            var g1 = svg.insert("g", ".grandparent")
                .datum(d)
                .attr("class", "depth");

            console.log(d._children);
            var g = g1.selectAll("g")
                .data(d._children)
                .enter().append("g");

            g.filter(function(d) {
                    return d._children;
                })
                .classed("children", true)
                .on("click", transition);

            var children = g.selectAll(".child")
                .data(function(d) {
                    return d._children || [d];
                })
                .enter().append("g");

            children.append("rect")
                .attr("class", "child")
                .call(rect)
                .append("title")
                .text(function(d) {
                    return d.key + " (" + formatNumber(d.value) + ")";
                });
            children.append("text")
                .attr("class", "ctext")
                .text(function(d) {
                    return d.key;
                })
                .call(text2);

            g.append("rect")
                .attr("class", "parent")
                .call(rect);

            var t = g.append("text")
                .attr("class", "ptext")
                .attr("dy", ".75em")

            t.append("tspan")
                .text(function(d) {
                    return d.key;
                });
            t.append("tspan")
                .attr("dy", "1.0em")
                .text(function(d) {
                    return formatNumber(d.value);
                });
            t.call(text);

            g.selectAll("rect")
                .style("fill", function(d) {
                    return color(d.key);
                });

            function transition(d) {
                if (transitioning || !d) return;
                transitioning = true;

                var g2 = display(d),
                    t1 = g1.transition().duration(750),
                    t2 = g2.transition().duration(750);

                // Update the domain only after entering new elements.
                x.domain([d.x, d.x + d.dx]);
                y.domain([d.y, d.y + d.dy]);

                // Enable anti-aliasing during the transition.
                svg.style("shape-rendering", null);

                // Draw child nodes on top of parent nodes.
                svg.selectAll(".depth").sort(function(a, b) {
                    return a.depth - b.depth;
                });

                // Fade-in entering text.
                g2.selectAll("text").style("fill-opacity", 0);

                // Transition to the new view.
                t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
                t1.selectAll(".ctext").call(text2).style("fill-opacity", 0);
                t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
                t2.selectAll(".ctext").call(text2).style("fill-opacity", 1);
                t1.selectAll("rect").call(rect);
                t2.selectAll("rect").call(rect);

                // Remove the old node when the transition is finished.
                t1.remove().each("end", function() {
                    svg.style("shape-rendering", "crispEdges");
                    transitioning = false;
                });
            }

            return g;
        }

        function text(text) {
            text.selectAll("tspan")
                .attr("x", function(d) {
                    return x(d.x) + 6;
                })
            text.attr("x", function(d) {
                    return x(d.x) + 6;
                })
                .attr("y", function(d) {
                    return y(d.y) + 6;
                })
                .style("opacity", function(d) {
                    return this.getComputedTextLength() < x(d.x + d.dx) -
                        x(d.x) ?
                        1 : 0;
                });
        }

        function text2(text) {
            text.attr("x", function(d) {
                    return x(d.x + d.dx) - this.getComputedTextLength() -
                        6;
                })
                .attr("y", function(d) {
                    return y(d.y + d.dy) - 6;
                })
                .style("opacity", function(d) {
                    return this.getComputedTextLength() < x(d.x + d.dx) -
                        x(d.x) ?
                        1 : 0;
                });
        }

        function rect(rect) {
            rect.attr("x", function(d) {
                    return x(d.x);
                })
                .attr("y", function(d) {
                    return y(d.y);
                })
                .attr("width", function(d) {
                    return x(d.x + d.dx) - x(d.x);
                })
                .attr("height", function(d) {
                    return y(d.y + d.dy) - y(d.y);
                });
        }

        function name(d) {
            return d.parent ? name(d.parent) + " / " + d.key + " (" +
                formatNumber(
                    d.value) + ")" : d.key + " (" + formatNumber(d.value) +
                ")";
        }
    }

}

// <style>
//
// #chart {
//   background: #fff;
//   font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
// }
//
// .title {
//     font-weight: bold;
//     font-size: 24px;
//     text-align: center;
//     margin-top: 6px;
//     margin-bottom: 6px;
// }
// text {
//   pointer-events: none;
// }
//
// .grandparent text {
//   font-weight: bold;
// }
//
// rect {
//   fill: none;
//   stroke: #fff;
// }
//
// rect.parent,
// .grandparent rect {
//   stroke-width: 2px;
// }
//
// rect.parent {
//     pointer-events: none;
// }
//
// .grandparent rect {
//   fill: orange;
// }
//
// .grandparent:hover rect {
//   fill: #ee9700;
// }
//
// .children rect.parent,
// .grandparent rect {
//   cursor: pointer;
// }
//
// .children rect.parent {
//   fill: #bbb;
//   fill-opacity: .5;
// }
//
// .children:hover rect.child {
//   fill: #bbb;
// }
//
// </style>
