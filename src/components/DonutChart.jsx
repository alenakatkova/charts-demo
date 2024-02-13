import { useEffect, useRef, useState } from "react";
import * as d3 from "d3"
import Filters from "./Filters";

function AreaChart ({filteredData}) {
    const width = 1000
    const height = 500

    const margin = {
        top: 40,
        right: 70,
        bottom: 70,
        left: 70
    };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    useEffect(() => {
        // data = data.filter(a => a.location === "Seattle")
        const svg = d3.select(".donut-chart-container")
            .append("svg")
            .attr("class", "donut-chart")
            .attr("viewBox", `0 0 ${width} ${height}`)
        
        const innerChart = svg.append("g").attr("class", "donut").attr("transform", `translate(${margin.left}, ${margin.top})`);
        const xScale = d3.scaleBand();

        const defineScales = (data) => {
            xScale
                .domain(filteredData.map(d => d.weather))
                .range([0, innerWidth]);
        };

        const formattedData = filteredData.reduce((acc, curr) => {
            if (acc.hasOwnProperty(curr.weather)) {
                acc[curr.weather]++
            } else {
                acc[curr.weather] = 1
            }
            return acc
        }, {})

        let formattedArray = []
        for (let key in formattedData) {
            formattedArray.push({
                weather: key,
                amountOfDays: formattedData[key]
            })
        }

        const pieGenerator = d3.pie()
            .value(d => d.amountOfDays);
        const annotatedData = pieGenerator(formattedArray);
        console.log(annotatedData)

        const formatsInfo = [
            {id: "rain", label: "Rain", color: "#76B6C2"},
            {id: "sun", label: "Sun", color: "#4CDDF7"},
            {id: "drizzle", label: "Drizzle", color: "#20B9BC"},
            {id: "snow", label: "Snow", color: "#2F8999"},
            {id: "fog", label: "Fog", color: "#E39F94"},

        ];
        const colorScale = d3.scaleOrdinal();
        colorScale
            .domain(formatsInfo.map(f => f.id))
            .range(formatsInfo.map(f => f.color));

        const arcGenerator = d3.arc()
            .startAngle(d => d.startAngle)
            .endAngle(d => d.endAngle)
            .innerRadius(100)
            .outerRadius(200)
            .padAngle(0.03)
            .cornerRadius(10);

        const donutContainer = innerChart
            .append("g")
            .attr("transform", `translate(${innerWidth/2}, ${innerHeight/2})`);
        const arcs = donutContainer
            .selectAll(`.arc`)
            .data(annotatedData)
            .join("g")
            .attr("class", `arc`);
        arcs
            .append("path")
            .attr("d", arcGenerator)
            .attr("fill", d => colorScale(d.data.weather));

        arcs
            .append("text")
            .text(d => {
                d["percentage"] = (d.endAngle - d.startAngle) / (2 * Math.PI);
                return d3.format(".0%")(d.percentage);
            })
            .attr("x", d => {
                d["centroid"] = arcGenerator
                    .startAngle(d.startAngle)
                    .endAngle(d.endAngle)
                    .centroid();
                return d.centroid[0];
            })
            .attr("y", d => d.centroid[1])
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", "#f6fafc")
            .attr("fill-opacity", d => d.percentage < 0.05 ? 0 : 1)
            .style("font-size", "26px")
            .style("font-weight", 500);

        const legendItems = d3.select(".legend-container")
            .append("ul")
            .attr("class", "color-legend")
            .selectAll(".color-legend-item")
            .data(formatsInfo)
            .join("li")
            .attr("class", "color-legend-item");

        legendItems
            .append("span")
            .attr("class", "color-legend-item-color")
            .style("background-color", d => d.color);

        legendItems
            .append("span")
            .attr("class", "color-legend-item-label")
            .text(d => d.label);



        return () => {
        svg.remove()
        }
    }, [filteredData])

    return (
        <div className="donut-chart-container">
            donut
            <div className="legend-container"></div>
        </div>
    )
}

export default AreaChart