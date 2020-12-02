const { Connection, Request } = require("tedious");

// Create connection to database
const config = {
  authentication: {
    options: {
      userName: "cs4225test", // update me
      password: "Cs4225gogogo" // update me
    },
    type: "default"
  },
  server: "cs4225database.database.windows.net", // update me
  options: {
    database: "sentimentResult", //update me
    encrypt: true
  }
};

const connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection.on("connect", err => {
  if (err) {
    console.error(err.message);
  } else {
    queryDatabase();
  }
});

function queryDatabase() {
  console.log("Reading rows from the Table...");

  // Read all rows from table
  const request = new Request(
    `SELECT TOP (10) * FROM [dbo].[sentimentResult]`,
    (err, rowCount) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`${rowCount} row(s) returned`);
      }
    }
  );

  let data = {}
  request.on("row", columns => {
    const row = {}
    let country, date, positiveAvg, neutralAvg, negativeAvg, finalSentiment

    columns.forEach(column => {
        console.log("%s\t%s", column.metadata.colName, column.value);

        const columnName = column.metadata.colName
        if (columnName === "positive_avg")
            positiveAvg = column.value 
        else if (columnName === 'neutral_avg')
            neutralAvg = column.value
        else if (columnName === 'negative_avg')
            negativeAvg = column.value
        else if (columnName === '_c2')
            country = column.value
        else if (columnName === '_c0')
            date = column.value
    });

    // find the sentiment --- -1 = negative, 0 = neutral, 1 = positive
    if (positiveAvg > neutralAvg && positiveAvg > negativeAvg)
        finalSentiment = 1
    else if (negativeAvg > neutralAvg && negativeAvg > positiveAvg)
        finalSentiment = -1
    else if (neutralAvg > negativeAvg && neutralAvg > positiveAvg)
        finalSentiment = 0

    row.sentiment = finalSentiment
    row.date = date

    if (country in data) 
      data[country].push(row)
    else
      data[country] = [row]
  });

  request.on("requestCompleted", () => {
    console.log("request completed")
    return data
    //console.log(data)
  })

  connection.execSql(request);
}

/**
 * {
    'United States Virgin Islands': [
      { sentiment: '1', date: 2020-03-24 },
      { cases: '0', date: 2020-03-25 },
      { cases: '1', date: 2020-03-26 },
    ],
    'Zimbabwe': [
      { cases: '-1', date: 2020-03-24 },
      { cases: '-1', date: 2020-03-25 },
      { cases: '1', date: 2020-03-26 },
    ],
 * }
 */