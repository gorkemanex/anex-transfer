
var SHEET_ID = '1V5_t0mQ4xTiiauiUcKUpshJauuUe99ii9sGOZa0RFPg';
var transferData = [];
var lang = 'en';

var i18n = {
  en: {
    subtitle:'Transfer Information',
    find:'Find your transfer',
    resno:'Reservation Number',
    fname:'First Name',
    lname:'Last Name',
    or:'or search by name',
    search:'Search Transfer',
    departure:'Pick-up Time',
    flight:'Flight',
    meeting:'Meeting Point',
    lobby:'Hotel Lobby',
    back:'\u2190 New Search',
    status:'Confirmed',
    footer:'Please be ready at the hotel lobby <strong>10 minutes before</strong> your pick-up time.<br>For questions, contact the Anex representative or reception.',
    error:'Transfer not found. Please check your reservation number.',
    dataLive:'Live data \u2014 updated daily',
    alertTitle:'\u26a0 Schedule Updated',
    alertBody:'Your pick-up time has been updated. Please note the new time above.'
  },
  ru: {
    subtitle:'\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043e \u0442\u0440\u0430\u043d\u0441\u0444\u0435\u0440\u0435',
    find:'\u041d\u0430\u0439\u0442\u0438 \u0442\u0440\u0430\u043d\u0441\u0444\u0435\u0440',
    resno:'\u041d\u043e\u043c\u0435\u0440 \u0431\u0440\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f',
    fname:'\u0418\u043c\u044f',
    lname:'\u0424\u0430\u043c\u0438\u043b\u0438\u044f',
    or:'\u0438\u043b\u0438 \u043f\u043e\u0438\u0441\u043a \u043f\u043e \u0438\u043c\u0435\u043d\u0438',
    search:'\u041d\u0430\u0439\u0442\u0438 \u0442\u0440\u0430\u043d\u0441\u0444\u0435\u0440',
    departure:'\u0412\u0440\u0435\u043c\u044f \u043f\u043e\u0434\u0430\u0447\u0438',
    flight:'\u0420\u0435\u0439\u0441',
    meeting:'\u041c\u0435\u0441\u0442\u043e \u0432\u0441\u0442\u0440\u0435\u0447\u0438',
    lobby:'\u041b\u043e\u0431\u0431\u0438 \u043e\u0442\u0435\u043b\u044f',
    back:'\u2190 \u041d\u0430\u0437\u0430\u0434',
    status:'\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u043e',
    footer:'\u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u0431\u0443\u0434\u044c\u0442\u0435 \u0432 \u043b\u043e\u0431\u0431\u0438 \u0437\u0430 <strong>10 \u043c\u0438\u043d\u0443\u0442</strong> \u0434\u043e \u0443\u043a\u0430\u0437\u0430\u043d\u043d\u043e\u0433\u043e \u0432\u0440\u0435\u043c\u0435\u043d\u0438.',
    error:'\u0422\u0440\u0430\u043d\u0441\u0444\u0435\u0440 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d.',
    dataLive:'\u0410\u043a\u0442\u0443\u0430\u043b\u044c\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435',
    alertTitle:'\u26a0 \u0412\u0440\u0435\u043c\u044f \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u043e',
    alertBody:'\u0412\u0440\u0435\u043c\u044f \u043f\u043e\u0434\u0430\u0447\u0438 \u0438\u0437\u043c\u0435\u043d\u0438\u043b\u043e\u0441\u044c.'
  }
};

function setLang(l) {
  lang = l;
  document.querySelectorAll('.lang-btn').forEach(function(b) {
    b.classList.toggle('active', b.textContent === l.toUpperCase());
  });
  var t = i18n[l];
  function s(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }
  s('txt-subtitle', t.subtitle);
  s('txt-find', t.find);
  s('lbl-resno', t.resno);
  s('lbl-fname', t.fname);
  s('lbl-lname', t.lname);
  s('txt-or', t.or);
  s('btn-search', t.search);
  s('txt-departure', t.departure);
  s('lbl-flight', t.flight);
  s('lbl-meeting', t.meeting);
  s('txt-lobby', t.lobby);
  s('btn-back', t.back);
  s('txt-footer', t.footer);
  s('error-msg', t.error);
  var st = document.getElementById('res-status');
  if (st && st.textContent) s('res-status', t.status);
}

function loadData() {
  var dot = document.getElementById('data-dot');
  var txt = document.getElementById('data-status-text');
  var csvUrl = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/export?format=csv&gid=0';
  var proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(csvUrl);
  fetch(proxyUrl)
    .then(function(res) {
      if (!res.ok) throw new Error('fail');
      return res.text();
    })
    .then(function(csv) {
      var lines = csv.trim().split('\n');
      var seen = {};
      transferData = [];
      for (var i = 1; i < lines.length; i++) {
        var cols = lines[i].split(',');
        var resNo = (cols[0] || '').trim().replace(/"/g, '');
        if (!resNo || seen[resNo]) continue;
        seen[resNo] = true;
        var pickup = (cols[1] || '').trim().replace(/"/g, '').slice(0, 5);
        var flightTime = (cols[4] || '').trim().replace(/"/g, '').slice(0, 5);
        var hotel = (cols[6] || '').trim().replace(/"/g, '');
        var flight = (cols[7] || '').trim().replace(/"/g, '').replace(' (GDS)', '');
        transferData.push({ res: resNo, pickup: pickup, hotel: hotel, flight: flight, flightTime: flightTime });
      }
      dot.className = 'data-dot';
      txt.textContent = i18n[lang].dataLive;
      checkStoredChange();
    })
    .catch(function() {
      dot.className = 'data-dot error';
      txt.textContent = 'Refresh to try again';
    });
}

function checkStoredChange() {
  var storedPickup = localStorage.getItem('anex_last_pickup');
  var storedRes = localStorage.getItem('anex_res');
  if (!storedPickup || !storedRes) return;
  var fresh = null;
  for (var i = 0; i < transferData.length; i++) {
    if (transferData[i].res === storedRes) { fresh = transferData[i]; break; }
  }
  if (fresh && fresh.pickup !== storedPickup) {
    localStorage.setItem('anex_last_pickup', fresh.pickup);
    document.getElementById('alert-title').innerHTML = i18n[lang].alertTitle;
    document.getElementById('alert-body').textContent = i18n[lang].alertBody;
    document.getElementById('change-alert').style.display = 'block';
    document.getElementById('res-time').textContent = fresh.pickup;
  }
}

function normalize(s) {
  return (s || '').toString().trim().toLowerCase().replace(/\s+/g, '');
}

function doSearch() {
  var inp = normalize(document.getElementById('inp-resno').value);
  var fname = normalize(document.getElementById('inp-fname').value);
  var lname = normalize(document.getElementById('inp-lname').value);
  document.getElementById('error-msg').style.display = 'none';
  if (!inp && !(fname && lname)) { document.getElementById('error-msg').style.display = 'block'; return; }
  if (transferData.length === 0) { document.getElementById('error-msg').style.display = 'block'; return; }
  var result = null;
  if (inp) {
    var long = inp.length <= 8 ? '1' + inp : inp;
    for (var i = 0; i < transferData.length; i++) {
      if (normalize(transferData[i].res) === inp || normalize(transferData[i].res) === long) {
        result = transferData[i]; break;
      }
    }
  }
  if (!result) { document.getElementById('error-msg').style.display = 'block'; return; }
  document.getElementById('loading').style.display = 'block';
  var r = result;
  setTimeout(function() {
    document.getElementById('loading').style.display = 'none';
    showResult(r);
  }, 300);
}

function showResult(d) {
  var t = i18n[lang];
  localStorage.setItem('anex_res', d.res);
  localStorage.setItem('anex_last_pickup', d.pickup);
  document.getElementById('search-section').style.display = 'none';
  document.getElementById('res-tag').textContent = 'Reservation ' + d.res;
  document.getElementById('res-hotel').textContent = d.hotel;
  document.getElementById('res-status').textContent = t.status;
  document.getElementById('res-time').textContent = d.pickup || '-';
  document.getElementById('txt-today').textContent = new Date().toLocaleDateString(
    lang === 'ru' ? 'ru-RU' : 'en-GB',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );
  document.getElementById('res-flight').textContent = d.flight || '-';
  document.getElementById('res-flighttime').textContent = d.flightTime || '';
  document.getElementById('result-card').style.display = 'block';
}

function resetSearch() {
  localStorage.removeItem('anex_res');
  localStorage.removeItem('anex_last_pickup');
  document.getElementById('result-card').style.display = 'none';
  document.getElementById('change-alert').style.display = 'none';
  document.getElementById('search-section').style.display = 'block';
  ['inp-resno', 'inp-fname', 'inp-lname'].forEach(function(id) {
    document.getElementById(id).value = '';
  });
  document.getElementById('error-msg').style.display = 'none';
}

document.addEventListener('keydown', function(e) { if (e.key === 'Enter') doSearch(); });
loadData();
