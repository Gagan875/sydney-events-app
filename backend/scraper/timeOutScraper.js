const axios = require("axios");
const cheerio = require("cheerio");
const crypto = require("crypto");
const Event = require("../models/Event");

const BASE_URL = "https://www.timeout.com/sydney/events";

function createHash(data) {
  return crypto.createHash("md5").update(data).digest("hex");
}

async function scrapeTimeOut() {
  try {
    const { data } = await axios.get(BASE_URL);
    const $ = cheerio.load(data);

    const links = [];

    $("a").each((i, el) => {
      const href = $(el).attr("href");

      if (
        href &&
        href.startsWith("/sydney/") &&
        !href.includes("events/sydney") &&
        href.split("/").length > 3
      ) {
        links.push("https://www.timeout.com" + href);
      }
    });

    const uniqueLinks = [...new Set(links)];

    console.log(`Found ${uniqueLinks.length} event links`);

    for (let url of uniqueLinks.slice(0, 20)) {
      const { data: eventPage } = await axios.get(url);
      const $$ = cheerio.load(eventPage);

      const title = $$("h1").first().text().trim();
      const description = $$("p").first().text().trim().slice(0, 300);

      const dateText = $$("time").first().text().trim();
      const dateTime = new Date(dateText);

      const venueName = $$("address").text().trim();
      const imageUrl = $$("img").first().attr("src");

      if (!title || isNaN(dateTime)) continue;

      const contentString =
        title + dateTime + venueName + description;
      const contentHash = createHash(contentString);

      const existing = await Event.findOne({ originalUrl: url });

      if (!existing) {
        await Event.create({
          title,
          description,
          dateTime,
          venueName,
          city: "Sydney",
          imageUrl,
          sourceName: "TimeOut",
          originalUrl: url,
          contentHash,
          lastScrapedAt: new Date(),
          status: "new",
        });
        console.log("New event added:", title);
      } else {
        if (existing.contentHash !== contentHash) {
          existing.title = title;
          existing.description = description;
          existing.dateTime = dateTime;
          existing.venueName = venueName;
          existing.imageUrl = imageUrl;
          existing.contentHash = contentHash;
          existing.status = "updated";
          console.log("Updated event:", title);
        }
        existing.lastScrapedAt = new Date();
        await existing.save();
      }
    }

    console.log("Scraping completed.");
  } catch (err) {
    console.error(err.message);
  }
}

module.exports = scrapeTimeOut;
