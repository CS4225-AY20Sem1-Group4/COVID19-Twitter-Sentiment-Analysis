import React from 'react';
import countryLatLong from './data/countryLatLong';

const Filter = (props) => {
    const {filter, allCountries, handleFilterCountryChange, handleFilterFrequencyChange} = props

    const countryOptionsComponent = [<option value="" key={0}>-- Select Country --</option>]
    
    allCountries.forEach((country, i) => countryOptionsComponent.push(<option value={country} key={i + 1}>{country}</option>))

    return (
        <div>
            <h1>Filter</h1>
            
            <select value={filter.country} onChange={e => handleFilterCountryChange(e.target.value)}>
                {countryOptionsComponent}
            </select>

            <select value={filter.frequency} onChange={e => handleFilterFrequencyChange(e.target.value) }>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
            </select>
        </div>
    )
}

export default Filter;