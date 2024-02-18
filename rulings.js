import { By } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { cardSlug } from './util.js';

export class Rulings {

    faqUrl = 'https://curiosa.io/faqs';
    
    rulings = new Map()

    constructor() { 
        // update when the app starts
        this.#loadRulings();

        setInterval(() => {
            // update again every 2 days
            this.#loadRulings();
        }, 2 * 24 * 60 * 60 * 1000);
    }

    async #loadRulings() {

        const options = new chrome.Options()
            .addArguments('--headless')
            .addArguments('--no-sandbox')
            .addArguments('--disable-dev-shm-usage');

        const driver = chrome.Driver.createSession(
            options, 
            new chrome.ServiceBuilder().build()
        );

        try {
            await driver.get(this.faqUrl);
    
            // give it a while to load, we're not in a rush
            await driver.sleep(5_000); // 5 seconds
    
            // find all the elements that contain card names and their FAQs
            const cards = await driver.findElements(By.css('.max-w-4xl > .pb-6'));

            const updatedRulings = new Map();
    
            for (const card of cards) {
    
                const cardName = await card.findElement(By.css('h3')).getText();
                const faqs = await card.findElements(By.css('.curiosa-faq'));
                const faqData = [];
    
                for (const faq of faqs) {
                    const pair = await faq.findElements(By.css('p.mb-4'));
                    const question = await pair[0].getText();
                    const answer = await pair[1].getText();
                    faqData.push(question, answer);
                }
    
                updatedRulings.set(cardSlug(cardName), faqData);
            }
    
            this.rulings = updatedRulings;

        } catch (error) {
            // make sure the map is empty
            this.rulings = new Map();
        } finally {
            await driver.quit();
        }
    }

    getRulings(slug) {
        return this.rulings.get(slug);
    }

    isInitialized() {
        return this.rulings.size > 0;
    }
}