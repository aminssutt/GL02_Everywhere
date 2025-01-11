const fs = require("fs/promises");
const colors = require("colors");
const Parser = require("./parser.js");
const vg = require("vega");
const vegalite = require("vega-lite");
const { error } = require("console");
const { start } = require("repl");

class Service {
  constructor() {
    this.parser = new Parser();
  }

  /**
   * receive a .CRU file and check its sintax
   * @param {file} - string path to a CRU file
   */
  async check(file) {
    const data = await fs.readFile(file, "utf8");
    const jsonData = this.parser.parse(data);

    if (typeof jsonData === "object") {
      return jsonData;
    } else {
      return "The .cru file contains error";
    }
  }

  /**
   * @param {file}  - path of the .cru file
   * @param {cours}  - course to check rooms associated
   * @returns returns an array with json objects of filtered info os courses' rooms
   * { nom_salle: '', capacite: '', batiment: '' }
   */
  async rechercheSalle(file, cours) {
    const data = await fs.readFile(file, "utf8");
    const jsonData = this.parser.parse(data);

    if (typeof jsonData === "object") {
      let n = new RegExp(cours);
      let info = this.searchRoomByCourse(jsonData, n);

      return info;
    } else {
      return "The .cru file contains error";
    }
  }

  /**
   * @param {file}  - path of the .cru file
   * @param {room}   - room being searched
   * @returns an json object with filtered information about the room
   *  { nom_salle, capacite }
   */
  async capaciteSalle(file, room) {
    const data = await fs.readFile(file, "utf8");
    const jsonData = this.parser.parse(data);

    if (typeof jsonData === "object") {
      let result = {};
      let n = new RegExp(room);
      let filtered = jsonData
        .flatMap((p) => p.classes)
        .find((item) => item.room.match(n));

      if (filtered) {
        result = {
          nom_salle: filtered.room,
          capacite: filtered.capacity,
        };
      }

      return result;
    } else {
      return "The .cru file contains error";
    }
  }

  /**
   * @param {file}  - path of the .cru file
   * @param {room}  - room being checked about availability
   * @returns a json object with timeslots of the room available at each day of the week
   *  { L: ["08:00-12:00"], MA: ["09:00-11:00", "14:00-16:00"] ... }
   */
  async disponibiliteSalle(file, room) {
    const data = await fs.readFile(file, "utf8");
    const jsonData = this.parser.parse(data);

    if (typeof jsonData === "object") {
      var n = new RegExp(room);
      return this.availability(jsonData, n);
    } else {
      return "The .cru file contains error";
    }
  }

  /**
   * @param {file}  - path of the .cru file
   * @param {slot}  - timeslot to check which rooms are available
   * @returns a json object with a list of rooms available for every day of the week
   * { L: [ { nom_salle 'P202', capacite: 24, batiment: P } ... ], ... }
   */
  async sallesDisponibles(file, slot) {
    const data = await fs.readFile(file, "utf8");
    const jsonData = this.parser.parse(data);

    if (typeof jsonData === "object") {
      var startSlot = slot.substring(0, 5);
      var endSlot = slot.substring(6, 11);
      var roomsAvaliable = [];

      // all rooms names without duplicates
      var allRooms = new Set(
        jsonData.flatMap((item) => item.classes).map((item) => item.room),
      );
      allRooms = [...allRooms];

      allRooms.forEach((room) => {
        let avb = this.availability(jsonData, new RegExp(room));

        // check avaliability for each room
        for (let key in avb) {
          for (let index in avb[key]) {
            let str = avb[key][index];
            if (
              str.substring(0, 5) <= startSlot &&
              str.substring(6, 11) >= endSlot
            ) {
              // if available, put in a response all desired data in json format
              roomsAvaliable.push({
                jour: key,
                salle: this.searchRoomByName(jsonData, room),
              });
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

      return roomsAvaliable;
    } else {
      return "The .cru file contains error";
    }
  }

  /**
   * @param {file}  - path of the .cru file
   * @param {dateDebut}  - date when the interval of the ics file starts on format YYYY-MM-DD
   * @param {dateFin}  - date when the interval of the ics file ends on format YYYY-MM-DD
   * @param {cours}  - course with the info being exported
   * @returns returns a json object with sucessful message and creates an .ics file in the same relative path
   */
  async genererICalendar(file, dateDebut, dateFin, cours) {
    const data = await fs.readFile(file, "utf8");
    const jsonData = this.parser.parse(data);

    if (typeof jsonData === "object") {
      const dates = this.getDatesBetween(dateDebut, dateFin);
      const courseData = jsonData.find((item) => item.course === cours);

      if (!courseData) {
        console.warn(`Course ${cours} not found.`);
        return;
      }

      const classes = courseData.classes;
      const icalData = [];

      dates.forEach((date) => {
        classes.forEach((cls) => {
          // Create event for each booked class
          if (this.checkWeekday(date, cls.weekday)) {
            const event = `BEGIN:VEVENT
            SUMMARY:${cours} ${cls.type} (${cls.subGroup})
            DTSTART;TZID=Europe/Paris:${this.formatDateTime(date, cls.startTime)}
            DTEND;TZID=Europe/Paris:${this.formatDateTime(date, cls.endTime)}
            RRULE:FREQ=WEEKLY;BYDAY=${this.convertWeekday(cls.weekday)}
            LOCATION:${cls.room}
            DESCRIPTION: Group ${cls.subGroup}
            END:VEVENT`;
            icalData.push(event);
          }
        });
      });

      // iCalendar file header
      const icalContent = `BEGIN:VCALENDAR
      VERSION:2.0
      PRODID:
      ${icalData.join("\n")}
      END:VCALENDAR`;

      // create file
      const outputFileName = `calendar.ics`;
      fs.writeFile(outputFileName, icalContent, (writeErr) => {
        if (writeErr) {
          console.warn("Error writing iCalendar file:", writeErr);
          return;
        }
        console.log(`iCalendar file generated: ${outputFileName}`);
      });

      return { message: "File created sucessfully" };
    } else {
      return "The .cru file contains error";
    }
  }

  /**
   * @param {file}  - path of the .cru file
   * @returns returns a json object with sucessful message and creates a .svg file with the chart of the occupancy rate
   */
  async tauxOccupation(file) {
    const data = await fs.readFile(file, "utf8");
    var jsonData = this.parser.parse(data);

    if (typeof jsonData === "object") {
      var allRooms = new Set(
        jsonData.flatMap((item) => item.classes).map((item) => item.room),
      );
      allRooms = [...allRooms];
      var chartData = [];

      allRooms.forEach((item) => {
        chartData.push(this.occupationRate(jsonData, item));
      });

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
        fs.writeFile("./pie_chart.svg", res);
        view.finalize();
        // console.log("%s", JSON.stringify(chart, null, 2));
        // console.log("Pie chart output : ./pie_chart.svg");
      });

      return { message: "Chart generated successfully" };
    } else {
      return "The .cru file contains error";
    }
  }

  /**
   * @param {file}  - path of the .cru file
   * @param {ordre}  - type of ordering (asc or desc)
   * @returns a json array with objects filtering rooms info
   *  { nom_salle: 'P201', capacite: 24 }
   */
  async classementSalles(file, ordre) {
    const data = await fs.readFile(file, "utf8");
    var jsonData = this.parser.parse(data);

    if (typeof jsonData === "object") {
      var allRooms = Array.from(
        new Set(jsonData
            .flatMap((item) => item.classes)
            .map((item) => JSON.stringify({
                nom_salle: item.room,
                capacite: item.capacity
            }))
        )
    ).map((item) => JSON.parse(item))
    .sort((a, b) => {
        // Gestion des cas où la capacité est "unknown"
        if (a.capacite === "unknown") return 1;
        if (b.capacite === "unknown") return -1;
    
        // Comparaison classique pour les valeurs numériques
        return parseInt(a.capacite) - parseInt(b.capacite);
    });

      /*old version = var allRooms = Array.from(
        new Set(
          jsonData
            .flatMap((item) => item.classes)
            .map((item) =>
              JSON.stringify({ nom_salle: item.room, capacite: item.capacity }),
            ),
        ),
      ).map((item) => JSON.parse(item));*/

      if (ordre.includes("des")) {
        allRooms = allRooms.sort((a, b) => b.capacite - a.capacite);
      } else {
        allRooms = allRooms.sort((a, b) => a.capacite - b.capacite);
      }

      return allRooms;
    } else {
      return "The .cru file contains error";
    }
  }

  searchRoomByCourse(data, courseName) {
    var filtered = data.filter((p) => p.course.match(courseName, "i"));
    if (filtered.length === 0) {
      return "No course available with this name";
    } else {
      var info = filtered[0].classes.map((item) => {
        let f = {
          nom_salle: item.room,
          capacite: item.capacity,
          batiment: item.room.charAt(0),
        };

        return f;
      });

      return info;
    }
  }

  searchRoomByName(data, roomName) {
    var filtered = data.flatMap((p) =>
      p.classes.filter((item) => item.room === roomName),
    );

    if (filtered.length === 0) {
      return {};
    } else {
      var info = {
        nom_salle: filtered[0].room,
        capacite: filtered[0].capacity,
        batiment: filtered[0].room.charAt(0),
      };

      return info;
    }
  }

  availability(data, n) {
    var filtered = data
      .flatMap((p) => p.classes)
      .filter((p) => p.room.match(n, "i"));
    if (filtered.length === 0) {
      return "Erreur: la salle n'existe pas";
    }
    var days = ["L", "MA", "ME", "J", "V", "S", "D"];
    var result = {};

    days.forEach((day) => {
      let todayClasses = filtered.filter((item) => item.weekday === day);
      var availability = [];

      if (todayClasses.length > 0) {
        todayClasses = todayClasses.sort((a, b) => {
          if (a.startTime < b.startTime) return -1;
          if (a.startTime > b.startTime) return 1;
          return 0;
        });

        for (let i = 0; i < todayClasses.length; i++) {
          if (i === 0 && !(todayClasses[i].startTime === "08:00")) {
            let slot = "08:00-" + todayClasses[i].startTime;
            availability.push(slot);
          }

          if (
            todayClasses[i + 1] &&
            todayClasses[i].endTime < "20:00" &&
            todayClasses[i].endTime !== todayClasses[i + 1].startTime
          ) {
            let slot =
              todayClasses[i].endTime + "-" + todayClasses[i + 1].startTime;
            availability.push(slot);
          }

          if (!todayClasses[i + 1] && todayClasses[i].endTime < "20:00") {
            let slot = todayClasses[i].endTime + "-20:00";
            availability.push(slot);
          }
        }
      } else {
        availability.push("08:00-20:00");
      }

      result[day] = availability;
    });
    return result;
  }

  occupationRate(data, roomName) {
    var filtered = data.flatMap((p) =>
      p.classes.filter((item) => item.room === roomName),
    );
    var diff = 0;

    filtered.forEach((item) => {
      let startHoursAsNumber = Number(item.startTime.substring(0, 2));
      let startMinutesAsNumber = Number(item.startTime.substring(3, 5));
      let endHoursAsNumber = Number(item.endTime.substring(0, 2));
      let endMinutesAsNumber = Number(item.endTime.substring(3, 5));

      diff +=
        endHoursAsNumber -
        startHoursAsNumber +
        (endMinutesAsNumber - startMinutesAsNumber) / 60;
    });

    var info = { nom_salle: roomName, occupation: diff };
    return info;
  }

  getDatesBetween(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      const formattedDate = currentDate.toISOString().split("T")[0];
      dates.push(formattedDate);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  checkWeekday(date, expectedDay) {
    const daysMapping = {
      L: 1,
      MA: 2,
      ME: 3,
      J: 4,
      V: 5,
      S: 6,
      D: 0,
    };

    const parsedDate = new Date(date);
    const dayOfWeek = parsedDate.getDay();

    return dayOfWeek === daysMapping[expectedDay];
  }

  formatDateTime(date, time) {
    if (!date || !time) {
      throw new Error(`Invalid arguments: date=${date}, time=${time}`);
    }

    return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
  }

  convertWeekday(weekday) {
    const mapping = {
      L: "MO",
      MA: "TU",
      ME: "WE",
      J: "TH",
      V: "FR",
      S: "SA",
      D: "SU",
    };
    return mapping[weekday] || weekday;
  }
}

module.exports = Service;
