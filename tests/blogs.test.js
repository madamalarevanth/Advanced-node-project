const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('when logged in',()=>{
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });
    
    test('can see blog create form',async ()=>{
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title')
    });

    describe('And using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('form button')
        });
        test('the form shows an error message',async () => {
            const titleError = await page.click('.title .red-text');
            const contentError = await page.click('.content .red-text');

            expect(titleError).toEqual('YOu must provide a value')
            expect(contentError).toEqual('YOu must provide a value')
        });
    })

});


