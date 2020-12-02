const { Connection, Request } = require("tedious");

const port = 5000

const express = require('express')
const app = express()
const mongoose = require('mongoose')

require('dotenv/config')


const configTH = {
    authentication: {
      options: {
        userName: process.env.AZURE_SQL_USERNAME_TH, // update me
        password: process.env.AZURE_SQL_PASSWORD_TH // update me
      },
      type: "default"
    },
    server: process.env.AZURE_SQL_SERVER_TH, // update me
    options: {
      database: process.env.AZURE_SQL_DATABASE_TH, //update me
      encrypt: true
    }
  };

  const configSyl = {
    authentication: {
      options: {
        userName: process.env.AZURE_SQL_USERNAME_SYL, // update me
        password: process.env.AZURE_SQL_PASSWORD_SYL // update me
      },
      type: "default"
    },
    server: process.env.AZURE_SQL_SERVER_SYL, // update me
    options: {
      database: process.env.AZURE_SQL_DATABASE_SYL, //update me
      encrypt: true
    }
  };


// import Routes
const postsRoute = require('./routes/posts')

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.get('/sentiment', (req, res) => {
  // Create connection to database  
  const connection = new Connection(configTH);
  
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
      `SELECT * FROM [dbo].[sentimentCount]`,
      (err, rowCount) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log(`${rowCount} row(s) returned`);
        }
      }
    );
  
    const data = {}
    let date, country, positiveCount, neutralCount, negativeCount;
    request.on("row", columns => {
      columns.forEach(column => {
        //console.log("%s\t%s", column.metadata.colName, column.value);

        const colName = column.metadata.colName;

        if (colName === '_c0')
            date = column.value
        else if (colName === '_c2')
            country = column.value
        else if (colName === 'positive_Count')
            positiveCount = column.value
        else if (colName === 'neutral_Count')
            neutralCount = column.value
        else if (colName === 'negative_Count')
            negativeCount = column.value
      });

        // ratio = p / (p + negative)
        const sentimentRatio = parseFloat(parseInt(positiveCount) / (parseInt(positiveCount) + parseInt(negativeCount))).toFixed(2)
        const content = {
            sentimentRatio: sentimentRatio,
            date: date
        }

        if (country in data)
            data[country].push(content)
        else
            data[country] = [content]
    });

    request.on("requestCompleted", () => {
        //console.log("request completed", data)

        // before sending data, sort the date order in ascending order
        Object.keys(data).forEach(key => {
          data[key].sort((a,b) => (new Date(a.date) > new Date(b.date)) ? 1 : ((new Date(b.date) > new Date(a.date)) ? -1 : 0));
        })
        res.send(data)
      })
  
    console.log('request', request)
  
    connection.execSql(request);
  }
})


app.get('/cases', (req, res) => {
    // Create connection to database  
    const connection = new Connection(configSyl);
    
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
          ON NC.CountryID = CTY.ID`, // TODO: FILTER BY DATE
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
          //console.log("request completed", data)
          Object.keys(data).forEach(key => {
            data[key].sort((a,b) => (new Date(a.date) > new Date(b.date)) ? 1 : ((new Date(b.date) > new Date(a.date)) ? -1 : 0));
          })
          res.send(data)
        })
      
        connection.execSql(request);
      }
  })

  
app.get('/death', (req, res) => {
    // Create connection to database  
    const connection = new Connection(configSyl);
    
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
          `SELECT ND.NewDeaths, ND.NewDeathsSmoothed, ND.Date, CTY.CountryName FROM NewDeaths ND
          INNER JOIN Country CTY
          ON ND.CountryID = CTY.ID`, // TODO: FILTER BY DATE
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
            else if (columnName === 'NewDeaths')
              row.deaths = column.value
          });
      
          if (country in data) 
            data[country].push(row)
          else
            data[country] = [row]
        });
      
        request.on("requestCompleted", () => {
          //console.log("request completed", data)
          Object.keys(data).forEach(key => {
            data[key].sort((a,b) => (new Date(a.date) > new Date(b.date)) ? 1 : ((new Date(b.date) > new Date(a.date)) ? -1 : 0));
          })
          res.send(data)
        })
      
        connection.execSql(request);
      }
  })


app.get('/test', (req, res) => {
    // Create connection to database  
    const connection = new Connection(configSyl);

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
            `SELECT NT.NewTests, NT.Date, CTY.CountryName FROM NewTests NT
            INNER JOIN Country CTY
            ON NT.CountryID = CTY.ID`, // TODO: FILTER BY DATE
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
                else if (columnName === 'NewTests')
                    row.tests = column.value
            });
        
            if (country in data) 
                data[country].push(row)
            else
                data[country] = [row]
        });
        
        request.on("requestCompleted", () => {
            //console.log("request completed", data)
            Object.keys(data).forEach(key => {
              data[key].sort((a,b) => (new Date(a.date) > new Date(b.date)) ? 1 : ((new Date(b.date) > new Date(a.date)) ? -1 : 0));
            })
            res.send(data)
        })
        
        connection.execSql(request);
    }
})

app.get('/hospital-bed', (req, res) => {
    // Create connection to database  
    const connection = new Connection(configSyl);

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
            `SELECT BPT.BedsPerThousand, BPT.Date, CTY.CountryName FROM BedsPerThousand BPT
            INNER JOIN Country CTY
            ON BPT.CountryID = CTY.ID`, // TODO: FILTER BY DATE
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
                else if (columnName === 'BedsPerThousand')
                    row.bedsPerThousand = column.value
            });
        
            if (country in data) 
                data[country].push(row)
            else
                data[country] = [row]
        });
        
        request.on("requestCompleted", () => {
            //console.log("request completed", data)
            Object.keys(data).forEach(key => {
              data[key].sort((a,b) => (new Date(a.date) > new Date(b.date)) ? 1 : ((new Date(b.date) > new Date(a.date)) ? -1 : 0));
            })
            res.send(data)
        })
        
        connection.execSql(request);
    }
})

app.get('/basic-handwashing-facilities', (req, res) => {
    // Create connection to database  
    const connection = new Connection(configSyl);

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
            `SELECT HF.HandwashingShare, HF.Date, CTY.CountryName FROM HandwashingFacilities HF
            INNER JOIN Country CTY
            ON HF.CountryID = CTY.ID`, // TODO: FILTER BY DATE
            
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
                else if (columnName === 'HandwashingShare')
                    row.handwashingShare = column.value
            });
        
            if (country in data) 
                data[country].push(row)
            else
                data[country] = [row]
        });
        
        request.on("requestCompleted", () => {
            //console.log("request completed", data)
            Object.keys(data).forEach(key => {
              data[key].sort((a,b) => (new Date(a.date) > new Date(b.date)) ? 1 : ((new Date(b.date) > new Date(a.date)) ? -1 : 0));
            })
            res.send(data)
        })
        
        connection.execSql(request);
    }
})


app.get('/stringency-index', (req, res) => {
    // Create connection to database  
    const connection = new Connection(configSyl);

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
            `SELECT ST.Stringency, ST.Date, CTY.CountryName FROM Stringency ST
            INNER JOIN Country CTY
            ON ST.CountryID = CTY.ID`, // TODO: FILTER BY DATE
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
                else if (columnName === 'Stringency')
                    row.stringency = column.value
            });
        
            if (country in data) 
                data[country].push(row)
            else
                data[country] = [row]
        });
        
        request.on("requestCompleted", () => {
            //console.log("request completed", data)
            Object.keys(data).forEach(key => {
              data[key].sort((a,b) => (new Date(a.date) > new Date(b.date)) ? 1 : ((new Date(b.date) > new Date(a.date)) ? -1 : 0));
            })
            res.send(data)
        })
        
        connection.execSql(request);
    }
})



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

