// Playwright script to get the operating hours for all the LUAS stops

const { chromium, webkit } = require('playwright');

var times = [];

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({
    width: 1200,
    height: 920,
  });

  for (var stationIndex = 1; stationIndex <= 67; stationIndex++) {

    for (var directionIndex = 0; directionIndex <= 1; directionIndex++) {
      await page.goto('https://luas.ie/operating-hours.html/');

      await page.click('button[data-id="ophours-stop"]')
      await page.click('body > div.page-content > div > div.col-md-5.col-sm-12.ophours-form > div > form > div > div:nth-child(1) > div > div > div > ul > li:nth-child(' + stationIndex + ') > a')

      await page.click('button[data-id="ophours-direction"]')
      let directions = await page.$$('body > div.page-content > div > div.col-md-5.col-sm-12.ophours-form > div > form > div > div:nth-child(3) > div > div > div > ul > li')
      if (directionIndex < directions.length) {
        await directions[directionIndex].click('a')

        await page.click('body > div.page-content > div > div.col-md-5.col-sm-12.ophours-form > div > form > div > div:nth-child(5) > button')

        times.push(await getOperatingHours(page));

        console.log(JSON.stringify(times))
      }
    }
  }

  await browser.close();
})();

async function getOperatingHours(page) {
  var object = {};

  let header = await page.$eval('body > div.page-content > div > div.row.ophours-results > div:nth-child(1) > h3', e => e.textContent);
  let directionSplitIndex = header.lastIndexOf('-');

  object.station = header.substring(0, directionSplitIndex - 1);
  object.directionString = header.substring(directionSplitIndex + 2);
  object.direction = object.directionString.substring(0, header.indexOf(' ') + 1)

  object.weekdays = {};
  object.weekdays.firstTram = await page.$eval('body > div.page-content > div > div.row.ophours-results > div:nth-child(2) > div:nth-child(3) > table > tbody > tr:nth-child(1) > td:nth-child(2)', e => e.textContent);
  object.weekdays.lastTram = await page.$eval('body > div.page-content > div > div.row.ophours-results > div:nth-child(2) > div:nth-child(3) > table > tbody > tr:nth-child(2) > td:nth-child(2)', e => e.textContent);

  object.saturday = {};
  object.saturday.firstTram = await page.$eval('body > div.page-content > div > div.row.ophours-results > div:nth-child(2) > div:nth-child(4) > table > tbody > tr:nth-child(1) > td:nth-child(2)', e => e.textContent);
  object.saturday.lastTram = await page.$eval('body > div.page-content > div > div.row.ophours-results > div:nth-child(2) > div:nth-child(4) > table > tbody > tr:nth-child(2) > td:nth-child(2)', e => e.textContent);

  object.sunday = {};
  object.sunday.firstTram = await page.$eval('body > div.page-content > div > div.row.ophours-results > div:nth-child(2) > div:nth-child(5) > table > tbody > tr:nth-child(1) > td:nth-child(2)', e => e.textContent);
  object.sunday.lastTram = await page.$eval('body > div.page-content > div > div.row.ophours-results > div:nth-child(2) > div:nth-child(5) > table > tbody > tr:nth-child(2) > td:nth-child(2)', e => e.textContent);

  return object;
}