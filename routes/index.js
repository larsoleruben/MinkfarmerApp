
/*
 * GET home page.
 */

exports.index = function(req, res){
   console.log( req.params.data );
    var commingIn = req.params.data;
  res.render('index', { title: commingIn });
};