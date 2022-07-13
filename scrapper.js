const puppeteer = require('puppeteer');
const prompt = require('prompt-sync')();
const fs = require('fs');

(async () => {

    // headless false only for debugging, allows to see the browser
    // If the scrapper is not getting the data correctly, try to increase the slowMo

    const browser = await puppeteer.launch({ headless: true, slowMo: 250 });
    const page = await browser.newPage();
    const userQuery = prompt('Enter your query or paste the URL: ');
    console.log("Scrapping...");

    try {

        const query = userQuery.split().map(q => q.trim()).join("+");
        await page.goto(`https://www.google.com/search?q=${query}&oq=${query}&aqs=edge.0.69i59j69i60l3.357j0j1&sourceid=chrome&ie=UTF-8`,)

        await page.click('a.tiS4rf');

        await page.waitForNavigation({
            waitUntil: 'networkidle0',
        });

        let data = [];

        const urls = [];

        const results = await page.$$('div.VkpGBb');

        for (const result of results) {
            const title = await result.evaluate(el => el.querySelector("div.dbg0pd > span.OSrXXb").textContent);
            let phone = await result.evaluate(el => el.querySelectorAll("div.rllt__details > div")[2].textContent);
            phone = phone ? "+" + phone.split("+")[1] : undefined;

            await result.evaluate(el => el.querySelectorAll("a")[0].click());

            const resultUrls = await page.$$('div.IzNS7c');

            for (const resultUrl of resultUrls) {
                const url = await resultUrl.evaluate(el => el.querySelector("div.QqG1Sd > a").href);
                urls.push(url ?? "Undefined");
            }
            console.log("Getting data...");
            data.push({ title, phone });
        }

        data = data.map((item, index) => {
            return { ...item, url: urls[index] ?? undefined };
        });

        // stringify JSON Object
        var jsonContent = JSON.stringify(data);

        const date = new Date();
        const documentId = date.getTime()

        fs.writeFile(`./json/data${documentId}.json`, jsonContent, 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return console.log(err);
            }

            console.log("JSON file has been saved.");
        });

        await browser.close();
    } catch (err) {
        console.log(err);
        await browser.close();

    }
})();