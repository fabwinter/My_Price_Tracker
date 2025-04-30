import fs from 'fs';
import path from 'path';

export async function getStaticProps({params}){
  const filePath=path.join(process.cwd(),'public','deals',`${params.date}.json`);
  let deals=[];
  if(fs.existsSync(filePath)){
    deals=JSON.parse(fs.readFileSync(filePath,'utf-8'));
  }
  return {props:{deals}, revalidate: 60};
}
export async function getStaticPaths(){
  return {paths:[], fallback:'blocking'};
}
export default function Deals({deals}){
  return <div style={{padding:20}}>
    <h1>Deals for {new Date().toISOString().split('T')[0]}</h1>
    <ul>{deals.map((d,i)=><li key={i}><a href={d.url}>{d.title}</a> - ${d.price}</li>)}</ul>
  </div>
}
