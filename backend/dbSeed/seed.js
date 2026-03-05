/**
 * seed.js
 * location: /dbSeed/seed.js
 * run from backend root: node dbSeed/seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser"); //run npm install csv-parse
const Facility = require("../models/Facility"); // facility 'schema'

const MONGO_URI = process.env.MONGO_URI;

// IMPORTANT: User ID to own the seeded data (admin)
const SYSTEM_USER_ID = "69a8859f33a8b33b4e1bcca7";

// the filename to process
const CSV_FILE_NAME = "facility_dataset_.csv";
const CSV_FILE_PATH = path.join(__dirname, "facility_dataset_.csv");

// helper function to extract the real image URL from the Google Search redirect
// function cleanUrl(url) {
//   if (!url) return "";
//   if (url.includes("search?q=")) {
//     // extract the part after 'search?q=' and decode it
//     const parts = url.split("search?q=");
//     return decodeURIComponent(parts[1]);
//   }
//   return url;
// }

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to Database.");

    //clear old data to prevent "Unknown Facility" clutter
    console.log("Wiping existing facility from collection");
    await Facility.deleteMany({});
    console.log("Collection cleared.");

    const facilitiesToInsert = [];
    let firstRowLogged = false;

    if (!fs.existsSync(CSV_FILE_PATH)) {
      console.error(`❌ Error: File not found at ${CSV_FILE_PATH}`);
      process.exit(1);
    }

    console.log(`Reading and parsing: ${CSV_FILE_NAME}...`);

    fs.createReadStream(CSV_FILE_PATH)
      .pipe(
        csv({
          stripBOM: true,
          mapHeaders: ({ header }) =>
            header
              .replace(/["']/g, "")
              .replace(/[^\x20-\x7E]/g, "")
              .trim(),
            //   .toLowerCase(),
        }),
      )
      .on("data", (row) => {
        const keys = Object.keys(row);
        let data = row;

        if (
          keys.length === 1 &&
          (keys[0].includes(",") || keys[0].includes(";"))
        ) {
          const separator = keys[0].includes(",") ? "," : ";";
          const headerNames = keys[0].split(separator);
          const rawValues = Object.values(row)[0];

          if (rawValues && rawValues.includes(separator)) {
            const values = rawValues.split(separator);
            data = {};
            headerNames.forEach((h, i) => {
              const cleanKey = h.trim().toLowerCase();
              data[cleanKey] = values[i]
                ? values[i].trim().replace(/^"|"$/g, "")
                : "";
            });
          }
        }

        // const finalImgUrl = cleanUrl(data.imgurl || data.img_url);

        if (!firstRowLogged && data.Name) {
          console.log("--- SUCCESSFUL MAPPING PREVIEW ---");
          console.log("Common Name:", data.Name);
          console.log("----------------------------------");
          firstRowLogged = true;
        }

        facilitiesToInsert.push({
          owner: SYSTEM_USER_ID,
          Name: data.Name || data.Name || "Unknown Facility",
          Category: data.Category ||  data.Category||  "N/A",
          Province: data.Province || "N/A",
          City: data.City || "N/A",
          Address: data.Address || "N/A",
          Latitude: data.Latitude || "N/A",
          Longitude: data.Longitude || "N/A",
          PostalCode: data.PostalCode || "N/A",
        });
      })
      .on("end", async () => {
        if (facilitiesToInsert.length === 0) {
          console.error("❌ No data was parsed.");
          process.exit(1);
        }

        try {
          const result = await Facility.insertMany(facilitiesToInsert);
        //   console.log(
        //     `✅ Success! Seeded ${result.length} plants with cleaned image URLs.`,
        //   );
          mongoose.connection.close();
          process.exit(0);
        } catch (err) {
          console.error("❌ Insertion failed:", err.message);
          process.exit(1);
        }
      });
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
}

seedDatabase();
