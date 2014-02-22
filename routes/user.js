/*
 * GET users listing.
 */


var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

exports.list = function (req, res) {
    res.send("respond with a resource");
};

exports.treatment = function (reg, res) {

    var days = reg.params.days;
    var farmid = reg.params.farmid;
    var reqType = reg.params.reqType;
    var sqlPartString;
    (reqType === "treatment") ? sqlPartString = " not in " : sqlPartString = " in ";

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
        "and  Actions_ID "+ sqlPartString +"(15,16) " +
        "group by  cast( [TimeStamp] as date ) ,[Diagnose_ID],[Diagnose_Description] " +
        "order by date asc, Diagnose_ID asc ";


    function executeStatement() {
        var tableObj = [];
        var request;
        request = new Request(sqlString1, function (err, rowCount) {
            if (err) {
                console.log(err);
                res.jsonp(JSON.stringify(err));
            } else {
                console.log(rowCount + ' rows');
                res.jsonp(JSON.stringify(tableObj));
            }
        });

        request.on('row', function (columns) {
            var actRow = new rowObj(columns[0].value, columns[1].value, columns[2].value, columns[3].value);
            tableObj.push(actRow);
        });

        connection.execSql(request);
    }
}

function rowObj(date, diagnose_ID, diagnose_Description, quantity) {
    this.date = date;
    this.diagnose_ID = diagnose_ID;
    this.diagnose_Description = diagnose_Description;
    this.quantity = quantity;
}



exports.fodder = function( reg, res ){
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

    var sqlString = "select cast(TimeStamp as date) Date, sum( FodderQuantity) FodderQuantity, Name, locationID, FoddermixerID " +
        " from [dbo].[Foddermixers] " +
        " inner join [dbo].[Fodder] " +
        " on [dbo].[Foddermixers].id = fodder.foddermixerID " +
        " where [dbo].[Foddermixers].LocationID = "+ farmid +
        " and cast( [TimeStamp] as date ) >  CONVERT(DATE, DATEADD(day,-"+days+",SYSDATETIME())) " +
        " group by cast(TimeStamp as date), Name, locationID, FoddermixerID " ;

    function executeStatement() {
        var tableObj = [];
        var request;
        request = new Request(sqlString, function (err, rowCount) {
            if (err) {
                console.log(err);
                res.jsonp(JSON.stringify(err));
            } else {
                console.log(rowCount + ' rows');
                res.jsonp(JSON.stringify(tableObj));
            }
        });

        request.on('row', function (columns) {
            var actRow = new fodderRowObj(columns[0].value, columns[1].value, columns[2].value, columns[3].value, columns[4].value);
            tableObj.push(actRow);
        });

        connection.execSql(request);
    }

}

function fodderRowObj( date,  fodderQuantity, name, locationID, foddermixerID  ){
    this.name = name;
    this.locationID = locationID;
    this.fodderQuantity = fodderQuantity;
    this.date = date;
    this.foddermixerID = foddermixerID;
}