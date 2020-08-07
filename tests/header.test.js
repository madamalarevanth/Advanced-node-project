const puppeteer = require('puppeteer');

let browser, page;

beforeEach(async () => {
    browser = await puppeteer.launch({
        headless: false
    });

    page = await browser.newPage();

    await page.goto('localhost:3000');
});

afterEach(async () => {
    await browser.close();
});

test('We can launch a browser', async () => {
    const text = await page.$eval('a.brand-logo', el => el.innerHTML);

    expect(text).toEqual('Blogster');
});

test('Clicking login to start Oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/);
});

test('When signin , shows logout button', async () => {
    const id = '5f2a9c9f8195b26835d466a1';
    const Buffer = require('safe-buffer').Buffer;
    const sessionObject = {
        passport: {
            user: id
        }
    };
    const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString('base64');

    //creating key and session string for session signature
    const Keygrip = require('keygrip');
    const keys = require('../config/keys');
    const keygrip = new Keygrip([keys.cookieKey]);
    const sig = keygrip.sign('session=' + sessionString);

    //set the cookies with sessionstring and signature 
    await page.setCookie({ name: 'session', value: sessionString });
    await page.setCookie({ name: 'session.sig', value: sig });
    await page.goto('localhost:3000');
    
    //wait till all the session variables are set and the anchor tag shows up in the page
    await page.waitFor('a[href="/auth/logout"]');

    const text = await page.$eval('a[href="/auth/logout"]',el=> el.innerHTML);
    expect(text).toEqual('Logout');
    
});