import { cardSlug, Color } from './util.js'
import chrome from 'selenium-webdriver/chrome.js';
import { Embed, EmbedBuilder } from 'discord.js';
import { By } from 'selenium-webdriver';

export class CardRulings {

    #faqUrl = 'https://curiosa.io/faqs';
    #rulings;

    constructor() { 
        // update rulings cache when the app starts
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
            await driver.get(this.#faqUrl);
    
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
    
            this.#rulings = updatedRulings;

        } catch (error) {
            // make sure the map is empty
            this.#rulings = new Map();
        } finally {
            driver.quit();
        }
    }

    #isInitialized() {
        return this.#rulings !== undefined && this.#rulings.size > 0;
    }

    /**
     * Gets the Discord embed response for a rulings query.
     * 
     * @param {string} cardName the full text name of the card
     * @returns {Embed} a Discord embed
     */
    getEmbed(cardName) {
        const slug = cardSlug(cardName);
        const embed = new EmbedBuilder()
            .setTitle(`Rulings for ${cardName}`)
            .setURL(process.env.CURIOSA_URL + slug);

        // if the FAQ scraping breaks, tell them to give me a heads up 
        if (!this.#isInitialized()) {
            embed.setDescription('Oops, something\'s up with rulings. Please ping @herbig to fix it.')
                .setColor(Color.FAIL);
        } else {
        
            const faqs = this.#rulings.get(slug);
            let description = '';

            if (faqs === undefined || faqs.length === 0) {
                description = `No rulings available for ${cardName}.`;
            } else {
                for (let i = 0; i < faqs.length; i++) {
                    if (i % 2 === 0) {
                        description += '**' + faqs[i] + '**\n';
                    } else {
                        description += faqs[i] + '\n\n';
                    }
                }
            }
            embed.setDescription(description)
                .setColor(Color.SUCCESS);
        }

        return embed;
    }
}