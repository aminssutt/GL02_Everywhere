/** Example of file parsed
+MC01
1,C1,P=24,H=J 10:00-12:00,F1,S=P202//
1,T1,P=24,H=J 13:00-16:00,F2,S=EXT1//
+ME01
1,C1,P=48,H=MA 8:00-12:00,F1,S=C104//
1,D1,P=48,H=ME 8:00-12:00,F1,S=C102//
+ME02
1,C1,P=38,H=V 8:00-12:00,F1,S=B101//
1,D1,P=38,H=V 12:00-16:00,F1,S=B101//
1,T1,P=38,H=V 16:00-20:00,F1,S=B101//
+ME05
1,C1,P=62,H=ME 12:00-16:00,F1,S=B101//
1,D1,P=64,H=ME 16:00-20:00,F1,S=B101//
*/

class Parser {
  constructor() {
    this.symb = ["P=", "H=", "S="];
    this.regex = `/^(?:\+\w{2}\d{2}$(?:\r?\n|$)|\d,[A-Z]\d,P=\d+,H=(L|MA|ME|J|V|S|D) (\d|1\d|2[0-3]):[0-5]\d-(0\d|1\d|2[0-3]):[0-5]\d,[A-Z]\d,S=\w+\/\/$(?:\r?\n|$))+/gm`;
  }

  /**
   * Test if the file is in a good format
   * @param {string} data
   * @returns
   */
  check(data) {
    return parser.regex.test(data);
  }
  /**
   * parse the data from a string to an array of objects
   * @param {*} data
   * @returns
   */
  parse(data) {
    check(data);
    let coursesStr = data.split("+");
    let courses = [];
    for (let i = 0; i <= coursesStr.length; i++) {
      course = toCourse(coursesStr[0]);
      courses.add(course);
    }
    return courses;
  }

  /**
   * Put the coursestring to a course and an array of classes
   * @param {string} courseStr :string of a course
   */
  toCourse(courseStr) {
    let course; //a course and an array of classes
    let lines = courseStr.split("\r\n");
    course.course = lines[0];
    let classe; //to put information about a class in a variable
    for (let i = 0; i <= lines.length; i++) {
      lines[i] = lines[i]
        .split("")
        .filter((val, idx) => !val.match(parser.symb))
        .join("");
      let elements = lines[i].split(",");
      classe.id = elements[0];
      classe.type = elements[1];
      classe.capacity = elements[2];
      let date = elements[3].split(" "); //separate weekdate and time
      classe.weekday = date[0];
      let hours = date[1].split("-"); //separate starttime and endtime
      classe.starttime = hours[0];
      classe.endtime = hours[1];
      classe.subgroup = elements[4];
      classe.room = elements[5];
      course.classe.add(classe);
    }
    return course;
  }

  searchRoomByCourse(data, courseName) {
    var filtered = data.filter((p) => p.course.match(courseName, "i"));
    if (filtered.length === 0) {
      return [];
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
    var filtered = data.flatMap((p) => p.classes.filter(item => item.room === roomName));

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

      // console.log(`${day}: ` + availability);
      result[day] = availability;
    });
    return result;
  }

    occupationRate(data, roomName){
        var filtered = data.flatMap((p) => p.classes.filter(item => item.room === roomName));
        var diff = 0; 

        filtered.forEach((item) => {
            let startHoursAsNumber = Number(item.startTime.substring(0,2));
            let startMinutesAsNumber = Number(item.startTime.substring(3,5));
            let endHoursAsNumber = Number(item.endTime.substring(0,2));
            let endMinutesAsNumber = Number(item.endTime.substring(3,5));
            
            diff += (endHoursAsNumber - startHoursAsNumber) + ((endMinutesAsNumber - startMinutesAsNumber)/60);
            
        })

        var info = {nom_salle: roomName, occupation: diff}
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
            D: 0
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
        const mapping = { L: "MO", MA: "TU", ME: "WE", J: "TH", V: "FR", S: "SA", D: "SU" };
        return mapping[weekday] || weekday;
    }

}

module.exports = Parser;
