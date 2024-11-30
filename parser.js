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

let parser = function(){
    this.symb = ["P=", "H=", "S="]
    this.regex = `/^(?:\+\w{2}\d{2}$(?:\r?\n|$)|\d,[A-Z]\d,P=\d+,H=(L|MA|ME|J|V|S|D) (\d|1\d|2[0-3]):[0-5]\d-(0\d|1\d|2[0-3]):[0-5]\d,[A-Z]\d,S=\w+\/\/$(?:\r?\n|$))+/gm`
}

/**
 * Test if the file is in a good format
 * @param {string} data 
 * @returns 
 */
let check = function(data){
    return parser.regex.test(data);
}
/**
 * parse the data from a string to an array of objects
 * @param {*} data 
 * @returns 
 */
let parse = function(data){
    check(data);
    let coursesStr = data.split('+')
    let courses = [];
    for (let i=0; i<=coursesStr.length; i++){
        course = toCourse(coursesStr[0]);
        courses.add(course);
    }
    return courses;
}
/**
 * Put the coursestring to a course and an array of classes
 * @param {string} courseStr :string of a course 
 */
let toCourse = function(courseStr){
    let course; //a course and an array of classes
    let lines = courseStr.split('\r\n')
    course.course = lines[0]
    let classe //to put information about a class in a variable
    for (let i = 0; i<=lines.length; i++){
        lines[i] = lines[i].split('').filter((val, idx) => !val.match(parser.symb)).join('')
        let elements = lines[i].split(',');
        classe.id = elements[0];
        classe.type = elements[1]
        classe.capacity = elements[2]
        let date = elements[3].split(' '); //separate weekdate and time
        classe.weekday = date[0]
        let hours = date[1].split('-') //separate starttime and endtime
        classe.starttime = hours[0]
        classe.endtime = hours[1]
        classe.subgroup = elements[4]
        classe.room = elements[5]
        course.classe.add(classe) 
    }
    return course;
}

