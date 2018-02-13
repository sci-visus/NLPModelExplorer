class svgExporter {
    constructor(svg, figName = "attention", pos = [10, 10]) {
        this.svg = svg;
        this.pos = pos;
        this.figName = figName;
        this.draw();
    }

    draw() {
        this.icon = this.svg.append('text')
            .attr("id", "cameraIcon")
            .attr("x", this.pos[0])
            .attr("y", this.pos[1] + 20)
            .attr('font-family', 'FontAwesome')
            .attr('font-size', function(d) {
                return 1.2 + 'em'
            })
            .text(function(d) {
                return '\uf030'
            })
            .attr("fill", "lightgrey")
            .style("alignment-baseline", "middle")
            .style("cursor", "hand")
            .on("click", this.exportSvg.bind(this));
    }

    exportSvg() {
        //hide the icon
        this.icon.attr("fill", "white");
        // this.icon.style("fill-opacity", 0.0);

        try {
            var isFileSaverSupported = !!new Blob();
        } catch (e) {
            alert("blob not supported");
        }

        var html = this.svg
            // .attr("title", "test2")
            .attr("version", 1.1)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .node().parentNode.innerHTML;

        var blob = new Blob([html], {
            type: "image/svg+xml"
        });
        saveAs(blob, this.figName + ".svg");

        //restore the icon
        this.icon.attr("fill", "lightgrey");
        // this.icon.style("fill-opacity", 1.0);
    }

}
