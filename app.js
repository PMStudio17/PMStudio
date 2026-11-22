const KEY = 'pms_db_v1';
let db = JSON.parse(localStorage.getItem(KEY) || '[{"id":1,"noInv":"INV/PMS/2026/11/056","tglInv":"2026-11-20","client":"Mas Erik / Sabs Media","email":"erik.purwanto@sabs.id","type":"Agency Partner — Playlist Placement","artis":"Brenda Yevabelle dkk","lagu":"Satu Terluka","durasi":1,"mulai":"2026-11-20","selesai":"2026-12-20","rate":600000,"sub":600000,"periode":"Bulan","playlist":"Main Playlist Placement"}]');

const KEY_C = 'pms_client_v1';
let dbC = JSON.parse(localStorage.getItem(KEY_C) || '[{"id":1,"nama":"Mas Erik / Sabs Media","email":"erik.purwanto@sabs.id","type":"Agency Partner — Playlist Placement"}]');

const bar = document.getElementById('invBar');
const selInv = document.createElement('select');
selInv.style.padding = '7px';
selInv.onchange = renderInv;
const selStat = document.createElement('select');
selStat.style.padding = '7px';
['Due Upon Receipt (Bayar Langsung)', 'PAID (Lunas)', 'Unpaid (Belum Lunas)'].forEach(s => {
  const o = document.createElement('option'); o.value = s; o.textContent = s; selStat.appendChild(o);
});
selStat.onchange = renderInv;
const btnPr = document.createElement('button');
btnPr.type = 'button'; btnPr.className = 'btn btn-sm'; btnPr.textContent = 'Print / PDF';
btnPr.onclick = () => window.print();
bar.append('Pilih Invoice: ', selInv, ' Status: ', selStat, btnPr);

function rp(n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID'); }
function urut() { db.sort((a, b) => (new Date(a.selesai) - new Date(b.selesai)) || (new Date(a.mulai) - new Date(b.mulai))); }

function bukaTab(id, btn) {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(id).classList.add('active');
  if (id === 'pRekap') renderRekap();
  if (id === 'pInvoice') muatInv();
  if (id === 'pClient') renderClient();
}

function hitungSub() {
  const d = Number(document.getElementById('fDurasi').value) || 0;
  const r = Number(document.getElementById('fRate').value) || 0;
  document.getElementById('fSub').value = rp(d * r);
}

function simpanData() {
  const noInv = document.getElementById('fNoInv').value.trim();
  const client = document.getElementById('fClient').value.trim();
  const artis = document.getElementById('fArtis').value.trim();
  const lagu = document.getElementById('fLagu').value.trim();
  const durasi = Number(document.getElementById('fDurasi').value) || 1;
  const rate = Number(document.getElementById('fRate').value) || 0;
  if (!noInv || !client || !artis || !lagu) return alert('Isi No Invoice, Client, Artis, dan Judul Lagu!');

  db.push({
    id: Date.now(), noInv, tglInv: document.getElementById('fTglInv').value, client,
    email: document.getElementById('fEmail').value.trim() || '-', type: document.getElementById('fType').value,
    artis, lagu, durasi, mulai: document.getElementById('fMulai').value, selesai: document.getElementById('fSelesai').value,
    rate, sub: durasi * rate, periode: document.getElementById('fPeriode').value, playlist: document.getElementById('fPlaylist').value
  });
  urut();
  localStorage.setItem(KEY, JSON.stringify(db));
  alert('Data tersimpan!');
  document.getElementById('fArtis').value = '';
  document.getElementById('fLagu').value = '';
  document.getElementById('fRate').value = '';
  document.getElementById('fSub').value = 'Rp 0';
}

function simpanClient() {
  const nama = document.getElementById('cNama').value.trim();
  const email = document.getElementById('cEmail').value.trim() || '-';
  const type = document.getElementById('cType').value;
  if (!nama) return alert('Isi Nama Client terlebih dahulu!');

  dbC.push({ id: Date.now(), nama, email, type });
  localStorage.setItem(KEY_C, JSON.stringify(dbC));
  alert('Data Client tersimpan!');
  document.getElementById('cNama').value = '';
  document.getElementById('cEmail').value = '';
  renderClient();
}

function renderClient() {
  const tb = document.getElementById('tbClient');
  if (tb) {
    tb.innerHTML = '';
    dbC.forEach((c, i) => {
      tb.innerHTML += `<tr><td class="c">${i+1}</td><td><b>${c.nama}</b></td><td>${c.email}</td><td>${c.type}</td><td class="c"><button type="button" onclick="hapusClient(${c.id})">X</button></td></tr>`;
    });
  }
  const sel = document.getElementById('fClient');
  if (sel && sel.tagName === 'SELECT') {
    sel.innerHTML = '<option value="">-- Pilih Client --</option>';
    dbC.forEach(c => {
      const o = document.createElement('option');
      o.value = c.nama;
      o.textContent = c.nama;
      sel.appendChild(o);
    });
  }
}

function hapusClient(id) {
  if (confirm('Hapus client ini?')) {
    dbC = dbC.filter(c => c.id !== id);
    localStorage.setItem(KEY_C, JSON.stringify(dbC));
    renderClient();
  }
}

function tglPendek(str) {
  if (!str || str === '-') return '-';
  var d = new Date(str + 'T00:00:00');
  if (isNaN(d)) return str;
  var bln = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return String(d.getDate()).padStart(2, '0') + '-' + bln[d.getMonth()] + '-' + String(d.getFullYear()).slice(-2);
}

function tglAngka(str) {
  if (!str || str === '-') return '-';
  var p = str.split('-');
  return p.length === 3 ? (p[2] + '/' + p[1] + '/' + p[0].slice(-2)) : str;
}

function renderRekap() {
  var urutInv = db.slice().sort(function(a, b) {
    return (b.tglInv || '').localeCompare(a.tglInv || '') || a.noInv.localeCompare(b.noInv) || (Number(a.id) - Number(b.id));
  });

  var tb = document.getElementById('tbRekap');
  if (!tb) return;
  tb.innerHTML = '';

  var tot = 0;
  var noGrup = 0;
  var i = 0;

  while (i < urutInv.length) {
    var x = urutInv[i];
    var kunci = (x.tglInv || '') + '|' + x.noInv + '|' + x.client;
    var jumlahBaris = 1;

    while (i + jumlahBaris < urutInv.length) {
      var y = urutInv[i + jumlahBaris];
      var kunciBerikut = (y.tglInv || '') + '|' + y.noInv + '|' + y.client;
      if (kunciBerikut === kunci) {
        jumlahBaris++;
      } else {
        break;
      }
    }

    noGrup++;

    for (var j = 0; j < jumlahBaris; j++) {
      var item = urutInv[i + j];
      tot += Number(item.sub);
      var namaPlaylistRingkas = (item.playlist || '').replace(' Playlist Placement', '');
      var tr = '<tr>';

        if (j === 0) {
        tr += '<td class="c" rowspan="' + jumlahBaris + '" style="vertical-align:top;">' + noGrup + '</td>';
        tr += '<td class="c" rowspan="' + jumlahBaris + '" style="vertical-align:top;">' + tglAngka(item.tglInv) + '</td>';
        tr += '<td rowspan="' + jumlahBaris + '" style="vertical-align:top;">' + item.noInv + '</td>';
        tr += '<td rowspan="' + jumlahBaris + '" style="vertical-align:top;">' + item.client + '</td>';
      }


      tr += '<td>' + item.artis + '</td>';
      tr += '<td>' + item.lagu + '</td>';
      tr += '<td class="c">' + item.durasi + ' ' + item.periode + '</td>';
      tr += '<td class="c">' + tglPendek(item.mulai) + '</td>';
      tr += '<td class="c"><b>' + tglPendek(item.selesai) + '</b></td>';
      tr += '<td class="r">' + rp(item.rate) + '</td>';
      tr += '<td class="r">' + rp(item.sub) + '</td>';
      tr += '<td>' + namaPlaylistRingkas + '</td>';
      tr += '<td class="c"><button type="button" onclick="hapus(' + item.id + ')">X</button></td>';
      tr += '</tr>';

      tb.innerHTML += tr;
    }

    i += jumlahBaris;
  }

  document.getElementById('totRekap').innerHTML = '<strong>' + rp(tot) + '</strong>';
}

function hapus(id) { if (confirm('Hapus?')) { db = db.filter(x => x.id !== id); localStorage.setItem(KEY, JSON.stringify(db)); renderRekap(); } }
function hapusSemua() { if (confirm('Hapus semua?')) { db = []; localStorage.setItem(KEY, JSON.stringify(db)); renderRekap(); } }

function downloadCsv() {
  let csv = 'No,No Invoice,Tgl Invoice,Client,Email,Type,Artis,Judul Lagu,Durasi,Join Date,Cut Off,Rate,Subtotal,Periode,Playlist\n';
  db.forEach((x, i) => { csv += `${i+1},"${x.noInv}","${x.tglInv}","${x.client}","${x.email}","${x.type}","${x.artis}","${x.lagu}",${x.durasi},"${x.mulai}","${x.selesai}",${x.rate},${x.sub},"${x.periode}","${x.playlist}"\n`; });
  const a = document.createElement('a'); a.href = encodeURI('data:text/csv;charset=utf-8,' + csv); a.download = 'Rekap-PM-Studio.csv'; a.click();
}

function terbilang(n) {
  n = Math.floor(Math.abs(n));
  const h = ["","Satu","Dua","Tiga","Empat","Lima","Enam","Tujuh","Delapan","Sembilan","Sepuluh","Sebelas"];
  if (n < 12) return " " + h[n];
  if (n < 20) return terbilang(n - 10) + " Belas";
  if (n < 100) return terbilang(Math.floor(n / 10)) + " Puluh" + terbilang(n % 10);
  if (n < 200) return " Seratus" + terbilang(n - 100);
  if (n < 1000) return terbilang(Math.floor(n / 100)) + " Ratus" + terbilang(n % 100);
  if (n < 2000) return " Seribu" + terbilang(n - 1000);
  if (n < 1000000) return terbilang(Math.floor(n / 1000)) + " Ribu" + terbilang(n % 1000);
  if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + " Juta" + terbilang(n % 1000000);
  return "";
}

function muatInv() {
  const list = [...new Set(db.map(x => x.noInv))];
  selInv.innerHTML = '';
  list.forEach(no => { const o = document.createElement('option'); o.value = no; o.textContent = no; selInv.appendChild(o); });
  renderInv();
}

function renderInv() {
  const items = db.filter(x => x.noInv === selInv.value);
  const tb = document.getElementById('tbInv'); tb.innerHTML = '';
  if (!items.length) return;
  const f = items.at(0);
  document.getElementById('iClient').textContent = f.client;
  document.getElementById('iEmail').textContent = f.email;
  document.getElementById('iType').textContent = f.type;
  document.getElementById('iTgl').textContent = f.tglInv || '-';
  document.getElementById('iNo').textContent = f.noInv;
  document.getElementById('iStat').textContent = selStat.value;
  let tot = 0;
  items.forEach((x, i) => {
    tot += Number(x.sub);
    tb.innerHTML += `<tr><td class="c">${i+1}</td><td><b>${x.artis} &mdash; ${x.lagu}</b><br><small style="color:#64748b;">${x.playlist} &mdash; Live: ${x.mulai} s/d ${x.selesai}</small></td><td class="c">${x.durasi}</td><td class="c">${x.periode}</td><td class="r">${rp(x.rate)}</td><td class="r">${rp(x.sub)}</td></tr>`;
  });
  document.getElementById('iCount').textContent = items.length;
  document.getElementById('iTotal').textContent = Number(tot).toLocaleString('id-ID');
  document.getElementById('iTerbilang').textContent = tot ? (terbilang(tot).trim() + ' Rupiah') : 'Nol Rupiah';
}

(function() {
  var sel = document.getElementById('fClient');
  if (!sel) return;

  var inp = document.createElement('input');
  inp.type = 'text';
  inp.id = 'fClient';
  inp.placeholder = 'Pilih / ketik nama client...';
  inp.autocomplete = 'off';
  inp.style.cssText = 'width:100%; padding:7px 26px 7px 7px; border:1px solid #cbd5e1; border-radius:4px;';

  var boxWrap = document.createElement('div');
  boxWrap.style.cssText = 'position:relative; width:100%;';
  sel.parentNode.replaceChild(boxWrap, sel);
  boxWrap.appendChild(inp);

  var arrow = document.createElement('span');
  arrow.innerHTML = '&#9662;';
  arrow.style.cssText = 'position:absolute; right:8px; top:50%; transform:translateY(-50%); pointer-events:none; color:#475569; font-size:12px;';
  boxWrap.appendChild(arrow);

  var list = document.createElement('div');
  list.style.cssText = 'position:absolute; top:100%; left:0; right:0; background:#fff; border:1px solid #cbd5e1; border-radius:4px; max-height:150px; overflow-y:auto; z-index:99; display:none; box-shadow:0 4px 8px rgba(0,0,0,0.1);';
  boxWrap.appendChild(list);

  var idxAktif = -1;
  var hasilTampil = [];

  function pilihItem(c) {
    inp.value = c.nama;
    document.getElementById('fEmail').value = c.email;
    document.getElementById('fType').value = c.type;
    list.style.display = 'none';
    idxAktif = -1;
  }

  function sorotItem() {
    var items = list.children;
    for (var i = 0; i < items.length; i++) {
      if (i === idxAktif) {
        items[i].style.background = '#0077c8';
        items[i].style.color = '#fff';
        items[i].scrollIntoView({ block: 'nearest' });
      } else {
        items[i].style.background = '#fff';
        items[i].style.color = '#1e293b';
      }
    }
  }

  function showList(q) {
    hasilTampil = dbC.filter(function(c) { return c.nama.toLowerCase().indexOf((q || '').toLowerCase()) !== -1; });
    list.innerHTML = '';
    idxAktif = -1;
    if (!hasilTampil.length) { list.style.display = 'none'; return; }
    hasilTampil.forEach(function(c, i) {
      var opt = document.createElement('div');
      opt.textContent = c.nama;
      opt.style.cssText = 'padding:7px 9px; cursor:pointer; font-size:13px;';
      opt.onmouseover = function() { idxAktif = i; sorotItem(); };
      opt.onmousedown = function(e) { e.preventDefault(); pilihItem(c); };
      list.appendChild(opt);
    });
    list.style.display = 'block';
  }

  inp.onfocus = function() { showList(''); };
  inp.oninput = function() { showList(inp.value); };
  inp.onkeydown = function(e) {
    if (list.style.display !== 'block' || !hasilTampil.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      idxAktif = (idxAktif + 1) % hasilTampil.length;
      sorotItem();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      idxAktif = (idxAktif - 1 + hasilTampil.length) % hasilTampil.length;
      sorotItem();
    } else if (e.key === 'Enter' && idxAktif >= 0) {
      e.preventDefault();
      pilihItem(hasilTampil[idxAktif]);
    } else if (e.key === 'Escape') {
      list.style.display = 'none';
    }
  };
  inp.onblur = function() { setTimeout(function() { list.style.display = 'none'; }, 150); };
})();


function hitungExpired() {
  const m = document.getElementById('fMulai').value;
  const d = Number(document.getElementById('fDurasi').value) || 0;
  const p = document.getElementById('fPeriode').value;
  if (!m || d <= 0) return;
  const t = new Date(m + 'T00:00:00');
  t.setDate(t.getDate() + (p === 'Bulan' ? d * 30 : d * 7));
  document.getElementById('fSelesai').value = t.toISOString().slice(0, 10);
}

renderClient();

(function initTab1() {
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  if (document.getElementById('fTglInv')) document.getElementById('fTglInv').value = today;
  if (document.getElementById('fMulai')) document.getElementById('fMulai').value = today;
  hitungExpired();

  ['fDurasi', 'fMulai', 'fPeriode'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.addEventListener('input', hitungExpired); el.addEventListener('change', hitungExpired); }
  });

  const selC = document.getElementById('fClient');
  if (selC) {
    selC.addEventListener('change', () => {
      const c = dbC.find(x => x.nama === selC.value);
      if (c) {
        document.getElementById('fEmail').value = c.email;
        document.getElementById('fType').value = c.type;
      }
    });
  }
})();
function tglIndo(str, pendek) {
  if (!str || str === '-') return '-';
  const d = new Date(str + 'T00:00:00');
  if (isNaN(d)) return str;
  const bln = pendek
    ? ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
    : ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return `${d.getDate()} ${bln[d.getMonth()]} ${d.getFullYear()}`;
}

function rpCell(n) {
  return `<div style="display:flex; justify-content:space-between; gap:8px;"><span>Rp</span><span>${Number(n || 0).toLocaleString('id-ID')}</span></div>`;
}

function renderInv() {
  const items = db.filter(x => x.noInv === selInv.value);
  const tb = document.getElementById('tbInv'); tb.innerHTML = '';
  if (!items.length) return;
  const f = items.at(0);
  document.getElementById('iClient').textContent = f.client;
  document.getElementById('iEmail').textContent = f.email;
  document.getElementById('iType').textContent = f.type;
  document.getElementById('iTgl').textContent = tglIndo(f.tglInv, false);
  document.getElementById('iNo').textContent = f.noInv;
  document.getElementById('iStat').textContent = selStat.value;
  let tot = 0;
  items.forEach((x, i) => {
    tot += Number(x.sub);
    tb.innerHTML += `<tr><td class="c">${i+1}</td><td><b>${x.artis} &mdash; ${x.lagu}</b><br><small style="color:#64748b;">${x.playlist} &mdash; Live: ${tglIndo(x.mulai, true)} s/d ${tglIndo(x.selesai, true)}</small></td><td class="c">${x.durasi}</td><td class="c">${x.periode}</td><td>${rpCell(x.rate)}</td><td>${rpCell(x.sub)}</td></tr>`;
  });
  document.getElementById('iCount').textContent = items.length;
  document.getElementById('iTotal').innerHTML = `<span style="margin-right:18px;">Rp</span><span>${Number(tot).toLocaleString('id-ID')}</span>`;
  document.getElementById('iTerbilang').textContent = tot ? (terbilang(tot).trim() + ' Rupiah') : 'Nol Rupiah';
}
window.addEventListener('load', function() {
  var area = document.getElementById('printArea');
  if (!area) return;
  area.style.display = 'flex';
  area.style.flexDirection = 'column';
  area.style.minHeight = '270mm';

  var lama = document.getElementById('ftPmStudio');
  if (lama) lama.remove();

  var bln = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  var d = new Date();
  var tgl = String(d.getDate()).padStart(2, '0') + '-' + bln[d.getMonth()] + '-' + d.getFullYear();

  var ft = document.createElement('div');
  ft.id = 'ftPmStudio';
  ft.style.cssText = 'margin-top:auto; padding-top:14px; text-align:center; font-size:11.5px; color:#1e293b; width:100%;';
  ft.innerHTML = 'Terima kasih atas kerja samanya dengan PM Studio. Document Generated Automatically &mdash; <strong>' + tgl + '</strong>';
  area.appendChild(ft);
});

// === SELECT + SEARCH & URUT TERBARU UNTUK PILIH INVOICE ===
(function() {
  if (typeof selInv === 'undefined' || !selInv) return;

  selInv.style.display = 'none';

  var boxWrap = document.createElement('div');
  boxWrap.style.cssText = 'position:relative; display:inline-block; min-width:230px;';
  selInv.parentNode.insertBefore(boxWrap, selInv);

  var inp = document.createElement('input');
  inp.type = 'text';
  inp.placeholder = 'Pilih / ketik No Invoice...';
  inp.autocomplete = 'off';
  inp.style.cssText = 'width:100%; padding:7px 26px 7px 8px; border:1px solid #cbd5e1; border-radius:4px; font-size:13px;';
  boxWrap.appendChild(inp);

  var arrow = document.createElement('span');
  arrow.innerHTML = '&#9662;';
  arrow.style.cssText = 'position:absolute; right:8px; top:50%; transform:translateY(-50%); pointer-events:none; color:#475569; font-size:12px;';
  boxWrap.appendChild(arrow);

  var list = document.createElement('div');
  list.style.cssText = 'position:absolute; top:100%; left:0; right:0; background:#fff; border:1px solid #cbd5e1; border-radius:4px; max-height:170px; overflow-y:auto; z-index:99; display:none; box-shadow:0 4px 8px rgba(0,0,0,0.1);';
  boxWrap.appendChild(list);

  var idxAktif = -1;
  var hasilTampil = [];
  var daftarInvTerbaru = [];

  function ambilDaftarTerbaru() {
    var urutId = db.slice().sort(function(a, b) { return Number(b.id) - Number(a.id); });
    var unik = [];
    urutId.forEach(function(x) {
      if (x.noInv && unik.indexOf(x.noInv) === -1) unik.push(x.noInv);
    });
    daftarInvTerbaru = unik;
    return unik;
  }

  function pilihInv(no) {
    inp.value = no;
    selInv.value = no;
    renderInv();
    list.style.display = 'none';
    idxAktif = -1;
  }

  function sorotInv() {
    var items = list.children;
    for (var i = 0; i < items.length; i++) {
      if (i === idxAktif) {
        items[i].style.background = '#0077c8';
        items[i].style.color = '#fff';
        items[i].scrollIntoView({ block: 'nearest' });
      } else {
        items[i].style.background = '#fff';
        items[i].style.color = '#1e293b';
      }
    }
  }

  function showInvList(q) {
    ambilDaftarTerbaru();
    hasilTampil = daftarInvTerbaru.filter(function(no) {
      return no.toLowerCase().indexOf((q || '').toLowerCase()) !== -1;
    });
    list.innerHTML = '';
    idxAktif = -1;
    if (!hasilTampil.length) { list.style.display = 'none'; return; }
    hasilTampil.forEach(function(no, i) {
      var opt = document.createElement('div');
      opt.textContent = no;
      opt.style.cssText = 'padding:7px 9px; cursor:pointer; font-size:13px;';
      opt.onmouseover = function() { idxAktif = i; sorotInv(); };
      opt.onmousedown = function(e) { e.preventDefault(); pilihInv(no); };
      list.appendChild(opt);
    });
    list.style.display = 'block';
  }

  var muatInvLama = muatInv;
  muatInv = function() {
    muatInvLama();
    var terbaru = ambilDaftarTerbaru();
    if (terbaru.length) {
      selInv.innerHTML = '';
      terbaru.forEach(function(no) {
        var o = document.createElement('option');
        o.value = no;
        o.textContent = no;
        selInv.appendChild(o);
      });
      selInv.value = terbaru[0];
      inp.value = terbaru[0];
      renderInv();
    }
  };

  inp.onfocus = function() { showInvList(''); };
  inp.oninput = function() { showInvList(inp.value); };
  inp.onkeydown = function(e) {
    if (list.style.display !== 'block' || !hasilTampil.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      idxAktif = (idxAktif + 1) % hasilTampil.length;
      sorotInv();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      idxAktif = (idxAktif - 1 + hasilTampil.length) % hasilTampil.length;
      sorotInv();
    } else if (e.key === 'Enter' && idxAktif >= 0) {
      e.preventDefault();
      pilihInv(hasilTampil[idxAktif]);
    } else if (e.key === 'Escape') {
      list.style.display = 'none';
    }
  };
  inp.onblur = function() { setTimeout(function() { list.style.display = 'none'; }, 150); };
})();

