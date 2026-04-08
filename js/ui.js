/**
 * UI.JS - Gestión de la Interfaz y Renderizado
 * Mantiene la estética original de las capturas enviadas.
 */

// Manejo de pestañas
function showTab(id) {
    document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    // Botones de pestañas
    const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => 
        btn.getAttribute('onclick').includes(id)
    );
    if (activeBtn) activeBtn.classList.add('active');

    // Redimensionar gráficos para que se ajusten al contenedor
    window.dispatchEvent(new Event('resize'));
}

// Función para abrir/cerrar acordeones de CECO
function toggleCeco(id) {
    const content = document.getElementById(id);
    if (content) content.classList.toggle('open');
}

/**
 * Renderizado Principal de Datos
 */
function procesarInformacion(data) {
    const bodyMemoria = document.getElementById('body-memoria');
    const contenedorAcordeon = document.getElementById('contenedor-acordeon');
    const gridCecoKpis = document.getElementById('grid-ceco-kpis');
    const outTablaAcumulada = document.getElementById('out-tabla');

    // Limpiar contenedores
    bodyMemoria.innerHTML = "";
    contenedorAcordeon.innerHTML = "";
    gridCecoKpis.innerHTML = "";
    if (outTablaAcumulada) outTablaAcumulada.innerHTML = "";

    if (data.length === 0) {
        document.getElementById('dir-oee').innerText = "0%";
        return;
    }

    // Acumuladores para KPIs
    let globalNom = 0, globalProd = 0;
    let turnos = { "MAÑANA": { n: 0, p: 0 }, "TARDE": { n: 0, p: 0 }, "NOCHE": { n: 0, p: 0 } };
    let cecos = {};

    // Procesamiento y Generación de Tabla de Memoria (Imagen 2)
    let htmlMemoria = "";
    let htmlTablaAcumulada = `<table><thead><tr><th>Fecha</th><th>Turno</th><th>SAP</th><th>OT</th><th>N° Art</th><th>Articulo</th><th>NOM</th><th>CECO</th></tr></thead><tbody>`;

    data.forEach(d => {
        globalNom += d.nom;
        globalProd += d.sap;

        // Turnos
        if (turnos[d.turno]) {
            turnos[d.turno].n += d.nom;
            turnos[d.turno].p += d.sap;
        }

        // CECOS
        if (!cecos[d.ceco]) cecos[d.ceco] = { n: 0, p: 0, filas: [] };
        cecos[d.ceco].n += d.nom;
        cecos[d.ceco].p += d.sap;
        cecos[d.ceco].filas.push(d);

        // Fila Memoria de Cálculo (Imagen 2)
        htmlMemoria += `
            <tr>
                <td>${d.fStr}</td>
                <td>${d.ot}</td>
                <td>${d.turno}</td>
                <td>${d.ceco}</td>
                <td>${d.nom}</td>
                <td>${d.sap}</td>
                <td class="cell-oee">${calcOEE(d.nom, d.sap).toFixed(1)}%</td>
                <td class="cell-ge">${calcGE(d.nom, d.sap).toFixed(1)}%</td>
            </tr>`;

        // Fila Tabla Acumulada (Imagen 3)
        htmlTablaAcumulada += `
            <tr>
                <td>${d.fStr}</td>
                <td>${d.turno}</td>
                <td>${d.sap}</td>
                <td>${d.ot}</td>
                <td>${d.n_art}</td>
                <td>${d.articulo}</td>
                <td>${d.nom}</td>
                <td>${d.ceco}</td>
            </tr>`;
    });

    htmlTablaAcumulada += `</tbody></table>`;
    bodyMemoria.innerHTML = htmlMemoria;
    if (outTablaAcumulada) outTablaAcumulada.innerHTML = htmlTablaAcumulada;

    // Actualizar KPIs Globales y de Turno (Imagen 1)
    document.getElementById('dir-oee').innerText = calcOEE(globalNom, globalProd).toFixed(1) + "%";
    document.getElementById('oee-m').innerText = calcOEE(turnos["MAÑANA"].n, turnos["MAÑANA"].p).toFixed(1) + "%";
    document.getElementById('oee-t').innerText = calcOEE(turnos["TARDE"].n, turnos["TARDE"].p).toFixed(1) + "%";
    document.getElementById('oee-n').innerText = calcOEE(turnos["NOCHE"].n, turnos["NOCHE"].p).toFixed(1) + "%";

    // Generar KPIs por CECO y Acordeones (Imagen 1)
    let cecoLabels = Object.keys(cecos).sort();
    let htmlCecosKpi = "";
    let htmlAcordeon = "";

    cecoLabels.forEach((ceco, index) => {
        const oeeCeco = calcOEE(cecos[ceco].n, cecos[ceco].p).toFixed(1);
        const geCeco = calcGE(cecos[ceco].n, cecos[ceco].p).toFixed(1);

        // Tarjeta pequeña de CECO
        htmlCecosKpi += `
            <div class="card">
                <h3>${ceco}</h3>
                <div class="value">${oeeCeco}%</div>
            </div>`;

        // Filas del acordeón
        let filasHtml = cecos[ceco].filas.map(r => `
            <tr>
                <td>${r.fStr}</td>
                <td>${r.ot}</td>
                <td>${r.turno}</td>
                <td>${r.n_art} - ${r.articulo}</td>
                <td>${r.nom}</td>
                <td>${r.sap}</td>
                <td style="font-weight:bold; color:var(--primary)">${calcOEE(r.nom, r.sap).toFixed(1)}%</td>
                <td style="font-weight:bold; color:var(--t)">${calcGE(r.nom, r.sap).toFixed(1)}%</td>
            </tr>`).join('');

        // Estructura Acordeón Detalle por Línea
        htmlAcordeon += `
            <div class="ceco-group" id="scroll-${ceco.replace(/\s+/g, '')}">
                <div class="ceco-header" onclick="toggleCeco('ceco-${index}')">
                    <span>${ceco}</span>
                    <span style="font-size: 0.85rem;">OEE: ${oeeCeco}% | GE: ${geCeco}% ▾</span>
                </div>
                <div id="ceco-${index}" class="ceco-content">
                    <table>
                        <thead>
                            <tr><th>Fecha</th><th>OT</th><th>Turno</th><th>Articulo</th><th>Nominal</th><th>Prod</th><th>OEE</th><th>GE</th></tr>
                        </thead>
                        <tbody>${filasHtml}</tbody>
                    </table>
                </div>
            </div>`;
    });

    gridCecoKpis.innerHTML = htmlCecosKpi;
    contenedorAcordeon.innerHTML = htmlAcordeon;

    // Renderizar Gráfico
    renderGraficoOEE(cecoLabels, cecos);
}

/**
 * Gráfico de barras interactivo
 */
function renderGraficoOEE(labels, dataCeco) {
    const oeeValues = labels.map(l => calcOEE(dataCeco[l].n, dataCeco[l].p).toFixed(1));
    
    const trace = {
        x: labels,
        y: oeeValues,
        type: 'bar',
        marker: { color: '#1a2a6c' },
        text: oeeValues.map(v => v + '%'),
        textposition: 'auto',
        hoverinfo: 'none'
    };

    const layout = {
        title: 'OEE % POR CENTRO DE COSTO',
        font: { family: 'Segoe UI' },
        margin: { t: 50, b: 80, l: 50, r: 20 },
        xaxis: { tickangle: -45 }
    };

    Plotly.newPlot('grafico-ceco-oee', [trace], layout, { responsive: true, displayModeBar: false });

    // Interactividad: scroll al CECO al hacer click
    document.getElementById('grafico-ceco-oee').on('plotly_click', function(data) {
        const cecoName = data.points[0].x;
        const targetId = 'scroll-' + cecoName.replace(/\s+/g, '');
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            element.querySelector('.ceco-content').classList.add('open');
            element.classList.add('highlight-select');
            setTimeout(() => element.classList.remove('highlight-select'), 2000);
        }
    });
}