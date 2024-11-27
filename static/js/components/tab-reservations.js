const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Agregar evento de clic a cada pestaña
tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
        // Remover la clase activa de todas las pestañas
        tabs.forEach(t => t.classList.remove('tab-active'));

        // Agregar la clase activa a la pestaña seleccionada
        tab.classList.add('tab-active');

        // Ocultar todos los contenidos de pestañas
        tabContents.forEach(content => content.classList.add('hidden'));

        // Mostrar el contenido correspondiente a la pestaña seleccionada
        tabContents[index].classList.remove('hidden');
    });
});

// Función para cambiar de pestaña

function changeTab(tabId) {
    // Ocultar todas las secciones
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.add('hidden'));

    // Mostrar la sección correspondiente
    const activeTabContent = document.getElementById(tabId);
    if (activeTabContent) {
        activeTabContent.classList.remove('hidden');
    }

    // Actualizar las pestañas activas
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('tab-active'));

    // Activar la pestaña seleccionada
    const activeTab = Array.from(tabs).find(tab => tab.textContent.toLowerCase().replace(/\s+/g, '-') === tabId);
    if (activeTab) {
        activeTab.classList.add('tab-active');
    }
}
