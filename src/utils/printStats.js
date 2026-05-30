export function printStats({ filtered, statusData, typeData }) {
    const date = new Date().toLocaleDateString('es-CO', {
        day: '2-digit', month: 'long', year: 'numeric'
    })

    const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Estadísticas de Incidentes — Udla</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; padding: 32px; color: #1f2937; }
          h1 { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
          p.subtitle { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
          .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
          .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
          .card .label { font-size: 11px; color: #9ca3af; margin-bottom: 4px; }
          .card .value { font-size: 28px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
          th { text-align: left; font-size: 12px; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding: 8px 12px; }
          td { font-size: 13px; padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
          .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
          .Reportado  { background: #fef3c7; color: #92400e; }
          .En-proceso { background: #dbeafe; color: #1e40af; }
          .Resuelto   { background: #d1fae5; color: #065f46; }
          h2 { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
          .footer { margin-top: 40px; font-size: 11px; color: #9ca3af; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Estadísticas de Incidentes</h1>
        <p class="subtitle">Universidad de la Amazonia · Generado el ${date}</p>

        <div class="cards">
          <div class="card">
            <div class="label">Total</div>
            <div class="value">${filtered.length}</div>
          </div>
          ${statusData.map(s => `
            <div class="card">
              <div class="label">${s.name}</div>
              <div class="value">${s.cantidad}</div>
            </div>
          `).join('')}
        </div>

        <h2>Incidentes por estado</h2>
        <table>
          <thead>
            <tr>
              <th>Estado</th>
              <th>Cantidad</th>
              <th>Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            ${statusData.map(s => `
              <tr>
                <td><span class="badge ${s.name.replace(' ', '-')}">${s.name}</span></td>
                <td>${s.cantidad}</td>
                <td>${filtered.length > 0
            ? ((s.cantidad / filtered.length) * 100).toFixed(1)
            : 0}%
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Incidentes por tipo</h2>
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            ${typeData.map(t => `
              <tr>
                <td>${t.name}</td>
                <td>${t.value}</td>
                <td>${filtered.length > 0
                    ? ((t.value / filtered.length) * 100).toFixed(1)
                    : 0}%
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Sistema de Reporte de Incidentes — Universidad de la Amazonia
        </div>
      </body>
    </html>
    `;
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    printFrame.srcdoc = html;
    document.body.appendChild(printFrame);

    printFrame.onload = () => {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
    };

    window.onafterprint = () => {
        document.body.removeChild(printFrame);
    };

};