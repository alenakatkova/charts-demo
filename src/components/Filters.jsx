function Filters({changeLocation, changeYear, changeQuater, showQuaterChoice, activeFilter}) {
    const cities = ["Seattle", "New_York"]
    const years = ["All years", 2012, 2013, 2014, 2015]
    const quaters = [ "Whole year", "Q1", "Q2", "Q3", "Q4"]
    return (
        <div className="filters-container">
          <div className="filters-group">
          {cities.map(city => (
            <button
                className={`filter-btn ${activeFilter.location === city && "active"}`}
                key={city} onClick={() => changeLocation(city)}>{city.split('_').join(' ')}</button>
          ))}
          </div>
          <div className="filters-group">
          {years.map(year => (
            <button
                className={`filter-btn ${activeFilter.year === year && "active"}`}
                key={year} onClick={() => changeYear(year)}>{year}</button>
          ))}
          </div>
          {showQuaterChoice && <div className="filters-group">
          {quaters.map(quater => (
            <button
                className={`filter-btn ${activeFilter.quater === quater && "active"}`}
                key={quater} onClick={() => changeQuater(quater)}>{quater}</button>
          ))}
          </div>}
        </div>
    )
}

export default Filters