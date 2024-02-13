import { useEffect, useRef, useState } from "react";
import * as d3 from "d3"
import Filters from "./Filters";

const intialFiltersState = {
    location: "Seattle",
    year: "All years",
    quater: "Whole year"
}

const quaters = {
    Q1: {
        start: "Jan 1",
        end: "Mar 31"
    },
    Q2: {
        start: "Apr 1",
        end: "Jun 30"
    },
    Q3: {
        start: "Jul 1",
        end: "Sep 30"
    },
    Q4: {
        start: "Oct 1",
        end: "Dec 31"
    }
}

function AreaChart ({data}) {
    const [activeFilter, setActiveFilter] = useState(intialFiltersState)
    const [filteredData, setFilteredData] = useState(data);

    // SVG
    const width = 1000
    const height = 500

    const margin = {
        top: 40,
        right: 70,
        bottom: 70,
        left: 70
    };

    // chart in SVG
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    function handleLocationChoice(newLocation) {
        console.log(newLocation)
        setActiveFilter(prev => {
            return {
                ...prev,
                location: newLocation
            }
        })
    }

    function handleYearChoice(newYear) {
        console.log(activeFilter)
        setActiveFilter(prev => {
            return {
                ...prev,
                year: newYear,
                quater: "Whole year"
            }
        })
    }

    function handleQuaterChoice(newQuater) {
        console.log(activeFilter)
        setActiveFilter(prev => {
            return {
                ...prev,
                quater: newQuater
            }
        })
    }

    useEffect(() => {
        console.log(new Date(new Date(quaters["Q2"].start + " " + 2012)))
        const filtered = data.filter((d) => {
            return d.location === activeFilter.location
              && ((activeFilter.year === "All years") ? true : d.date.getFullYear() === activeFilter.year)
              && ((activeFilter.quater === "Whole year") 
                  ? true 
                  : (d.date >= new Date(quaters[activeFilter.quater].start + " " + d.date.getFullYear())
                    && d.date <= new Date(quaters[activeFilter.quater].end + " " + d.date.getFullYear()))
                  )
        })
        
        setFilteredData(filtered)
    }, [activeFilter])

    useEffect(() => {
        // data = data.filter(a => a.location === "Seattle")
        console.log(activeFilter)
        const svg = d3.select(".line-chart-container")
            .append("svg")
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
        console.log(T.map(f))

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

        const leftAxis = d3.axisLeft(yScale).ticks(10).tickSizeOuter(0);
        innerChart
            .append("g")
            .attr("class", "axis-y")
            .call(leftAxis);

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
        .attr("y", 20);

        const aubergine = "#75485E";
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
          .attr("fill-opacity", 0.2);

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
            

       return () => {
        svg.remove()
        }
    }, [filteredData])

    return (
        <div className="line-chart-container">
            <Filters 
                changeLocation={handleLocationChoice} 
                changeYear={handleYearChoice}
                showQuaterChoice={activeFilter.year !== "All years"}
                changeQuater={handleQuaterChoice}
            />
        </div>
    )
}

export default AreaChart