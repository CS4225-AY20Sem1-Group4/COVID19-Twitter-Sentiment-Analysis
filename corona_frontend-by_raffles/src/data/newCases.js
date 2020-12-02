const { Connection, Request } = require("tedious");

// Create connection to database
const config = {
  authentication: {
    options: {
      userName: "cs4225project", // update me
      password: "1y2u3i4o5P!" // update me
    },
    type: "default"
  },
  server: "cs4225projectdata.database.windows.net", // update me
  options: {
    database: "cs4225projectdata", //update me
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
    `SELECT NC.NewCases, NC.NewCasesSmoothed, NC.Date, CTY.CountryName FROM NewCases NC
    INNER JOIN Country CTY
    ON NC.CountryID = CTY.ID`,
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
    let country;
    columns.forEach(column => {
      //console.log("%s\t%s", column.metadata.colName, column.value);

      const columnName = column.metadata.colName
      if (columnName === "Date")
        row.date = column.value 
      else if (columnName === 'CountryName')
        country = column.value
      else if (columnName === 'NewCases')
        row.cases = column.value
    });

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
      { cases: '17', date: 2020-03-24T00:00:00.000Z },
      { cases: '0', date: 2020-03-25T00:00:00.000Z },
      { cases: '0', date: 2020-03-26T00:00:00.000Z },
    ],
    'Zimbabwe': [
      { cases: '17', date: 2020-03-24T00:00:00.000Z },
      { cases: '0', date: 2020-03-25T00:00:00.000Z },
      { cases: '0', date: 2020-03-26T00:00:00.000Z },
    ],
 * }
 */