import axios from 'axios';
import cheerio from 'cheerio';

const PRICE_RE = /\$\s*([0-9]+(?:\.[0-9]{2})?)/;

export async function fetchPrice(url){
  const { data } = await axios.get(url, {
    headers:{'user-agent':'Mozilla/5.0'}
  });
  const $ = cheerio.load(data);

  // crude generic - takes first $xx.xx
  const bodyText = $('body').text();
  const match = bodyText.match(PRICE_RE);
  const price = match ? parseFloat(match[1]) : null;

  const title = $('title').first().text().trim().slice(0,140);

  return {price, title};
}
