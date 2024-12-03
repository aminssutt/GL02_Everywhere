
class Service{

  constructor(){
    
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

module.exports = Service; 