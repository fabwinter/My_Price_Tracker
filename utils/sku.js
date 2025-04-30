export function normaliseSku({ upc, ean }){
  // simple pass-through now
  return upc || ean || null;
}
