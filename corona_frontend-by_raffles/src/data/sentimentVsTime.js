import countryLatLong from './countryLatLong';

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

const data = {}
countryLatLong.ref_country_codes.forEach(countryObject => {
    let i = 0;
    const startDate = new Date('2020-03-01')
    data[countryObject.country] = {}
    data[countryObject.country].countryData = {...countryObject}
    data[countryObject.country].sentimentList = []
    
    for (i = 1; i < 100; i++) {
        startDate.setDate(startDate.getDate() + 1)
        data[countryObject.country].sentimentList.push({
            date: new Date(startDate),
            sentiment: parseFloat(getRandomArbitrary(-1, 1).toFixed(2)),
        })
    }
})

/**
 * Data look like this
 * 
 * {
 *  countryName: {
 *      countryData: {
 *          ...
 *      },
 *      sentimentList: [
 *          {
 *              data: "...",
 *              sentiment: ... ,
 *          }
 *      ]
 *  }
 * }
 */
 

export default data