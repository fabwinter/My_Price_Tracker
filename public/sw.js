self.addEventListener('push',e=>{
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification('Price Alert',{
      body:data.body||'Item dropped in price!',
      icon:'/icon-192.png'
    })
  );
});
