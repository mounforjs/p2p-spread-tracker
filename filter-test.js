(async function testScraperWithFilters() {
    console.clear();
    console.group("🚀 Iniciando Prueba: Limpieza de Filtros + Scraper");

    // --- FUNCIONES DE APOYO ---
    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    const parseP2PPrice = (str) => {
        if (!str) return 0;
        let clean = str.replace(',', '.');
        let parts = clean.split('.');
        if (parts.length > 1 && parts[parts.length - 1].length === 3) {
            const decimals = parts.pop();
            const integer = parts.join('');
            return parseFloat(`${integer}.${decimals}`);
        }
        return parseFloat(str.replace(/\./g, '').replace(',', '.'));
    };

    const extract = () => {
        const rows = [];
        for (let i = 2; i <= 5; i++) {
            const tr = document.querySelector(`tr[aria-rowindex="${i}"]`);
            if (tr) {
                const p = tr.querySelector('td[aria-colindex="2"]')?.innerText.match(/[0-9.,]+/)?.[0] || "0";
                rows.push({ precio: p });
            }
        }
        return rows;
    };

    // --- FASE 1: LIMPIEZA DE FILTROS ---
    console.log("🔍 Verificando filtros...");
    const filterBtn = document.querySelector('button[aria-label="more filter"]');

    if (filterBtn) {
        filterBtn.click();
        await wait(2000); // Esperar a que abra el modal

        // ... (dentro de tu script de prueba, reemplaza la sección del switch por esta)

        // 1. Buscamos todos los switches en el modal
        const switches = document.querySelectorAll('div[role="switch"]');

        switches.forEach((sw) => {
            // Verificamos si está encendido (por atributo ARIA o por clase CSS)
            const isChecked = sw.getAttribute('aria-checked') === 'true' ||
                sw.classList.contains('checked') ||
                sw.classList.contains('bn-switch__checked');

            if (isChecked) {
                console.log("🎯 Switch activo encontrado. Intentando múltiples métodos de apagado...");

                // Método 1: Click en el contenedor
                sw.click();

                // Método 2: Click en el punto interno (a veces el único que reacciona)
                const dot = sw.querySelector('.bn-switch-dot');
                if (dot) dot.click();

                // Método 3: Eventos de Mouse manuales
                const mouseDown = new MouseEvent('mousedown', { bubbles: true });
                const mouseUp = new MouseEvent('mouseup', { bubbles: true });
                sw.dispatchEvent(mouseDown);
                sw.dispatchEvent(mouseUp);
            }
        });

        const applyBtn = Array.from(document.querySelectorAll('button'))
            .find(btn => btn.innerText.includes('Apply'));
        if (applyBtn) {
            applyBtn.click();
            console.log("✅ Filtros aplicados.");
            await wait(2000); // Esperar a que la tabla refresque
        }
    } else {
        console.warn("⚠️ No se encontró el botón de filtros.");
    }

    // --- FASE 2: EXTRACCIÓN DE DATOS ---
    const tabs = document.querySelectorAll('.bn-tab-list__segment-outline .bn-tab');
    if (tabs.length < 2) {
        console.error("❌ No se encontraron las pestañas Buy/Sell");
        console.groupEnd();
        return;
    }

    // Pestaña BUY
    console.log("🔄 Cambiando a pestaña BUY...");
    tabs[0].click();
    await wait(4500);
    const buyData = extract();

    // Pestaña SELL
    console.log("🔄 Cambiando a pestaña SELL...");
    tabs[1].click();
    await wait(4500);
    const sellData = extract();

    // --- FASE 3: RESULTADOS ---
    if (buyData.length > 0 && sellData.length > 0) {
        const vNum = parseP2PPrice(buyData[0].precio);
        const cNum = parseP2PPrice(sellData[0].precio);

        if (cNum > 0) {
            const spread = ((vNum - cNum) / cNum) * 100;
            const stats = {
                "Precio Venta (Buy Tab)": vNum.toFixed(3),
                "Precio Compra (Sell Tab)": cNum.toFixed(3),
                "Spread %": spread.toFixed(3) + "%",
                "Hora": new Date().toLocaleTimeString()
            };
            console.table(stats);
        }
    } else {
        console.error("❌ Falló la extracción de datos de la tabla.");
    }

    console.groupEnd();
})();