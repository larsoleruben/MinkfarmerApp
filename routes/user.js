/*
 * GET users listing.
 */


var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

exports.list = function (req, res) {
    res.send("respond with a resource");
};

exports.mortality = function (reg, res) {

    var days = reg.params.days;
    var farmid = reg.params.farmid;
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
        ",[Diagnose_ID] " +
        ",[Diagnose_Description] " +
        ",count(cast( [TimeStamp] as date )) as Quantity " +
        "FROM [MinkFarmer].[dbo].[TreatmentView] " +
        "INNER JOIN [RecursiveLocations] ON [TreatmentView].[LocationID] = [RecursiveLocations].[ID] " +
        "WHERE  cast( [TimeStamp] as date ) >  CONVERT(DATE, DATEADD(day,-"+ days +",SYSDATETIME())) " +
        "and  Actions_ID in (15,16) " +
        "group by  cast( [TimeStamp] as date ) ,[Diagnose_ID],[Diagnose_Description] " +
        "order by date asc, Diagnose_ID asc "


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

    function rowObj(date, diagnose_ID, diagnose_Description, quantity) {
        this.date = date;
        this.diagnose_ID = diagnose_ID;
        this.diagnose_Description = diagnose_Description;
        this.quantity = quantity;
    }

}