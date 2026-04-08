let rawDataStore = [];

const calcOEE = (nom, prod) => nom > 0 ? ((prod * 8) / (nom * 6.5)) * 100 : 0;
const calcGE = (nom, prod) => nom > 0 ? (prod / (nom / 8) / 8) * 100 : 0;

// Actualización selectores en cascada
function actualizarAnios() {
    const sel = document.getElementById('sel-anio');
    const anios = [...new Set(rawDataStore.map(d => d.anio))].sort();
    sel.innerHTML = '<option value="ALL">AÑO (TODOS)</option>' + anios.map(a => `<option value="${a}">${a}</option>`).join('');
    actualizarMeses();
}

function actualizarMeses() {
    const aSel = document.getElementById('sel-anio').value;
    const sel = document.getElementById('sel-mes');
    const filtrada = aSel === "ALL" ? rawDataStore : rawDataStore.filter(d => d.anio === aSel);
    const meses = [...new Set(filtrada.map(d => d.mes))].sort((a,b)=>a-b);
    sel.innerHTML = '<option value="ALL">MES (TODOS)</option>' + meses.map(m => `<option value="${m}">${m}</option>`).join('');
    actualizarDias();
}

function actualizarDias() {
    const aSel = document.getElementById('sel-anio').value;
    const mSel = document.getElementById('sel-mes').value;
    const sel = document.getElementById('sel-dia');
    let f = rawDataStore;
    if(aSel !== "ALL") f = f.filter(d => d.anio === aSel);
    if(mSel !== "ALL") f = f.filter(d => d.mes === mSel);
    const dias = [...new Set(f.map(d => d.fStr))].sort((a,b)=> new Date(a)-new Date(b));
    sel.innerHTML = '<option value="ALL">DÍA (TODOS)</option>' + dias.map(d => `<option value="${d}">${d}</option>`).join('');
    aplicarFiltro();
}

function aplicarFiltro() {
    const a = document.getElementById('sel-anio').value;
    const m = document.getElementById('sel-mes').value;
    const d = document.getElementById('sel-dia').value;
    let data = rawDataStore;
    if(a !== "ALL") data = data.filter(i => i.anio === a);
    if(m !== "ALL") data = data.filter(i => i.mes === m);
    if(d !== "ALL") data = data.filter(i => i.fStr === d);
    procesarInformacion(data);
}