import React, {useState, useEffect} from 'react';
import {Line, Pie} from 'react-chartjs-2';
import ReactWordcloud from 'react-wordcloud';
import axios from 'axios';

import sentimentVsTime from './data/sentimentVsTime';
import { createGenerateClassName } from '@material-ui/core';

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

const Visualisation = (props) => {
    const [chartDataSentimentVsTime, setChartDataSentimentVsTime] = useState({})
    const [chartDataSentimentVsCases, setChartDataSentimentVsCases] = useState({})
    const [chartDataSentimentVsDeaths, setChartDataSentimentVsDeaths] = useState({})
    const [chartDataSentimentVsTests, setChartDataSentimentVsTests] = useState({})
    const [chartDataSentimentVsBeds, setChartDataSentimentVsBeds] = useState({})
    const [chartDataSentimentVsStringency, setChartDataSentimentVsStringency] = useState({})
    const [chartDataSentimentVsHandwashing, setChartDataSentimentVsHandwashing] = useState({})
    
    const [chartDataSentimentPositiveNeutralNegative, setChartDataSentimentPositiveNeutralNegative] = useState({})


    // store the data
    const [sentiments, setSentiments] = useState({})
    const [cases, setCases] = useState({})
    const [deaths, setDeaths] = useState({})
    const [tests, setTests] = useState({})
    const [beds, setBeds] = useState({}) // beds per thousand
    const [stringency, setStringency] = useState({}) 
    const [handwashing, setHandwashing] = useState({}) // handwashing facilities

    const {filter, setAllCountries} = props

    const labels = []
    const data = []

    // set the sentimentVsTime data

    // daily data
    if (filter.frequency === "daily") {
        sentimentVsTime[filter.country].sentimentList.forEach(so => {
            labels.push(so.date)
            data.push(so.sentiment)
        })
    } 
    // weekly data
    else if (filter.frequency === "weekly") {
        let i = 0;
        let sum = 0;
        let startDate;
        let endDate;
        const sentimentList = sentimentVsTime[filter.country].sentimentList;
    
        sentimentList.forEach((so, listIndex) => {
            //console.log(`[Visualisation] --- weekly --- listIndex = ${listIndex} --- sum = ${sum} --- i = ${i}`)
    
            if (i === 0)
                startDate = so.date
    
            if (i < 6 && listIndex !== (sentimentList.length - 1)) {
                sum += so.sentiment
            }
                
            if (i === 6 || listIndex === (sentimentList.length - 1)) {
                // on the 7th date

                // compute the average
                const average = sum / (i+1)
                // console.log(`[Visualisation] average = ${average} --- sum = ${sum} --- i === ${i}`)
    
                // mark it as the endDate
                endDate = so.date
    
                // store it
                labels.push(formatDate(startDate) + " to " + formatDate(endDate))
                data.push(average)
    
                // reset i, sum, startDate, endDate
                i = 0
                sum = 0
                startDate = null
                endDate = null
            }

            i++
        })
    }

    // Get data from backend
    useEffect(() => {
        let sentimentUrl    = 'http://localhost:5000/sentiment';
        let casesUrl        = 'http://localhost:5000/cases';
        let deathUrl        = 'http://localhost:5000/death';
        let testUrl         = 'http://localhost:5000/test';
        let bedUrl          = 'http://localhost:5000/hospital-bed';
        let stringencyUrl   = 'http://localhost:5000/stringency-index';
        let handwashingUrl   = 'http://localhost:5000/basic-handwashing-facilities';
        
        const requestSentiment = axios.get(sentimentUrl)
        const requestCases = axios.get(casesUrl)
        const requestDeaths = axios.get(deathUrl)
        const requestTests = axios.get(testUrl)
        const requestBeds = axios.get(bedUrl)
        const requestStringency = axios.get(stringencyUrl)
        const requestHandwashing = axios.get(handwashingUrl)

        axios.all([requestSentiment, requestCases, requestDeaths, requestTests, requestBeds, requestStringency, requestHandwashing]).then(axios.spread((...responses) => {
            const responseOne = responses[0]
            const responseTwo = responses[1]
            const responseThree = responses[2]
            const responseFour = responses[3]
            const responseFive = responses[4]
            const responseSix = responses[5]
            const responseSeven = responses[6]

            // use/access the results 
            setSentiments(responseOne.data)
            setCases(responseTwo.data)
            setDeaths(responseThree.data)
            setTests(responseFour.data)
            setBeds(responseFive.data)
            setStringency(responseSix.data)
            setHandwashing(responseSeven.data)
          }))
          .catch(errors => {
            // react on errors.
            console.log("error la", errors.message)
          })
    }, [])

    // Set sentiment vs time chart
    useEffect(() => {
        const allCountries = Object.keys(sentiments).map(k => k)
        setAllCountries(allCountries)

        if (Object.keys(sentiments).length > 0) {
            // set the sentiment vs time chart
            const labels=[]
            const data=[]
            
            // filter by country
            sentiments[filter.country].forEach(o => {
                labels.push(o.date)
                data.push(o.sentimentRatio)
            })

            setChartDataSentimentVsTime({
                labels: labels,
                datasets: [
                    {
                        label: 'Sentiment',
                        //data: [-0.5, 3.34, -0.32, -0.33, -0.12, 0.32, 0.85],
                        data: data,
                        backgroundColor: ['rgba(255,255,255,0)'],
                        borderColor: ['rgba(75, 192, 192, 1)'],
                        borderWidth: 4
                    }
                ]
            })   
        }
    }, [sentiments, filter.country])

    // Set sentiment & cases vs time
    useEffect(() => {
        if (Object.keys(sentiments).length > 0 && Object.keys(cases).length > 0) {
            const labels=[]
            const dataA=[]
            const dataB=[]

            // processing sentiment
            const updatedSentiment = {}
            Object.keys(sentiments).map(k => {
                sentiments[k].forEach(o => {
                    if (!(k in updatedSentiment))
                        updatedSentiment[k] = {}
                    updatedSentiment[k][o.date] = {sentimentRatio: o.sentimentRatio}
                })
            })

            // processing cases -- slot case into updated sentiment
            // for the date, need to substring(0, 10)
            Object.keys(sentiments).map(k => {
                if (k in cases) {
                    cases[k].forEach(c => {
                        let casesValue = c.cases;
                        let date = c.date.substring(0, 10)

                        if (date in updatedSentiment[k])
                            updatedSentiment[k][date].cases = casesValue;
                    })
                }
            })

            console.log("[Visualisation] updated updatedSentiment", updatedSentiment)

            Object.keys(updatedSentiment[filter.country]).forEach(date => {
                labels.push(date)
                
                const sentimentRatio = parseFloat(updatedSentiment[filter.country][date].sentimentRatio).toFixed(2);
                const cases = parseInt(updatedSentiment[filter.country][date].cases);

                dataA.push(sentimentRatio)
                dataB.push(cases)
            })

            setChartDataSentimentVsCases({
                labels: labels,
                datasets: [
                    {
                        label: 'Sentiment',
                        yAxisID: 'Sentiment',
                        data: dataA,
                        backgroundColor: ['rgba(255,255,255,0)'],
                        borderColor: ['rgba(75, 192, 192, 1)'],
                        borderWidth: 4
                    },
                    {
                        label: 'Cases',
                        yAxisID: 'Cases',
                        data: dataB,
                        backgroundColor: ['rgba(255,255,255,0)'],
                        borderColor: ['rgba(218, 61, 46, 0.6)'],
                        borderWidth: 4
                    }
                ]
            })
        }
    }, [sentiments, cases, filter.country])

    // Set sentiment & deaths vs time
    useEffect(() => {
        if (Object.keys(sentiments).length > 0 && Object.keys(deaths).length > 0) {
            const labels=[]
            const dataA=[]
            const dataB=[]

            // processing sentiment
            const updatedSentiment = {}
            Object.keys(sentiments).map(k => {
                sentiments[k].forEach(o => {
                    if (!(k in updatedSentiment))
                        updatedSentiment[k] = {}
                    updatedSentiment[k][o.date] = {sentimentRatio: o.sentimentRatio}
                })
            })

            // processing cases -- slot case into updated sentiment
            // for the date, need to substring(0, 10)
            Object.keys(sentiments).map(k => {
                if (k in deaths) {
                    deaths[k].forEach(c => {
                        let deathsValue = c.deaths;
                        let date = c.date.substring(0, 10)

                        if (date in updatedSentiment[k])
                            updatedSentiment[k][date].deaths = deathsValue;
                    })
                }
            })

            console.log("[Visualisation] updated updatedSentiment", updatedSentiment)

            Object.keys(updatedSentiment[filter.country]).forEach(date => {
                labels.push(date)
                
                const sentimentRatio = parseFloat(updatedSentiment[filter.country][date].sentimentRatio).toFixed(2);
                const deaths = parseInt(updatedSentiment[filter.country][date].deaths);

                dataA.push(sentimentRatio)
                dataB.push(deaths)
            })

            setChartDataSentimentVsDeaths({
                labels: labels,
                datasets: [
                    {
                        label: 'Sentiment',
                        yAxisID: 'Sentiment',
                        data: dataA,
                        backgroundColor: ['rgba(255,255,255,0)'],
                        borderColor: ['rgba(75, 192, 192, 1)'],
                        borderWidth: 4
                    },
                    {
                        label: 'Deaths',
                        yAxisID: 'Deaths',
                        data: dataB,
                        backgroundColor: ['rgba(255,255,255,0)'],
                        borderColor: ['rgba(218, 61, 46, 0.6)'],
                        borderWidth: 4
                    }
                ]
            })
        }
    }, [sentiments, deaths, filter.country])    

    // Set sentiment & tests vs time
    useEffect(() => {
        if (Object.keys(sentiments).length > 0 && Object.keys(tests).length > 0) {
            const labels=[]
            const dataA=[]
            const dataB=[]

            // processing sentiment
            const updatedSentiment = {}
            Object.keys(sentiments).map(k => {
                sentiments[k].forEach(o => {
                    if (!(k in updatedSentiment))
                        updatedSentiment[k] = {}
                    updatedSentiment[k][o.date] = {sentimentRatio: o.sentimentRatio}
                })
            })

            // processing cases -- slot case into updated sentiment
            // for the date, need to substring(0, 10)
            Object.keys(sentiments).map(k => {
                if (k in tests) {
                    tests[k].forEach(c => {
                        let testsValue = c.tests;
                        let date = c.date.substring(0, 10)

                        if (date in updatedSentiment[k])
                            updatedSentiment[k][date].tests = testsValue;
                    })
                }
            })

            console.log("[Visualisation] updated updatedSentiment", updatedSentiment)

            Object.keys(updatedSentiment[filter.country]).forEach(date => {
                labels.push(date)
                
                const sentimentRatio = parseFloat(updatedSentiment[filter.country][date].sentimentRatio).toFixed(2);
                const tests = parseFloat(updatedSentiment[filter.country][date].tests);

                dataA.push(sentimentRatio)
                dataB.push(tests)
            })

            setChartDataSentimentVsTests({
                labels: labels,
                datasets: [
                    {
                        label: 'Sentiment',
                        yAxisID: 'Sentiment',
                        data: dataA,
                        backgroundColor: ['rgba(255,255,255,0)'],
                        borderColor: ['rgba(75, 192, 192, 1)'],
                        borderWidth: 4
                    },
                    {
                        label: 'Tests',
                        yAxisID: 'Tests',
                        data: dataB,
                        backgroundColor: ['rgba(255,255,255,0)'],
                        borderColor: ['rgba(218, 61, 46, 0.6)'],
                        borderWidth: 4
                    }
                ]
            })
        }
    }, [sentiments, tests, filter.country])
    
    // Set sentiment & hospital-bed vs time
    useEffect(() => {
        if (Object.keys(sentiments).length > 0 && Object.keys(beds).length > 0) {
            const labels=[]
            const dataA=[]
            const dataB=[]

            // processing sentiment
            const updatedSentiment = {}
            Object.keys(sentiments).map(k => {
                sentiments[k].forEach(o => {
                    if (!(k in updatedSentiment))
                        updatedSentiment[k] = {}
                    updatedSentiment[k][o.date] = {sentimentRatio: o.sentimentRatio}
                })
            })

            // processing cases -- slot case into updated sentiment
            // for the date, need to substring(0, 10)
            Object.keys(sentiments).map(k => {
                if (k in beds) {
                    beds[k].forEach(c => {
                        let bedsValue = c.bedsPerThousand;
                        let date = c.date.substring(0, 10)

                        if (date in updatedSentiment[k])
                            updatedSentiment[k][date].beds = bedsValue;
                    })
                }
            })

            console.log("[Visualisation] updated updatedSentiment", updatedSentiment)

            Object.keys(updatedSentiment[filter.country]).forEach(date => {
                labels.push(date)
                
                const sentimentRatio = parseFloat(updatedSentiment[filter.country][date].sentimentRatio).toFixed(2);
                const beds = parseFloat(updatedSentiment[filter.country][date].beds);

                dataA.push(sentimentRatio)
                dataB.push(beds)
            })

            setChartDataSentimentVsBeds({
                labels: labels,
                datasets: [
                    {
                        label: 'Sentiment',
                        yAxisID: 'Sentiment',
                        data: dataA,
                        backgroundColor: ['rgba(255,255,255,0)'],
                        borderColor: ['rgba(75, 192, 192, 1)'],
                        borderWidth: 4
                    },
                    {
                        label: 'Beds',
                        yAxisID: 'Beds',
                        data: dataB,
                        backgroundColor: ['rgba(255,255,255,0)'],
                        borderColor: ['rgba(218, 61, 46, 0.6)'],
                        borderWidth: 4
                    }
                ]
            })
        }
    }, [sentiments, beds, filter.country])
    

    // Set sentiment & stringency vs time
    useEffect(() => {
        if (Object.keys(sentiments).length > 0 && Object.keys(stringency).length > 0) {
            const labels=[]
            const dataA=[]
            const dataB=[]

            // processing sentiment
            const updatedSentiment = {}
            Object.keys(sentiments).map(k => {
                sentiments[k].forEach(o => {
                    if (!(k in updatedSentiment))
                        updatedSentiment[k] = {}
                    updatedSentiment[k][o.date] = {sentimentRatio: o.sentimentRatio}
                })
            })

            // processing cases -- slot case into updated sentiment
            // for the date, need to substring(0, 10)
            Object.keys(sentiments).map(k => {
                if (k in stringency) {
                    stringency[k].forEach(c => {
                        let stringencyValue = c.stringency;
                        let date = c.date.substring(0, 10)

                        if (date in updatedSentiment[k])
                            updatedSentiment[k][date].stringency = stringencyValue;
                    })
                }
            })

            console.log("[Visualisation] updated updatedSentiment", updatedSentiment)

            Object.keys(updatedSentiment[filter.country]).forEach(date => {
                labels.push(date)
                
                const sentimentRatio = parseFloat(updatedSentiment[filter.country][date].sentimentRatio).toFixed(2);
                const stringency = parseFloat(updatedSentiment[filter.country][date].stringency);

                dataA.push(sentimentRatio)
                dataB.push(stringency)
            })

            setChartDataSentimentVsStringency({
                labels: labels,
                datasets: [
                    {
                        label: 'Sentiment',
                        yAxisID: 'Sentiment',
                        data: dataA,
                        backgroundColor: ['rgba(255,255,255,0)'],
                        borderColor: ['rgba(75, 192, 192, 1)'],
                        borderWidth: 4
                    },
                    {
                        label: 'Stringency Index',
                        yAxisID: 'Stringency',
                        data: dataB,
                        backgroundColor: ['rgba(255,255,255,0)'],
                        borderColor: ['rgba(218, 61, 46, 0.6)'],
                        borderWidth: 4
                    }
                ]
            })
        }
    }, [sentiments, stringency, filter.country])

    // Set sentiment & stringency vs time
    useEffect(() => {
        if (Object.keys(sentiments).length > 0 && Object.keys(handwashing).length > 0) {
            const labels=[]
            const dataA=[]
            const dataB=[]

            // processing sentiment
            const updatedSentiment = {}
            Object.keys(sentiments).map(k => {
                sentiments[k].forEach(o => {
                    if (!(k in updatedSentiment))
                        updatedSentiment[k] = {}
                    updatedSentiment[k][o.date] = {sentimentRatio: o.sentimentRatio}
                })
            })

            // processing cases -- slot case into updated sentiment
            // for the date, need to substring(0, 10)
            Object.keys(sentiments).map(k => {
                if (k in handwashing) {
                    handwashing[k].forEach(c => {
                        let handwashingValue = c.handwashingShare;
                        let date = c.date.substring(0, 10)

                        if (date in updatedSentiment[k])
                            updatedSentiment[k][date].handwashing = handwashingValue;
                    })
                }
            })

            console.log("[Visualisation] updated updatedSentiment", updatedSentiment)

            Object.keys(updatedSentiment[filter.country]).forEach(date => {
                labels.push(date)
                
                const sentimentRatio = parseFloat(updatedSentiment[filter.country][date].sentimentRatio).toFixed(2);
                const handwashing = parseFloat(updatedSentiment[filter.country][date].handwashing);

                dataA.push(sentimentRatio)
                dataB.push(handwashing)
            })

            setChartDataSentimentVsHandwashing({
                labels: labels,
                datasets: [
                    {
                        label: 'Sentiment',
                        yAxisID: 'Sentiment',
                        data: dataA,
                        backgroundColor: ['rgba(255,255,255,0)'],
                        borderColor: ['rgba(75, 192, 192, 1)'],
                        borderWidth: 4
                    },
                    {
                        label: 'Handwashing',
                        yAxisID: 'Handwashing',
                        data: dataB,
                        backgroundColor: ['rgba(255,255,255,0)'],
                        borderColor: ['rgba(218, 61, 46, 0.6)'],
                        borderWidth: 4
                    }
                ]
            })
        }
    }, [sentiments, handwashing, filter.country])



    console.log("[Visualisation] sentiments ----> ", sentiments)
    console.log("[Visualisation] cases ----> ", cases)
    console.log("[Visualisation] deaths ----> ", deaths)
    console.log("[Visualisation] tests ----> ", tests)
    console.log("[Visualisation] beds ----> ", beds)
    console.log("[Visualisation] stringency ----> ", stringency)
    console.log("[Visualisation] handwashing ----> ", handwashing)
    
    return (
        <div>
            <h1>Sentiment vs Time Period</h1>
            <div style={{width: '100%'}}>
                <Line 
                    data={chartDataSentimentVsTime}
                    options={{
                        responsive: true
                    }}
                />
            </div>

            <h1>Sentiment vs Time & No. of Covid Cases vs Time</h1>
            <div style={{width: '100%'}}>
                <Line 
                    data={chartDataSentimentVsCases}
                    options={{
                        responsive: true,
                        scales: {
                            yAxes: [
                                {
                                    id: 'Sentiment',
                                    position: 'left',
                                }, 
                                {
                                    id: 'Cases',
                                    position: 'right',
                                }
                            ]
                          }
                    }}
                />
            </div>

            <h1>Sentiment vs Time & No. of Covid Deaths vs Time</h1>
            <div style={{width: '100%'}}>
                <Line 
                    data={chartDataSentimentVsDeaths}
                    options={{
                        responsive: true,
                        scales: {
                            yAxes: [
                                {
                                    id: 'Sentiment',
                                    position: 'left',
                                }, 
                                {
                                    id: 'Deaths',
                                    position: 'right',
                                }
                            ]
                          }
                    }}
                />
            </div>

            <h1>Sentiment vs Time & No. of Covid Tests vs Time</h1>
            <div style={{width: '100%'}}>
                <Line 
                    data={chartDataSentimentVsTests}
                    options={{
                        responsive: true,
                        scales: {
                            yAxes: [
                                {
                                    id: 'Sentiment',
                                    position: 'left',
                                }, 
                                {
                                    id: 'Tests',
                                    position: 'right',
                                }
                            ]
                          }
                    }}
                />
            </div>

            <h1>Sentiment vs Time & Hospital Beds Per Thousand vs Time</h1>
            <div style={{width: '100%'}}>
                <Line 
                    data={chartDataSentimentVsBeds}
                    options={{
                        responsive: true,
                        scales: {
                            yAxes: [
                                {
                                    id: 'Sentiment',
                                    position: 'left',
                                }, 
                                {
                                    id: 'Beds',
                                    position: 'right',
                                }
                            ]
                          }
                    }}
                />
            </div>

            <h1>Sentiment vs Time & Government Response Stringency Index vs Time</h1>
            <div style={{width: '100%'}}>
                <Line 
                    data={chartDataSentimentVsStringency}
                    options={{
                        responsive: true,
                        scales: {
                            yAxes: [
                                {
                                    id: 'Sentiment',
                                    position: 'left',
                                }, 
                                {
                                    id: 'Stringency',
                                    position: 'right',
                                }
                            ]
                          }
                    }}
                />
            </div>

            <h1>Sentiment vs Time & Share of Population with Basic Handwashing Facilities vs Time</h1>
            <div style={{width: '100%'}}>
                <Line 
                    data={chartDataSentimentVsHandwashing}
                    options={{
                        responsive: true,
                        scales: {
                            yAxes: [
                                {
                                    id: 'Sentiment',
                                    position: 'left',
                                }, 
                                {
                                    id: 'Handwashing',
                                    position: 'right',
                                }
                            ]
                          }
                    }}
                />
            </div>



{/* 

            <h1>Positive vs Neutral vs Negative</h1>
            <div style={{ width: '100%'}}>
                <Pie
                    data={chartDataSentimentPositiveNeutralNegative}
                    options={{
                        responsive: true
                    }}
                />
            </div>

            <h1>Word Cloud</h1>
            <ReactWordcloud words={[
                {
                    text: 'told',
                    value: 64,
                  },
                  {
                    text: 'mistake',
                    value: 11,
                  },
                  {
                    text: 'thought',
                    value: 16,
                  },
                  {
                    text: 'bad',
                    value: 17,
                  },
            ]}/> */}
        </div>
    )
}

export default Visualisation;