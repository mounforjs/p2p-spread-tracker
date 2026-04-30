document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('autoRunToggle');
  const display = document.getElementById('data-display');

  // 1. Cargar el estado actual del toggle y los datos guardados
  chrome.storage.local.get(['autoRun', 'p2p_stats'], (res) => {
    toggle.checked = !!res.autoRun;
    if (res.p2p_stats) {
      updateUI(JSON.parse(res.p2p_stats));
    }
  });

  // 2. Escuchar cambios en el toggle
  toggle.addEventListener('change', () => {
    const isEnabled = toggle.checked;
    chrome.storage.local.set({ autoRun: isEnabled }, () => {
      console.log("Estado de autoRun cambiado a:", isEnabled);
    });
  });

  // 3. Escuchar actualizaciones en tiempo real (cuando el scraper termine)
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.p2p_stats) {
      updateUI(JSON.parse(changes.p2p_stats.newValue));
    }
  });

  // Al abrir el popup, cargar el valor guardado
  chrome.storage.local.get(['filterAmount'], (res) => {
    if (res.filterAmount) {
      document.getElementById('filterAmount').value = res.filterAmount;
    }
  });

  // Al cambiar el valor, guardarlo
  document.getElementById('filterAmount').addEventListener('input', (e) => {
    chrome.storage.local.set({ filterAmount: e.target.value });
  });

  function updateUI(stats) {
    display.innerHTML = `
            <p><span class="bold">Compra:</span> ${stats.sell_price}</p>
            <p><span class="bold">Venta:</span> ${stats.buy_price}</p>
            <p><span class="bold">Spread:</span> ${stats.spread_percent}%</p>
            <p style="color: #666; font-size: 9px;">Actualizado: ${stats.last_update}</p>
        `;
  }
});