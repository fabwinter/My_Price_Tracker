(function(){
  const btn=document.createElement('button');
  btn.textContent='Track price';
  btn.style.position='fixed';
  btn.style.bottom='16px';
  btn.style.right='16px';
  btn.style.zIndex='999999';
  btn.style.padding='8px 12px';
  btn.style.background='#4f46e5';
  btn.style.color='#fff';
  btn.style.borderRadius='4px';
  btn.onclick=()=>{
    chrome.runtime.sendMessage({action:'track', url:location.href});
  };
  document.body.appendChild(btn);
})();
