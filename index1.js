const axios = require("axios");
const cheerio = require("cheerio");
const { randomInt } = require("crypto");
const express = require("express");
const fs = require("fs");
const sl = require("slug");
const PORT = process.env.PORT || 3000;
const animeList = []; 
let page = 1;
const app = express();
const delayTime = 500;
let product_name;
let seller_id;
let slug;
let price;
let category_id = 2;
let instock;
let sold;
let description = '\n';
let brand = '\n';
let i = 0;


function scrapeDataWithIntervl() {
  const url = `https://tiki.vn/nha-sach-tiki/c8322?page=${page}`;
  axios(url)
    .then((res) => {
      const htmlData = res.data;
      const $ = cheerio.load(htmlData);
      $(".style__StyledItem-sc-1axza32-0", htmlData).each((index, element) => {
        product_name = $(element).find(".name").text();
        slug = sl(product_name);
        price = parseInt($(element).find(".price-discount__price").text().split(".").join(""));
        img =  $(element).find(".styles__StyledImg-sc-p9s3t3-0").attr("srcset").split(" ")[0];
        seller_id = randomInt(1,100);
        instock = randomInt(50, 9999);
        sold = randomInt(0, 6000);
        animeList.push({seller_id, product_name, slug, price, img, category_id, instock, sold, brand, description});
      });
      page++;
      const jsonData = JSON.stringify(animeList, null, 2);
      fs.writeFile("data.json", jsonData, "utf8", (err) => {
        if (err) {
          console.error("Failed", err);
          return;
        }
        if (page <= 50) {
          setTimeout(scrapeDataWithIntervl, delayTime);
        }
        console.log(
          `Data has been written to file successfully attemp ${page}`
        );
      });
    })
    .catch((error) => console.log(error));
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Bắt đầu scraping
scrapeDataWithIntervl();
console.log(i);