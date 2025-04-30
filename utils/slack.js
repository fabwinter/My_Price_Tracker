import axios from 'axios';
export async function sendSlack(webhookUrl, message){
  if(!webhookUrl) return;
  await axios.post(webhookUrl, {text: message});
}
