class CourseDTO{
    /**
     * Empty constructor
     */
    constructor(){
        this._course
        this._classes = []
    }
    /**
     * Getter of the course
     */
    get course() { return this._course }
    /**
     * Getter of the classes table
     */
    get classes() { return this._classes }
    /**
     * Setter of the course
     * @param {string} value 
     */
    set course(value) { this._course = value }
}
module.exports = CourseDTO