const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('localhost:3000');
});

afterEach(async () => {
    await page.close();
});

test('We can launch a browser', async () => {
    const text = await page.getContentsOf('a.brand-logo');

    expect(text).toEqual('Blogster');
});

test('Clicking login to start Oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/);
});

test('When signin , shows logout button', async () => {
    await page.login()
    const text = await page.getContentsOf('a[href="/auth/logout"]');
    expect(text).toEqual('Logout');
    
});