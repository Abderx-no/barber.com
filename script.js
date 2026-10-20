// ====== MODIFICA QUI ======
var WHATSAPP = "393000000000"; // numero del barbiere, con prefisso, senza + (es. 39 + numero)
var SERVIZI = [["Taglio","€15 · 30 min"],["Barba","€10 · 20 min"],["Taglio + Barba","€22 · 45 min"],["Rasatura","€12 · 25 min"]];
var ORARI = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30"];
// ==========================
var sel = {s:null,t:null};
var srv = document.getElementById("srv"), slots = document.getElementById("slots"), day = document.getElementById("day");
SERVIZI.forEach(function(x,i){var b=document.createElement("button");b.className="opt";b.innerHTML=x[0]+"<small>"+x[1]+"</small>";
 b.onclick=function(){sel.s=x[0];[].forEach.call(srv.children,function(c){c.classList.remove("on")});b.classList.add("on")};srv.appendChild(b)});
var today=new Date();day.min=today.toISOString().slice(0,10);day.value=day.min;
function draw(){slots.innerHTML="";sel.t=null;var d=new Date(day.value+"T12:00:00"),closed=d.getDay()===0,now=new Date();
 ORARI.forEach(function(o){var b=document.createElement("button");b.className="opt";b.textContent=o;
  var past=day.value===day.min&&new Date(day.value+"T"+o+":00")<now;b.disabled=closed||past;
  b.onclick=function(){sel.t=o;[].forEach.call(slots.children,function(c){c.classList.remove("on")});b.classList.add("on")};slots.appendChild(b)})}
day.onchange=draw;draw();
document.getElementById("send").onclick=function(){
 var n=document.getElementById("nm").value.trim(),t=document.getElementById("tel").value.trim(),e=document.getElementById("err");
 if(!sel.s||!day.value||!sel.t||!n||!t){e.textContent="Compila tutti i campi per continuare.";return}
 e.textContent="";var d=new Date(day.value+"T12:00:00").toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long"});
 var m="Ciao! Vorrei prenotare: "+sel.s+" – "+d+" alle "+sel.t+". Nome: "+n+", tel: "+t+".";
 window.location.href="https://wa.me/"+WHATSAPP+"?text="+encodeURIComponent(m)};