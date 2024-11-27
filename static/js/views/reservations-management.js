import { openModal, closeModal } from '/static/js/components/modal-reservations.js';
import { showSpinner, hideSpinner } from '../components/spinners.js';
import { setupLogoutEvent } from '../components/auth.js';
import GetData from '../services/getData.js';
import { renewAccessToken } from "../services/renewAccessToken.js";
import { logout } from "../components/auth.js";
import { AUTH_URLS, RESERVATION_URLS } from "../components/utilities.js"

// ==============================
// 1. Autenticación y Token
// ==============================

//const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxIiwiSXNBZG1pbiI6IlRydWUiLCJJc0FjdGl2ZSI6IlRydWUiLCJuYmYiOjE3MzIyMDI2NDksImV4cCI6MTczMjIwMjk0OSwiaWF0IjoxNzMyMjAyNjQ5fQ.BLE9f90BqzddEA2vvEFi_soJ8jeDl550v1QMzralzyc";


//const token =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxIiwiSXNBZG1pbiI6IlRydWUiLCJJc0FjdGl2ZSI6IlRydWUiLCJuYmYiOjE3MzIyODY5NzAsImV4cCI6MTczMjI4NzI3MCwiaWF0IjoxNzMyMjg2OTcwfQ.puK01Skvxdv7mdPFu5hASF0pUggoiTD2sZsBi4Ph5io";



// Función para decodificar el JWT y obtener el payload
function parseJwt(token) {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
    }
}

const payload = parseJwt(localStorage.getItem('token'));
const userId = payload ? payload.nameid : null;
const isAdmin = payload ? payload.IsAdmin === 'True' : false;
// ==============================
// 2. Funciones de la API
// ==============================

const BASE_URL = "https://localhost:7295/api/Reservation";
// Mostrar los datos del usuario
function mostrarDatosUsuario(datos) {
    
    console.log("Datos del usuario:", datos);
    const inicialUsuario = document.getElementById('inicial-usuario');
    if (inicialUsuario) {
        inicialUsuario.textContent = datos.name.charAt(0).toUpperCase(); // Muestra la inicial del nombre
    }
}

// Obtener datos del usuario
async function obtenerDatosUsuario(userId) {
  //  if (!userId) {
  //      console.error('El ID de usuario no es válido.');
  //      return;
  //  }

    try {
 //       console.log(`Obteniendo datos del usuario con ID: ${userId}`);
 //       const response = await fetch(`https://localhost:7130/api/v1/User/${userId}`, {
 //           headers: { Authorization: `Bearer ${token}` },
 //       });
        
 //       if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
 //       const data = await response.json();
  //      console.log(data); // Verifica qué datos se están recibiendo
        showSpinner();
        
        const data = await GetData.Get(AUTH_URLS.GET_USER_BY_ID(userId));

        hideSpinner();

        mostrarDatosUsuario(data);

    } catch (error) {
        console.error('Error al obtener los datos:', error);
        hideSpinner();
    }
}


async function fetchReservationsByDate(date) {
    try {
        showSpinner();

        if (!date) {
            Swal.fire({
                icon: "warning",
                title: "¡Advertencia!",
                text: "Por favor, selecciona una fecha válida.",
                customClass: {
                    confirmButton: "custom-confirm-button",
                    popup: "custom-swal",
                },
            });
            return;
        }

        const formattedDate = date.split("T")[0];

        console.log(`Fetching reservations for date: ${formattedDate}`);

   //     const response = await fetch(`${BASE_URL}?date=${formattedDate}`, {
   //         headers: { Authorization: `Bearer ${token}` },
   //     });

   //     if (!response.ok) throw new Error("Error al obtener reservas");

   //     const reservations = await response.json();
   //     console.log("Reservas obtenidas:", reservations);

        const reservations = await GetData.Get(`${RESERVATION_URLS.GET_RESERVATION}?${new URLSearchParams({ date: formattedDate }).toString()}`);

        console.log(reservations);

        const ReservasActivas = [];
        const ReservasCanceladas = [];

        reservations.forEach((reserva) => {
            if (reserva.status.id === 1) {
                ReservasActivas.push(reserva);
            } else if (reserva.status.id === 3) {
                ReservasCanceladas.push(reserva);
            }
        });

        renderActiveReservations(ReservasActivas);
        renderCancelledReservations(ReservasCanceladas);
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "¡Error!",
            text: "Hubo un problema al obtener las reservas.",
            footer:
                '<a href="https://wa.me/5491112345678">¿Aún tienes problemas? ¡Contáctanos!</a>',
            customClass: {
                confirmButton: "custom-confirm-button",
                popup: "custom-swal",
            },
        });

        renderActiveReservations([]);
        renderCancelledReservations([]);
    } finally {
        hideSpinner();
    }
}


// Función para ordenar reservas por fecha y hora
function sortReservationsByDate(reservations) {
    if (!Array.isArray(reservations)) {
        console.error("El parámetro 'reservations' no es un array.");
        return [];
    }
    return reservations.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateA - dateB;
    });
}

function getFormattedToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}


async function cancelarReserva(reservationId) {
//    try {
//        const url = `https://localhost:7295/api/Reservation/${reservationId}`;
//        const response = await fetch(url, {
//            method: "DELETE",
//            headers: { 
//                "Authorization": `Bearer ${token}`,
//                "Content-Type": "application/json"
//            }
//        });

//        if (response.ok) {
//            Swal.fire({
//                icon: 'success',
//                title: 'Reserva cancelada',
//                text: 'La reserva ha sido cancelada exitosamente.',
//                timer: 2000,
//                showConfirmButton: false
//            });
            
//            const fechaSeleccionada = document.getElementById('date').value || getFormattedToday();
//            await fetchReservationsByDate(fechaSeleccionada);
//        } else {
//            const errorData = await response.json();
//            Swal.fire({
//                icon: 'error',
//                title: 'Error',
//                text: 'No se pudo cancelar la reserva.',
//            });
//            console.error('Error al cancelar la reserva:', errorData);
//        }
//    } catch (error) {
//        Swal.fire({
//            icon: 'error',
//            title: 'Error',
//            text: 'Ocurrió un problema con la solicitud.',
//        });
//        console.error("Error al cancelar la reserva:", error);
//    }
    const url = `https://localhost:7295/api/Reservation/${reservationId}`;
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    try {

        showSpinner();

        let response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        console.log('code:', response.status);

        // Manejo de token expirado
        if (response.status === 401) {
            const newToken = await renewAccessToken(token, refreshToken);

            if (newToken) {
                response = await fetch(url, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${newToken}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error('Error en la solicitud DELETE después de renovar el token.');
                }
            } else {
                console.log('No se pudo renovar el token, cerrando sesión.');
                await logout();
            }
        }

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Reserva cancelada',
                text: 'La reserva ha sido cancelada exitosamente.',
                timer: 2000,
                showConfirmButton: false
            });

            const fechaSeleccionada = document.getElementById('date').value || getFormattedToday();
            await fetchReservationsByDate(fechaSeleccionada);
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cancelar la reserva.',
            });
            console.error('Error al cancelar la reserva:', errorData);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un problema con la solicitud.',
        });
        console.error("Error al cancelar la reserva:", error);
    }
}

async function cancelReservationHandler(event) {
    const button = event.currentTarget;
    const reserva = JSON.parse(button.dataset.reserva);

    // Confirmación de cancelación
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción cancelará la reserva por completo.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No, volver',
        customClass: {
            confirmButton: 'custom-cancel-button',
            cancelButton: 'custom-confirm-button',
            popup: 'custom-swal'
        },
    });

    if (result.isConfirmed) {
        await cancelarReserva(reserva.reservationID);
    }
}

// ==============================
// 3. Renderizado de Reservas
// ==============================

// Función para renderizar las reservas en la interfaz
function renderActiveReservations(reservations) {
    const contenedorReservas = document.getElementById("contenedor-reservas");
    contenedorReservas.innerHTML = "";

    if (!reservations || reservations.length === 0) {
        contenedorReservas.innerHTML = `<p class="text-center text-md text-white">No se encontraron reservas para la fecha indicada.</p>`;
        return;
    }

    reservations = sortReservationsByDate(reservations);

    const today = new Date();

    reservations.forEach((reserva) => {
        const tempContainer = document.createElement("div");

        // Calcular si la reserva es futura
        const isFutureReservation = new Date(`${reserva.date}T${reserva.startTime}`) > today;

       tempContainer.innerHTML = `
    <div class="flex flex-col justify-between bg-palette-tertiary-color rounded-md p-4 shadow-md">
        <div class="text-center md:text-left">
            <h3 class="text-lg text-center font-semibold mb-4 pb-2 border-b border-palette-primary-color text-white">
                ${reserva.field.name || 'Campo'}
            </h3>
            <div class="grid grid-cols-2 gap-4 text-md text-gray-400">
                <!-- Fecha -->
                <div class="flex flex-col items-start space-y-2 mb-4">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-calendar-alt text-gray-400 text-lg"></i>
                        <p class="font-semibold">Fecha</p>
                    </div>
                    <p class="mt-3 text-gray-400">${reserva.date}</p>
                </div>
                <!-- Horario -->
                <div class="flex flex-col items-start space-y-3 mb-4">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-clock text-gray-400 text-lg"></i>
                        <p class="font-semibold">Horario</p>
                    </div>
                    <p class=" text-center mt-3  text-gray-400">${reserva.startTime} - ${reserva.endTime}</p>
                </div>
                <!-- Tamaño -->
                <div class="flex flex-col items-start space-y-2 mb-4">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-futbol text-gray-400 text-lg"></i>
                        <p class="font-semibold">Tamaño</p>
                    </div>
                    <p class="text-center mt-3  text-gray-400">${reserva.field.size}</p>
                </div>
                <!-- Superficie -->
                <div class="flex flex-col items-start space-y-2 mb-4">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-th-large text-gray-400 text-lg"></i>
                        <p class="font-semibold">Superficie</p>
                    </div>
                    <p class="mt-3 text-center text-gray-400">${reserva.field.fieldType.description}</p>
                </div>
            </div>
            ${
                !isFutureReservation
                    ? `<p class="text-center text-palette-accent-color font-bold  mt-4">
                            Reserva Completada
                    </p>`
                    : ''
            }
        </div>
    </div>
`;


        const reservaElement = tempContainer.firstElementChild;

        // Si la reserva es futura, agregar los botones
        if (isFutureReservation) {
            const botonesContainer = document.createElement("div");
            botonesContainer.className = "flex justify-center space-x-4 border-t border-palette-primary-color mt-4 pt-2";

            const btnVerJugadores = document.createElement("button");
            btnVerJugadores.className = "flex items-center gap-2 px-4 py-2 rounded-md text-white hover:bg-palette-accent-color";
            btnVerJugadores.innerHTML = `<i class="fas fa-users text-palette-primary-color"></i>`;
            btnVerJugadores.addEventListener("click", () => {
                mostrarJugadores(reserva.players, reserva);
                openModal();
            });

            const btnCancelarReserva = document.createElement("button");
            btnCancelarReserva.className = "flex items-center gap-2 px-4 py-2 rounded-md text-white hover:bg-palette-accent-color";
            btnCancelarReserva.innerHTML = `<i class="fas fa-trash-alt text-palette-primary-color"></i>`;
            btnCancelarReserva.dataset.reserva = JSON.stringify(reserva);
            btnCancelarReserva.addEventListener("click", cancelReservationHandler);

            botonesContainer.appendChild(btnVerJugadores);
            botonesContainer.appendChild(btnCancelarReserva);

            reservaElement.appendChild(botonesContainer);
        }

        contenedorReservas.appendChild(reservaElement);
    });
}

function renderCancelledReservations(reservations) {
    const contenedorReservasCanceladas = document.getElementById("contenedor-canceladas");
    contenedorReservasCanceladas.innerHTML = "";

    if (!reservations || reservations.length === 0) {
        contenedorReservasCanceladas.innerHTML = `<p class="text-center text-white">No hay reservas canceladas.</p>`;
        return;
    }

    reservations = sortReservationsByDate(reservations);

    reservations.forEach((reserva) => {
        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = `
            <div class="flex flex-col justify-between bg-palette-tertiary-color rounded-md p-4 shadow-md">
        <div class="text-center md:text-left">
            <h3 class="text-lg text-center font-semibold mb-4 pb-2 border-b border-palette-primary-color text-white">
                ${reserva.field.name || 'Campo'}
            </h3>
            <div class="grid grid-cols-2 gap-4 text-md text-gray-400">
                <!-- Fecha -->
                <div class="flex flex-col items-start space-y-2 mb-4">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-calendar-alt text-gray-400 text-lg"></i>
                        <p class="font-semibold">Fecha</p>
                    </div>
                    <p class="mt-3 text-gray-400">${reserva.date}</p>
                </div>
                <!-- Horario -->
                <div class="flex flex-col items-start space-y-3 mb-4">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-clock text-gray-400 text-lg"></i>
                        <p class="font-semibold">Horario</p>
                    </div>
                    <p class=" text-center mt-3  text-gray-400">${reserva.startTime} - ${reserva.endTime}</p>
                </div>
                <!-- Tamaño -->
                <div class="flex flex-col items-start space-y-2 mb-4">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-futbol text-gray-400 text-lg"></i>
                        <p class="font-semibold">Tamaño</p>
                    </div>
                    <p class="text-center mt-3  text-gray-400">${reserva.field.size}</p>
                </div>
                <!-- Superficie -->
                <div class="flex flex-col items-start space-y-2 mb-4">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-th-large text-gray-400 text-lg"></i>
                        <p class="font-semibold">Superficie</p>
                    </div>
                    <p class="mt-3 text-center text-gray-400">${reserva.field.fieldType.description}</p>
                </div>
            </div>
        `;
        const reservaElement = tempContainer.firstElementChild;
        contenedorReservasCanceladas.appendChild(reservaElement);
    });
}


// Función para limpiar los filtros
async function clearFilters() {
    try {
        console.log("Limpiando filtros...");

        // Reseteo el valor del input de fecha
        const inputFecha = document.getElementById("date");
        if (inputFecha) {
            inputFecha.value = ""; 
        }

       // Cargar reservas del día actual usando getFormattedToday()
       const today = getFormattedToday();
       await fetchReservationsByDate(today);
       
    } catch (error) {
        console.error("Error al limpiar los filtros:", error);
    }
}


function mostrarJugadores(players, reservation) {
    const playersContainer = document.getElementById("players-list");

    if (!playersContainer) {
        console.error("No se encontró el contenedor para mostrar los jugadores.");
        return;
    }

    playersContainer.innerHTML = ""; // Limpiar contenido previo

    players.forEach(player => {
        const playerItem = document.createElement("div");
        playerItem.className = "player-item flex justify-between items-center bg-palette-tertiary-color shadow-md p-2 rounded gap-4";
        playerItem.innerHTML = `
            <span class="text-lg"><i class="fas fa-user"></i></span>
            <span class="text-white flex-grow pr-4 pl-10">${player.name}</span>
        `;
        playerItem.setAttribute("data-player-id", player.id);

        playersContainer.appendChild(playerItem);
    });
}

// ==============================
// 3. Carga inicial del DOM
// ==============================

document.addEventListener("DOMContentLoaded", async () => {

    //Chequeo si el usuario que ingreso es admin
    console.log('es Admin:', isAdmin);
    
    if(!isAdmin) {
        window.location.href = '../../src/reservations.html';
        return;
    }

    try {
        //SETEO BOTON DE LOGOUT

        setupLogoutEvent();
        
        console.log("Cargando datos al cargar el DOM...");

        // Muestro los datos del usuario
        if (userId) {
            await obtenerDatosUsuario(userId);
        } else {
            console.error("No se pudo obtener el ID del usuario. Verifica el token.");
        }

        // Obtengo la fecha actual en formato YYYY-MM-DD sin zona horaria
        const formattedToday = getFormattedToday();
        await fetchReservationsByDate(formattedToday);
      

        const inputFecha = document.getElementById("date");
        if (inputFecha) {
            inputFecha.addEventListener("change", async (event) => {
                const fechaSeleccionada = event.target.value;
                await fetchReservationsByDate(fechaSeleccionada);
                
            });

            //Simular click en el input para abrir el calendario
            document.getElementById("calendar-icon").addEventListener("click", function() {
                document.getElementById("date").showPicker();
            });
        } else {
            console.error("El input de fecha no existe en el DOM.");
        }

        const clearFiltersBtn = document.getElementById("clear-filters-btn");
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener("click", clearFilters);
        } else {
            console.error("El botón de limpiar filtros no existe en el DOM.");
        }
    } catch (error) {
        console.error("Error al cargar la página:", error);
    }
});
