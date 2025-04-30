import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { openDb } from './db.js';
import { fetchPrice } from './scraper.js';
import { sendEmail, sendPush } from './utils/notifier.js';
import { normaliseSku } from './utils/sku.js';
import webpush from 'web-push';
import { readFile } from 'fs/promises';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const dbPath = process.env.DB_PATH || './db.sqlite';
let db;

const runningFlag = {running:false};

async function init(){
  db = await openDb(dbPath);
}
await init();

app.get('/api/config', (req,res)=>{
  res.json({
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
    stripePriceId: process.env.STRIPE_PRICE_ID
  });
});

app.post('/api/products', async (req,res)=>{
  const { url, target, userId } = req.body;
  if(!url) return res.status(400).json({error:'url required'});
  const { price, title } = await fetchPrice(url);
  const sku = normaliseSku({});
  const retailer = new URL(url).hostname;

  // merge by sku or url
  let prod = await db.get('SELECT * FROM products WHERE url=?', [url]);
  if(!prod){
    const result = await db.run('INSERT INTO products(user_id,url,title,price,target,sku,retailer) VALUES (?,?,?,?,?,?,?)',
      [userId || 'anon', url, title, price, target || null, sku, retailer]
    );
    prod = await db.get('SELECT * FROM products WHERE id=?', [result.lastID]);
  } else {
    await db.run('UPDATE products SET price=? WHERE id=?',[price, prod.id]);
  }
  await db.run('INSERT INTO price_history(product_id,price) VALUES (?,?)',[prod.id, price]);

  res.json(prod);
});

app.get('/api/products', async (req,res)=>{
  const rows = await db.all('SELECT * FROM products');
  res.json(rows);
});

app.post('/api/subscriptions', async (req,res)=>{
  const { subscription, userId } = req.body;
  await db.run('CREATE TABLE IF NOT EXISTS push_subscriptions(id INTEGER PRIMARY KEY, user_id TEXT, sub TEXT)');
  await db.run('INSERT INTO push_subscriptions(user_id, sub) VALUES (?,?)',[userId||'anon', JSON.stringify(subscription)]);
  res.json({ok:true});
});

async function refreshLoop(){
  if(runningFlag.running) return;
  runningFlag.running = true;
  try{
    const products = await db.all('SELECT * FROM products');
    for(const prod of products){
      try{
        const { price } = await fetchPrice(prod.url);
        if(price==null) continue;
        await db.run('INSERT INTO price_history(product_id,price) VALUES (?,?)',[prod.id, price]);
        await db.run('UPDATE products SET price=? WHERE id=?',[price, prod.id]);

        if(prod.target && price <= prod.target && !prod.notified){
          await db.run('UPDATE products SET notified=1 WHERE id=?',[prod.id]);
          if(prod.user_id && prod.user_id.includes('@')){
            await sendEmail(prod.user_id, 'Price drop!', `<p>${prod.title} is now $${price}</p>`);
          }
        }
        if(prod.notified && price > prod.target){
          await db.run('UPDATE products SET notified=0 WHERE id=?',[prod.id]);
        }
      }catch(e){
        console.error('refresh error',e);
      }
    }
  } finally{
    runningFlag.running = false;
  }
}

// cron every 15 min
cron.schedule('*/15 * * * *', refreshLoop);

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log('Server listening on', port));
