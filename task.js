import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
const browserOptions = {
  headless: true,
  ignoreHTTPSErrors: true,
};

let browser;
let page;

beforeAll(async () => {
  browser = await puppeteer.launch(browserOptions);
  page = await browser.newPage();
  await page.goto("file://" + path.resolve("./index.html"));
}, 30000);

afterAll((done) => {
  try {
    this.puppeteer.close();
  } catch (e) {}
  done();
});

describe("Export", () => {
  it("`click.js` has `clickImages` export", async () => {
    const { clickImages } = await import("../modules/click.js");
    expect(clickImages).toBeDefined();
  });
  it("`hover.js` has `hoverHeader` export", async () => {
    const { hoverHeader } = await import("../modules/hover.js");
    expect(hoverHeader).toBeDefined();
  });
  it("`scroll.js` has `scrollWindow` export", async () => {
    const { scrollWindow } = await import("../modules/scroll.js");
    expect(scrollWindow).toBeDefined();
  });
});

describe("Import", () => {
  it("`main.js` imports `clickImages` from from `click.js`", async () => {
    const clickJs = fs
      .readFileSync("./modules/main.js")
      .toString("utf-8")
      .replace(/ /g, "");
    expect(clickJs).toMatch(/import.*clickImages./);
  });
  it("`main.js` imports `hoverHeader` from `hover.js`", async () => {
    const hover = fs
      .readFileSync("./modules/main.js")
      .toString("utf-8")
      .replace(/ /g, "");
    expect(hover).toMatch(/import.*hoverHeader./);
  });
  it("`main.js` imports `scrollWindow` from `scroll.js`", async () => {
    const scroll = fs
      .readFileSync("./modules/main.js")
      .toString("utf-8")
      .replace(/ /g, "");
    expect(scroll).toMatch(/import.*scrollWindow./);
  });
  it("Imported functions are called in `main.js`", async () => {
    const indexContents = fs
      .readFileSync("./modules/main.js")
      .toString("utf-8")
      .replace(/ /g, "");
    expect(indexContents).toMatch(/clickImages.*\(.*\);/);
    expect(indexContents).toMatch(/hoverHeader.*\(.*\);/);
    expect(indexContents).toMatch(/scrollWindow.*\(.*\);/);
  });
});

describe("Usage on page", () => {
  it("`main.js` is included in HTML using `script` tag", async () => {
    const scriptTag = await page.$('script[src$="main.js"]');
    expect(scriptTag).toBeTruthy();
  });
  it('`script` tag has `type="module"` attribute', async () => {
    const scriptTag = await page.$('script[type="module"]');
    expect(scriptTag).toBeTruthy();
  });
});
