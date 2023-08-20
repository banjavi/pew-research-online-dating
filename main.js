// make responsive 

window.addEventListener('resize', () => {
    drawChart(menGraphData, '#chart-men', menGraph_menColor, menGraph_womenColor);
    drawChart(womenGraphData, '#chart-women', womenGraph_menColor, womenGraph_womenColor);
});


let globalData = [];
let menGraphData = [];
let womenGraphData = [];

// define your filter conditions for each chart
const menGraphAttributes = 
[
    "Encountered scammers on dating apps", 
    "Have ever paid to use a dating app",
    "Insecure because of the lack of messages they have received",
    "Single-and-looking adults that have used dating apps within past year",
    "Disappointed by the people they have seen",
    "Believe people on dating apps have too many options",
    "Believe dating app algorithms could predict love"
]; 
const womenGraphAttributes = 
[
    "Been sent a sexually explicit message or image they didn't ask for", 
    "Had someone continue to contact them after they said they were not interested",
    "Been called an offensive name",
    "Been threatened with physical harm",
    "Overwhelmed by the number of messages they have received",
    "Rate their own personal experiences with online dating as negative",
    "Believe online dating is not safe",

]; 

menGraph_menColor = '#0000FF'
menGraph_womenColor = '#C0BFBF'
womenGraph_menColor = '#BFC0C0'
womenGraph_womenColor = '#FF0000'

document.addEventListener('DOMContentLoaded', function () {
    d3.csv('data/topline_data_2022.csv')
        .then((loadedData) => {
            //console.log(loadedData)
            globalData = loadedData.map(d => ({
                attribute: d.Attribute,
                percent_men: +d.Percent_Men,
                percent_women: +d.Percent_Women
            }));
            //console.log(globalData)

            // filter globalData based on the conditions
            menGraphData = globalData.filter(d => menGraphAttributes.includes(d.attribute));
            womenGraphData = globalData.filter(d => womenGraphAttributes.includes(d.attribute));


            drawChart(menGraphData, '#chart-men', menGraph_menColor,menGraph_womenColor);
            drawChart(womenGraphData, '#chart-women', womenGraph_menColor, womenGraph_womenColor);
        })
        .catch((error) => {
            console.log('Error loading data:', error);
        });
});

function drawChart(data, containerId, menColor, womenColor) {
    const container = d3.select(containerId);
    const containerNode = container.node();
    const width = containerNode.clientWidth;
    const height = containerNode.clientHeight + 120;
    const margin = { top: 20, right: 30, bottom: 40, left: 200 };

    // remove existing SVG elements
    container.selectAll('svg').remove();


    const tooltip = d3.select(containerId)
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('padding', '8px')
    .style('border', '1px solid lightgrey')
    .style('border-radius', '4px');


    // create container
    const svg = container
        .append('svg')
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
       //.style('background-color', 'lightgrey') // add this line
        .append('g')
        .attr('transform', `translate(${margin.left + 100}, ${margin.top + 5})`);

    // scales
    const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.min(Math.max(d.percent_men, d.percent_women)) + 10, 100)])
    .range([0, width - margin.left - margin.right + 80]); // add extra length (e.g., 50) to the range

    const yScale = d3.scaleBand()
        .domain(data.map(d => d.attribute))
        .range([0, height - margin.top - margin.bottom])
        .padding(.4);

    const alternatingColors = ['#f5f5f5', '#ffffff']; // Light gray and white
    const backgroundBarHeight = yScale.bandwidth() * 1.5
    
    // draw alternating background bars
    svg.selectAll('.background-rect')
        .data(data)
        .join('rect')
        .attr('class', 'background-rect')
        .attr('fill', (d, i) => alternatingColors[i % alternatingColors.length])
        .attr('x', 0)
        .attr('y', d => yScale(d.attribute) - (backgroundBarHeight - yScale.bandwidth()) / 2)
        .attr('width', width - margin.left - margin.right + 80)
        .attr('height', backgroundBarHeight + 5)

    //console.log(data)

    // draw bars for men
    svg.selectAll('.bar-men')
        .data(data)
        .join('rect')
        .attr('class', 'bar-men')
        .attr('fill', menColor)
        .attr('x', 0)
        .attr('y', d => yScale(d.attribute))
        .attr('width', 0) 
        .attr('height', yScale.bandwidth() / 2)
        .on('mouseenter', function(event, d) {
            d3.select(this)
                .style('opacity', 0.7);
            tooltip.style('opacity', 1)
                .html(`${d.attribute}<br>Men: ${d.percent_men}%<br>Women: ${d.percent_women}%`)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 30) + 'px');
          })
          .on('mouseleave ', function(event, d) {
            d3.select(this).
                style('opacity', 1);
            tooltip.style('opacity', 0);
          })
        .transition()
        .duration(1000) 
        .attr('width', d => xScale(d.percent_men))
        

    // draw bars for women
    svg.selectAll('.bar-women')
        .data(data)
        .join('rect')
        .attr('class', 'bar-women')
        .attr('fill', womenColor)
        .attr('x', 0)
        .attr('y', d => yScale(d.attribute) + yScale.bandwidth() / 2 + 2)
        .attr('width', 0) 
        .attr('height', yScale.bandwidth() / 2)
        .on('mouseenter', function(event, d) {
            d3.select(this)
                .style('opacity', 0.7);
            tooltip.style('opacity', 1)
                .html(`${d.attribute}<br>Men: ${d.percent_men}%<br>Women: ${d.percent_women}%`)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 30) + 'px');
          })
          .on('mouseleave ', function(event, d) {
            d3.select(this).
                style('opacity', 1);
            tooltip.style('opacity', 0);
          })
        .transition()
        .duration(1000) 
        .attr('width', d => xScale(d.percent_women))


    // text for men bars
    svg.selectAll('.label-men')
        .data(data)
        .join('text')
        .attr('class', 'label-men')
        .attr('x', d => xScale(d.percent_men) + 6) // 5 pixels to the right of the bar
        .attr('y', d => yScale(d.attribute) + yScale.bandwidth() / 4)
        .attr('dy', '0.35em') // Vertical alignment
        .text(d => `${d.percent_men}%`)
        .style('font-size', `${14}px`) 
        .attr('opacity', 0) 
        .transition()
        .delay(1000) // Wait for the bar animation to finish
        .duration(500) 
        .attr('opacity', 1); 

    // text for women bars
    svg.selectAll('.label-women')
        .data(data)
        .join('text')
        .attr('class', 'label-women')
        .attr('x', d => xScale(d.percent_women) + 6) // 5 pixels to the right of the bar
        .attr('y', d => yScale(d.attribute) + 3 * yScale.bandwidth() / 4)
        .attr('dy', '0.35em') 
        .text(d => `${d.percent_women}%`)
        .style('font-size', `${14}px`) 
        .attr('opacity', 0) 
        .transition()
        .delay(1000) 
        .duration(300) 
        .attr('opacity', 1); 

    // add the X axis
    const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickSizeInner(-(height - margin.top - margin.bottom))
        .tickSizeOuter(0)
        .tickFormat(d => `${d}%`); // Add the percentage sign to each tick value

   // add dotted lines
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(xAxis)
        .selectAll('.tick line') 
        .style('stroke-dasharray', '1,1')
        .style('stroke-width', '1')
        .style('stroke', 'rgb(205, 205, 205)');  

    // add X axis title
    svg.append('text')
        .attr('class', 'axis-title')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', height - margin.top - margin.bottom + margin.bottom * 0.8 + 15)
        .attr('text-anchor', 'middle')
        .text('Share of Respondents');

    // add the Y axis
    const yAxis = d3.axisLeft(yScale);
    svg.append('g')
        .call(yAxis)
        .selectAll('.tick text')
        .call(wrap, margin.left - 0)

    svg.selectAll('.tick text')
        .style('font-size', '14px'); // Replace 16px with the desired font size


    // draw color legend
    const legendData = [
        { label: 'Men', color: menColor },
        { label: 'Women', color: womenColor }
    ];
    
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${(width - margin.left - margin.right) / 2},${height - margin.top - margin.bottom + margin.bottom * 0.3 + 15})`);
    
    const legendItems = legend.selectAll('.legend-item')
        .data(legendData)
        .join('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(${i * 100}, 0)`);
    
    legendItems.append('rect')
        .attr('x', 0)
        .attr('y', 50)
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', d => d.color);
    
    legendItems.append('text')
        .attr('x', 16)
        .attr('y', 60)
        .text(d => d.label)
        .style('font-size', '14px');
    
    // calculate the total width of the legend
    const legendWidth = legendItems.nodes().reduce((acc, item) => {
        return acc + item.getBBox().width + 20;
    }, 0);
    
    // center the legend by adjusting the starting x position
    legend.attr('transform', `translate(${(width - margin.left - margin.right) / 2 - legendWidth / 2},${height - margin.top - margin.bottom + margin.bottom * 0.3 + 15})`);

}


// function for wrapping text, from Mike Bostock's example https://gist.github.com/mbostock/7555321
function wrap(text, width) {
    text.each(function () {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr('y'),
        dy = parseFloat(text.attr('dy')),
        dx = -1.1
        tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em').attr('dx', dx+ 'em');
  
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').attr('dx', dx + 'em').text(word);
        }
      }
      // conditional to align wrapped text with tick lines
      if (lineNumber > 0) {
        text.selectAll('tspan').attr('dy', function (_, i) {
          return (i - lineNumber / 2) * lineHeight + dy + 'em';
        });
      }

    });
  }


// grindlines for background bar charts 
function make_x_gridlines() {
    return d3.axisBottom(xScale)
        .ticks(5); // Adjust the number of ticks if needed
}
