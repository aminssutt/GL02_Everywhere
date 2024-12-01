const fs = require("fs");
const colors = require("colors");
const Parser = require("./parser.js");
// const { parser, check, parse, toCourse, availability } = require("./parser");

const vg = require("vega");
const vegalite = require("vega-lite");
const { error } = require("console");
const { start } = require("repl");

const cli = require("@caporal/core").default;

cli
  .version("parser-cli")
  .version("0.01")
  // check Data File
  .command("check", "Check if <file> is a valid data file")
  .argument("<file>", "The file to check with Vpf parser")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      var analyzer = new Parser();
      let info = analyzer.parse(data);
      console.log(info);

      // if (analyzer.errorCount === 0) {
      //   logger.info("The file is a valid file".green);
      // } else {
      //   logger.info("The .cru file contains error".red);
      // }

      //   logger.debug(analyzer.parsedPOI);
    });
  })

  // SPEC_1 search rooms being used given a course
  .command("recherche-salle", "Free text search on rooms given a course's name")
  .argument("<file>", "The data file to search")
  .argument("<cours>", "The text to look for in courses' names")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      let parser = new Parser();
      // analyzer.parse(data);

      // test
      var jsonData = JSON.parse(data);
      var analyzer = { errorCount: 0, parsedData: jsonData };

      if (analyzer.errorCount === 0) {
        var n = new RegExp(args.cours);
        var info = parser.searchRoomByCourse(analyzer.parsedData, n);

        logger.info("%s", JSON.stringify(info, null, 2));
      } else {
        logger.info("The .cru file contains error".red);
      }
    });
  })

  // SPEC_2 show rooms' capacity given a room name
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

      // // test
      // var jsonData = JSON.parse(data);
      // var analyzer = { errorCount: 0, parsedData: jsonData };

      if (analyzer.errorCount === 0) {
        var n = new RegExp(args.room);
        var filtered = analyzer.parsedData
          .flatMap((p) => p.classes)
          .find((item) => item.room.match(n));

        if (filtered) {
          var result = {
            nom_salle: filtered.room,
            capacite: filtered.capacity,
          };
        }

        logger.info("%s", JSON.stringify(result, null, 2));
      } else {
        logger.info("The .cru file contains error".red);
      }
    });
  })

  // SPEC_3 show if room is available a day and a timeslot
  .command("disponibilite-salle", "Check room's availability given its name")
  .argument("<file>", "The data file to search")
  .argument("<room>", "The text to look for in rooms' names")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      let parser = new Parser();
      // analyzer = new Parser();
      // analyzer.parse(data);

      var jsonData = JSON.parse(data);
      var analyzer = { errorCount: 0, parsedData: jsonData };

      if (analyzer.errorCount === 0) {
        var n = new RegExp(args.room);
        info = parser.availability(analyzer.parsedData, n);
        logger.info(`%s`, JSON.stringify(info, null, 2));
      } else {
        logger.info("The .vpf file contains error".red);
      }
    });
  })

  // SPEC_4 show if room's available given a timeslot
  .command("salles-disponibles", "Check rooms available given a timeslot")
  .argument("<file>", "The data file to search")
  .argument("<slot>", "The timeslot searched for availability")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      var parser = new Parser();
      // analyzer = new Parser();
      // analyzer.parse(data);

      //test
      var jsonData = JSON.parse(data);
      var analyzer = { errorCount: 0, parsedData: jsonData };

      if (analyzer.errorCount === 0) {
        var startSlot = args.slot.substring(0, 5);
        var endSlot = args.slot.substring(6, 11);
        var roomsAvaliable = [];

        // all rooms names
        var allRooms = new Set(analyzer.parsedData.flatMap((item) => item.classes).map((item) => item.room));
        allRooms = [...allRooms];

        allRooms.forEach((room) => {
          let avb = parser.availability(analyzer.parsedData, new RegExp(room));

          // check avaliability for each room
          for (let key in avb) {
            for (index in avb[key]) {
              let str = avb[key][index];
              if (str.substring(0, 5) <= startSlot && str.substring(6, 11) >= endSlot) {
                // if available, put in a response all desired data in json format
                roomsAvaliable.push({jour: key, salle: parser.searchRoomByName(analyzer.parsedData, room)})
              }
            }
          }
        });
        
        // format to delete duplicates
        roomsAvaliable = roomsAvaliable.reduce((acc, { jour, salle }) => {
          if (!acc[jour]) acc[jour] = [];
          if (!acc[jour].includes(salle)) acc[jour].push(salle);
          return acc;
        }, {});

        logger.info("%s", JSON.stringify(roomsAvaliable, null, 2));
      } else {
        logger.info("The .cru file contains error".red);
      }
    });
  })

  // SPEC_5 export iCalendar
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

      const parser = new Parser();
      // analyzer = new Parser();
      // analyzer.parse(data);

      //test
      var jsonData = JSON.parse(data);
      var analyzer = { errorCount: 0, parsedData: jsonData };

      if (analyzer.errorCount === 0) {
        const dates = parser.getDatesBetween(args.dateDebut, args.dateFin);

        const courseData = jsonData.find((item) => item.course === args.cours);
        if (!courseData) {
          console.warn(`Course ${args.cours} not found.`);
          return;
        }

        const classes = courseData.classes;
        const icalData = [];

        dates.forEach((date) => {
          classes.forEach((cls) => {
            // Create event for each class
            if (parser.checkWeekday(date, cls.weekday)){
              const event = `BEGIN:VEVENT
              SUMMARY:${args.cours} ${cls.type} (${cls.subGroup})
              DTSTART;TZID=Europe/Paris:${parser.formatDateTime(date, cls.startTime)}
              DTEND;TZID=Europe/Paris:${parser.formatDateTime(date, cls.endTime)}
              RRULE:FREQ=WEEKLY;BYDAY=${parser.convertWeekday(cls.weekday)}
              LOCATION:${cls.room}
              DESCRIPTION: Group ${cls.subGroup}
              END:VEVENT`;
              icalData.push(event);
            }
          });
        })

        // iCalendar file content
        const icalContent = `BEGIN:VCALENDAR
        VERSION:2.0
        PRODID:
        ${icalData.join("\n")}
        END:VCALENDAR`;
        
        const outputFileName = `calendar.ics`;
        fs.writeFile(outputFileName, icalContent, (writeErr) => {
          if (writeErr) {
            console.warn("Error writing iCalendar file:", writeErr);
            return;
          }
          console.log(`iCalendar file generated: ${outputFileName}`);
        });

        // logger.info("%s", JSON.stringify(info, null, 2));
      } else {
        // logger.info("The .vpf file contains error".red);
      }
    });
  })

  // SPEC_6 generate chart
  .command(
    "taux-occupation",
    "Compute the average note of each POI and export a Vega-lite chart"
  )
  .argument("<file>", "The data file to use")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      // analyzer = new Parser();
      // analyzer.parse(data);

      const parser = new Parser();
      var jsonData = JSON.parse(data);
      var analyzer = { errorCount: 0, parsedData: jsonData };

      if (analyzer.errorCount === 0) {
        var allRooms = new Set(analyzer.parsedData.flatMap((item) => item.classes).map((item) => item.room));
        allRooms = [...allRooms];
        var chartData = [];

        allRooms.forEach((item) => {
          chartData.push(parser.occupationRate(analyzer.parsedData, item))
        })

        var pieChart = {
          data: {
            values: chartData,
          },
          mark: "arc",
          encoding: {
            theta: {
              field: "occupation",
              type: "quantitative",
              stack: true,
              axis: { title: "Occupations" },
            },
            color: {
              field: "nom_salle",
              type: "nominal",
              legend: { title: "Rooms" },
            },
          },
        };
        
        const chart = vegalite.compile(pieChart).spec;
        
        /* SVG version */
        var runtime = vg.parse(chart);
        var view = new vg.View(runtime).renderer("svg").run();
        var mySvg = view.toSVG();
        mySvg.then(function (res) {
          fs.writeFileSync("./pie_chart.svg", res);
          view.finalize();
          logger.info("%s", JSON.stringify(chart, null, 2));
          logger.info("Pie chart output : ./pie_chart.svg");
        });

      } else {
        // logger.info("The .vpf file contains error".red);
      }
    });
  })

  // Sort class by its size
  .command("classement-salles", "Organize rooms in an an array ordered by size")
  .argument("<file>", "The .cru file to group by")
  .argument("<ordre>", "The type of order")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      // analyzer = new Parser();
      // analyzer.parse(data);

      // const parser = new Parser();
      var jsonData = JSON.parse(data);
      var analyzer = { errorCount: 0, parsedData: jsonData };


      if (analyzer.errorCount === 0) {
        var allRooms = Array.from(
          new Set(analyzer.parsedData
            .flatMap((item) => item.classes)
            .map((item) => JSON.stringify({ nom_salle: item.room, capacite: item.capacity })))
        ).map((item) => JSON.parse(item));

        if (args.ordre.includes("des")){
          allRooms = allRooms.sort((a, b) => b.capacite - a.capacite);
        }else{
          allRooms = allRooms.sort((a, b) => a.capacite - b.capacite);
        }

        logger.info("%s", JSON.stringify(allRooms, null, 2));
      } else {
        logger.info("The .cru file contains error".red);
      }
    });
  });

cli.run(process.argv.slice(2));
