/*
 * GET users listing.
 */


var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

exports.list = function (req, res) {
    res.send("respond with a resource");
};

exports.conSqlServer = function (reg, res) {


    var days = reg.params.days;
    var farmid = reg.params.farmid;

    /*
     var config = {
     userName: 'larsole_foodcomp',
     password: 'L0rc110901',
     server: 'msdb3.surftown.dk',
     options: {
     "database": 'larsole_ruben'
     }
     }
     */
    var config = {
        userName: 'DsbRef@qzsgd0zt2p',
        password: 'TavsErEnOst1',
        server: 'qzsgd0zt2p.database.windows.net',
        options: {database: 'MinkFarmer',
            encrypt: true }


    }


    var connection = new Connection(config);

    connection.on('connect', function (err) {
            executeStatement();
        }
    );


    connection.on('errorMessage', function (text) {
            console.log(text);
        }
    );


    connection.on('debug', function (text) {
            console.log(text);
        }
    );

    var sqlString1 = "WITH [RecursiveLocations] ([ID],[Name],[Parent], Level) " +
        " AS ( SELECT [Locations].[ID],[Locations].[Name],[Locations].[Parent], 0 AS Level " +
        " FROM [MinkFarmer].[dbo].[Locations] WHERE Locations.[id] IN ("+ farmid +") " +
        " UNION ALL SELECT [Locations].[ID],[Locations].[Name],[Locations].[Parent], Level + 1 " +
        " FROM [MinkFarmer].[dbo].[Locations] " +
        " INNER JOIN [RecursiveLocations] ON [Locations].[Parent] = [RecursiveLocations].[ID]) " +
        " SELECT " +
        " cast( [TimeStamp] as date ) as date " +
        ",[Actions_ID] " +
        ",[Actions_Name] " +
        ",count(cast( [TimeStamp] as date )) as Quantity " +
        "FROM [MinkFarmer].[dbo].[TreatmentView] " +
        "INNER JOIN [RecursiveLocations] ON [TreatmentView].[LocationID] = [RecursiveLocations].[ID] " +
        "WHERE  cast( [TimeStamp] as date ) >  CONVERT(DATE, DATEADD(day,-"+ days +",SYSDATETIME())) " +
        "and  Actions_ID in (15,16) " +
        " group by  cast( [TimeStamp] as date ), [Actions_ID], [Actions_Name], UserID"

    function executeStatement() {

        var tableObj = [];
        var responceString = "Start <br>";

        request = new Request(sqlString1, function (err, rowCount) {
            if (err) {
                console.log(err);
            } else {
                console.log(rowCount + ' rows');
                res.send(JSON.stringify(tableObj));
            }
        });

        request.on('row', function (columns) {
            var actRow = new rowObj(columns[0].value, columns[1].value, columns[2].value, columns[3].value);
            tableObj.push(actRow);
        });

        connection.execSql(request);
    }

    function rowObj(date, Actions_ID, Actions_Name, Quantity) {
        this.date = date;
        this.Actions_ID = Actions_ID;
        this.Actions_Name = Actions_Name;
        this.Quantity = Quantity;
    }

}