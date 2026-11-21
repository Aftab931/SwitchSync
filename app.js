
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
  departure: '',
  returning: '',
  note: '',
  active: false
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
    log = JSON.parse(localStorage.getItem('switchsync-log')) || [];

    if (!Array.isArray(log)) log = [];
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


// 5. AUTOMATIC DATE AND GREETING

function updateGreetingAndDate() {
  const now = new Date();
  const hour = now.getHours();

  let greeting;

  if (hour >= 5 && hour < 12) {
    greeting = 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    greeting = 'Good evening';
  } else {
    greeting = 'Good night';
  }

  $('greeting').textContent = greeting + ', Admin.';

  $('currentDate').textContent = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}


// 6. TOAST NOTIFICATION

function toast(message) {
  const element = $('toast');

  element.textContent = message;
  element.classList.add('show');

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    element.classList.remove('show');
  }, 2500);
}


// 7. ACTIVITY LOG

function addLog(message) {
  log.unshift({
    text: message,
    time: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  });

  log = log.slice(0, 60);

  save();
  renderLog();
}


// 8. APPLIANCE CONTROL

function toggle(id, on) {
  const device = deviceById(id);

  if (!device) return;

  device.on = on;

  if (!on) {
    device.runtime = 0;
  }

  addLog(`${device.name} turned ${on ? 'ON' : 'OFF'}`);

  toast(`${device.icon} ${device.name} is now ${on ? 'ON' : 'OFF'}`);

  render();
}


// 9. ENERGY CALCULATION

function energy() {
  return devices.reduce((sum, device) => {
    return sum + (
      device.on
        ? device.watts / 1000 * (device.runtime / 3600)
        : 0
    );
  }, 0);
}


// 10. SMART ALERTS

function alerts() {
  return devices.filter(device =>
    device.on && device.priority && device.runtime >= 1800
  );
}


// 11. FILTERING

function filtered() {
  return devices.filter(device =>
    filter === 'all' ||
    (filter === 'on' ? device.on : !device.on)
  );
}


// 12. RUNTIME FORMAT

function formatRuntime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}


// 13. DEVICE CARD

function card(device) {
  return `
    <article class="device-card ${device.on ? 'is-on' : ''}">
      <div class="device-top">
        <div class="device-icon">${device.icon}</div>

        <div class="status-dot ${device.on ? 'on' : ''}">
          ${device.on ? '● ON' : '○ OFF'}
        </div>
      </div>

      <h3>${device.name}</h3>

      <p>${device.category} • ${device.watts} W</p>

      <div class="device-bottom">
        <span class="watts">
          ${device.on ? formatRuntime(device.runtime) : 'Standby'}
        </span>

        <button class="toggle ${device.on ? 'on' : ''}"
          data-toggle="${device.id}"
          aria-label="Toggle ${device.name}">
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

      if (device) {
        toggle(device.id, !device.on);
      }
    };
  });
}


// 15. RENDER ALERTS

function renderAlerts() {
  const currentAlerts = alerts();

  $('alertCount').textContent = currentAlerts.length;
  $('alertBadge').textContent = currentAlerts.length;

  $('alertLabel').textContent =
    currentAlerts.length ? 'needs attention' : 'all clear';

  $('alerts').innerHTML = currentAlerts.length
    ? currentAlerts.map(device => `
        <div class="alert-item">
          <div class="alert-symbol">!</div>
          <div>
            <b>${device.name} has been ON for a long time</b>
            <small>${formatRuntime(device.runtime)} • Consider switching it off.</small>
          </div>
        </div>
      `).join('')
    : '<div class="empty">✓ No critical appliance alerts.</div>';
}


// 16. RENDER ENERGY

function renderEnergy() {
  const totalEnergy = energy();

  $('energyToday').textContent = totalEnergy.toFixed(2) + ' kWh';

  $('energyCost').textContent =
    '₹' + (totalEnergy * price).toFixed(2);

  const maximum = Math.max(
    ...devices.map(device =>
      device.watts / 1000 * (Math.max(device.runtime, 900) / 3600)
    ),
    1
  );

  $('energyBar').style.width =
    Math.min(100, totalEnergy / (maximum * 5) * 100) + '%';

  $('energyRows').innerHTML = devices.map(device => {
    const value = device.on
      ? device.watts / 1000 * (device.runtime / 3600)
      : 0;

    return `
      <div class="energy-row">
        <div>
          <b>${device.icon} ${device.name}</b>
          <small>${device.watts} W</small>
        </div>
        <b>${value.toFixed(3)} kWh</b>
      </div>
    `;
  }).join('');
}


// 17. RENDER ACTIVITY LOG

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


// 18. TRAVEL MODE

function saveTripPlan() {
  const departure = $('departureDate').value;
  const returning = $('returnDate').value;
  const note = $('tripNote').value.trim();

  if (!departure || !returning) {
    toast('Please enter both travel dates.');
    return false;
  }

  if (returning < departure) {
    toast('Return date cannot be before departure.');
    return false;
  }

  tripPlan.departure = departure;
  tripPlan.returning = returning;
  tripPlan.note = note;

  save();
  renderTravel();

  toast('✈ Trip plan saved successfully.');

  addLog('Travel plan saved');

  return true;
}


function renderTravel() {
  const onCount = devices.filter(device => device.on).length;
  const offCount = devices.length - onCount;

  $('travelMonitorOn').textContent = onCount;
  $('travelMonitorOff').textContent = offCount;

  $('travelMonitorStatus').textContent =
    tripPlan.active ? 'Travel Mode Active' : 'At Home';

  $('travelStatus').textContent =
    tripPlan.active ? '✈ Travel Mode Active' :
    tripPlan.departure ? 'Trip Planned' : 'No trip planned';

  if (tripPlan.departure && tripPlan.returning) {
    const start = new Date(tripPlan.departure + 'T00:00:00');
    const end = new Date(tripPlan.returning + 'T00:00:00');

    const days = Math.round((end - start) / 86400000) + 1;

    $('tripDuration').textContent =
      days + (days === 1 ? ' day' : ' days');
  } else {
    $('tripDuration').textContent = 'Not planned';
  }

  $('travelChecklist').innerHTML = devices.map(device => `
    <div class="travel-check-row">
      <div class="travel-check-device">
        <div class="travel-check-icon">${device.icon}</div>
        <div>
          <strong>${device.name}</strong>
          <div class="muted">${device.category} • ${device.watts} W</div>
        </div>
      </div>

      <span class="check-state ${device.on ? 'on' : 'off'}">
        ${device.on ? '● ON' : '✓ OFF'}
      </span>
    </div>
  `).join('');

  if (tripPlan.departure) {
    $('departureDate').value = tripPlan.departure;
    $('returnDate').value = tripPlan.returning;
    $('tripNote').value = tripPlan.note || '';
  }
}


function activateTravelMode() {
  if (!tripPlan.departure || !tripPlan.returning) {
    toast('Save your trip plan first.');
    return;
  }

  tripPlan.active = true;
  mode = 'away';

  save();
  render();

  addLog('Travel Mode activated');

  toast('✈ Travel Mode activated.');
}


function switchAllOffForTravel() {
  devices.forEach(device => {
    device.on = false;
    device.runtime = 0;
  });

  mode = 'away';

  save();
  render();

  addLog('All simulated appliances switched OFF for travel');

  toast('✓ All simulated appliances are OFF.');
}


// 19. MAIN DASHBOARD RENDER

function render() {
  updateGreetingAndDate();

  const onCount = devices.filter(device => device.on).length;

  $('totalDevices').textContent = devices.length;
  $('onDevices').textContent = onCount;

  $('onPercent').textContent =
    Math.round(onCount / devices.length * 100) + '%';

  $('modeLabel').textContent =
    mode === 'home' ? 'At Home' : 'Away';

  $('modeSwitch').classList.toggle('away', mode === 'away');

  if ($('profileMode')) {
    $('profileMode').textContent =
      mode === 'home' ? 'At Home' : 'Away';
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
  document.querySelectorAll('.view-panel, #dashboardView').forEach(view => {
    view.classList.add('hidden');
  });

  const selectedView = $(name === 'dashboard' ? 'dashboardView' : name + 'View');

  if (selectedView) {
    selectedView.classList.remove('hidden');
  }

  document.querySelectorAll('.nav-item[data-view]').forEach(button => {
    button.classList.toggle('active', button.dataset.view === name);
  });

  $('pageTitle').textContent =
    name.charAt(0).toUpperCase() + name.slice(1);

  if (name === 'travel') {
    renderTravel();
  }
}


// 21. NAVIGATION BUTTONS

document.querySelectorAll('.nav-item[data-view]').forEach(button => {
  button.onclick = () => {
    showView(button.dataset.view);
    $('sidebar').classList.remove('open');
  };
});


// 22. FILTER BUTTONS

document.querySelectorAll('.filter').forEach(button => {
  button.onclick = () => {
    filter = button.dataset.filter;

    document.querySelectorAll('.filter').forEach(item => {
      item.classList.remove('active');
    });

    button.classList.add('active');

    renderDevices();
  };
});


// 23. HOME AND AWAY MODE

$('modeSwitch').onclick = () => {
  mode = mode === 'home' ? 'away' : 'home';

  addLog(`Home mode changed to ${mode === 'home' ? 'At Home' : 'Away'}`);

  if (mode === 'away') {
    const activeDevices = devices.filter(device => device.on);

    toast(
      activeDevices.length
        ? `⚠️ ${activeDevices.length} appliances are still ON`
        : '✈ Away Mode enabled — all appliances are OFF'
    );
  } else {
    tripPlan.active = false;
    toast('🏠 At Home mode enabled');
  }

  render();
};


// 24. TURN EVERYTHING OFF

$('allOff').onclick = () => {
  devices.forEach(device => {
    device.on = false;
    device.runtime = 0;
  });

  addLog('All appliances switched OFF');

  toast('⏻ All appliances switched OFF');

  render();
};


// 25. TURN EVERYTHING ON

$('allOn').onclick = () => {
  devices.forEach(device => {
    device.on = true;
  });

  addLog('All appliances switched ON');

  toast('◉ All appliances switched ON');

  render();
};


// 26. REFRESH SIMULATION

$('refreshBtn').onclick = () => {
  render();
  toast('↻ Dashboard refreshed');
};


// 27. SIMULATE HOUSEHOLD ACTIVITY

$('randomBtn').onclick = () => {
  devices.forEach(device => {
    if (Math.random() < 0.28) {
      device.on = !device.on;
    }
  });

  addLog('Simulated household activity');

  toast('✦ Simulated appliance activity');

  render();
};


// 28. CLEAR ACTIVITY LOG

$('clearLog').onclick = () => {
  log = [];

  save();
  renderLog();

  toast('Activity log cleared');
};


// 29. ELECTRICITY PRICE

$('priceInput').oninput = event => {
  price = Number(event.target.value) || 8;
  renderEnergy();
};


// 30. SIMULATION SPEED

$('speedSelect').onchange = event => {
  speed = Number(event.target.value);
  toast('Simulation speed updated');
};


// 31. MOBILE MENU

$('mobileMenu').onclick = () => {
  $('sidebar').classList.toggle('open');
};


// 32. DARK AND LIGHT MODE

const savedTheme = localStorage.getItem('switchsync-theme');

if (savedTheme === 'light') {
  document.body.classList.add('light');
  $('themeBtn').textContent = '☾';
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


// 33. ADMIN PROFILE

const profileOverlay = $('profileOverlay');

function openProfile() {
  profileOverlay.classList.add('show');

  $('profileMode').textContent =
    mode === 'home' ? 'At Home' : 'Away';
}

function closeProfile() {
  profileOverlay.classList.remove('show');
}

$('profileBtn').onclick = openProfile;
$('profileClose').onclick = closeProfile;
$('profileDone').onclick = closeProfile;

profileOverlay.onclick = event => {
  if (event.target === profileOverlay) {
    closeProfile();
  }
};


// 34. TRAVEL MODE BUTTONS

$('saveTrip').onclick = saveTripPlan;

$('activateTravel').onclick = activateTravelMode;

$('travelAllOff').onclick = switchAllOffForTravel;

$('refreshChecklist').onclick = () => {
  renderTravel();
  toast('Travel checklist refreshed.');
};


// 35. INITIALIZE WEBSITE

load();

if (tripPlan.departure) {
  $('departureDate').value = tripPlan.departure;
  $('returnDate').value = tripPlan.returning;
  $('tripNote').value = tripPlan.note || '';
}

render();


// 36. AUTOMATIC RUNTIME AND DATE UPDATES

setInterval(() => {
  devices.forEach(device => {
    if (device.on) {
      device.runtime += speed;
    }
  });

  render();
}, 1000);
