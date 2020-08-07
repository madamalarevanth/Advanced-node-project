const sessionFactory= require('./factories/sessionFactory');
const userFactory = require('./factories/userFactory');
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
    const text = await page.$eval('a.brand-logo', el => el.innerHTML);

    expect(text).toEqual('Blogster');
});

test('Clicking login to start Oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/);
});

test('When signin , shows logout button', async () => {
    
    const user = await userFactory();
    const {session,sig} = sessionFactory(user);

    //set the cookies with sessionstring and signature 
    await page.setCookie({ name: 'session', value: session });
    await page.setCookie({ name: 'session.sig', value: sig });
    await page.goto('localhost:3000');

    //wait till all the session variables are set and the anchor tag shows up in the page
    await page.waitFor('a[href="/auth/logout"]');

    const text = await page.$eval('a[href="/auth/logout"]',el=> el.innerHTML);
    expect(text).toEqual('Logout');
    
});