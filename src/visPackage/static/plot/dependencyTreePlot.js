/*

add dependencyTreePlot to an existing svg
*/

class dependencyTreePlot {

    //pos: The index position
    //width: The width of sentence
    //heigth: The height of sentence
    constructor(svg, orientation, sen, pos, dep_triples, width, height) {
        this.svg = svg.append('g');
        this.orientation = orientation;
        this.pos = pos;
        this.sen = sen;
        this.dep_triples = dep_triples;
        this.width = width;
        this.height = height;

        //text box width and height
        this.text_box_width = Math.min(this.width * 0.1, 15);
        this.text_box_height = Math.min(this.height * 0.1, 10);

        this.collapseIndex = new Set();

        this.filter(); //init the display index

        this.draw();
    }

    setCollapseHandle(func) {
        this.callback = func;
    }

    onHandleCollapse() {

        this.sentenceMask = [];
        for (let i = 0; i < this.sen.length; i++) {
            if (this.display_index.includes(i)) {
                this.sentenceMask[i] = 1;
            } else {
                this.sentenceMask[i] = 0;
            }
        }

        // this.callback(this.sentenceMask); //[1,0,0,1]
        // this.callback(this.display_index); //the index of word will be presented
    }

    //i: index of word in sentence
    collapse(i) {
        if (this.collapseIndex.has(i)) {
            this.collapseIndex.delete(i);
        } else {
            this.collapseIndex.add(i);
        }

        this.filter();
        this.draw();

        //callback called
        this.onHandleCollapse();
    }

    //support function for collapse: filter
    //this.display_index is reset, shows which words are presented
    filter() {
        let childs = [];
        let display_index = [];
        console.log("collapseIndex:", this.collapseIndex);

        this.collapseIndex.forEach(d => {
            let collapseChildren = this.getChild(d, this.dep_triples)
            console.log(collapseChildren);
            childs = childs.concat(collapseChildren);
        });

        let childs_set = new Set(childs);
        console.log(childs_set);
        for (let i = 0; i < this.sen.length; i++) {
            if (!childs_set.has(i)) {
                display_index.push(i);
            }
        }
        this.display_index = display_index;
        console.log(display_index);
    }

    //support function for collapse: get child index
    getChild(index, deps) {
        let childs = [];
        let filter = new Set();

        //loop throught the dependency until there is not new node
        //add to the filter.
        let l = 0;
        do {
            l = filter.size;
            for (let i = 0; i < deps.length; i++) {
                if (filter.has(deps[i][0]) && !(filter.has(deps[i][2]))) {
                    filter.add(dep[i][2]);
                    childs.add(dep[i][2]);
                }
            }
        } while (filter.size != l);
        return childs;
    }

    //draw the dependency tree over sentence
    draw() {
        //clean
        this.svg.html('');
        //arrow
        this.svg.append("svg:defs")
            .append("svg:marker")
            .attr("id", "arrow")
            .attr('viewBox', '0 0 10 10')
            .attr("refX", 1)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z")
            .style('fill', 'steelblue');

        //line function
        let lineFunction = d3.line()
            .x(function(d) {
                return d.x;
            })
            .y(function(d) {
                return d.y;
            })
            .curve(d3.curveLinear);

        //path
        let path_loc = this.pathLocation();
        this.svg.selectAll('.dep_tree_dep_path').data(path_loc)
            .enter()
            .append('path')
            .attr('d', function(d) {
                return lineFunction(d);
            })
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("stroke-opacity", 0.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .style("stroke-dasharray", "4,4")
            .style("marker-end", "url(#arrow)");

        //component rect
        let text_loc = this.textLocation();

        //component text
        this.svg.selectAll('.dep_tree_rel_text').data(text_loc)
            .enter()
            .append('text')
            .text(function(d) {
                return d.text;
            })
            .attr('x', function(d, i) {
                return d.x;
            })
            .attr('y', function(d, i) {
                return d.y;
            })
            .attr('font-size', 8)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central");
    }

    //get text pos
    textLocation() {
        let data = [];
        for (let i = 0; i < this.dep_triples.length; i++) {
            let d = this.dep_triples[i];

            if (this.display_index.includes(d[0]) && this.display_index.includes(
                    d[2])) {
                let word1_loc = this.pos[this.display_index.indexOf(d[0])],
                    word2_loc = this.pos[this.display_index.indexOf(d[2])],
                    item = {
                        'text': d[1]
                    };

                if (this.orientation == 'h-top') {
                    item['x'] = (word1_loc.x + word2_loc.x) / 2;
                    item['y'] = word1_loc.y - Math.abs(d[0] - d[2]) * this.text_box_height -
                        this.text_box_height * 1.5;
                } else if (this.orientation == 'h-bottom') {
                    item['x'] = (word1_loc.x + word2_loc.x) / 2;
                    item['y'] = word1_loc.y + Math.abs(d[0] - d[2]) * this.text_box_height +
                        this.text_box_height * 1.5;
                } else if (this.orientation == 'v-left') {
                    item['x'] = word1_loc.x - Math.abs(d[0] - d[2]) * this.text_box_width -
                        this.text_box_width * 1.5;
                    item['y'] = (word1_loc.y + word2_loc.y) / 2;
                }
                data.push(item)
            }
        }
        return data;
    }

    //get path pos
    pathLocation() {
        let data = [];

        for (let i = 0; i < this.dep_triples.length; i++) {
            let d = this.dep_triples[i];
            if (this.display_index.includes(d[0]) && this.display_index.includes(
                    d[2])) {
                let word1_loc = this.pos[this.display_index.indexOf(d[0])],
                    word2_loc = this.pos[this.display_index.indexOf(d[2])],
                    item = [];

                if (this.orientation == 'h-top') {
                    //first point
                    item.push({
                        'x': word1_loc.x,
                        'y': word1_loc.y - this.text_box_height *
                            1.5
                    });
                    //second point
                    item.push({
                        'x': word1_loc.x * 5 / 6 + word2_loc.x * 1 /
                            6,
                        'y': word1_loc.y - Math.abs(d[0] - d[2]) *
                            this.text_box_height - this
                            .text_box_height * 1.5
                    });
                    //third point
                    item.push({
                        'x': word1_loc.x * 1 / 6 + word2_loc.x * 5 /
                            6,
                        'y': word1_loc.y - Math.abs(d[0] - d[2]) *
                            this.text_box_height - this
                            .text_box_height * 1.5
                    });
                    //fourth point
                    item.push({
                        'x': word2_loc.x,
                        'y': word2_loc.y - this.text_box_height *
                            1.5
                    });
                } else if (this.orientation == 'h-bottom') {
                    //first point
                    item.push({
                        'x': word1_loc.x,
                        'y': word1_loc.y + this.text_box_height *
                            1.5
                    });
                    //second point
                    item.push({
                        'x': word1_loc.x * 5 / 6 + word2_loc.x * 1 /
                            6,
                        'y': word1_loc.y + Math.abs(d[0] - d[2]) *
                            this.text_box_height + this
                            .text_box_height * 1.5
                    });
                    //third point
                    item.push({
                        'x': word1_loc.x * 1 / 6 + word2_loc.x * 5 /
                            6,
                        'y': word1_loc.y + Math.abs(d[0] - d[2]) *
                            this.text_box_height + this
                            .text_box_height * 1.5
                    });
                    //fourth point
                    item.push({
                        'x': word2_loc.x,
                        'y': word2_loc.y + this.text_box_height *
                            1.5
                    });
                } else if (this.orientation == 'v-left') {
                    //first point
                    item.push({
                        'x': word1_loc.x - this.text_box_width *
                            1.5,
                        'y': word1_loc.y
                    });
                    //second point
                    item.push({
                        'x': word1_loc.x - Math.abs(d[0] - d[2]) *
                            this.text_box_width - this.text_box_width *
                            1.5,
                        'y': word1_loc.y * 5 / 6 + word2_loc.y * 1 /
                            6
                    });
                    //third point
                    item.push({
                        'x': word1_loc.x - Math.abs(d[0] - d[2]) *
                            this.text_box_width - this.text_box_width *
                            1.5,
                        'y': word1_loc.y * 1 / 6 + word2_loc.y * 5 /
                            6
                    });
                    //fourth point
                    item.push({
                        'x': word2_loc.x - this.text_box_width *
                            1.5,
                        'y': word2_loc.y
                    });
                } else
                    throw Error('unknow orientation');

                data.push(item);
            }
        }
        return data;
    }
}
