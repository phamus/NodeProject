const puppeteer = require("puppeteer");

let broswer, page;
beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false
  });

  page = await browser.newPage();

  await page.goto("localhost:3000");
});

test("We can launch a broswer like so", async () => {
  const text = await page.$eval("a.brand-logo", el => el.innerHTML);

  expect(text).toEqual("Blogster");
});
