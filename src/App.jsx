import { useEffect, useState } from 'react'
import './App.css'
import * as d3 from 'd3';
import temperatureDatasetURL from './data/temperature_data.csv?url'
import AreaChart from './components/AreaChart';
import DonutChart from "./components/DonutChart.jsx";
import Filters from "./components/Filters.jsx";
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

function App() {
  const [temperatureData, setTemperatureData] = useState([])
  const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState(intialFiltersState)
    const [filteredData, setFilteredData] = useState([]);

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
        const filtered = temperatureData.filter((d) => {
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

    let mounted = true
    d3
      .csv(temperatureDatasetURL, d3.autoType)
      .then((data) => {
        if (mounted) {
          console.log(data)
          setTemperatureData(data)
            setFilteredData(data.filter(d => d.location === "New_York"))
          setLoading(false);
        }
      })
      return () => mounted = false;
  }, [])

  return (
    <div className="container">
      <Filters
          changeLocation={handleLocationChoice}
          changeYear={handleYearChoice}
          showQuaterChoice={activeFilter.year !== "All years"}
          changeQuater={handleQuaterChoice}
      />
     {loading && <div className="loading">Loading...</div>}

    {!loading && <AreaChart
        filteredData={filteredData}
        handleYearChoice={handleYearChoice}
        handleLocationChoice={handleLocationChoice}
        handleQuaterChoice={handleQuaterChoice}
        activeFilter={activeFilter}
    />}
        {!loading && <DonutChart filteredData={filteredData} /> }
        <ul className="todo">
            <li>DONE switch cities</li>
            <li>DONE switch years</li>
            <li>DONE if 13 month and less do not translate the month label</li>
            <li>DONE for quarters ??</li>
            <li>DONE for quaters show avarage dots</li>
            <li>DONE delete underscore from NY</li>
            <li>DONE for degrees show horizontal lines</li>
            <li>when hovering on the dot show precipitation in tooltip</li>
            <li>style tooltip</li>
            <li>bar chart for something (comparison of seatle and new york)</li>
            <li>donut chart for days with different precipitations</li>
            <li>highlight active filters</li>
            <li>add legends</li>
        </ul>
    </div>
  )
}

export default App
