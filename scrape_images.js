#!/usr/bin/env node
import { loadCards } from './util.js'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

//
// A simple script to download card images from curiosa.io, for self hosting.
// Run in terminal via "./scrape_images.js"
//
// TODO This only works for beta, for downloading alpha switch 'bet' to 'alp' at the end of the URL
// this should ultimately dynamically support any set but I just manually downloaded the few remaining 
// alpha cards for now.
//

const curiosaImgUrl = 'https://curiosa.io/_next/image?w=750&q=75&url=https%3A%2F%2Fd27a44hjr9gen3.cloudfront.net%2Fbet%2F';
const __dirname = dirname(fileURLToPath(import.meta.url));

async function downloadCardImage(normalizedName) {
  try {

    const savePath = path.join(__dirname, 'downloaded_images', `${normalizedName}.png`);

    // ensure the directory exists
    fs.mkdirSync(path.dirname(savePath), { recursive: true });

    const response = await axios({
      method: 'GET',
      url: curiosaImgUrl + normalizedName + '.png',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(savePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading ${normalizedName}: ${error.message}`);
  }
}

async function downloadImages() {
  const cards = await loadCards();
  for (let [key,] of cards) {
    await downloadCardImage(key);
  }
}

downloadImages();