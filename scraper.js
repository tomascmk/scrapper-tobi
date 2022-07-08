const puppeteer = require('puppeteer');
const prompt = require('prompt-sync')();

// storage facilities orlando list


// headless false only for debugging, allows to see the browser

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const userQuery = prompt('Enter your query: ');
    console.log("Scrapping...");
    try {
        const query = userQuery.split().map(q => q.trim()).join("+");
        await page.goto(`https://www.google.com/search?q=${query}&oq=${query}&aqs=edge.0.69i59j69i60l3.357j0j1&sourceid=chrome&ie=UTF-8`,)
        await page.click('a.tiS4rf');
        await page.waitForNavigation({
            waitUntil: 'networkidle0',
        });
        const data = [];
        const results = await page.$$('div.VkpGBb');
        for (const result of results) {
            const title = await result.evaluate(el => el.querySelector("div.dbg0pd > span.OSrXXb").textContent);
            let phone = await result.evaluate(el => el.querySelectorAll("div.rllt__details > div")[2].textContent);
            phone = phone ? "+" + phone.split("+")[1] : undefined;
            data.push({ title, phone });
        }
        console.log('data', data)
        /* const resultLinks = await page.$$('a.yYlJEf'); */
        const resultLinks = await page.$$('div.VkpGBb');
        for (const resultLink of resultLinks) {
            const title = await resultLink.evaluate(el => el ? el.querySelector("div.dbg0pd > span.OSrXXb").textContent : undefined);
            console.log(title);
        }
        await browser.close();
    } catch (err) {
        console.log(err);
        await browser.close();

    }
})();