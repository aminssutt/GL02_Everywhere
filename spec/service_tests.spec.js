const Service = require('../service.js');
const path = require('path');

describe("Program testing of service", function() {
    beforeAll(function() {
        this.service = new Service();
        this.validFilePath = path.resolve(__dirname, "../data.cru");
    });

    it("can check if the file has a valid syntax", async function() {
        try {
            let result = await this.service.check(this.validFilePath);
            expect(result).not.toBe("The .cru file contains error");
            expect(typeof result).toBe('object');
        } catch (error) {
            fail(`Error occurred: ${error.message}`);
        }
    });


    it("can search for room by course", async function() {
        try {
            const result = await this.service.rechercheSalle(this.validFilePath, "MC01");
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
        } catch (error) {
            fail(`Error occurred: ${error.message}`);
        }
    });

    it("can get the capacity of a room", async function() {
        try {
            const result = await this.service.capaciteSalle(this.validFilePath, "P202");
            expect(result).toBeDefined();
            expect(result.capacite).toBe('24');
        } catch (error) {
            fail(`Error occurred: ${error.message}`);
        }
    });

    it("can get availability of a room", async function() {
        try {
            const result = await this.service.disponibiliteSalle(this.validFilePath, "P202");
            expect(result).toBeDefined();
            expect(result.V).toContain("08:00-20:00");
        } catch (error) {
            fail(`Error occurred: ${error.message}`);
        }
    });

    it("can get available rooms for a timeslot", async function() {
        try {
            const result = await this.service.sallesDisponibles(this.validFilePath, "10:00-12:00");

            expect(result).toBeDefined();
            expect(typeof result).toBe("object");
    
            let hasAvailableRooms = false;
            for (let key in result) {
                if (result[key] && Array.isArray(result[key]) && result[key].length > 0) {
                    hasAvailableRooms = true;
                    break;
                }
            }
            expect(hasAvailableRooms).toBeTrue();
        } catch (error) {
            fail(`Error occurred: ${error.message}`);
        }
    });

    it("can generate iCalendar file for a given date range and course", async function() {
        try {
            const result = await this.service.genererICalendar(this.validFilePath, "2024-12-01", "2024-12-31", "MC01");
            expect(result).toBeDefined();
            expect(result.message).toBe("File created sucessfully");
        } catch (error) {
            fail(`Error occurred: ${error.message}`);
        }
    });

    it("can calculate room occupation rate", async function() {
        try {
            const result = await this.service.tauxOccupation(this.validFilePath);
            expect(result).toBeDefined();
            expect(result.message).toBe("Chart generated successfully");
        } catch (error) {
            fail(`Error occurred: ${error.message}`);
        }
    });

    it("can sort rooms by capacity", async function() {
        try {
            const result = await this.service.classementSalles(this.validFilePath, "asc");
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].capacite).toBeLessThanOrEqual(result[1].capacite);
        } catch (error) {
            fail(`Error occurred: ${error.message}`);
        }
    });

});