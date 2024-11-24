const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

// Define a route to handle requests with the train number
app.get("/train-status/:trainNumber", async (req, res) => {
  const { trainNumber } = req.params;
  const url = `https://www.confirmtkt.com/train-running-status/${trainNumber}`; // Replace with the actual URL pattern

  try {
    // Fetch the webpage
    const response = await axios.get(url);

    // Load the HTML into Cheerio
    const $ = cheerio.load(response.data);

    // Extract data from the `.running-status` section
    const runningStatus = [];
    $(".running-status .well").each((_, element) => {
      const stationName = $(element).find(".rs__station-name").text().trim();
      const day = $(element).find(".col-xs-3 span").first().text().trim();
      const date = $(element).find(".col-xs-3 span").last().text().trim();
      const arrival = $(element).find(".col-xs-2 span").first().text().trim();
      const departure = $(element).find(".col-xs-2 span").last().text().trim();
      const delay = $(element).find(".rs__station-delay").text().trim();

      runningStatus.push({
        stationName,
        day,
        date,
        arrival: arrival || "N/A",
        departure: departure || "N/A",
        delay,
      });
    });

    // Respond with the extracted data in JSON format
    res.json({ trainNumber, runningStatus });
  } catch (error) {
    console.error("Error scraping the data:", error.message);
    res.status(500).json({ error: "Failed to fetch train status" });
  }
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
