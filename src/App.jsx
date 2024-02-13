import { useEffect, useState } from 'react'
import './App.css'
import * as d3 from 'd3';
import temperatureDatasetURL from './data/temperature_data.csv?url'
import AreaChart from './components/AreaChart';

function App() {
  const [temperatureData, setTemperatureData] = useState(0)
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // const parseDate = d3.timeParse('%Y-%m-%d'); // Define a custom date parsing function

   /*  d3.csv(temperatureDatasetURL, row => {
      // Parse the date using the custom parsing function
      return {
        ...row,
        date: parseDate(row.date)
      };
    }).then(data => {
      console.log(data);
      setTemperatureData(data);
    }); */
    let mounted = true
    d3
      .csv(temperatureDatasetURL, d3.autoType)
      .then((data) => {
        if (mounted) {
          console.log(data)
          setTemperatureData(data)
          setLoading(false);
        }
      })
      return () => mounted = false;
  }, [])

  return (
    <div className="container">
     {loading && <div className="loading">Loading...</div>}

    {!loading && <AreaChart data={temperatureData} />}
     <ul>
      <li>DONE switch cities</li>
      <li>DONE switch years</li>
      <li>DONE if 13 month and less do not translate the month label</li>
      <li>DONE for quarters ??</li>
      <li>DONE for quaters show avarage dots</li>
      <li>when hovering on the dot show precipitation in tooltip</li>
      <li>for degrees show horizontal lines</li>
      <li>bar chart for something (comparison of seatle and new york)</li>
      <li>donut chart for days with different precipitations</li>
      <li>highlight active filters</li>
      <li>delete underscore from NY</li>
     </ul>
    </div>
  )
}

export default App
