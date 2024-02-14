import { useEffect, useState } from "react";
import * as d3 from "d3"
import Filters from "./Filters";
import { act } from "react-dom/test-utils";



function AreaChart ({filteredData, handleYearChoice, handleQuaterChoice, handleLocationChoice, activeFilter}) {
    // SVG
    const width = 1000
    const height = 500

    const margin = {
        top: 70,
        right: 100,
        bottom: 70,
        left: 40
    };

    // chart in SVG
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;



    useEffect(() => {
        // data = data.filter(a => a.location === "Seattle")
        const svg = d3.select(".line-chart-container")
            .append("svg")
            .attr("class", "area-chart")
            .attr("viewBox", `0 0 ${width} ${height}`)
        
        const innerChart = svg.append("g").attr("class", "area").attr("transform", `translate(${margin.left}, ${margin.top})`);
        
        // we are creating scale for x axis whih will reflect dates
        // const firstDate = d3.min(data, d => d.date) // if we count like this it'll work but it will start axis with february
        const firstDate = new Date(d3.min(filteredData, d => d.date).getFullYear(), d3.min(filteredData, d => d.date).getMonth(), 1, 0, 0, 0); // making this it will display the label with the year (2021) instead of January and then display the months starting from February, will change 2021 to Jan with tick when creating axisBottom
        
        const lastDate = d3.max(filteredData, d => d.date)

        const xScale = d3.scaleTime([firstDate, lastDate], [0, innerWidth])
        const T = xScale.ticks(d3.timeMonth)
        const f = xScale.tickFormat();
        const axixXTicks = T.map(f);

        let bottomAxis
        if (axixXTicks.length <= 12) {
          bottomAxis = d3
            .axisBottom(xScale) // The axis generator is a function that constructs the elements composing an axis
            .ticks(d3.timeSunday)
            .tickSizeOuter(0)
            .tickFormat(d3.timeFormat("%d %b")); // Ticks are the short vertical lines on the axis; %b is format which will display abbreviations of the months
        } else {
          bottomAxis = d3
            .axisBottom(xScale) // The axis generator is a function that constructs the elements composing an axis
            .ticks(d3.timeMonth)
            .tickSizeOuter(0)
            .tickFormat(d3.timeFormat("%b %Y")); // Ticks are the short vertical lines on the axis; %b is format which will display abbreviations of the months
        }
        

        // inserting axis-x
        innerChart
            .append("g")
            .attr("class", "axis-x")
            .attr("transform", `translate(0, ${innerHeight})`) // to the bottom of svg, after the planned chart
            .call(bottomAxis) // For axis to appear on the screen, we need to call the axis generator from within a D3 selection

        // now the name of the month is displayed right under the tick (делитель на оси Х), we want to move the to the center of the отрезок
        // it requires some calculations because months have different number of days and we need to calculate the center
        
       
        
        if (activeFilter.quater !== "Whole year") {
            d3
                .selectAll(".axis-x text") // selecting text elements in the group which represents the tick and the month name
                //.attr("transform", dateTransformAttr)
                .attr("y", "10px")
        } else if (activeFilter.quater === "Whole year" && activeFilter.year !== "All years") {
            d3
                .selectAll(".axis-x text") // selecting text elements in the group which represents the tick and the month name
                .attr("transform", "translate(-22,13)rotate(-45)")
                .attr("y", "10px")
        } else {
            d3
                .selectAll(".axis-x text") // selecting text elements in the group which represents the tick and the month name
                .attr("transform", "translate(-21,22)rotate(-45)")
                .attr("x", d => { // here we are iterations NOT through the dataset but through the dates on our asix-s, which are the first dates of each months
                    const currentMonth = d;
                    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
                    return (xScale(nextMonth) - xScale(currentMonth)) / 2;
                })
                .attr("y", "10px")
        }

       

        // creating scale for y axis based on the temperature values
        const maxTemp = d3.max(filteredData, d => d.temp_max);
        const minTemp = d3.min(filteredData, d => d.temp_min);
        const yScale = d3.scaleLinear([minTemp, maxTemp], [innerHeight, 0])

        const leftAxis = d3.axisLeft(yScale).tickSizeOuter(0).tickSize(innerWidth * -1);
        innerChart
            .append("g")
            .attr("class", "axis-y")
            .call(leftAxis)
            .call(g => g.select(".domain").remove());

        d3.selectAll(".axis-y text")
            .attr("transform", "translate(-5)")

             // changing font settings for both axis
        d3.selectAll(".axis-x text, .axis-y text")
            .style("font-family", "Roboto, sans-serif")
            .style("font-size", "11px");

        // adding label for vertical axis so user won't have to guess what are these numbers
         svg
         .append("text")
         .text("Temperature (°C)")
        .attr("y", 40);

      const aubergine = "#75485E";
         // adding legend
      svg
          .append("text")
          .text("temperature fluctuations")
          .attr("y", 30)
          .attr("x", innerWidth - 150);
      svg
          .append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("y", 21)
          .attr("x", innerWidth - 165)
          .attr("fill", aubergine)
          .attr("opacity", "0.4");

      if (activeFilter.quater !== "Whole year") {
        svg
            .append("text")
            .text("average temperature")
            .attr("y", 30)
            .attr("x", innerWidth - 350);
        svg
            .append("circle")
            .attr("r", 5)
            // .attr("height", 10)
            .attr("cy", 25)
            .attr("cx", innerWidth - 358)
            .attr("fill", aubergine);
      }

        // AREA ILLUSTRATING THE MIN AND MAX TEMPERATURES
        const areaGenerator = d3
        .area()
        .x(d => xScale(d.date))
        .y0(d => yScale(d.temp_min))
        .y1(d => yScale(d.temp_max))
        .curve(d3.curveCatmullRom);

        innerChart
        .append("path")
        .attr("d", areaGenerator(filteredData))
        .transition()
          .duration(1000)
          .ease(d3.easeCubicOut)
          .attr("fill", aubergine)
          .attr("fill-opacity", 0.4);

          // rendering average temperatures for each date
          if (activeFilter.quater !== "Whole year") {
            innerChart
            .selectAll("circle")
            .data(filteredData)
            .join("circle")
            .attr("cy", d => yScale((d.temp_max + d.temp_min) / 2))
            .attr("cx", d => xScale(d.date))
            .attr("r", 4)
            .attr("fill", aubergine)

            const lineGenerator = d3
                .line()
                .x(d => xScale(d.date))
                .y(d => yScale((d.temp_max + d.temp_min) / 2))
                // необязательная строка. если нас устраивают угловатые линии, можно обойтись без нее. curve создает плавность соединения точек
                // there are different curves in d3: d3.curveBasis, d3.curveBundle, etc. Or even squared curves -- d3.curveStep
                .curve(d3.curveCatmullRom);

            // appending path element and setting d attribute for it and using our line generator function
            innerChart
                .append("path")
                .attr("d", lineGenerator(filteredData))
                .attr("fill", "none") // because by default SVG paths are filled with black and connected
                .attr("stroke", aubergine);
          }


// tooltip
        const createTooltip = (data) => {

            const tooltipWidth = 100;
            const tooltipHeight = 150;
            const textColor = "#494e4f";
            const textLineHeight = 22;

            const tooltip = innerChart
                .append("g")
                .attr("class", "tooltip");

            tooltip
                .append("rect")
                .attr("y", -20)
                .attr("width", tooltipWidth)
                .attr("height", tooltipHeight)
                .attr("opacity", "0.4")
                .attr("rx", "10")
                .attr("fill", "#48755f")
            // Append the vertical line
            tooltip
                .append("line")
                .attr("x1", 0)
                .attr("x2", 0)
                .attr("y1", -10)
                .attr("y2", innerHeight)
                .attr("stroke", "#48755f")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "6 4")
                // .attr("opacity", "0.6");

            // Append the year at the bottom of the tooltip
            const firstYear = d3.min(data, d => d.date);


            // Append the text element that will wrap to sales breakdown per music format
            const tooltipContent = tooltip
                .append("g")
                .attr("transform", `translate(${-1 * tooltipWidth/2}, ${-1 * margin.top + 30})`);
            const tooltipText = tooltipContent
                .append("text")
                .attr("class", "tooltip-content")
                .style("font-size", "14px")
                .style("font-weight", 500)
                .style("fill", textColor);

          const tooltipYear = tooltipContent
              .append("text")
              .attr("class", "tooltip-year")
              .attr("x", tooltipWidth)
              .attr("y", 50)
              .style("font-size", "12px")
              .style("font-weight", 700)
              .style("fill", textColor)
              .attr("text-anchor", "middle")
              .text(firstYear.toLocaleDateString('en-GB'));
              // .text(firstYear.toISOString().split('T')[0]);
            // Append the sales breakdown per music format and a colored circle for each format
            const dataFirstYear = data.find(item => item.date === firstYear);
            ['temp_min', 'temp_max'].forEach((format, i) => {
              tooltipText
                  .append("tspan")
                  .attr("x", 60)
                  .attr("y", i * 2 * textLineHeight + 80)
                  .text(format === "temp_min" ? "Minimum" : "Maximum");


              tooltipText
                  .append("tspan")
                  .attr("x", 60)
                  .attr("y", i * 2* textLineHeight + 100)
                  .text(dataFirstYear[format] + "°C");


            });

        };

          let tooltipData = ['temp_min', 'temp_max']
        const handleMouseEvents = (data) => {
            d3.selectAll("svg path")
                .on("mousemove", e => {
                    // Set the position of the tooltip according to the x-position of the mouse
                    const xPosition = d3.pointer(e)[0];
                    d3.select(".tooltip")
                        .attr("transform", `translate(${xPosition}, 0)`);

                    // Get the year corresponding to the x-position and set the text of the tooltip"s year label
                    // scaleX is a continuous scale, which means it can return any floating number
                    // Since the years are integers, we need to round the value returned by the scale
                    const dateFromScale = xScale.invert(xPosition);

                    d3.select(".tooltip-year").text(dateFromScale.toLocaleDateString('en-GB'));
                    // d3.select(".tooltip-year").text(dateFromScale.toISOString().split('T')[0]);


                    // Populate the tooltip content
                    const yearData = data.find(item => {
                        return item.date.toISOString().split('T')[0] === dateFromScale.toISOString().split('T')[0]
                    });

                    tooltipData.forEach(format => {
                        d3.select(`.sales-${format}`)
                            .text(yearData[format]);
                    });

                });

        };
        createTooltip(filteredData)
        handleMouseEvents(filteredData)

       return () => {
        svg.remove()
        }
    }, [filteredData])

    return (
        <div className="line-chart-container">
          <h2>Daily Temperature Fluctuations</h2>
        </div>
    )
}

export default AreaChart