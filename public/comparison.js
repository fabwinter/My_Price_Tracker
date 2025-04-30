export async function renderCompareTable(){
  const res=await fetch('/api/products');
  const data=await res.json();
  const group={};
  data.forEach(p=>{
    const key=p.sku||p.title||p.url;
    group[key]=group[key]||[];
    group[key].push(p);
  });
  const rows=Object.values(group).filter(arr=>arr.length>1);
  const container=document.getElementById('compareTable');
  container.innerHTML = rows.map(arr=>{
    const cheapest=arr.reduce((min,p)=>p.price<min.price?p:min,arr[0]);
    return `<div class="bg-white shadow mb-4 rounded overflow-auto">
      <div class="font-semibold p-2">${cheapest.title}</div>
      <table class="min-w-full text-sm">
        ${arr.map(p=>\`<tr class="\${p.id===cheapest.id?'bg-green-100':''}">
          <td class="px-2 py-1">\${p.retailer}</td>
          <td class="px-2 py-1">\${p.price.toFixed(2)}</td>
          <td class="px-2 py-1"><a href="\${p.url}" target="_blank" class="text-blue-600 underline">Go</a></td>
        </tr>\`).join('')}
      </table>
    </div>`;
  }).join('');
}
renderCompareTable();
