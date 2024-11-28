const fs = require("fs");
const colors = require("colors");
const parser = require("./parser.js");

const vg = require("vega");
const vegalite = require("vega-lite");

const cli = require("@caporal/core").default;

cli
  .version("parser-cli")
  .version("0.01")
  // check Data File
  .command("check", "Check if <file> is a valid data file")
  .argument("<file>", "The file to check with Vpf parser")
  //   .option("-s, --showSymbols", "log the analyzed symbol at each step", {
  //     validator: cli.BOOLEAN,
  //     default: false,
  //   })
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      var analyzer = new Parser();
      analyzer.parse(data);

      if (analyzer.errorCount === 0) {
        logger.info("The file is a valid file".green);
      } else {
        logger.info("The file contains error".red);
      }

      //   logger.debug(analyzer.parsedPOI);
    });
  })

  // load data on .txts files (maybe will not be used)
  .command("import", "Load a valid data <file>")
  .argument("<file>", "The file to load")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      var analyzer = new Parser();
      analyzer.load(data);

      if (analyzer.errorCount === 0) {
        logger.info("CRU file loaded into the system".green);
      } else {
        logger.info("The file contains error".red);
      }
    });
  })

  // search rooms being used given a course
  .command("recherche-salle", "Free text search on rooms given a course's name")
  .argument("<file>", "The data file to search")
  .argument("<course>", "The text to look for in courses' names")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      analyzer = new Parser();
      analyzer.parse(data);

      if (analyzer.errorCount === 0) {
        var n = new RegExp(args.course);
        var filtered = analyzer.parsedData.filter((p) => p.name.match(n, "i"));
        // get room's infos
        // salles associées au cours demandé, avec la capacité d'accueil de chaque salle (nom de la salle, capacité, bâtiment)

        var info = [
          { salle: filtered.roomsName, capacite: filtered.capacity },
          { salle: filtered.roomsName, capacite: filtered.capacity },
          //...
        ];

        logger.info("%s", JSON.stringify(info, null, 2));
      } else {
        logger.info("The file contains error".red);
      }
    });
  })

  // show rooms' capacity given a room name
  .command(
    "capacite-salle",
    "Free text search on room's capacity given its name"
  )
  .argument("<file>", "The data file to search")
  .argument("<room>", "The text to look for in rooms' names")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      analyzer = new Parser();
      analyzer.parse(data);

      if (analyzer.errorCount === 0) {
        var n = new RegExp(args.course);
        var filtered = analyzer.parsedData.filter((p) => p.name.match(n, "i"));
        // get room's infos
        // L'utilisateur reçoit une réponse avec le nom de la salle et sa capacité d'accueil (nombre de places).

        var info = {
          salle: filtered.roomName,
          capacite: filtered.capacity,
        };

        logger.info("%s", JSON.stringify(info, null, 2));
      } else {
        logger.info("The .vpf file contains error".red);
      }
    });
  })

  // show if room is available a day and a timeslot
  .command("disponibilité-salle", "Check room's availability given its name")
  .argument("<file>", "The data file to search")
  .argument("<room>", "The text to look for in rooms' names")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      analyzer = new Parser();
      analyzer.parse(data);

      if (analyzer.errorCount === 0) {
        var n = new RegExp(args.course);
        var filtered = analyzer.parsedData.filter((p) => p.name.match(n, "i"));
        // Check availability
        // L'utilisateur souhaite connaître les créneaux horaires disponibles d'une salle donnée sur une semaine.
        // L'utilisateur reçoit la liste des créneaux horaires disponibles de la salle sur une semaine sous forme de tableau (jour, créneau horaire).
        // Get all available timeslots from the actual day + 7 days

        var info = [
          { jour: filtered.date, availability: filtered.availability },
          { jour: filtered.date, availability: filtered.availability },
          //...
        ];

        // diplay as table

        logger.info("%s", JSON.stringify(info, null, 2));
      } else {
        logger.info("The .vpf file contains error".red);
      }
    });
  })

  // show if room's available given a timeslot
  .command("salles-disponibles", "Check rooms available given a timeslot")
  .argument("<file>", "The data file to search")
  .argument("<room>", "The text to look for in rooms' names")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      analyzer = new Parser();
      analyzer.parse(data);

      if (analyzer.errorCount === 0) {
        var n = new RegExp(args.course);
        var filtered = analyzer.parsedData.filter((p) => p.name.match(n, "i"));
        // Check which rooms are available in a specific timeslot; since there's no date, use the current day
        // L'utilisateur reçoit la liste des salles disponibles pour l'horaire donné, sous forme de tableau avec nom de la salle, capacité et bâtiment.

        var info = [
          {
            name: filtered.roomName,
            capacite: filtered.roomCapacity,
            batiment: filtered.roomBatiment,
          },
          {
            name: filtered.roomName,
            capacite: filtered.roomCapacity,
            batiment: filtered.roomBatiment,
          },
        ];

        logger.info("%s", JSON.stringify(info, null, 2));
      } else {
        logger.info("The .vpf file contains error".red);
      }
    });
  })

  // export iCalendar
  .command("generer-icalendar", "Generate iCalendar file for a period")
  .argument("<file>", "The data file to search")
  .argument("<date_debut>", "Start of the searched period in format YYYY-MM-DD")
  .argument("<date_fin>", "End of the searched period in format YYYY-MM-DD")
  .argument("<cours>", "Course searched to export")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      analyzer = new Parser();
      analyzer.parse(data);

      if (analyzer.errorCount === 0) {
        var n = new RegExp(args.course);
        var filtered = analyzer.parsedData.filter((p) => p.name.match(n, "i"));
        //
        // L'utilisateur reçoit la liste des salles disponibles pour l'horaire donné, sous forme de tableau avec nom de la salle, capacité et bâtiment.

        var info = [
          {
            name: filtered.roomName,
            capacite: filtered.roomCapacity,
            batiment: filtered.roomBatiment,
          },
          {
            name: filtered.roomName,
            capacite: filtered.roomCapacity,
            batiment: filtered.roomBatiment,
          },
        ];

        logger.info("%s", JSON.stringify(info, null, 2));
      } else {
        logger.info("The .vpf file contains error".red);
      }
    });
  })

  // average with chart
  .command(
    "averageChart",
    "Compute the average note of each POI and export a Vega-lite chart"
  )
  .alias("avgChart")
  .argument("<file>", "The Vpf file to use")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      analyzer = new VpfParser();
      analyzer.parse(data);

      if (analyzer.errorCount === 0) {
        var avg = analyzer.parsedPOI.map((p) => {
          var m = 0;
          // compute the average for each POI
          if (p.ratings.length > 0) {
            m =
              p.ratings.reduce((acc, elt) => acc + parseInt(elt), 0) /
              p.ratings.length;
          }
          p["averageRatings"] = m;
          return p;
        });

        var avgChart = {
          //"width": 320,
          //"height": 460,
          data: {
            values: avg,
          },
          mark: "bar",
          encoding: {
            x: {
              field: "name",
              type: "nominal",
              axis: { title: "Restaurants' name." },
            },
            y: {
              field: "averageRatings",
              type: "quantitative",
              axis: { title: "Average ratings for " + args.file + "." },
            },
          },
        };

        const myChart = vegalite.compile(avgChart).spec;

        /* SVG version */
        var runtime = vg.parse(myChart);
        var view = new vg.View(runtime).renderer("svg").run();
        var mySvg = view.toSVG();
        mySvg.then(function (res) {
          fs.writeFileSync("./result.svg", res);
          view.finalize();
          logger.info("%s", JSON.stringify(myChart, null, 2));
          logger.info("Chart output : ./result.svg");
        });

        /* Canvas version */
        /*
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('canvas').background("#FFF").run();
			var myCanvas = view.toCanvas();
			myCanvas.then(function(res){
				fs.writeFileSync("./result.png", res.toBuffer());
				view.finalize();
				logger.info(myChart);
				logger.info("Chart output : ./result.png");
			})			
			*/
      } else {
        logger.info("The .vpf file contains error".red);
      }
    });
  })

  // abc
  .command("abc", "Organize POI in an Object grouped by name")
  .argument("<file>", "The Vpf file to group by")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      analyzer = new VpfParser();
      analyzer.parse(data);

      if (analyzer.errorCount === 0) {
        var abc = analyzer.parsedPOI.reduce(function (acc, elt) {
          var idx = elt.name.charAt(0);
          if (acc[idx]) {
            acc[idx].push(elt);
          } else {
            acc[idx] = [elt];
          }
          return acc;
        }, {});

        logger.info("%s", JSON.stringify(abc, null, 2));
      } else {
        logger.info("The .vpf file contains error".red);
      }
    });
  });

cli.run(process.argv.slice(2));
