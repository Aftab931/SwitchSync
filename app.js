const devices = [
  {id:'living-light',name:'Living Room Light',icon:'💡',category:'Lighting',watts:60,on:false,runtime:0,priority:false},
  {id:'bedroom-light',name:'Bedroom Light',icon:'🛏️',category:'Lighting',watts:40,on:false,runtime:0,priority:false},
  {id:'kitchen-light',name:'Kitchen Light',icon:'💡',category:'Lighting',watts:50,on:true,runtime:0,priority:false},
  {id:'fan',name:'Bedroom Fan',icon:'🌀',category:'Climate',watts:70,on:true,runtime:0,priority:false},
  {id:'ceiling-fan',name:'Living Room Fan',icon:'🌀',category:'Climate',watts:75,on:false,runtime:0,priority:false},
  {id:'ac',name:'Air Conditioner',icon:'❄️',category:'Climate',watts:1500,on:true,runtime:0,priority:true},
  {id:'geyser',name:'Geyser',icon:'🚿',category:'Water Heating',watts:2000,on:true,runtime:0,priority:true},
  {id:'fridge',name:'Refrigerator',icon:'🧊',category:'Kitchen',watts:180,on:true,runtime:0,priority:false},
  {id:'microwave',name:'Microwave Oven',icon:'🍲',category:'Kitchen',watts:1200,on:false,runtime:0,priority:true},
  {id:'oven',name:'Electric Oven',icon:'♨️',category:'Kitchen',watts:2200,on:false,runtime:0,priority:true},
  {id:'dishwasher',name:'Dishwasher',icon:'🍽️',category:'Kitchen',watts:1000,on:false,runtime:0,priority:false},
  {id:'washer',name:'Washing Machine',icon:'🧺',category:'Laundry',watts:500,on:false,runtime:0,priority:false},
  {id:'tv',name:'Smart TV',icon:'📺',category:'Entertainment',watts:120,on:false,runtime:0,priority:false},
  {id:'router',name:'Wi-Fi Router',icon:'📡',category:'Network',watts:15,on:true,runtime:0,priority:false},
  {id:'computer',name:'Desktop PC',icon:'🖥️',category:'Office',watts:300,on:false,runtime:0,priority:false},
  {id:'coffee',name:'Coffee Maker',icon:'☕',category:'Kitchen',watts:900,on:false,runtime:0,priority:false},
  {id:'iron',name:'Electric Iron',icon:'👔',category:'Utility',watts:1000,on:false,runtime:0,priority:true},
  {id:'vacuum',name:'Vacuum Cleaner',icon:'🧹',category:'Utility',watts:800,on:false,runtime:0,priority:false},
  {id:'water-purifier',name:'Water Purifier',icon:'💧',category:'Utility',watts:60,on:false,runtime:0,priority:false},
  {id:'air-purifier',name:'Air Purifier',icon:'🌬️',category:'Climate',watts:50,on:false,runtime:0,priority:false}
];
let mode='home', filter='all', speed=1, price=8, log=[];
const $=id=>document.getElementById(id);
const deviceById=id=>devices.find(d=>d.id===id);
function save(){localStorage.setItem('switchsync-devices',JSON.stringify(devices));localStorage.setItem('switchsync-log',JSON.stringify(log));localStorage.setItem('switchsync-mode',mode)}
function load(){try{const a=JSON.parse(localStorage.getItem('switchsync-devices'));if(Array.isArray(a)){a.forEach(x=>{const d=deviceById(x.id);if(d){d.on=!!x.on;d.runtime=Number(x.runtime)||0}})}}catch{}try{log=JSON.parse(localStorage.getItem('switchsync-log'))||[]}catch{log=[]}mode=localStorage.getItem('switchsync-mode')||'home'}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),2200)}
function addLog(text){log.unshift({text,time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})});log=log.slice(0,60);save();renderLog()}
function toggle(id,on){const d=deviceById(id);if(!d)return;d.on=on;d.runtime=on?d.runtime:0;addLog(`${d.name} turned ${on?'ON':'OFF'}`);toast(`${d.icon} ${d.name} is now ${on?'ON':'OFF'}`);render()}
function energy(){return devices.reduce((sum,d)=>sum+(d.on?d.watts/1000*(d.runtime/3600):0),0)}
function alerts(){return devices.filter(d=>d.on&&d.priority&&d.runtime>=1800)}
function filtered(){return devices.filter(d=>filter==='all'||(filter==='on'?d.on:!d.on))}
function card(d){return `<article class="device-card ${d.on?'is-on':''}"><div class="device-top"><div class="device-icon">${d.icon}</div><div class="status-dot ${d.on?'on':''}">${d.on?'● ON':'○ OFF'}</div></div><h3>${d.name}</h3><p>${d.category} • ${d.watts} W</p><div class="device-bottom"><span class="watts">${d.on?formatRuntime(d.runtime):'Standby'}</span><button class="toggle ${d.on?'on':''}" data-toggle="${d.id}" aria-label="Toggle ${d.name}"><span></span></button></div></article>`}
function formatRuntime(s){const h=Math.floor(s/3600),m=Math.floor((s%3600)/60);return h?`${h}h ${m}m`:`${m}m`}
function renderDevices(){const html=filtered().map(card).join('');$('deviceGrid').innerHTML=html||'<div class="empty">No devices match this filter.</div>';$('allDeviceGrid').innerHTML=devices.map(card).join('');document.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{const d=deviceById(b.dataset.toggle);toggle(d.id,!d.on)})}
function renderAlerts(){const a=alerts();$('alertCount').textContent=a.length;$('alertBadge').textContent=a.length;$('alertLabel').textContent=a.length?'needs attention':'all clear';$('alerts').innerHTML=a.length?a.map(d=>`<div class="alert-item"><div class="alert-symbol">!</div><div><b>${d.name} has been ON for a long time</b><small>${formatRuntime(d.runtime)} • Consider switching it off.</small></div></div>`).join(''):'<div class="empty">✓ No critical appliance alerts.</div>'}
function renderEnergy(){const e=energy();$('energyToday').textContent=e.toFixed(2)+' kWh';$('energyCost').textContent='₹'+(e*price).toFixed(2);const max=Math.max(...devices.map(d=>d.watts/1000*(Math.max(d.runtime,900)/3600)),1);$('energyBar').style.width=Math.min(100,e/(max*5)*100)+'%';$('energyRows').innerHTML=devices.map(d=>{const v=d.on?d.watts/1000*(d.runtime/3600):0;return `<div class="energy-row"><div><b>${d.icon} ${d.name}</b><small>${d.watts} W</small></div><b>${v.toFixed(3)} kWh</b></div>`}).join('')}
function renderLog(){$('activityLog').innerHTML=log.length?log.map(x=>`<div class="log-row"><span>${x.text}</span><small>${x.time}</small></div>`).join(''):'<div class="empty">No activity yet.</div>'}
function render(){const on=devices.filter(d=>d.on).length;$('totalDevices').textContent=devices.length;$('onDevices').textContent=on;$('onPercent').textContent=Math.round(on/devices.length*100)+'%';$('modeLabel').textContent=mode==='home'?'At Home':'Away';$('modeSwitch').classList.toggle('away',mode==='away');renderDevices();renderAlerts();renderEnergy();renderLog();save()}
function showView(name){document.querySelectorAll('.view-panel,#dashboardView').forEach(x=>x.classList.add('hidden'));$(name==='dashboard'?'dashboardView':name+'View').classList.remove('hidden');document.querySelectorAll('.nav-item[data-view]').forEach(x=>x.classList.toggle('active',x.dataset.view===name));$('pageTitle').textContent=name[0].toUpperCase()+name.slice(1)}
document.querySelectorAll('.nav-item[data-view]').forEach(b=>b.onclick=()=>{showView(b.dataset.view);$('sidebar').classList.remove('open')});document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderDevices()});
$('modeSwitch').onclick=()=>{mode=mode==='home'?'away':'home';addLog(`Home mode changed to ${mode==='home'?'At Home':'Away'}`);if(mode==='away')toast('🚶 Away Mode enabled');render()};$('allOff').onclick=()=>{devices.forEach(d=>{d.on=false;d.runtime=0});addLog('All appliances switched OFF');toast('⏻ All appliances switched OFF');render()};$('allOn').onclick=()=>{devices.forEach(d=>d.on=true);addLog('All appliances switched ON');toast('◉ All appliances switched ON');render()};$('refreshBtn').onclick=()=>{render();toast('↻ Dashboard refreshed')};$('randomBtn').onclick=()=>{devices.forEach(d=>{if(Math.random()<.28)d.on=!d.on});addLog('Simulated household activity');toast('✦ Simulated appliance activity');render()};$('clearLog').onclick=()=>{log=[];save();renderLog();toast('Activity log cleared')};$('priceInput').oninput=e=>{price=Number(e.target.value)||8;renderEnergy()};$('speedSelect').onchange=e=>{speed=Number(e.target.value);toast('Simulation speed updated')};$('mobileMenu').onclick=()=>$('sidebar').classList.toggle('open');/* =========================
   DARK / LIGHT MODE
   ========================= */

const savedTheme = localStorage.getItem('switchsync-theme');

if (savedTheme === 'light') {
  document.body.classList.add('light');
}

$('themeBtn').onclick = () => {

  document.body.classList.toggle('light');

  const isLight = document.body.classList.contains('light');

  localStorage.setItem(
    'switchsync-theme',
    isLight ? 'light' : 'dark'
  );

  $('themeBtn').textContent = isLight ? '☾' : '☼';
  
};
/* =========================
   ADMIN PROFILE
   ========================= */

const profileBtn = $('profileBtn');
const profileOverlay = $('profileOverlay');
const profileClose = $('profileClose');
const profileDone = $('profileDone');

function openProfile() {
  profileOverlay.classList.add('show');

  const modeText =
    mode === 'home'
      ? 'At Home'
      : 'Away';

  $('profileMode').textContent = modeText;
}

function closeProfile() {
  profileOverlay.classList.remove('show');
}

if (profileBtn) {
  profileBtn.onclick = openProfile;
}

if (profileClose) {
  profileClose.onclick = closeProfile;
}

if (profileDone) {
  profileDone.onclick = closeProfile;
}

if (profileOverlay) {

  profileOverlay.onclick = (event) => {

    if (event.target === profileOverlay) {
      closeProfile();
    }

  };

}
