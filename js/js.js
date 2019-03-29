(function($){
	$(document).ready(function(){
		//function for the button plot
		$('#plot').click(function(){
			var code=$('#input-code').val();
			var lines=new Array();
			var i=j=0;
			while (i>=0){
				i=code.indexOf('{',j);
				j=code.indexOf('}',i);
				if (i!=-1){
					var line=code.slice(i,j+1);
					$.each(['min_response_time', 'max_response_time','os','browser'],function(i,key){
				        line=line.replace("'"+key+"'",key);
				    });
					$.each(['type','timestamp','select','group','os','browser','min_response_time', 'max_response_time','begin','end'],function(i,key){
				        line=line.replace(key,'"'+key+'"');
				    });
					line=line.replace(/'/g,'"');
					lines.push($.parseJSON(line));
				}
			};

			//analyzing the values of 'start', 'stop' and 'span'
			var start=stop=span=0;
			for (var i=0;i<lines.length;i++){
				if (lines[i].type=='start'){
					start=i;
					break
				}
			};
			for (var i=start;i<lines.length;i++){
				if (lines[i].type=='span'){
					span=i;
					break
				}
			};
			for (var i=span;i<lines.length;i++){
				if (lines[i].type=='stop'){
					stop=i;
					break
				}
			};

			if (start<span<stop){
				//capturing informations
				t1=lines[span].begin;
				t2=lines[span].end;
				labels=new Array();
				values=new Array();
				for (var i=span+1; i<stop;i++){
					var a=lines[i].os;
					var b=lines[i].browser;
					a=a.substr(0,1).toUpperCase()+a.substr(1);
					b=b.substr(0,1).toUpperCase()+b.substr(1);
					var label_1=a+' '+b+' Min Response Time';
					var label_2=a+' '+b+' Max Response Time';
					if (lines[i].timestamp==t1){
						labels.push(label_1);
						labels.push(label_2);
						values.push([lines[i].min_response_time,-1]);
						values.push([lines[i].max_response_time,-1]);
					}
					else if (lines[i].timestamp==t2){
						j=labels.indexOf(label_1);
						if (j>=0){
							values[j][1]=lines[i].min_response_time;
							values[j+1][1]=lines[i].max_response_time;
						}
						else {
							values.splice(j+1,1);
							values.splice(j,1);
							labels.splice(j+1,1);
							labels.splice(j,1);
						}
					}
				}
				
				for (var i=values.length-1;i>=0;i--){
					if (values[i][1]==-1){
						values.splice(i,1);
						labels.splice(i,1);
					}
				}
				google.charts.setOnLoadCallback(drawChart);

			}
			else {
				alert('Your data set is incomplete!');
			}

		});
		google.charts.load('current', {packages: ['corechart','line']});
		$('#container').show();

		function drawChart(){
            // Define the chart to be drawn.
            var data=new google.visualization.DataTable();
            data.addColumn('string', 'Times');
            $.each(labels,function(i,v){
		        data.addColumn('number',v);
		    });
		    t1=new Date(t1);
		    t2=new Date(t2);

		    t1=t1.getHours()+':'+t1.getMinutes();
		    t2=t2.getHours()+':'+t2.getMinutes();
		    var rows=[[t1+''],[t2+'']];
		    $.each(values,function(i,v){
		        rows[0].push(v[0]);
		        rows[1].push(v[1]);
		    });
            data.addRows(rows);
               
            // Set chart options
            var options = {'title' : '',
               hAxis: {
                  title: ''
               },
               vAxis: {
                  title: ''
               },
            };

            // Instantiate and draw the chart.
            var chart=new google.visualization.LineChart(document.getElementById('container'));
            chart.draw(data,options);
	    }
	});
})(jQuery);