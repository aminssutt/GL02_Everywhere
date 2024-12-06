class ClasseDTO{
    /**
     * Empty constructor 
     */
    constructor(){
        this._id = ""
        this._type = ""
        this._capacity = 0
        this._weekday=""
        this._startTime=""
        this._endTime=""
        this._subGroup=""
        this._room=""
    }
    /** Getter of the id */
    get id() { return this._id }
    /** Getter of the type */
    get type() { return this._type }
    /** Getter of the capacity */
    get capacity() { return this._capacity }
    /** Getter of the weekday */
    get weekday() { return this._weekday }
    /** Getter of the starttime */
    get startTime() { return this._startTime }
    /** Getter of the entime */
    get endTime() { return this._endTime }
    /** Getter of the subgroup */
    get subGroup() { return this._subGroup }
    /** Getter of the room */
    get room() { return this._room }
    
    /**Setter of the id */
    set id(value) { this._id=value }
    /**Setter of the type */
    set type(value) { this._type = value}
    /**Setter of the capacity */
    set capacity(value) { this._capacity = value}
    /**Setter of the weekday */
    set weekday(value) { this._weekday = value}
    /**Setter of the start time */
    set startTime(value) { this._startTime=value }
    /**Setter of the end time */
    set endTime(value) { this._endTime=value }
    /**Setter of the subgroup */
    set subGroup(value) { this._subGroup = value }
    /**Setter of the room */
    set room(value) { this._room = value }

    transformIntoJson(){
        let json={
            id: this.id,
            type: this.type,
            capacity: this.capacity,
            weekday: this.weekday,
            startTime: this.startTime,
            endTime: this.endTime,
            subGroup: this.subGroup,
            room: this.room
        }
        return json;
    }
}
module.exports = ClasseDTO