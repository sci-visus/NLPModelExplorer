class svgExporter {
    constructor(svg, pos = [0, 10]) {
        this.svg = svg;
        this.pos = pos;
        this.draw();
    }

    draw() {
        // <div style="font-size:3em; color:Tomato">
        //   <i class="fas fa-camera-retro"></i>
        // </div>
        this.svg.append('text')
            .attr("x", this.pos[0])
            .attr("y", this.pos[1] + 20)
            .attr('font-family', 'FontAwesome')
            .attr("color", "grey")
            .attr('font-size', function(d) {
                return 3 + 'em'
            })
            .text(function(d) {
                return '\uf030'
            })
            .style("alignment-baseline", "middle");
    }

    exportSvg() {
        //open file selector

    }

}
