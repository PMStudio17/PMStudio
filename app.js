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

function renderRekap() {
  urut();
  const tb = document.getElementById('tbRekap'); tb.innerHTML = '';
  let tot = 0;
  db.forEach((x, i) => {
    tot += Number(x.sub);
    tb.innerHTML += `<tr><td class="c">${i+1}</td><td><b>${x.noInv}</b></td><td>${x.tglInv||'-'}</td><td>${x.client}</td><td>${x.email}</td><td>${x.type}</td><td>${x.artis}</td><td>${x.lagu}</td><td class="c">${x.durasi}</td><td>${x.mulai||'-'}</td><td><b>${x.selesai||'-'}</b></td><td class="r">${rp(x.rate)}</td><td class="r">${rp(x.sub)}</td><td>${x.periode}</td><td>${x.playlist}</td><td class="c"><button type="button" onclick="hapus(${x.id})">X</button></td></tr>`;
  });
  document.getElementById('totRekap').innerHTML = `<strong>${rp(tot)}</strong>`;
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
