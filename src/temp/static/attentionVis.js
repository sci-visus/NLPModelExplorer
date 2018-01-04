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

function draw_Attention_matrix(para){
	let matrix = para.matrix,
		sen1 = para.sen1.concat('\\n'),
		sen2 = para.sen2.concat('\\n');

	let row = sen1.length;
	let col = sen2.length;
	let rectw = 60, recth = 30;
	let width = col * rectw;
	let height = row * recth;
	let X = 200, Y = 100, xpadding = 50, ypadding = 20;
	let colorscale = d3.interpolateRdBu;//d3.scaleLinear().domain([1, 0]).range(['white', 'red']);//

	$('#canvas').html('');

	canvas = d3.select('#canvas').append('svg').attr('width', width * 1.8).attr('height', height * 2);
	canvas.append('g').selectAll('.collabeltext')
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
		.attr("text-anchor", "middle");
	
	canvas.append('g').selectAll('.rowlabeltext')
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
		.attr("dominant-baseline", "central");
	
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
	
	$('#result_label').html('result:'+para.label)
		
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
	
