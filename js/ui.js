// Funciones de utilidad para la interfaz
function showTab(id) {
    document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    // Forzar redimensionado de Plotly al cambiar de pestaña
    window.dispatchEvent(new Event('resize'));
}

function toggleCeco(id) {
    const content = document.getElementById(id);
    if(content) content.classList.toggle('open');
}

// Renderizado principal
function procesarInformacion(data) {
    const bodyMem = document.getElementById('body-memoria');
    const acordeon = document.getElementById('contenedor-acordeon');
    const gridCecoKpis = document.getElementById('grid-ceco-kpis');
    
    let htmlMem = "", htmlAco = "", htmlGrid = "";
    if(data.length === 0) {
        bodyMem.innerHTML = ""; acordeon.innerHTML = ""; gridCecoKpis.innerHTML = "";
        document.getElementById('dir-oee').innerText = "0%"; return;
    }

    let gN = 0, gP = 0, tS = {"MAÑANA":{n:0,p:0}, "TARDE":{n:0,p:0}, "NOCHE":{n:0,p:0}}, cD = {};

    data.forEach(d => {
        gN += d.nom; gP += d.sap;
        if(tS[d.turno]) { tS[d.turno].n += d.nom; tS[d.turno].p += d.sap; }
        if(!cD[d.ceco]) cD[d.ceco] = { n: 0, p: 0, rows: [] };
        cD[d.ceco].n += d.nom; cD[d.ceco].p += d.sap;
        cD[d.ceco].rows.push(d);
        htmlMem += `<tr><td>${d.fStr}</td><td>${d.ot}</td><td>${d.turno}</td><td>${d.ceco}</td><td>${d.nom}</td><td>${d.sap}</td><td style="font-weight:bold">${calcOEE(d.nom, d.sap).toFixed(1)}%</td><td>${calcGE(d.nom, d.sap).toFixed(1)}%</td></tr>`;
    });

    bodyMem.innerHTML = htmlMem;
    document.getElementById('dir-oee').innerText = calcOEE(gN, gP).toFixed(1) + "%";
    document.getElementById('oee-m').innerText = calcOEE(tS["MAÑANA"].n, tS["MAÑANA"].p).toFixed(1) + "%";
    document.getElementById('oee-t').innerText = calcOEE(tS["TARDE"].n, tS["TARDE"].p).toFixed(1) + "%";
    document.getElementById('oee-n').innerText = calcOEE(tS["NOCHE"].n, tS["NOCHE"].p).toFixed(1) + "%";

    const labels = Object.keys(cD).sort();
    labels.forEach((ceco, i) => {
        const o = calcOEE(cD[ceco].n, cD[ceco].p).toFixed(1);
        const g = calcGE(cD[ceco].n, cD[ceco].p).toFixed(1);
        htmlGrid += `<div class="card ceco-card"><h3>${ceco}</h3><div class="value">${o}%</div></div>`;
        let rH = cD[ceco].rows.map(r => `<tr><td>${r.fStr}</td><td>${r.ot}</td><td>${r.turno}</td><td>${r.n_art} - ${r.articulo}</td><td>${r.nom}</td><td>${r.sap}</td><td style="font-weight:bold; color:var(--primary)">${calcOEE(r.nom, r.sap).toFixed(1)}%</td><td style="font-weight:bold; color:var(--t)">${calcGE(r.nom, r.sap).toFixed(1)}%</td></tr>`).join('');
        htmlAco += `<div class="ceco-group" id="scroll-${ceco.replace(/\s+/g, '')}">
            <div class="ceco-header" onclick="toggleCeco('ceco-${i}')"><span>${ceco}</span><span>OEE: ${o}% | GE: ${g}% ▾</span></div>
            <div id="ceco-${i}" class="ceco-content"><table><thead><tr><th>Fecha</th><th>OT</th><th>Turno</th><th>Art</th><th>Nominal</th><th>Prod</th><th>OEE</th><th>GE</th></tr></thead><tbody>${rH}</tbody></table></div>
        </div>`;
    });
    gridCecoKpis.innerHTML = htmlGrid; acordeon.innerHTML = htmlAco;
    renderGrafico('grafico-ceco-oee', 'OEE POR CECO', labels, labels.map(l=>calcOEE(cD[l].n, cD[l].p).toFixed(1)), '#1a2a6c');
    renderGrafico('grafico-ceco-ge', 'GE POR CECO', labels, labels.map(l=>calcGE(cD[l].n, cD[l].p).toFixed(1)), '#e67e22');
}

function renderGrafico(id, tit, x, y, col) {
    Plotly.newPlot(id, [{ x: x, y: y, type: 'bar', marker: {color: col}, text: y.map(v=>v+'%'), textposition: 'auto' }], { title: tit });
    document.getElementById(id).on('plotly_click', d => {
        const target = document.getElementById('scroll-' + d.points[0].x.replace(/\s+/g, ''));
        if(target) {
            target.scrollIntoView({ behavior: 'smooth' });
            target.querySelector('.ceco-content').classList.add('open');
            target.classList.add('highlight-select');
            setTimeout(() => target.classList.remove('highlight-select'), 1500);
        }
    });
}