const axios = require("axios");
const cheerio = require("cheerio");
const { log } = require("console");
const { randomInt } = require("crypto");
const express = require("express");
const fs = require("fs");
const { parse } = require("path");
const sl = require("slug");
const { callbackify } = require("util");
const PORT = process.env.PORT || 3000;

const app = express();
const animeList = [];
let category_id = 5;
let name;
let page = 0;
const delayTime = 2000;
let seller_id;
const products = [];
let slug;
let price;
let instock;
let sold;
let description;
let brand;
let checked = true;
let url;
let link;
let LinkList= [];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const  pushLink = async () => {
    const list = [];
   url = "https://tiki.vn/thiet-bi-am-thanh-va-phu-kien/c8215";
   const res = await axios(url);
    const htmlData = res.data;
    const  a = cheerio.load(htmlData);
    a(".styles__TreeItemContainer-sc-1uq9a9i-1", htmlData).each((index, element) => {
      link = a(element).find('a').attr("href");
      list.push(link);
   })
   return list;
};

async function scrapeDataWithInterval() {
  url = `https://tiki.vn${LinkList[page]}`;
  axios(url)
  .then((res) => {
    const htmlData = res.data;
    const $ = cheerio.load(htmlData);
    let json = $("#__NEXT_DATA__").text();
    json = JSON.parse(json);
    let data = json.props.initialState.catalog.data;

    const getUrl = async (index) => {
      await sleep(200);
      const pro_url = `https://tiki.vn/${index.url_path}`;
      await axios(pro_url).then((res) =>{
        const htmlData = res.data;
        const b = cheerio.load(htmlData);
        let projson = b("#__NEXT_DATA__").text();
        projson = JSON.parse(projson);
        let prodata = projson.props.initialState.productv2.productData.response.data;
        seller_id = randomInt(4, 300)
        name = prodata.name;
        slug = sl(name);
        price = prodata.price;
        img = prodata.images[0].medium_url;
        console.log(name);
        instock = randomInt(50, 9999);
        sold = randomInt(0, 6000);
        brand = prodata.brand.name;
        description = prodata.description.replace(/(<([^>]+)>)/ig, '');
        products.push({seller_id, name, slug, price, img, category_id, instock, sold, brand, description, checked});
        console.log(
          `Data has been written to file successfully attemp ${pro_url}`
        ); 
      }) 
      } 
    data.map(getUrl);
    const jsonData = JSON.stringify(products, null, 11);
    fs.writeFile("data.json", jsonData, "utf8", (err) => {
      if (err) {
        console.error("Failed", err);
        return;
      }
    });
      page += 1;
      setTimeout(scrapeDataWithInterval, delayTime);
    })
    .catch((error) => console.log(error));
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const main = async () => {
  LinkList = await pushLink();
  await scrapeDataWithInterval();
}
main();