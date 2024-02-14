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
        setActiveFilter(prev => {
            return {
                ...prev,
                location: newLocation
            }
        })
    }

    function handleYearChoice(newYear) {
        setActiveFilter(prev => {
            return {
                ...prev,
                year: newYear,
                quater: "Whole year"
            }
        })
    }

    function handleQuaterChoice(newQuater) {
        setActiveFilter(prev => {
            return {
                ...prev,
                quater: newQuater
            }
        })
    }

    useEffect(() => {
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
          setTemperatureData(data)
            setFilteredData(data.filter(d => d.location === "New_York"))
          setLoading(false);
        }
      })
      return () => mounted = false;
  }, [])

  return (
    <div className="container">
      <h1>Exploring Climate Trends: New York and Seattle (2012-2015)</h1>
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
            <li>highlight active filters</li>
            <li>add legends</li>
        </ul>
    </div>
  )
}

export default App
