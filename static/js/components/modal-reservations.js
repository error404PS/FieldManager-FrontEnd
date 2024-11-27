// Define las funciones y expórtalas
export function openModal() {
    const modal = document.getElementById("playerModal");
    if (modal) {
        modal.classList.remove("hidden");
    }
}

export function closeModal() {
    const modal = document.getElementById("playerModal");
    if (modal) {
        modal.classList.add("hidden");
    }
}

// Configuración de eventos en el DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    // Asignar evento al botón de cierre
    const closeModalButton = document.getElementById("closeModalBtn");
    if (closeModalButton) {
        closeModalButton.onclick = closeModal;
    }

    // Asignar evento al botón para abrir el modal
    const openModalButton = document.getElementById("view-players-btn");
    if (openModalButton) {
        openModalButton.onclick = openModal;
    }
});
