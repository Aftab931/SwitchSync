
/* =========================================
   SWITCHSYNC - SMART HOME SIMULATION
   ========================================= */

// 1. APPLIANCE DATABASE

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

// 2. GLOBAL VARIABLES

let mode = 'home';
let filter = 'all';
let speed = 1;
let price = 8;
let log = [];

let tripPlan = {
  departure:'',
  returning:'',
  note:'',
  active:false
};

const $ = id => document.getElementById(id);
const deviceById = id => devices.find(d => d.id === id);

// 3. SAVE DATA

function save() {
  localStorage.setItem('switchsync-devices', JSON.stringify(devices));
  localStorage.setItem('switchsync-log', JSON.stringify(log));
  localStorage.setItem('switchsync-mode', mode);
  localStorage.setItem('switchsync-trip', JSON.stringify(tripPlan));
}

// 4. LOAD DATA

function load() {
  try {
    const savedDevices = JSON.parse(localStorage.getItem('switchsync-devices'));

    if (Array.isArray(savedDevices)) {
      savedDevices.forEach(item => {
        const device = deviceById(item.id);
        if (device) {
          device.on = !!item.on;
          device.runtime = Number(item.runtime) || 0;
        }
      });
    }
  } catch (error) {
    console.error('Device loading error:', error);
  }

  try {
    const savedLog = JSON.parse(localStorage.getItem('switchsync-log'));
    log = Array.isArray(savedLog) ? savedLog : [];
  } catch {
    log = [];
  }

  mode = localStorage.getItem('switchsync-mode') || 'home';

  try {
    const savedTrip = JSON.parse(localStorage.getItem('switchsync-trip'));
    if (savedTrip && typeof savedTrip === 'object') {
      tripPlan = { ...tripPlan, ...savedTrip };
    }
  } catch {
    console.log('No saved trip found.');
  }
}

// 5. GREETING AND DATE

function updateGreetingAndDate() {
  const now = new Date();
  const hour = now.getHours();

  let greeting = 'Good night';

  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17 && hour < 21) greeting = 'Good evening';

  $('greeting').innerHTML = greeting + ', <span>Admin.</span> 👋';

  $('currentDate').textContent = now.toLocaleDateString('en-IN', {
    weekday:'long',
    month:'long',
    day:'numeric',
    year:'numeric'
  }).toUpperCase();
}

// 6. TOAST

let toastTimer;

function toast(message) {
  const element = $('toast');
  element.textContent = message;
  element.classList.add('show');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    element.classList.remove('show');
  }, 2500);
}

// 7. ACTIVITY LOG

function addLog(message) {
  log.unshift({
    text:message,
    time:new Date().toLocaleTimeString([], {
      hour:'2-digit',
      minute:'2-digit',
      second:'2-digit'
    })
  });

  log = log.slice(0,60);
  save();
  renderLog();
}

// 8. APPLIANCE CONTROL

function toggle(id, on) {
  const device = deviceById(id);
  if (!device) return;

  device.on = on;
  if (!on) device.runtime = 0;

  addLog(`${device.name} turned ${on ? 'ON' : 'OFF'}`);
  toast(`${device.icon} ${device.name} is now ${on ? 'ON' : 'OFF'}`);

  render();
}

// 9. ENERGY

function energy() {
  return devices.reduce((sum,d) =>
    sum + (d.on ? d.watts / 1000 * (d.runtime / 3600) : 0), 0);
}

// 10. ALERTS

function alerts() {
  return devices.filter(d => d.on && d.priority && d.runtime >= 1800);
}

// 11. FILTERING

function filtered() {
  return devices.filter(d =>
    filter === 'all' || (filter === 'on' ? d.on : !d.on)
  );
}

// 12. RUNTIME FORMAT

function formatRuntime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// 13. APPLIANCE CARD

function card(d) {
  return `
    <article class="device-card">
      <div class="device-top">
        <div class="device-icon">${d.icon}</div>
        <div class="status-dot ${d.on ? 'on' : ''}">
          ${d.on ? '● ON' : '○ OFF'}
        </div>
      </div>

      <h3>${d.name}</h3>
      <p>${d.category} • ${d.watts} W</p>

      <div class="device-bottom">
        <span class="watts">${d.on ? formatRuntime(d.runtime) : 'Standby'}</span>
        <button class="toggle ${d.on ? 'on' : ''}" data-toggle="${d.id}">
          <span></span>
        </button>
      </div>
    </article>
  `;
}

// 14. RENDER DEVICES

function renderDevices() {
  $('deviceGrid').innerHTML = filtered().map(card).join('');
  $('allDeviceGrid').innerHTML = devices.map(card).join('');

  document.querySelectorAll('[data-toggle]').forEach(button => {
    button.onclick = () => {
      const device = deviceById(button.dataset.toggle);
      if (device) toggle(device.id, !device.on);
    };
  });
}

// 15. RENDER ALERTS

function renderAlerts() {
  const list = alerts();

  $('alertCount').textContent = list.length;
  $('alertBadge').textContent = list.length;
  $('alertLabel').textContent = list.length ? 'needs attention' : 'all clear';

  $('alerts').innerHTML = list.length
    ? list.map(d => `
      <div class="alert-item">
        <div class="alert-symbol">!</div>
        <div>
          <b>${d.name} has been ON for a long time</b>
          <small>${formatRuntime(d.runtime)} • Consider switching it off.</small>
        </div>
      </div>
    `).join('')
    : '<div class="empty">✓ No critical appliance alerts.</div>';
}

// 16. RENDER ENERGY

function renderEnergy() {
  const total = energy();

  $('energyToday').textContent = total.toFixed(3) + ' kWh';
  $('energyCost').textContent = '₹' + (total * price).toFixed(2);

  const max = Math.max(
    ...devices.map(d => d.watts / 1000 * (Math.max(d.runtime,900) / 3600)),
    1
  );

  $('energyBar').style.width =
    Math.min(100,total / (max * 5) * 100) + '%';

  $('energyRows').innerHTML = devices.map(d => {
    const value = d.on ? d.watts / 1000 * (d.runtime / 3600) : 0;

    return `
      <div class="energy-row">
        <div><b>${d.icon} ${d.name}</b><br><small>${d.watts} W</small></div>
        <b>${value.toFixed(3)} kWh</b>
      </div>
    `;
  }).join('');
}

// 17. ACTIVITY LOG DISPLAY

function renderLog() {
  $('activityLog').innerHTML = log.length
    ? log.map(item => `
      <div class="log-row">
        <span>${item.text}</span>
        <small>${item.time}</small>
      </div>
    `).join('')
    : '<div class="empty">No activity yet.</div>';
}

// 18. TRAVEL MODE DISPLAY

function renderTravel() {
  const onCount = devices.filter(d => d.on).length;
  const offCount = devices.length - onCount;

  $('travelMonitorOn').textContent = onCount;
  $('travelMonitorOff').textContent = offCount;

  $('travelStatus').textContent =
    tripPlan.active ? 'Travel Mode Active' :
    tripPlan.departure ? 'Trip Planned' : 'No trip planned';

  $('travelMonitorStatus').textContent =
    tripPlan.active ? 'Travel Mode Active' : 'At Home';

  if (tripPlan.departure && tripPlan.returning) {
    const start = new Date(tripPlan.departure + 'T00:00:00');
    const end = new Date(tripPlan.returning + 'T00:00:00');
    const days = Math.round((end - start) / 86400000) + 1;

    $('tripDuration').textContent =
      days + (days === 1 ? ' day' : ' days');
  } else {
    $('tripDuration').textContent = 'Not planned';
  }

  $('travelChecklist').innerHTML = devices.map(d => `
    <div class="travel-check-row">
      <div class="travel-check-device">
        <div class="travel-check-icon">${d.icon}</div>
        <div>
          <strong>${d.name}</strong>
          <div class="muted">${d.category} • ${d.watts} W</div>
        </div>
      </div>
      <span class="check-state ${d.on ? 'on' : 'off'}">
        ${d.on ? '● ON' : '✓ OFF'}
      </span>
    </div>
  `).join('');
}

// 19. MAIN RENDER

function render() {
  updateGreetingAndDate();

  const onCount = devices.filter(d => d.on).length;

  $('totalDevices').textContent = devices.length;
  $('onDevices').textContent = onCount;
  $('onPercent').textContent =
    Math.round(onCount / devices.length * 100) + '%';

  $('modeLabel').textContent = mode === 'home' ? 'At Home' : 'Away';
  $('modeSwitch').classList.toggle('away',mode === 'away');

  if ($('profileMode')) {
    $('profileMode').textContent = mode === 'home' ? 'At Home' : 'Away';
  }

  renderDevices();
  renderAlerts();
  renderEnergy();
  renderLog();
  renderTravel();

  save();
}

// 20. PAGE NAVIGATION

function showView(name) {
  document.querySelectorAll('.view-panel,#dashboardView').forEach(view => {
    view.classList.add('hidden');
  });

  const target = $(name === 'dashboard' ? 'dashboardView' : name + 'View');

  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.nav-item[data-view]').forEach(button => {
    button.classList.toggle('active',button.dataset.view === name);
  });

  $('pageTitle').textContent =
    name.charAt(0).toUpperCase() + name.slice(1);

  $('sidebar').classList.remove('open');
}

// 21. NAVIGATION BUTTONS

document.querySelectorAll('.nav-item[data-view]').forEach(button => {
  button.onclick = () => showView(button.dataset.view);
});

// 22. FILTER BUTTONS

document.querySelectorAll('.filter').forEach(button => {
  button.onclick = () => {
    filter = button.dataset.filter;

    document.querySelectorAll('.filter').forEach(item =>
      item.classList.remove('active')
    );

    button.classList.add('active');
    renderDevices();
  };
});

// 23. HOME / AWAY MODE

$('modeSwitch').onclick = () => {
  mode = mode === 'home' ? 'away' : 'home';

  addLog(`Home mode changed to ${mode === 'home' ? 'At Home' : 'Away'}`);

  toast(mode === 'home' ? '🏠 At Home mode enabled' : '✈ Away Mode enabled');

  render();
};

// 24. TURN EVERYTHING OFF

function switchEverythingOff() {
  devices.forEach(d => {
    d.on = false;
    d.runtime = 0;
  });

  addLog('All appliances switched OFF');
  render();
  toast('⏻ All appliances switched OFF');
}

$('allOff').onclick = switchEverythingOff;

// 25. TURN EVERYTHING ON

$('allOn').onclick = () => {
  devices.forEach(d => d.on = true);

  addLog('All appliances switched ON');
  render();
  toast('All appliances switched ON');
};

// 26. REFRESH

$('refreshBtn').onclick = () => {
  render();
  toast('Dashboard refreshed');
};

// 27. SIMULATE ACTIVITY

$('randomBtn').onclick = () => {
  devices.forEach(d => {
    if (Math.random() < 0.28) d.on = !d.on;
  });

  addLog('Simulated household activity');
  render();
  toast('Simulated appliance activity');
};

// 28. CLEAR LOG

$('clearLog').onclick = () => {
  log = [];
  save();
  renderLog();
  toast('Activity log cleared');
};

// 29. ENERGY PRICE

$('priceInput').oninput = event => {
  price = Number(event.target.value) || 8;
  renderEnergy();
};

// 30. SIMULATION SPEED

$('speedSelect').onchange = event => {
  speed = Number(event.target.value) || 1;
  toast('Simulation speed updated');
};

// 31. MOBILE MENU

$('mobileMenu').onclick = () => {
  $('sidebar').classList.toggle('open');
};

// 32. DARK / LIGHT THEME

if (localStorage.getItem('switchsync-theme') === 'light') {
  document.body.classList.add('light');
  $('themeBtn').textContent = '☾';
}

$('themeBtn').onclick = () => {
  document.body.classList.toggle('light');

  const light = document.body.classList.contains('light');

  localStorage.setItem('switchsync-theme',light ? 'light' : 'dark');
  $('themeBtn').textContent = light ? '☾' : '☼';
};

// 33. ADMIN PROFILE

function closeProfile() {
  $('profileOverlay').classList.remove('show');
}

$('profileBtn').onclick = () => {
  $('profileOverlay').classList.add('show');
  $('profileMode').textContent = mode === 'home' ? 'At Home' : 'Away';
};

$('profileClose').onclick = closeProfile;
$('profileDone').onclick = closeProfile;

$('profileOverlay').onclick = event => {
  if (event.target === $('profileOverlay')) closeProfile();
};

// 34. TRAVEL MODE: SAVE TRIP PLAN

function saveTripPlan() {
  const departure = $('departureDate').value;
  const returning = $('returnDate').value;
  const note = $('tripNote').value.trim();

  if (!departure || !returning) {
    toast('Please select both travel dates.');
    return;
  }

  if (returning < departure) {
    toast('Return date cannot be before departure.');
    return;
  }

  tripPlan.departure = departure;
  tripPlan.returning = returning;
  tripPlan.note = note;

  tripPlan.active = false;

  save();
  renderTravel();
  addLog('Travel plan saved');

  toast('Trip plan saved successfully!');
}

// 35. TRAVEL MODE: ACTIVATE

function activateTravelMode() {
  if (!tripPlan.departure || !tripPlan.returning) {
    toast('Please save your trip plan first.');
    return;
  }

  tripPlan.active = true;
  mode = 'away';

  save();
  render();
  addLog('Travel Mode activated');

  toast('✈ Travel Mode activated!');
}

// 36. TRAVEL MODE: SWITCH ALL APPLIANCES OFF

function switchAllOffForTravel() {
  devices.forEach(d => {
    d.on = false;
    d.runtime = 0;
  });

  mode = 'away';

  save();
  render();
  addLog('All appliances switched OFF for travel');

  toast('All simulated appliances are OFF!');
}

// 37. TRAVEL MODE BUTTON CONNECTIONS

$('saveTrip').onclick = saveTripPlan;
$('activateTravel').onclick = activateTravelMode;
$('travelAllOff').onclick = switchAllOffForTravel;

$('refreshChecklist').onclick = () => {
  renderTravel();
  toast('Travel checklist refreshed!');
};

// 38. START WEBSITE

load();

if (tripPlan.departure) {
  $('departureDate').value = tripPlan.departure;
  $('returnDate').value = tripPlan.returning;
  $('tripNote').value = tripPlan.note || '';
}

render();

// 39. APPLIANCE RUNTIME TIMER

setInterval(() => {
  devices.forEach(d => {
    if (d.on) d.runtime += speed;
  });

  render();
},1000);
