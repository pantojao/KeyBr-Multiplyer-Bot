const puppeteer = require("puppeteer");

async function main() {
  let page = null;

  async function getBrowser() {
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 1,
      args: ["--window-size=1220,1080"],
    });

    page = await browser.newPage();
    await page.goto("https://www.keybr.com/multiplayer");
    await runBot(page);
  }

  async function runBot(page) {
    while ((await checkForGo(page)) === false) {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("foo");
        }, 1000);
      });
    }

    const keys = await getKeys(page);
    const paragraph = createParagraph(keys);
    await page.keyboard.type(paragraph, { delay: 70 });
  }

  function createParagraph(keys) {
    let paragraph = keys
      .map((char) => {
        if (char === "␣") return " ";
        return char;
      })
      .join("");
    console.log(paragraph);
    return paragraph;
  }

  async function checkForGo(page) {
    const element = await page.$$(".Track-ticker");
    const textObject = await element[0].getProperty("textContent");
    const text = textObject._remoteObject.value;
    console.log(text);
    return text === "GO!" ? true : false;
  }

  async function getKeys(page) {
    const elements = await page.$$(".TextInput-item");
    const chars = await extract(elements);
    return chars;
  }

  async function extract(elements) {
    const promises = elements.map(async (spanElement) => {
      spanElement = await spanElement.getProperty("innerText");
      spanElement = await spanElement.jsonValue();
      return spanElement;
    });
    console.log("extracting");
    return Promise.all(promises);
  }

  while (true) {
    if (page === null) await getBrowser();
    await runBot(page);
  }
}

main();
