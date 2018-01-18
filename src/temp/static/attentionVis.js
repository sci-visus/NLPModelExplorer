let attention_src_filter_node = [],
    attention_targ_filter_node = [],
    attention_para = null;

function load_data(json, callback){
	$.ajax({
		url:'/_getData',
		type:'POST',
		contentType:'application/json',
		data:JSON.stringify(json),
		dataType:'json',
		success:function(para){
			callback(para);
		}
	});
}

function load_sentences(callback){
	$.ajax({
		url:'/_getSentences',
		type:'POST',
		contentType:'application/json',
		dataType:'json',
		success:function(para){
			callback(para);
		}
	});
}

function init_vis(para){
	let s_sens = para.source,
		t_sens = para.target;
	
	let source_string_buffer = '';
	s_sens.forEach(d=>{
		source_string_buffer += '<option>'+d+'</option>';
	});
	$('#source_sentences').html(source_string_buffer);

	let target_string_buffer = '';
	t_sens.forEach(d=>{
		target_string_buffer += '<option>'+d+'</option>';
	});
	$('#target_sentences').html(target_string_buffer);

	load_data({'index':0, 'sen1':s_sens[0], 'sen2':t_sens[0]}, draw_Attention_matrix);
}

function draw_Attention_matrix(matrix, row, col){
	
	attention_para = para;
	let matrix = para.matrix,
		sen1 = [''].concat(para.sen1),
		sen2 = [''].concat(para.sen2);

	let row = sen1.length;
	let col = sen2.length;
	let rectw = 60, recth = 30;
	let width = col * rectw;
	let height = row * recth;
	let X = 800, Y = 400, xpadding = 50, ypadding = 20;
	let colorscale = d3.interpolateRdBu;//d3.scaleLinear().domain([1, 0]).range(['white', 'red']);//

	//clean canvas
	$('#canvas').html('');

	
	
	
	//draw top targ sentence parser tree
	draw_sen_parser_tree(canvas.append('g'), X + rectw, 50, para.sen1_tree.ROOT[0], true, 1); 
	draw_sen_parser_tree(canvas.append('g'), 50, Y + recth, para.sen2_tree.ROOT[0], false, 1);
	
	
	
	//draw heatmap
	/*canvas.append('g').selectAll('.collabeltext')
		.data(sen2)
		.enter()
		.append('text')
		.text(d=>{return d;})
		.attr('x', (d, i)=>{
			return X + i * rectw + rectw/2;
		})
		.attr('y', Y-5)
		.attr("font-family", "sans-serif")
		.attr("font-size", "14px")
		.attr("text-anchor", "middle");*/
	
	/*canvas.append('g').selectAll('.rowlabeltext')
		.data(sen1)
		.enter()
		.append('text')
		.text(d=>{return d;})
		.attr('x', X - rectw)
		.attr('y', (d, i)=>{
			return Y + i  * recth + recth/2;
		})
		.attr("font-family", "sans-serif")
		.attr("font-size", "14px")
		.attr("dominant-baseline", "central");*/
	
	canvas.append('g').selectAll('.attentionMatrixRect')
		.data(matrix)
		.enter()
		.append('rect')
		.attr('x', (d, i)=>{
			return X + i % col * rectw;
		})
		.attr('y', (d, i)=>{
			return Y + Math.floor(i / col) * recth;
		})
		.attr('width',rectw)
		.attr('height',recth)
		.style('stroke', 'black')
		.style('stroke-width', '1px')
		.style('fill',d=>{return colorscale(1-d);});
	
	linearGradient = canvas.append('defs').append('linearGradient')
		.attr('id','attention_heatmapg_gradient')
		.attr('x1', '0%')
		.attr('y1', '0%')
		.attr('x2', '0%')
		.attr('y2', '100%');
	
	for(let i = 0; i <= 10; i++){
		linearGradient.append('stop')
			.attr('offset', (i * 10) + '%')
			.attr('stop-color', colorscale(i/10));
	}
	linearGradient.append('stop')
			.attr('offset', '100%')
			.attr('stop-color', colorscale(1));
			
	canvas.append('rect')
		.attr('x', X + (col + 1) * rectw)
		.attr('y', Y )
		.attr('width', 30)
		.attr('height', row * recth)
		.style('fill', 'url(#attention_heatmapg_gradient)');
	
	$('#result_label').html('result:'+para.label);
		
}

function draw_sen_parser_tree(canvas, x, y, tree, isTarg, depth){
	//next level tree
	let key = Object.keys(tree);
	
	//check whether is middle node of leaf of tree
	if(typeof(tree) == 'string'){
		let w = 60,
		    h = 30;
		canvas.selectAll('.treenode').data([tree]).enter().append('rect')
			.attr('x', x)
			.attr('y', y)
			.attr('rx', 5)
			.attr('ry', 5)
			.attr('width', w)
			.attr('height', h)
			.style('fill', 'white')
			.style("stroke", 'gray')
			.style("stroke-width", 1);
		canvas.selectAll('.treenode_text').data([tree]).enter().append('text')
			.text(d=>{return d;})
			.attr('x', d=>{return x + w/2})
			.attr('y', y + h/2)
		        .attr("text-anchor", "middle")
		        .attr("dominant-baseline", "central")
		        .style('font-size', 8);
		return isTarg?w:30;
	}
	else{
		//render the tree in hierachical or horizontal
		if(isTarg){
			let w = 0,
			h = 20,
			flag = attention_src_filter_node.indexOf(key+depth) == -1;
			
			if(flag){
				//check whether current node is leave of middle node
				for(let i = 0; i < tree[key].length; i++)
					w += draw_sen_parser_tree(canvas.append('g'), x + w, y + h, tree[key][i], isTarg, depth+1);
			}else{
				w = 60;
			}
			
			canvas.selectAll('.treenode').data([key]).enter().append('rect')
				.attr('x', (d, i)=>{return x + i * w;})
				.attr('y', y)
				.attr('rx', 5)
				.attr('ry', 5)
				.attr('width', w)
				.attr('height', h)
				.style('fill', flag?'white':'steelblue')
				.style("stroke", 'gray')
				.style("stroke-width", 1)
				.on('click', d=>{
					let index = attention_src_filter_node.indexOf(d+depth)
					if(index >-1){
						attention_src_filter_node.splice(index, 1);
					}else{
						attention_src_filter_node.push(d+depth);
					}
					update();
				});
			
			canvas.selectAll('.treenode_text').data([key]).enter().append('text')
				.text(d=>{return d[0];})
				.attr('x', (d, i)=>{return x + w/2})
				.attr('y', y + h/2)
		        	.attr("text-anchor", "middle")
		        	.attr("dominant-baseline", "central")
		        	.style('font-size', 8);
			return w;
		}else{
			let h = 0,
			w = 60,
			flag = attention_targ_filter_node.indexOf(key+depth) == -1;
			if(flag){
				for(let i = 0; i < tree[key].length; i++){
					//check whether current node is leave of middle node
					h += draw_sen_parser_tree(canvas.append('g'), x + 60, y + h, tree[key][i], isTarg, depth+1);
				}
			}
			else{
				h = 30;
			}
			canvas.selectAll('.treenode').data([key]).enter().append('rect')
				.attr('x', (d, i)=>{return x + i * w;})
				.attr('y', y)
				.attr('rx', 5)
				.attr('ry', 5)
				.attr('width', w)
				.attr('height', h)
				.style('fill', flag?'white':'steelblue')
				.style("stroke", 'gray')
				.style("stroke-width", 1)
				.on('click', d=>{
					//TODO: check whether the node in the filter_node and re-render the view
					let index = attention_targ_filter_node.indexOf(d+depth)
					if(index >-1){
						attention_targ_filter_node.splice(index, 1);
					}else{
						attention_targ_filter_node.push(d+depth);
					}
					update();
				});
		
			canvas.selectAll('.treenode_text').data([key]).enter().append('text')
				.text(d=>{return d;})
				.attr('x', (d, i)=>{return x + w/2})
				.attr('y', y + h/2)
	        		.attr("text-anchor", "middle")
	        		.attr("dominant-baseline", "central")
	        		.style('font-size', 8);
			return h;
		}
	}
}

//update the visualization base on current tree structure.
function update(){
	matrixAggregation();
	//draw_Attention_matrix(attention_para);
}


function getAggregateIndexs(tree, filter_set, isAggregate, index, aggregateindex, depth){
	let key = Object.keys(tree);
	
	if(typeof(tree) == 'string'){
		index[0]++;
		if(isAggregate)
			aggregateindex.push(index[0]);
	}else{
		//aggregate all nodes under this node.
		if(filter_set.indexOf(key+depth) > -1 && !isAggregate){
			isAggregate = true;
			let indexs = []
			for(let i = 0; i < tree[key].length; i++){
				getAggregateIndexs(tree[key][i], filter_set, isAggregate, index, indexs, depth+1);
			}
			if(indexs.length > 1)
				aggregateindex.push(d3.extent(indexs));
		}
		else{
			for(let i = 0; i < tree[key].length; i++){
				getAggregateIndexs(tree[key][i], filter_set, isAggregate, index, aggregateindex, depth+1);
			}
		}
	}
}

function matrixAggregation(){
	let col_filter_index = [],
	row_filter_index = [];
	
	getAggregateIndexs(attention_para.sen1_tree.ROOT[0], attention_src_filter_node, false, [-1], col_filter_index, 1);
	getAggregateIndexs(attention_para.sen2_tree.ROOT[0], attention_targ_filter_node, false, [-1], row_filter_index, 1);
	
	let matrix = [],
	row = attention_para.sen1.length + 1,
	col = attention_para.sen2.length + 1;
	
	
	console.log(col_filter_index);
	console.log(row_filter_index);
	
	//aggregate col
	for(let i = 0; i < attention_para.matrix.length; i++){
		let index = i % col,
		flag = false;
		
		for(let j = 0; j < col_filter_index.length; j++){
			if(index==col_filter_index[j][0]){
				let l = col_filter_index[j][1] - col_filter_index[j][0];
				matrix.push(d3.max(attention_para.matrix.slice(i, l+1)));
				i += l;
				flag = true;
				break;
			}
		}
		//no aggregate element
		if(!flag)
			matrix.push(attention_para.matrix[i]);
		
	}
	
	//aggregate row
	for(let i = 0; i < matrix.length; i++){
		
	}
	
	attention_para.matrix = matrix;
	draw_Attention_matrix(attention_para)
	
	
	
	
}

function bindingEvent(){
	$('#source_sentences').change(function(){
		let index = $('#source_sentences option:selected').index(),
			sen1 = $('#source_sentences').val();
		
		$('#target_sentences').prop('selectedIndex', index);
		let	sen2 = $('#target_sentences').val();
		
		load_data({'index':index, 'sen1':sen1, 'sen2':sen2}, draw_Attention_matrix);
	});

	$('#target_sentences').change(function(){
		let index = $('#target_sentences option:selected').index(),
			sen2 = $('#target_sentences').val();
		
		$('#source_sentences').prop('selectedIndex', index);
		let sen1 = $('#source_sentences').val();

		
		load_data({'index':index, 'sen1':sen1, 'sen2':sen2}, draw_Attention_matrix);
	});
}

bindingEvent();
load_sentences(init_vis)
	
