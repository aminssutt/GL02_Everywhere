# Team Everywhere - Project implementation of OG Men
Students: LI Zhenpeng, VIALA Morgane, SESTITO GUERRA Gabriel

## Installing

1. Unzip de the repository file
2. Open the folder GL02_Everywhere in terminal
3. Run the command  `npm install`

## Command List

### Check 

The operation checks if the .cru file has a valid syntax. If it does, the CLI will display the content in a JSON format.

Parameters:
- relative path of the .cru file

Exemple of usage
```
node cli.js check ./data.cru
```

### recherche-salle

This command searches for all classrooms linked with a given course, then will generate a JSON array with all the matches. 

Parameters:
- relative path of the .cru file
- name of the course

Exemple of usage
```
node cli.js recherche-salle ./data.cru MC01
```

### capacite-salle

It displays some of searched classroom's information as a JSON Object.

Parameters:
- relative path of the .cru file
- name of the classroom

Exemple of usage
```
node cli.js capacite-salle ./data.cru P202
```

### salles-disponibles

This operation searches for all available classrooms given a specific timeslot. 

Parameters:
- relative path of the .cru file
- timeslot in format `HH:mm-HH:mm`

```
node cli.js salles-disponibles ./data.cru 08:00-12:00
```

### disponibilite-salle

The functionality check all available timeslots for a given clasroom and display by day of week in a JSON Object.

Parameters:
- relative path of the .cru file
- name of the classroom

Exemple of usage
```
node cli.js disponibilite-salle ./data.cru B101
```


### generer-icalendar 

It creates a .ics file with all the timetable of a given course for the time period specified.

Parameters:
- relative path of the .cru file
- start date in format `YYYY-MM-DD`
- end date in format `YYYY-MM-DD`
- name of the course

Exemple of usage
```
node cli.js igenerer-icalendar ./data.cru 2024-10-01 2024-10-31 MC01
```

### taux-occupation

This command generates a classrooms' occupancy rate chart in .svg format

Parameters:
- relative path of the .cru file

Exemple of usage
```
node cli.js taux-occupation ./data.cru
```

### classement-salles

It will show classrooms' capacity sorted by asc or desc

Parameters:
- relative path of the .cru file
- type of sorting

Exemple of usage
```
node cli.js classement-salles ./data.cru desc
```
