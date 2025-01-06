const fs = require("fs");
const Parser = require("./parser.js");
const Service = require("./service.js");
const vg = require("vega");
const vegalite = require("vega-lite");
const { error } = require("console");
const { start } = require("repl");

const cli = require("@caporal/core").default;
const service = new Service();

cli
  .version("parser-cli")
  .version("0.01")
  // check Data File
  .command("check", "Check if <file> is a valid data file")
  .argument("<file>", "The file to check with Vpf parser")
  .action(async ({ args, options, logger }) => {
    
  
    const result = await service.check(args.file);

    if (typeof(result) === 'string') {
      logger.info(result.red);
    } else {
      logger.info("%s", JSON.stringify(result, null, 2));
    }
  
  })

  // SPEC_1 search rooms being used given a course
  .command("recherche-salle", "Free text search on rooms given a course's name")
  .argument("<file>", "The data file to search")
  .argument("<cours>", "The text to look for in courses' names")
  .action(async ({ args, options, logger }) => {
    
    const result = await service.rechercheSalle(args.file, args.cours);

    if (typeof(result) === 'string') {
      logger.info(result.red);
    } else {
      logger.info("%s", JSON.stringify(result, null, 2));
    }

  })

  // SPEC_2 show rooms' capacity given a room name
  .command("capacite-salle", "Free text search on room's capacity given its name")
  .argument("<file>", "The data file to search")
  .argument("<room>", "The text to look for in rooms' names")
  .action(async ({ args, options, logger }) => {
  
    const result = await service.capaciteSalle(args.file, args.room);

    if (typeof(result) === 'string') {
      logger.info(result.red);
    } else if (Object.keys(result).length === 0) {
      logger.info("Erreur: la salle n'existe pas".red);
    } else {
      logger.info("%s", JSON.stringify(result, null, 2));
    }

  })

  // SPEC_3 show if room is available a day and a timeslot
  .command("disponibilite-salle", "Check room's availability given its name")
  .argument("<file>", "The data file to search")
  .argument("<room>", "The text to look for in rooms' names")
  .action(async ({ args, options, logger }) => {
    
    const result = await service.disponibiliteSalle(args.file, args.room);

    if (typeof(result) === 'string') {
      logger.info(result.red);
    } else {
      logger.info("%s", JSON.stringify(result, null, 2));
    }

  })

  // SPEC_4 show if room's available given a timeslot
  .command("salles-disponibles", "Check rooms available given a timeslot")
  .argument("<file>", "The data file to search")
  .argument("<slot>", "The timeslot searched for availability")
  .action(async ({ args, options, logger }) => {
  // Check if the slot is valid
    const slot = args.slot;
  const slotRegex = /^([0-1]\d|2[0-2]):([0-5]\d)-([0-1]\d|2[0-2]):([0-5]\d)$/;
      // check the hour format
  if (!slotRegex.test(slot)) {
    logger.error("Le créneau horaire doit être au format HH:MM-HH:MM, avec des heures entre 08:00 et 22:00 et des minutes entre 00 et 59.");
    return;
  }
    const result = await service.sallesDisponibles(args.file, args.slot);

    if (typeof(result) === 'string') {
      logger.info(result.red);
    } else {
      logger.info("%s", JSON.stringify(result, null, 2));
      console.log('There is no room available at this period of time')
    }

  })

  // SPEC_5 export iCalendar
  .command("generer-icalendar", "Generate iCalendar file for a period")
  .argument("<file>", "The data file to search")
  .argument("<date_debut>", "Start of the searched period in format YYYY-MM-DD")
  .argument("<date_fin>", "End of the searched period in format YYYY-MM-DD")
  .argument("<cours>", "Course searched to export")
  .action(async ({ args, options, logger }) => {
    
    const dateDebut = new Date(args.dateDebut);
    const dateFin = new Date(args.dateFin);
// Check if the dates are valid
  if (isNaN(dateDebut) || isNaN(dateFin)) {
    logger.error("Date invalide.");
    return;
  } else if (dateDebut > dateFin) {
    logger.error("Date of beginning is after the date of end.");
    return;
  }

   // Define the periods where no courses are available
   const noCoursePeriods = [
    { start: new Date('2024-10-22'), end: new Date('2024-11-03') }, // Toussaint
    { start: new Date('2024-12-21'), end: new Date('2025-01-05') }, // Noël
    { start: new Date('2025-02-15'), end: new Date('2025-03-01') }, // Hiver
    { start: new Date('2025-04-12'), end: new Date('2025-04-26') }, // Printemps
    { start: new Date('2025-01-24'), end: new Date('2025-02-01') }  // Intersemestre
  ];

  const isDateInNoCoursePeriod = (date) => {
    return noCoursePeriods.some(period => date >= period.start && date <= period.end);
  };

  if (isDateInNoCoursePeriod(dateDebut) || isDateInNoCoursePeriod(dateFin)) {
    logger.error("Les dates fournies se trouvent dans une période sans cours.");
    return;
  }
  
    const result = await service.genererICalendar(args.file, args.dateDebut, args.dateFin, args.cours);

    if (typeof(result) === 'string') {
      logger.info(result.red);
    } else {
      logger.info("%s", JSON.stringify(result, null, 2));
    }
  }

  )

  // SPEC_6 generate chart
  .command(
    "taux-occupation",
    "Compute the average note of each POI and export a Vega-lite chart"
  )
  .argument("<file>", "The data file to use")
  .action(async ({ args, options, logger }) => {
    
    const result = await service.tauxOccupation(args.file);
    
    if (typeof(result) === 'string') {
      logger.info(result.red);
    } else {
      logger.info("%s", JSON.stringify(result, null, 2));
    }

  })

  // Sort class by its size
  .command("classement-salles", "Organize rooms in an an array ordered by size")
  .argument("<file>", "The .cru file to group by")
  .argument("<ordre>", "The type of order")
  .action(async ({ args, options, logger }) => {
    
    const result = await service.classementSalles(args.file, args.ordre);
    
    if (typeof(result) === 'string') {
      logger.info(result.red);
    } else {
      logger.info("%s", JSON.stringify(result, null, 2));
    }

  });

cli.run(process.argv.slice(2));
