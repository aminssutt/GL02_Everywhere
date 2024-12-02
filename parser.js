const ClasseDTO = require("./classeDTO");
const CourseDTO = require("./courseDTO");

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

class Parser{
    constructor(){
        this.symb = ["P=", "H=", "S=", "//"]
        this.regex = /^(?:\+\w{2}\d{2}$(?:\r?\n|$)|\d,[A-Z]\d,P=\d+,H=(L|MA|ME|J|V|S|D) (\d|1\d|2[0-3]):[0-5]\d-(0\d|1\d|2[0-3]):[0-5]\d,[A-Z]\d,S=\w+\/\/$(?:\r?\n|$))+/gm
        this.parseddata = []
    }
    
    /**
     * Test if the file is in a good format
     * @param {string} data 
     * @returns 
     */
    check(data){
        return this.regex.test(data);
    }
    /**
     * parse the data from a string to an array of objects
     * @param {string} data 
     * @returns 
     */
    parse(data){
        this.check(data);
        //data = this.deleteComment(data);
        let coursesStr = data.split('+')
        let courses = [];
        for (let i=0; i<=coursesStr.length-1; i++){
            let course = this.toCourse(coursesStr[i]);
            console.log(course)
            courses.push(course);
        }
        return courses;
    }
    
    /**
     * Put the coursestring to a course and an array of classes
     * @param {string} courseStr :string of a course 
     */
    toCourse(courseStr){
        let course = new CourseDTO(); //a course and an array of classes
        let lines = courseStr.split('\r\n')
        course.course = lines[0]
        for (let i = 1; i<lines.length-1; i++){
            let classe = new ClasseDTO() //to put information about the class in a variable
            lines[i] = lines[i].split('').filter((val, idx) => !val.match(this.symb)).join('')
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
            course.classes.push(classe) 
        }
        return course;
    }

    /**
     * Delete the useless row of the file
     * @param {*} data 
     * @returns 
     */
    deleteComment(data){
        let dataArray = data.split('')
        let counterPlus = 0
        let indexDelete= -1;
        for (let i = 0; i<=dataArray.length;i++){
            if (dataArray[i]==='+'){
                counterPlus += 1
                if (counterPlus ===2){
                    indexDelete = i
                }
            }
        }
        let withoutStartComment = dataArray.slice(indexDelete, dataArray.length).join('')
        let searchEndArray = withoutStartComment.split('\r\n')
        let toDelete=[];
        for (let i = 0; i<searchEndArray.length; i++){
            if (searchEndArray[i]===''){
                toDelete.push(i)
            }
        }
        for (let i= toDelete.length ; i>=0; i--){
            searchEndArray.splice(toDelete[i], 1)
        }
        //searchEndArray.pop()
        let withoutEndComment = searchEndArray.join('\r\n')
        return withoutEndComment
        //ca supprime la premiere ligne, et ca me laisse des espaces en bas
    }
}
module.exports = Parser;

