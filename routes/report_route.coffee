###
  report form functions

  renders and processes the report form
###
db = require("../models/reports_model"); #load the database

###
  renders the default form of the registration
  @param req      request
  @param res      resource to render
###
exports.index = (req, res)->
  types = ['meow','moo','quack','ribbet','woof']
  res.render('reportform', { types: types })

###
  saves data on form submit for later processing
  @param req.code   random code for identifying route
  @param req.type   report type

###
exports.submit = (req, res) ->
  shortcode = req.body.code;
  type = req.body.type;
  comment = req.body.comment;

  #check for valid code
  if _validateCode() #@todo validate code

    data = {code:shortcode,type:type,comment:comment}
    console.log data
    db.addReport(data,(result) ->
      console.log(result)
      res.send(result)
    )
    #console.log(data)


  return true


  #@todo insertion escaping


_validateCode = () ->
  return true

exports.getall = (req, res) ->
  db.getReports(20, (result) ->
    if result
      res.send(result)
  )