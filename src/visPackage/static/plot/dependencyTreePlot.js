/*

add dependencyTreePlot to an existing svg
*/

class dependencyTreePlot {
    constructor(svg, orientation, pos) {
        this.svg = svg;
        this.orientation = orientation;

    }

    setCollapseHandle(func) {
        this.callback = func;

    }

    onHandleCollapse() {
        this.callback(this.sentenceMask); //[1,0,0,1]

    }

    draw() {

    }

    draw_dep_tree(x, y, sen, sen_dep_tree, horv) {
        canvas = this.svg;

        //location of text
        let text_loc = {};

        for (let i = 0; i < sen.length; i++) {
            if (horv == 'h') {
                text_loc[sen[i] + i] = {
                    'x': x + i * rectw,
                    'y': y - 10
                };
            } else if (horv == 'v') {
                text_loc[sen[i] + i] = {
                    'x': x - rectw,
                    'y': y + recth * i
                };
            } else {
                throw Error('unknow confi. in draw_dep_tree');
            }
        }

        //text
        canvas.selectAll('.dep_tree_word').data(sen).enter()
            .append('text')
            .text(function(d) {
                return d;
            })
            .attr('x', function(d, i) {
                if (horv == 'h')
                    return text_loc[d + i].x;
                else
                    return text_loc[d + i].x + rectw;
            })
            .attr('y', function(d, i) {
                if (horv == 'h')
                    return text_loc[d + i].y + 10;
                else
                    return text_loc[d + i].y;
            })
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .style('font-size', 12)
            .on('mouseover', function(d, i) {
                d3.selectAll('.' + d + '_' + i + '_path').style(
                    "stroke-dasharray", "").style('stroke',
                    'orange');
                d3.selectAll('.' + d + '_' + i + '_rect').style(
                    'stroke', 'orange');
            })
            .on('mouseout', function(d, i) {
                d3.selectAll('.' + d + '_' + i + '_path').style(
                    "stroke-dasharray", "4,4").style('stroke',
                    'steelblue');
                d3.selectAll('.' + d + '_' + i + '_rect').style(
                    'stroke', 'gray');
            })
            .on('click', function(d, i) {
                if (horv == 'h') {

                } else {

                }
            });

        //path
        canvas.append("svg:defs")
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

        let lineFunction = d3.line()
            .x(function(d) {
                return d.x;
            })
            .y(function(d) {
                return d.y;
            })
            .curve(d3.curveLinear);

        canvas.selectAll('.dep_tree_dep_path').data(sen_dep_tree).enter()
            .append('path')
            .attr('d', function(d, i) {
                let data = [],
                    word1 = sen[d[0]] + d[0],
                    word2 = sen[d[2]] + d[2];

                if (horv == 'h') {
                    //first point
                    data.push(text_loc[word1]);
                    //second point
                    data.push({
                        'x': text_loc[word1].x * 5 / 6 +
                            text_loc[word2].x * 1 / 6,
                        'y': text_loc[word1].y - Math.abs(
                            text_loc[word1].x - text_loc[
                                word2].x) / rectw * 15
                    });
                    //third point
                    data.push({
                        'x': text_loc[word1].x * 1 / 6 +
                            text_loc[word2].x * 5 / 6,
                        'y': text_loc[word1].y - Math.abs(
                            text_loc[word1].x - text_loc[
                                word2].x) / rectw * 15
                    });
                    //third point
                    data.push(text_loc[word2]);
                } else {
                    //first point
                    data.push(text_loc[word1]);
                    //second point
                    data.push({
                        'x': text_loc[word1].x - Math.abs(
                            text_loc[word1].y - text_loc[
                                word2].y) / recth * 20,
                        'y': text_loc[word1].y * 5 / 6 +
                            text_loc[word2].y * 1 / 6
                    });
                    //third point
                    data.push({
                        'x': text_loc[word1].x - Math.abs(
                            text_loc[word1].y - text_loc[
                                word2].y) / recth * 20,
                        'y': text_loc[word1].y * 1 / 6 +
                            text_loc[word2].y * 5 / 6
                    });
                    //fourth point
                    data.push(text_loc[word2]);
                }
                return lineFunction(data);
            })
            .attr('class', function(d, i) {
                let word = sen[d[0]];
                return word + '_' + d[0] + '_path';
            })
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .style("stroke-dasharray", "4,4")
            .style("marker-end", "url(#arrow)");

        //component rect
        canvas.selectAll('.dep_tree_rel_text').data(sen_dep_tree).enter()
            .append('rect')
            .attr('width', rectw / 2)
            .attr('height', recth / 2)
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('x', function(d, i) {
                let word1 = sen[d[0]] + d[0],
                    word2 = sen[d[2]] + d[2];

                if (horv == 'h') {
                    return (text_loc[word1].x + text_loc[word2].x) / 2 -
                        rectw / 4;
                } else {
                    return text_loc[word1].x - Math.abs(text_loc[word1]
                            .y - text_loc[word2].y) / recth * 20 -
                        rectw / 4
                }
            })
            .attr('y', function(d, i) {
                let word1 = sen[d[0]] + d[0],
                    word2 = sen[d[2]] + d[2];
                if (horv == 'h')
                    return text_loc[word1].y - Math.abs(text_loc[word1]
                            .x - text_loc[word2].x) / rectw * 15 -
                        recth / 4;
                else
                    return (text_loc[word1].y + text_loc[word2].y) / 2 -
                        recth / 4;
            })
            .attr('class', function(d, i) {
                let word = sen[d[0]];
                return word + '_' + d[0] + '_rect';
            })
            .attr('font-size', 8)
            .attr('fill', 'white')
            .style('stroke', 'gray')
            .style('stroke-width', '1px');


        //component text
        canvas.selectAll('.dep_tree_rel_text').data(sen_dep_tree).enter()
            .append('text')
            .text(function(d) {
                return d[1]
            })
            .attr('width', rectw / 2)
            .attr('height', recth / 2)
            .attr('x', function(d, i) {
                let word1 = sen[d[0]] + d[0],
                    word2 = sen[d[2]] + d[2];

                if (horv == 'h') {
                    return (text_loc[word1].x + text_loc[word2].x) / 2;
                } else {
                    return text_loc[word1].x - Math.abs(text_loc[word1]
                        .y - text_loc[word2].y) / recth * 20
                }
            })
            .attr('y', function(d, i) {
                let word1 = sen[d[0]] + d[0],
                    word2 = sen[d[2]] + d[2];
                if (horv == 'h')
                    return text_loc[word1].y - Math.abs(text_loc[word1]
                        .x - text_loc[word2].x) / rectw * 15;
                else
                    return (text_loc[word1].y + text_loc[word2].y) / 2;
            })
            .attr('class', function(d, i) {
                let word = sen[d[0]];
                return word + '_' + d[0] + '_text';
            })
            .attr('font-size', 10)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central");

    }

}
