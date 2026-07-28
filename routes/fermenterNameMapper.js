const BrewName = require("./../models/BrewName.js");

module.exports = function (req, res, next) {
  req.getFermenterName = async function (id) {
    const name = await new Promise((resolve) => {
      BrewName.model.findOne({
         brewId: id
         }, "brew_name", (err, data) => {
        if (err || !data) resolve(null); // Check if data is null
        else resolve(data.name);
      });
    });

    if (name) return name;

    return [
      "Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrott", "Gold", "Hotel", "India", "Juliette", "Kilo", "Lima", "Mike", "November", "Oscar", "Papa", "Quebec", "Romneo", "Sierra", "Tango", "Victor", "Wiskey", "Xray", "Yankee", "Zulu"
    ][id - 1];
  };

  next();
};