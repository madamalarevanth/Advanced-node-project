const sessionFactory= require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');
const puppeteer = require('puppeteer');

class CustomPage{
    static async build(){
    
        const browser = await puppeteer.launch({
            headless: false
        });

        const page = await browser.newPage();
        const customPage = new CustomPage(page);
        
        return new Proxy(customPage,{
            get: function (target,property){
                return customPage[property] ||  browser[property] || page[property] 
            }
        });
    }
    constructor(page){
        this.page = page;
    }

    async login(){
        const user = await userFactory();
        const {session,sig} = sessionFactory(user);
    
        //set the cookies with sessionstring and signature 
        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: sig });
        await this.page.goto('localhost:3000/blogs');
    
        //wait till all the session variables are set and the anchor tag shows up in the page
        await this.page.waitFor('a[href="/auth/logout"]');
    }

    async getContentsOf(selector){
        return this.page.$eval(selector, el => el.innerHTML)
    }
}

module.exports = CustomPage;
