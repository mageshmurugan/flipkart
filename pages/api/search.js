import puppeteer from "puppeteer";
import { createClient } from "redis";

const DEFAULT_EXPIRATION = process.env.DEFAULT_EXPIRATION;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

const redisClient = createClient({
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});
// const redisClient = createClient({
//   password: "rMhI2NH8KtS5qy4G98FGzInygHh5A0EA",
//   socket: {
//     host: "redis-12737.c252.ap-southeast-1-1.ec2.cloud.redislabs.com",
//     port: 12737,
//   },
// });

redisClient.connect();
// console.log(process.env.REDIS_PORT);
let page; // Declare a variable to store the page instance globally

const initializePage = async () => {
  const browser = await puppeteer.launch({ headless: false });
  page = await browser.newPage();
};

const scrapeFlipkartData = async (url) => {
  if (!page) {
    await initializePage();
  }

  await page.goto(`https://www.flipkart.com/search?q=${url}`);

  const flipkartData = await page.evaluate(() => {
    const products = document.querySelectorAll("._2kHMtA");
    if (products.length === 0) {
      return [];
    }

    const flipkartContent = [];
    products.forEach(async (product) => {
      const headingTag = await product.querySelector("._4rR01T");
      const ratingTag = await product.querySelector("._3LWZlK");
      const reviewsTag = await product.querySelector("._2_R_DZ");
      const priceTag = await product.querySelector("._30jeq3");
      const offerTag = await product.querySelector("._3Ay6Sb");
      const imageTag = await product.querySelector("._396cs4");
      const anchorTag = await product.querySelector("._1fQZEK");

      flipkartContent.push({
        Heading: headingTag.innerText,
        Rating: ratingTag.innerText,
        Reviews: reviewsTag.innerText,
        Price: priceTag.innerText,
        Offer: offerTag.innerText,
        AnchorTag: `www.flipkart.com/${anchorTag.getAttribute("href")}`,
        Image: imageTag.getAttribute("src"),
      });
    });
    return flipkartContent;
  });

  return flipkartData;
};

const scrapeAlternateFlipkartData = async (url) => {
  if (!page) {
    await initializePage();
  }

  await page.goto(`https://www.flipkart.com/search?q=${url}`);

  const flipkartData = await page.evaluate(() => {
    const products = document.querySelectorAll("._13oc-S > div");
    if (products.length === 0) {
      return "No data found";
    }

    const flipkartContent = [];
    products.forEach(async (product) => {
      const imageTag = await product.querySelector("img");
      const anchorTags = await product.querySelectorAll("a");
      const ratingTags = await product.querySelectorAll("span");
      const priceTag = await product.querySelector("._30jeq3");

      flipkartContent.push({
        Heading: anchorTags[1].innerText,
        AnchorTag: `www.flipkart.com/${anchorTags[0].getAttribute("href")}`,
        Image: imageTag.getAttribute("src"),
        Rating: ratingTags[0].innerText,
        Reviews: ratingTags[1].innerText,
        Price: priceTag.innerText,
        Offer: ratingTags[2].innerText,
      });
    });
    return flipkartContent;
  });

  return flipkartData;
};

export default async function handleFlipkartDataRequest(req, res) {
  const searchTerm = req.body;
  const sanitizedSearchTerm = await searchTerm.split(" ").join(" ");
  console.log(sanitizedSearchTerm);
  const cachedData = await redisClient.get(`${sanitizedSearchTerm}`);

  if (cachedData) {
    return res.status(200).json(JSON.parse(cachedData));
    // return res.status(200).json({ message: JSON.parse(cachedData) });
    // return res.status(200).json({ message: cachedData });
  } else {
    if (searchTerm !== "favicon.ico") {
      const flipkartData = await scrapeFlipkartData(sanitizedSearchTerm);

      if (flipkartData.length === 0) {
        const alternateFlipkartData = await scrapeAlternateFlipkartData(
          sanitizedSearchTerm
        );
        redisClient.setEx(
          sanitizedSearchTerm,
          DEFAULT_EXPIRATION,
          JSON.stringify(alternateFlipkartData)
        );
        return res.json(alternateFlipkartData);
      }

      redisClient.setEx(
        sanitizedSearchTerm,
        DEFAULT_EXPIRATION,
        JSON.stringify(flipkartData)
      );
      res.status(200).json(flipkartData);
    }
  }
}
