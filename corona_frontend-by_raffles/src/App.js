import React from 'react';
import logo from './logo.svg';
import './App.css';
import Papa from "papaparse";
import axios from "axios";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Leaflet from "./Map.js";
import DateSlider from "./DateSlider.js";
import DataSelector from "./DataSelector.js";

import Visualisation from './Visualisation';
import Filter from './Filter';

// Added by raffles
import sentimentVsTime from './data/sentimentVsTime';
import countryLatLong from './data/countryLatLong';

const infectedUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
const recoveredUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv";
const deathUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"
class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      infectedData: [],
      deathData: [],
      recoveredData: [],
      date: "2/1/20", // feb-1-2020
      infectedOn: true,
      deathOn: false,
      recoveredOn: false,
      
      filter: {
        country: "Canada",
        frequency: "daily",
      },

      allCountries: []
    };
    this.handleDateChange = this.handleDateChange.bind(this);
    this.toggleInfectedData = this.toggleInfectedData.bind(this);
    this.toggleRecoveredData = this.toggleRecoveredData.bind(this);
    this.toggleDeathData = this.toggleDeathData.bind(this);

    this.handleFilterCountryChange = this.handleFilterCountryChange.bind(this);
    this.handleFilterFrequencyChange = this.handleFilterFrequencyChange.bind(this);

    this.setAllCountries = this.setAllCountries.bind(this);
  }

  componentDidMount() {
    const parsedInfectedData = App.pullAndParseUrl(infectedUrl);
    const parsedRecoveredData = App.pullAndParseUrl(recoveredUrl);
    const parsedDeathData = App.pullAndParseUrl(deathUrl);

    parsedInfectedData.then(result => {
      console.log("infected", result);

      this.setState({ infectedData: result.data });
    });

    parsedRecoveredData.then(result => {
      console.log("recovered", result);

      this.setState({ recoveredData: result.data });
    });

    parsedDeathData.then(result => {
      console.log("death", result);

      this.setState({ deathData: result.data });
    });
  }

  static pullAndParseUrl(url) {
    return axios.get(url).then(response => Papa.parse(response.data, { header: true }));
  }


  handleDateChange(selectedDate) {
    this.setState({ "date": selectedDate });
  };

  toggleInfectedData() {
    this.setState({infectedOn: !this.state.infectedOn});
  }

  toggleRecoveredData() {
    this.setState({recoveredOn: !this.state.recoveredOn});
  }

  toggleDeathData() {
    this.setState({deathOn: !this.state.deathOn});
  }

  handleFilterCountryChange(countryNew) {
    console.log("handleFilterCountryChange == ", countryNew)
    this.setState(prev => {
      const prevCopy = {...prev}
      const filterCopy = {...prevCopy.filter}
      filterCopy.country = countryNew
      
      return {
        ...prevCopy,
        filter: filterCopy
      }
    })
  }

  handleFilterFrequencyChange(frequencyNew) {
    console.log("handleFilterFrequencyChange == ", frequencyNew)
    this.setState(prev => {
      const prevCopy = {...prev}
      const filterCopy = {...prevCopy.filter}
      filterCopy.frequency = frequencyNew
      
      return {
        ...prevCopy,
        filter: filterCopy
      }
    })
  }

  setAllCountries(allCountries) {
    this.setState({allCountries: allCountries});
  }

  render() {

    // Printing mock data created by Raffles
    console.log('sentiment vs time')
    console.log(sentimentVsTime)


    return (
      <div className="App">
        <Grid container justify="center"   alignItems="center" spacing={3}>
          <Grid item xs={8}>
            <Typography id="title" variant='h3'>
              Visualizing COVID-19 Over Time
            </Typography>
          </Grid>
          <Grid item xs={10}>
            <Leaflet
              infectedData={this.state.infectedData}
              infectedOn={this.state.infectedOn}
              recoveredData={this.state.recoveredData}
              recoveredOn={this.state.recoveredOn}
              deathData={this.state.deathData}
              deathOn={this.state.deathOn}
              date={this.state.date}
              handleFilterCountryChange={this.handleFilterCountryChange}
            />
          </Grid>
          <Grid item xs={8}>
            {this.state.date}
            <DateSlider
              handleDateChange={this.handleDateChange}
            />
          </Grid>
          <Grid item xs={8}>
            <DataSelector
              toggleInfectedData={this.toggleInfectedData}
              infectedOn={this.state.infectedOn}
              toggleRecoveredData={this.toggleRecoveredData}
              recoveredOn={this.state.recoveredOn}
              toggleDeathData={this.toggleDeathData}
              deathOn={this.state.deathOn}
            />
          </Grid>
          <Grid item xs={8}>
            {/* <Typography id="title" variant='caption'>
              This is a depiction of the spread of COVID-19 over time. We rely on the Johns Hopkins CSSE Data Repository, which is
              updated once a day at around 23:59 UTC. For that reason, the most recent data our slider allows users to select is
              yesterday's.
            </Typography> */}
          </Grid>
        </Grid>

        <Filter 
          filter={this.state.filter}
          allCountries={this.state.allCountries}
          handleFilterCountryChange={this.handleFilterCountryChange}
          handleFilterFrequencyChange={this.handleFilterFrequencyChange}
        />
        <Visualisation 
          filter={this.state.filter}
          setAllCountries={this.setAllCountries}
        />
      </div>
    );
  }
}



export default App;
