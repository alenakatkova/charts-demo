function Filters({changeLocation, changeYear, changeQuater, showQuaterChoice}) {
    const cities = ["New_York", "Seattle"]
    const years = [2012, 2013, 2014, 2015, "All years"]
    const quaters = ["Q1", "Q2", "Q3", "Q4", "Whole year"]
    return (
        <div className="filters-container">
          <div className="filters-group">
          {cities.map(city => (
            <button className="filter-btn" key={city} onClick={() => changeLocation(city)}>{city.split('_').join(' ')}</button>
          ))}
          </div>
          <div className="filters-group">
          {years.map(year => (
            <button className="filter-btn" key={year} onClick={() => changeYear(year)}>{year}</button>
          ))}
          </div>
          {showQuaterChoice && <div className="filters-group">
          {quaters.map(quater => (
            <button className="filter-btn" key={quater} onClick={() => changeQuater(quater)}>{quater}</button>
          ))}
          </div>}
        </div>
    )
}

export default Filters