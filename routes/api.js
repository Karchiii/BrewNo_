const BrewName = require("./../models/BrewName.js");

module.exports = function(req, res, next) {
  
  if (req.params.function == "update-name") {
    console.log("Name:", req.body.brewName);
    console.log("ID:", req.body.brewId);

    // Delete old entries
    BrewName.model.deleteMany({
      brewId: req.body.brewId
    }, (err) => {
      if (err) console.error(err);
    });

    // Create new entry
    const nameChange = new BrewName.model({
      brewId: req.body.brewId,
      name: req.body.brewName
    });

    nameChange.save((err, result) => {});
  }

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end();
}