let storico = [];
let fondo = 0;

function aggiungiSpesa() {
  const data = document.getElementById("data").value;
  const entrate = parseFloat(document.getElementById("entrate").value) || 0;
  const uscite = parseFloat(document.getElementById("uscite").value) || 0;
  const note = document.getElementById("note").value;

  fondo += entrate - uscite;
  aggiornaFondo();

  const riga = { data, entrate, uscite, note };
  storico.push(riga);

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${data}</td>
    <td style="color:green;">€${entrate.toFixed(2)}</td>
    <td style="color:red;">€${uscite.toFixed(2)}</td>
    <td>${note}</td>
  `;
  document.getElementById("storico-body").appendChild(row);

  document.getElementById("data").value = "";
  document.getElementById("entrate").value = "";
  document.getElementById("uscite").value = "";
  document.getElementById("note").value = "";
}

function aggiornaFondo() {
  const fondoSpan = document.getElementById("fondoCassaPDF");
  fondoSpan.textContent = fondo.toFixed(2);
  fondoSpan.style.color = fondo < 0 ? "red" : "green";
}

function esportaPDF() {
  document.getElementById("fondoCassaPDF").textContent = fondo.toFixed(2);
  const element = document.getElementById("sezione-tabella");

  const opt = {
    margin: 0.5,
    filename: 'spese_tabella.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}

function esportaExcel() {
  esportaIntervalloDate(new Date("1900-01-01"), new Date(), "spese_completo.xlsx");
}

function esportaSettimana() {
  const valore = document.getElementById("settimanaSelezionata").value;
  if (!valore) return alert("Seleziona una settimana");

  const [anno, week] = valore.split("-W");
  const primoGiorno = new Date(anno);
  primoGiorno.setDate((week - 1) * 7 + 1);
  const ultimoGiorno = new Date(primoGiorno);
  ultimoGiorno.setDate(primoGiorno.getDate() + 6);

  esportaIntervalloDate(primoGiorno, ultimoGiorno, `spese_settimana_${week}.xlsx`);
}

function esportaMese() {
  const valore = document.getElementById("meseSelezionato").value;
  if (!valore) return alert("Seleziona un mese");

  const [anno, mese] = valore.split("-");
  const primoGiorno = new Date(`${anno}-${mese}-01`);
  const ultimoGiorno = new Date(primoGiorno.getFullYear(), primoGiorno.getMonth() + 1, 0);

  esportaIntervalloDate(primoGiorno, ultimoGiorno, `spese_mese_${mese}.xlsx`);
}

function esportaIntervalloDate(startDate, endDate, nomeFile) {
  const filtro = storico.filter(e => {
    const d = new Date(e.data);
    return d >= startDate && d <= endDate;
  });

  const wsData = [["Data", "Entrate (€)", "Uscite (€)", "Note"]];
  let totEntrate = 0, totUscite = 0;

  filtro.forEach(e => {
    wsData.push([e.data, e.entrate, e.uscite, e.note]);
    totEntrate += e.entrate;
    totUscite += e.uscite;
  });

  wsData.push([]);
  wsData.push(["Totale", totEntrate, totUscite, ""]);
  wsData.push(["Fondo Cassa", totEntrate - totUscite, "", ""]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, "Spese");
  XLSX.writeFile(wb, nomeFile);
}

function resetStorico() {
  if (confirm("Sei sicuro di voler cancellare tutti i dati?")) {
    storico = [];
    fondo = 0;
    document.getElementById("storico-body").innerHTML = "";
    aggiornaFondo();
  }
}