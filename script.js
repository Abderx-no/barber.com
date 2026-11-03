// ====== MODIFICA QUI ======
var WHATSAPP = "393000000000"; // numero del barbiere, con prefisso, senza + (es. 39 + numero)
var API_URL = "https://barber-booking.abderrahmanem627.workers.dev/";
// id = nome in italiano che arriva al barbiere; price/min sono mostrati al cliente.
// I nomi nelle altre lingue sono in T.xx.services qui sotto.
var SERVIZI = [
  {id: "Taglio",         price: "€7", min: 30},
  {id: "Barba",          price: "€5", min: 20},
  {id: "Taglio + Barba", price: "€10", min: 45},
  {id: "Rasatura",       price: "€12", min: 25}
];
var ORARI = ["14:00","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00"];

var T = {
  it: {
    dir: "ltr",
    title: "Barbiere – Prenota il tuo appuntamento",
    sub: "Prenota il tuo appuntamento in pochi secondi",
    s1: "Servizio", s2: "Giorno", s3: "Orario", s4: "I tuoi dati",
    lbName: "Nome e cognome", lbTel: "Telefono",
    book: "Prenota",
    addr: "Via Colonna Rotta, Palermo · Lun–Sab 9:00–19:00 · Domenica chiuso",
    conf: "Riceverai conferma via WhatsApp.",
    min: "min",
    services: {"Taglio": "Taglio", "Barba": "Barba", "Taglio + Barba": "Taglio + Barba", "Rasatura": "Rasatura"},
    closed: "La domenica siamo chiusi. Scegli un altro giorno.",
    fill: "Compila tutti i campi per continuare.",
    phone: "Inserisci un numero di telefono valido.",
    sending: "Invio prenotazione in corso...",
    ok: "✓ Prenotazione inviata con successo!",
    fail: "✕ Errore durante la prenotazione. Riprova."
  },
  en: {
    dir: "ltr",
    title: "Barber – Book your appointment",
    sub: "Book your appointment in a few seconds",
    s1: "Service", s2: "Day", s3: "Time", s4: "Your details",
    lbName: "Full name", lbTel: "Phone",
    book: "Book now",
    addr: "Via Colonna Rotta, Palermo · Mon–Sat 9:00–19:00 · Sunday closed",
    conf: "You will receive a confirmation on WhatsApp.",
    min: "min",
    services: {"Taglio": "Haircut", "Barba": "Beard trim", "Taglio + Barba": "Haircut + beard", "Rasatura": "Shave"},
    closed: "We are closed on Sundays. Please choose another day.",
    fill: "Please fill in all fields to continue.",
    phone: "Please enter a valid phone number.",
    sending: "Sending your booking...",
    ok: "✓ Booking sent successfully!",
    fail: "✕ Booking failed. Please try again."
  },
  ar: {
    dir: "rtl",
    title: "الحلاق – احجز موعدك",
    sub: "احجز موعدك في ثوانٍ",
    s1: "الخدمة", s2: "اليوم", s3: "الوقت", s4: "بياناتك",
    lbName: "الاسم الكامل", lbTel: "رقم الهاتف",
    book: "احجز الآن",
    addr: "Via Colonna Rotta، باليرمو · الإثنين–السبت 9:00–19:00 · الأحد مغلق",
    conf: "ستصلك رسالة تأكيد عبر واتساب.",
    min: "دقيقة",
    services: {"Taglio": "قصّ الشعر", "Barba": "تشذيب اللحية", "Taglio + Barba": "قصّ الشعر + اللحية", "Rasatura": "الحلاقة"},
    closed: "نحن مغلقون يوم الأحد. يرجى اختيار يوم آخر.",
    fill: "يرجى ملء جميع الحقول للمتابعة.",
    phone: "يرجى إدخال رقم هاتف صحيح.",
    sending: "جارٍ إرسال الحجز...",
    ok: "✓ تم إرسال الحجز بنجاح!",
    fail: "✕ تعذّر إتمام الحجز. حاول مرة أخرى."
  }
};
// ==========================

var sel = {s: null, t: null};
var lang = "it";
var msg = null; // ultimo messaggio mostrato {key, type}, così cambia lingua insieme al resto

var srv = document.getElementById("srv"),
    slots = document.getElementById("slots"),
    day = document.getElementById("day"),
    err = document.getElementById("err"),
    closedNote = document.getElementById("closedNote"),
    btn = document.getElementById("send"),
    nm = document.getElementById("nm"),
    tel = document.getElementById("tel");

/* ---------- date helpers (ora locale, non UTC) ---------- */
function pad(n) { return (n < 10 ? "0" : "") + n; }
function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function isClosed(dateStr) { return new Date(dateStr + "T12:00:00").getDay() === 0; }

/* ---------- messages ---------- */
function showMsg(key, type) {
  msg = {key: key, type: type};
  err.className = type;
  err.textContent = T[lang][key];
}
function clearMsg() {
  msg = null;
  err.className = "";
  err.textContent = "";
}

/* ---------- services ---------- */
function renderServices() {
  var t = T[lang];
  srv.innerHTML = "";
  SERVIZI.forEach(function (x) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "opt" + (sel.s === x.id ? " on" : "");
    b.setAttribute("aria-pressed", sel.s === x.id ? "true" : "false");
    b.appendChild(document.createTextNode(t.services[x.id]));
    var small = document.createElement("small");
    var price = document.createElement("span");
    price.dir = "ltr";
    price.textContent = x.price;
    small.appendChild(price);
    small.appendChild(document.createTextNode(" · " + x.min + " " + t.min));
    b.appendChild(small);
    b.onclick = function () {
      sel.s = x.id;
      [].forEach.call(srv.children, function (c) {
        c.classList.remove("on");
        c.setAttribute("aria-pressed", "false");
      });
      b.classList.add("on");
      b.setAttribute("aria-pressed", "true");
    };
    srv.appendChild(b);
  });
}

/* ---------- time slots ---------- */
function draw() {
  slots.innerHTML = "";
  sel.t = null;
  var closed = isClosed(day.value), now = new Date();
  closedNote.hidden = !closed;
  ORARI.forEach(function (o) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "opt";
    b.textContent = o;
    var past = day.value === day.min && new Date(day.value + "T" + o + ":00") < now;
    b.disabled = closed || past;
    b.onclick = function () {
      sel.t = o;
      [].forEach.call(slots.children, function (c) {
        c.classList.remove("on");
        c.setAttribute("aria-pressed", "false");
      });
      b.classList.add("on");
      b.setAttribute("aria-pressed", "true");
    };
    slots.appendChild(b);
  });
}

/* ---------- language ---------- */
function setLang(l) {
  if (!T[l]) l = "it";
  lang = l;
  var t = T[l], h = document.documentElement;
  h.lang = l;
  h.dir = t.dir;
  document.title = t.title;

  [].forEach.call(document.querySelectorAll("[data-i18n]"), function (el) {
    var k = el.getAttribute("data-i18n");
    if (t[k] !== undefined) el.textContent = t[k];
  });
  [].forEach.call(document.querySelectorAll(".lang button"), function (b) {
    b.setAttribute("aria-pressed", b.getAttribute("data-lang") === l ? "true" : "false");
  });

  closedNote.textContent = t.closed;
  renderServices();
  if (msg) showMsg(msg.key, msg.type);
  try { localStorage.setItem("lang", l); } catch (e) {}
}

[].forEach.call(document.querySelectorAll(".lang button"), function (b) {
  b.onclick = function () { setLang(b.getAttribute("data-lang")); };
});

/* ---------- init ---------- */
var today = new Date();
day.min = iso(today);

// se oggi non ci sono più orari liberi parte da domani; salta la domenica
var start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
if (new Date(iso(start) + "T" + ORARI[ORARI.length - 1] + ":00") < today) start.setDate(start.getDate() + 1);
while (start.getDay() === 0) start.setDate(start.getDate() + 1);
day.value = iso(start);

day.onchange = draw;
draw();

var initial = null;
try { initial = localStorage.getItem("lang"); } catch (e) {}
if (!initial || !T[initial]) {
  var nav = (navigator.language || "it").slice(0, 2).toLowerCase();
  initial = T[nav] ? nav : "it";
}
setLang(initial);

/* ---------- submit ---------- */
btn.onclick = async function () {
  var n = nm.value.trim();
  var p = tel.value.trim();

  if (!sel.s || !day.value || !sel.t || !n || !p) {
    showMsg("fill", "error");
    return;
  }
  if (p.replace(/\D/g, "").length < 7) {
    showMsg("phone", "error");
    return;
  }

  showMsg("sending", "sending");
  btn.disabled = true;

  try {
    var response = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        service: sel.s,
        date: day.value,
        time: sel.t,
        name: n,
        phone: p,
        lang: lang
      })
    });

    var result = await response.json();
    if (!response.ok || !result.success) throw new Error("Booking failed");

    showMsg("ok", "success");
    // svuota il modulo così non si invia due volte la stessa prenotazione
    nm.value = "";
    tel.value = "";
    sel.s = null;
    renderServices();
    draw();
  } catch (error) {
    showMsg("fail", "error");
  } finally {
    btn.disabled = false;
  }
};
