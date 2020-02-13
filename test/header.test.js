const puppeteer = require("puppeteer");
const sessionFactor = require("./factories/sessionFactor");
const userFactory = require("./factories/userFactory");

let browser, page;
beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false
  });

  page = await browser.newPage();

  await page.goto("localhost:3000");
});

afterEach(async () => {
  await browser.close();
});

test("THe header has the correct text", async () => {
  await page.waitFor("a.left.brand-logo");
  const text = await page.$eval("a.left.brand-logo", el => el.innerHTML);

  expect(text).toEqual("Blogster");
});

test("clicking login starts oauth flow", async () => {
  await page.waitFor(".right a");
  await page.click(".right a");

  const url = await page.url();
  console.log(url);
  expect(url).toMatch(/accounts\.google\.com/);
});

test("when signed in, shows logout button", async () => {
  const id = "5e3400cf02e8c954a88c3b39";

  const user = await userFactory();

  const { session, sig } = sessionFactor(user);

  await page.setCookie({ name: "session", value: session });
  await page.setCookie({ name: "session.sig", value: sig });

  await page.goto("localhost:3000");

  await page.waitFor('a[href="/auth/logout"]');
  const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

  expect(text).toEqual("Logout");
});
