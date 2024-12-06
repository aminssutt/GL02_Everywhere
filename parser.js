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
        //Below : the big regex to verify the whole file we are reading
        this.regex = /^(?:\+\w{2}\d{2}$(?:\r?\n|$)|\d,[A-Z]\d,P=\d+,H=(L|MA|ME|J|V|S|D) (\d|1\d|2[0-3]):[0-5]\d-(0\d|1\d|2[0-3]):[0-5]\d,[A-Z]\d,S=\w+\/\/$(?:\r?\n|$))+/gm
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
        try{
            let courses = [];
            if(this.check(data)){
                data = this.deleteComment(data)
                let coursesStr = data.split('+');
                for (let i=0; i<=coursesStr.length-1; i++){
                    let course = this.toCourse(coursesStr[i]);
                    if (course.course !== ''){
                        courses.push(course);
                    }
                }
                this.parseddata = courses;
            }
            else{
                courses="ERROR : the file is not in the right format";
            }
            return courses;
        } catch (error) {
            console.log(error.stack)
        }
    }
    
    /**
     * Put the coursestring to a course and an array of classes
     * @param {string} courseStr :string of a course 
     */
    toCourse(courseStr){
        let course = new CourseDTO(); //a course and an array of classes
        let lines = courseStr.split('\r\n')
        course.course = lines[0];
        for (let i = 1; i<=lines.length-1; i++){
            if (lines[i]!==''){
                let classe = new ClasseDTO() //to put information about the class in a variable
                let elements = lines[i].split(',');
                classe.id = elements[0];
                classe.type = elements[1];
                let capacity = this.deleteSymb(elements[2]); //delete "P="
                classe.capacity = capacity;
                let date = elements[3].split(' '); //separate weekday and time
                let weekday =  this.deleteSymb(date[0]); //delete "H="
                classe.weekday = weekday;
                let hours = date[1].split('-'); //separate starttime and endtime

                if (hours[0].length<= 4){
                    hours[0] = "0" + hours[0]
                }

                if (hours[1].length<= 4){
                    hours[1] = "0" + hours[1]
                }

                classe.startTime = hours[0];
                classe.endTime = hours[1];
                classe.subGroup = elements[4];
                let room=this.deleteSymb(elements[5]); //delete "S="" and "//"
                classe.room = room;
                let classeJSON = classe.transformIntoJson();
                course.classes.push(classeJSON); 
            }
        }
        let courseJSON = course.transformIntoJson();
        return courseJSON;
    }
    
    /**
     * delete the symbols that we don't need to keep
     * @param {string} elt 
     * @returns string 
     */
    deleteSymb(elt){
        let eltTab = elt.split('');
        if(eltTab[0]==="P"||eltTab[0]==="H"||eltTab[0]==="S"){
            if (eltTab[1]==="="){
                eltTab.shift()
                eltTab.shift()
            }
        }
        let lastIndex = eltTab.length
        if(eltTab[lastIndex-2] === '/' && eltTab[lastIndex-1]==='/'){
            eltTab.pop()
            eltTab.pop()
        }
        let eltModified = eltTab.join('');
        return eltModified;
    }

    /**
     * Delete the useless row of the file
     * @param {string} data 
     * @returns data(string) but without useless lines
     */
    deleteComment(data){
        let dataArray = data.split('')
        let counterPlus = 0
        let indexDelete= -1;
        for (let i = 0; i<=dataArray.length;i++){
            if (dataArray[i]==='+'){
                counterPlus += 1
                if (counterPlus === 2){
                    indexDelete = i
                }
            }
        }
        let withoutStartComment = dataArray.slice(indexDelete, dataArray.length).join('')
        let searchEndArray = withoutStartComment.split('\r\n')
        let toDelete=[]; //array of the index we need to delet
        for (let i = 0; i<searchEndArray.length; i++){
            if (searchEndArray[i]===''){
                toDelete.push(i);
            }
        }
        if(toDelete.length !== 0){ //in case of there is nothing to delete otherwise it delete the last line of the document
            for (let i= toDelete.length ; i>=0; i--){ //we take the lines backward so the index of the line to delete doesn't change
                searchEndArray.pop(i);
            }    
        }
        
        //searchEndArray.pop()
        let withoutEndComment = searchEndArray.join('\r\n')
        return withoutEndComment
    }
}
module.exports = Parser;
