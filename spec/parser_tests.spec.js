const fs = require('fs/promises');
const path = require('path');
const Parser = require('../parser.js');

describe("Program testing of Parser", function() {
    beforeAll(function() {
        this.parser = new Parser();
        this.validFilePath = path.resolve(__dirname, "../edt.cru");
        this.invalidFilePath = path.resolve(__dirname, "../completely-invalid.cru");
    });

    it("can check if the file has a valid syntax", async function() {
        try {
            const fileContent = await fs.readFile(this.validFilePath, "utf8");
            let isValid = this.parser.check(fileContent);
            expect(isValid).toBeTrue();
        } catch (error) {
            fail(`Error occurred: ${error.message}`);
        }
    });
    
    it("can check if the file has an invalid syntax", async function() {
        try {
            const fileContent = await fs.readFile(this.invalidFilePath, "utf8");            
            let isValid = this.parser.check(fileContent);
            expect(isValid).toBeFalse();
        } catch (error) {
            fail(`Error occurred: ${error.message}`);
        }
    });

    it("can parse the file and convert to course objects", async function() {
        try {
            const fileContent = await fs.readFile(this.validFilePath, "utf8");
            let parsedData = this.parser.parse(fileContent);
            
            expect(parsedData).toBeDefined();
            expect(Array.isArray(parsedData)).toBeTrue();
            expect(parsedData.length).toBeGreaterThan(0);
            
            parsedData.forEach(course => {
                expect(course.course).toBeDefined();
                expect(Array.isArray(course.classes)).toBeTrue();
                course.classes.forEach(classe => {
                    expect(classe).toBeDefined();
                    expect(classe.id).toBeDefined();
                    expect(classe.type).toBeDefined();
                    expect(classe.capacity).toBeDefined();
                    expect(classe.weekday).toBeDefined();
                    expect(classe.startTime).toBeDefined();
                    expect(classe.endTime).toBeDefined();
                    expect(classe.room).toBeDefined();
                });
            });
        } catch (error) {
            fail(`Error occurred: ${error.message}`);
        }
    });

    it("can delete symbols from elements", function() {
        const element = "P=24//";
        const result = this.parser.deleteSymb(element);
        expect(result).toBe("24");
    });

    it("can delete comments from the file", async function() {
        try {
            const fileContent = await fs.readFile(this.validFilePath, "utf8");
            const result = this.parser.deleteComment(fileContent);
            expect(result).toBeDefined();
            expect(result).not.toContain("+MC01");
        } catch (error) {
            fail(`Error occurred: ${error.message}`);
        }
    });

});