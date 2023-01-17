
var margin = {top: 20, right: 200, bottom: 40, left: 80},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

var data;
var tooltip = d3.select("#tooltip").attr('opacity' , 0);


d3.csv("DesignubungGradingData.csv").then(function(dataset) {
    
    data = dataset
    data.forEach(element => {
        element.Grade = +element.Grade
    });

    drawLines()

})
function drawLines(){

    function tweenDash() {
        var l = this.getTotalLength(),
            i = d3.interpolateString("0," + l, l + "," + l);
        return function (t) { return i(t); };
    }
    function transition(selection) {
        selection.each(function(){
        d3.select(this).transition()
                    .duration(2000)
                    .attrTween("stroke-dasharray", tweenDash);
        })
            }

    d3.select('.svg').remove()
    // Create the svg canvas in the "graph" div
    var svg = d3.select("#lineChart")
    .style("width", width + margin.left + margin.right + "px")
    .style("height", height + margin.top + margin.bottom + "px")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "svg");

    var attribute = d3.select('#attribute-input').property('value')
    
    var nest = d3.nest().key(function(d) {
        return d[attribute];
      })
      .key(function(d){
        return +d.Grade;
    })
      .rollup(function(leaves) {
        return leaves.length;
      }).entries(data)

      var max =  d3.max(nest, function(c) { return d3.max(c.values, function(d) { return d.value; }); })

    // Set the ranges
    var x = d3.scaleLinear().domain(d3.extent(data, function(d) { return +d.Grade; })).range([0, width]);
    var y = d3.scaleLinear().domain([0,max]).range([height, 0]).nice()
    var color = d3.scaleOrdinal(d3.schemeCategory10);  

    // Define the line
    var valueLine = d3.line()
    .x(function(d) { return x(+d.key); })
    .y(function(d) { return y(+d.value); })

      // Set up the x axis
    var xaxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "x axis")
    .call(d3.axisBottom(x));

    //add label to x-axis
    svg.append("text")      // text label for the x axis
    .attr("transform", "translate("+ width/2 +"," + (height+margin.top+20) + ")")

        .style("text-anchor", "middle")
        .text("Grade");

      // Add the Y Axis
   var yaxis = svg.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(y)
                    .tickPadding(6));

    // Add a label to the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 60)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of persons per grade")
        .attr("class", "y axis label");


    
    nest.forEach(d=>{
        g = svg.append('g').attr('class' , d.key)

        d.values = d.values.sort((a,b) => (+a.key) - (+b.key))

        g
        .append("path")
        .attr('class' , 'line')
        .attr("d", valueLine(d.values))
        .attr('stroke' , color(d.key))
        .attr('fill' , 'none')

        g.selectAll("circle")
	    .data(d.values)
	    .enter()
	    .append("circle")
        .attr('cx' , d=>x(+d.key))
        .attr('cy' , d=>y(+d.value))
        .attr('r' , 4)
        .attr('fill' , color(d.key))
        .style('opacity' , 0)
        .on('mousemove', function(e){
            d3.select(this).style("cursor", "pointer").attr('r' , 7); 
            d3.select("#tooltip")
            .style('opacity' , 1)
              .html(d.key  +"<br><b>Grade:</b> "+ e.key+"<br><b>Number of people:</b> "+ e.value  )
              .style("left", ( d3.event.pageX)  +"px") 
              .style("top", (d3.event.pageY - 40) + "px")
              .style("fill-opacity","0.5")

           
        })
        .on('mouseout' , function(d){
            d3.select(this).style("cursor", "default").attr('r' , 4); 

            d3.select("#tooltip").style('opacity' , 0).html('')
              .style("left", (0) + "px") 
              .style("top", (0) + "px")
        }) 

        g.append("text")
        .attr('class' , 'labels')
		.attr("transform", "translate(" + (width+10) + "," + y(d.values[d.values.length-1].value) + ")")
		.attr("dy", ".35em")
		.attr("text-anchor", "start")
		.style("fill", color(d.key))
		.text(d.key).style('opacity' , 0);

    })

    transition(d3.selectAll(".line"))

    d3.selectAll('circle').transition()
    .duration(2500).style('opacity' , 1)

    d3.selectAll('.labels').transition()
    .duration(3000).style('opacity' , 1)

}