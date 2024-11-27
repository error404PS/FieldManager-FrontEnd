 
import GetData from '../services/getData.js';
import { AUTH_URLS, RESERVATION_URLS , generateLink, daysInSpanish, convertTimeSpanToHHMM, getDayFromDate } from '../components/utilities.js';
import { openModal, closeModal } from '/static/js/components/modal-reservations.js';
import { showSpinner, hideSpinner } from '../components/spinners.js';
import { setupLogoutEvent } from '../components/auth.js';
import { renewAccessToken } from "../services/renewAccessToken.js";
import { showErrorAlert, showPlayerAddSucces, showErrorJoinReservation } from '../components/alerts.js';
import { logout } from "../components/auth.js";

 // ejemplo de token, esto se debe cambiar a que se reciba del localStorage


//token rocio
//const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI0IiwiSXNBZG1pbiI6IkZhbHNlIiwiSXNBY3RpdmUiOiJUcnVlIiwibmJmIjoxNzMyMTk2MjczLCJleHAiOjE3MzIxOTY1NzMsImlhdCI6MTczMjE5NjI3M30.mc7zwTqss4opIEpu8R72ZxdqnWWly7iFCkk8GkYviLc";
//token melina
//const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI1IiwiSXNBZG1pbiI6IkZhbHNlIiwiSXNBY3RpdmUiOiJUcnVlIiwibmJmIjoxNzMyMTk2MzEwLCJleHAiOjE3MzIxOTY2MTAsImlhdCI6MTczMjE5NjMxMH0.-RpNgTz7S9Ebgl5hWJX0Z6WJpgSP2lsY2paamntpPzU";


// Función para decodificar el JWT y obtener el payload
function parseJwt(token) {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
}

const payload = parseJwt(localStorage.getItem('token'));
const userId = payload ? payload.nameid : null;
const isAdmin = payload ? payload.IsAdmin === 'True' : false;


async function handlerAddPlayer(reservationID){
    await addPlayer(reservationID);
}

async function addPlayer(reservationId) {

    try{
        showSpinner();

        let reservationPlayerToAdd = {
            reservationId: reservationId,
            userID: userId
        }

        let response = await fetch(RESERVATION_URLS.CREATE_RESERVATION_PLAYER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(reservationPlayerToAdd)
        });

        if (response.status === 401) {

            const newToken = await renewAccessToken(localStorage.getItem('token'), localStorage.getItem('refreshToken'));

            if (newToken){
                response = await fetch(RESERVATION_URLS.CREATE_RESERVATION_PLAYER, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newToken}`
                    },
                    body: JSON.stringify(reservationPlayerToAdd)
                });
            }
            else {
                console.log('No se pudo renovar el token, cerrando sesión.');
                await logout();

            }
        }

        hideSpinner();

        if (response.ok) {
            
            showPlayerAddSucces();    
        }
        else{
            const error = await response.json();
            showErrorJoinReservation(error.message);
        }      
    }
    catch(error){
        console.log(error);
        
        
    }
    finally{
        hideSpinner();
    }
    
}

// ==============================
// 1. Autenticación y Token
// ==============================



// ==============================
// 2. Funciones de la API
// ==============================

// Obtener datos del usuario
async function obtenerDatosUsuario(userId) {
    try {
 //       console.log(`Obteniendo datos del usuario con ID: ${userId}`);
 //       const response = await fetch(`https://localhost:7130/api/v1/User/${userId}`);
 //       if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
 //       const data = await response.json();
 //       console.log(data);  // Verifica qué datos se están recibiendo
        const data = await GetData.Get(AUTH_URLS.GET_USER_BY_ID(userId));
        mostrarDatosUsuario(data);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}


async function getReservationsByUserId(userId) {
    try {
        showSpinner();
//        const [playerResponse, ownerResponse] = await Promise.all([
//            fetch(`https://localhost:7295/api/Reservation/Reservation-player?player=${userId}`, {
//                headers: {
//                    "Authorization": `Bearer ${token}`,
//                   "Content-Type": "application/json"
//                }
//            }),
//            fetch(`https://localhost:7295/api/Reservation?user=${userId}`, {
//                headers: {
//                    "Authorization": `Bearer ${token}`,
//                    "Content-Type": "application/json"
//                }
//            })
//        ]);

//        if (!playerResponse.ok || !ownerResponse.ok) throw new Error('Error al obtener las reservas');

//        const reservasJugador = await playerResponse.json();
//        const reservasOwner = await ownerResponse.json();

        const [reservasJugador, reservasOwner] = await Promise.all([
            GetData.Get(`${RESERVATION_URLS.GET_RESERVATION_PLAYER}?${new URLSearchParams({ player: userId }).toString()}`),
            GetData.Get(`${RESERVATION_URLS.GET_RESERVATION}?${new URLSearchParams({ user: userId }).toString()}`)
        ]);

        const today = new Date();

        // Filtrar y ordenar reservas del jugador
        const reservasJugadorFuturas = reservasJugador
            .filter(reserva => 
                new Date(`${reserva.date}T${reserva.startTime}`) > today &&
                reserva.status.id === 1
            )
            .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`));

        // Filtrar y ordenar reservas del propietario
        const reservasOwnerFuturas = reservasOwner
            .filter(reserva => 
                new Date(`${reserva.date}T${reserva.startTime}`) > today &&
                reserva.status.id === 1
            )
            .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`));

        // Combinar todas las reservas futuras
        const todasReservasFuturas = [...reservasJugadorFuturas, ...reservasOwnerFuturas]
            .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`));

         // Filtrar reservas previas del jugador
         const reservasJugadorPrevias = reservasJugador
         .filter(reserva => 
             new Date(`${reserva.date}T${reserva.startTime}`) <today 
             
         );

     // Filtrar reservas previas del propietario
     const reservasOwnerPrevias = reservasOwner
         .filter(reserva => 
             new Date(`${reserva.date}T${reserva.startTime}`) < today 
 
         );
        // Mostrar reservas
        mostrarReservas(reservasOwnerFuturas, reservasOwnerPrevias);
        mostrarReservas(reservasJugadorFuturas, reservasJugadorPrevias);


        // Mostrar la próxima reserva combinada
        mostrarProximaReserva(todasReservasFuturas);
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "¡Error!",
            text: "Hubo un problema al obtener las reservas.",
            footer:
                '<a href="https://wa.me/5491112345678">¿Aún tienes problemas? ¡Contáctanos!</a>',
            heightAuto: false, 
            scrollbarPadding: false,
            customClass: {
                confirmButton: "custom-confirm-button",
                popup: "custom-swal",
            },
        });
        console.error('Error al obtener las reservas:', error);
    } finally {
        hideSpinner();
    }
}

async function cancelarReserva(reservationId, userId) {

    //Nuevo cancelar Reserva

    const url = `https://localhost:7295/api/Reservation/${reservationId}`;
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    try {
        showSpinner();

        let response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('code:', response.status);

        if (response.status === 401) {
            const newToken = await renewAccessToken(token, refreshToken);

            if (newToken) {
                response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newToken}`
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

        hideSpinner();

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error al cancelar la reserva:', errorData);
            throw new Error('Se ha registrado un error en la solicitud DELETE.');
        }

        // Si la eliminación es exitosa, obtenemos nuevamente las reservas del usuario
        await getReservationsByUserId(userId);
    } catch (error) {
        console.error("Error al cancelar la reserva:", error);
        throw error;
    }
    finally{
        hideSpinner();
    }
}

async function removePlayer(reservationId, playerId, callback) {
    const url = `https://localhost:7295/api/Reservation/${reservationId}/Player/${playerId}`;
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

        hideSpinner();

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Jugador eliminado',
                text: 'El jugador fue eliminado correctamente.',
                heightAuto: false, 
                scrollbarPadding: false,
                timer: 2000,
                showConfirmButton: false
            });

            if (callback) callback();
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar al jugador.',
                heightAuto: false, 
                scrollbarPadding: false,
            });
            console.error("Error al eliminar al jugador:", errorData);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un problema con la solicitud.',
            heightAuto: false, 
            scrollbarPadding: false,
        });
        console.error("Error en la solicitud:", error);
    }
    finally{
        hideSpinner();
    }
}


// Función para copiar el enlace al portapapeles
function copiarEnlace(reservation) {
    const reservationLink = generateLink(reservation);
    navigator.clipboard.writeText(reservationLink)
    .then(() => {
        Swal.fire({
            icon: 'success',
            title: '¡Copiado!',
            text: 'El enlace ha sido copiado al portapapeles.',
            heightAuto: false, 
            scrollbarPadding: false,
            timer: 2000,
            showConfirmButton: false
        });
    })
    .catch(err => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo copiar el enlace.',
            heightAuto: false, 
            scrollbarPadding: false,
        });
        console.error("Error al copiar el enlace: ", err);
    });
}

// ==============================
// 3. Funciones de UI (Interfaz de Usuario)
// ==============================
function mostrarDatosUsuario(data) {
    console.log('Datos del usuario:', data);
    
    const nombreUsuarioElement = document.getElementById("nombre-usuario");
    const userInitialElement = document.getElementById('inicial-usuario');

    // Verifica que los elementos existen antes de intentar asignarles datos
    if (nombreUsuarioElement && userInitialElement) {
        nombreUsuarioElement.textContent = `Bienvenido/a, ${data.name}`;
        userInitialElement.textContent = data.name.charAt(0).toUpperCase();
    } else {
        console.error("Los elementos no fueron encontrados en el DOM.");
    }
}
async function cancelReservationHandler(event) {
    const proximaReserva = JSON.parse(event.currentTarget.dataset.reserva);
    const reservaFechaHora = new Date(`${proximaReserva.date}T${proximaReserva.startTime}`);
    const ahora = new Date();
    const diferenciaHoras = (reservaFechaHora - ahora) / (1000 * 60 * 60); // Diferencia en horas

    // Si el usuario es el dueño, validamos las 24 horas
    if (parseInt(proximaReserva.ownerUserID) === parseInt(userId) && diferenciaHoras < 24) {
        Swal.fire({
            icon: 'error',
            title: 'No se puede cancelar',
            text: 'Como dueño, solo puedes cancelar reservas con 24 horas de anticipación.',
            heightAuto: false, 
            scrollbarPadding: false,
            customClass: {
                confirmButton: 'custom-confirm-button',
                popup: 'custom-swal'
            }
        });
        return; // Detenemos la ejecución
    }

    // Confirmación de cancelación
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: parseInt(proximaReserva.ownerUserID) === parseInt(userId) 
            ? "Esta acción cancelará la reserva por completo." 
            : "Se te eliminará de la reserva.",
        icon: 'warning',
        showCancelButton: true,
        heightAuto: false, 
        scrollbarPadding: false,
        cancelButtonText: 'No, volver',
        confirmButtonText: 'Sí, continuar',
        customClass: {
            confirmButton: 'custom-confirm-button',
            cancelButton: 'custom-cancel-button',
            popup: 'custom-swal'
        }
    });

    if (result.isConfirmed) {
        try {
            if (parseInt(proximaReserva.ownerUserID) === parseInt(userId)) {
                // El dueño cancela toda la reserva
                await cancelarReserva(proximaReserva.reservationID);
            } else {
                // Un jugador se elimina de la reserva
                await removePlayer(proximaReserva.reservationID, userId);
            }

            Swal.fire({
                icon: 'success',
                title: parseInt(proximaReserva.ownerUserID) === parseInt(userId) 
                    ? 'Reserva cancelada' 
                    : 'Te eliminaste de la reserva',
                text: 'La acción se completó correctamente.',
                heightAuto: false, 
                scrollbarPadding: false,
                timer: 2000,
                showConfirmButton: false
            });

            await getReservationsByUserId(userId);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo completar la acción. Intenta nuevamente.',
            });
            console.error("Error al procesar la cancelación:", error);
        }
    }
}

function mostrarProximaReserva(todasReservasFuturas) {
    const reservasFuturas = todasReservasFuturas;

    if (reservasFuturas.length > 0) {
        const proximaReserva = reservasFuturas[0]; 
        document.querySelector("#next-reservation-field-name").textContent = proximaReserva.field.name;
        document.getElementById("next-reservation-date").textContent = proximaReserva.date;
        document.getElementById("next-reservation-time").textContent = `${proximaReserva.startTime} - ${proximaReserva.endTime}`;
        document.getElementById("next-reservation-size").textContent = proximaReserva.field.size;
        document.getElementById("next-reservation-type").textContent = proximaReserva.field.fieldType.description;

        const reservaLink = generateLink(proximaReserva);
        document.getElementById("reservation-link").textContent = reservaLink;
        document.getElementById("reservation-link").setAttribute("href", reservaLink);

        
        const botonCopiar = document.getElementById("copy-button");
        if (botonCopiar) {
            botonCopiar.addEventListener('click', () => {
                copiarEnlace(proximaReserva);
            });
        }
         
        const viewPlayersButton = document.getElementById("view-players-btn");
        if (viewPlayersButton) {
            viewPlayersButton.removeEventListener("click", viewPlayersHandler);
            viewPlayersButton.addEventListener("click", () => viewPlayersHandler(proximaReserva));
        }            

        const cancelButton = document.getElementById("cancel-reservation-btn");
        if (cancelButton) {
            cancelButton.dataset.reserva = JSON.stringify(proximaReserva);
            cancelButton.removeEventListener("click", cancelReservationHandler);
            cancelButton.addEventListener("click", cancelReservationHandler);
        }
    } else {
    
        const error = document.getElementById("tarjeta-reserva-proxima");
        error.classList.add("hidden");
        const errorBotonCancelar = document.getElementById("cancel-reservation-btn");
        errorBotonCancelar.classList.add("hidden");
        const errorImage = document.getElementById("no-reservations");
        console.log(errorImage);
        errorImage.classList.remove("hidden");
        errorImage.innerHTML = `
            
            <img src="../img/fieldManager-Error.png" alt="" >
            <p class="text-2xl text-white text-center pt-4" > No hay una reserva próxima. </p>
            
        `;
        console.log("No hay próximas reservas activas.");
        // Limpiar la vista de próxima reserva si no hay reservas activas
        document.querySelector("#next-reservation-field-name").textContent = "";
        document.getElementById("next-reservation-date").textContent = "";
        document.getElementById("next-reservation-time").textContent = "";
        document.getElementById("next-reservation-size").textContent = "";
        document.getElementById("next-reservation-type").textContent = "";
        document.getElementById("reservation-link").textContent = "";
        document.getElementById("reservation-link").removeAttribute("href");
        document.getElementById("reservation-link").style.display = "none";
    }
}

function viewPlayersHandler(proximaReserva) {
    mostrarJugadores(proximaReserva.players, proximaReserva);
    openModal(); 
}

function mostrarReservas(reservasFuturas, reservasPrevias) {
    const contenedorReservas = document.getElementById('contenedor-reservas');
    const contenedorHistorial = document.getElementById('contenedor-historial');

    contenedorReservas.innerHTML = ''; // Limpiar el contenedor de reservas
    reservasFuturas.forEach(reserva => {
        const tarjetaReserva = document.createElement('div');
        tarjetaReserva.className = "flex flex-col md:flex-row justify-between items-center bg-palette-tertiary-color rounded-md p-4 shadow-md";
        
        // HTML para cada tarjeta de reserva
        tarjetaReserva.innerHTML = `
        <div class="text-center md:text-left mb-4 md:mb-0 tracking-widest">
            <div class="flex justify-between items-start">
                <h3 class="text-lg font-semibold mb-4 text-white">${reserva.field.name}</h3>
            </div>
           <div class="space-y-4 text-sm text-gray-400">
            <div class="flex items-center gap-x-4">
                <i class="fas fa-calendar-alt text-gray-400 mr-2"></i>
                <span>Fecha: ${reserva.date}    |    Horario: ${reserva.startTime} - ${reserva.endTime}</span>
            </div>
            <div class="flex items-center gap-x-4"> 
                <i class="fas fa-futbol text-gray-400 mr-2"></i>
                <span>Tamaño: ${reserva.field.size}    |    Tipo: ${reserva.field.fieldType.description}</span>
            </div>
        </div>
        </div>
        <div class="flex space-x-4 mt-6">
            <button class="view-players-btn flex items-center gap-4 px-4 bg-palette-tertiary-color py-3 rounded-md font-semibold hover:opacity-80 text-palette-primary-color">
                <i class="fas fa-users text-palette-primary-color"></i>
            </button>
            <button class="btn-cancelar-reserva flex items-center gap-4 px-4 bg-palette-tertiary-color py-3 rounded-md font-semibold hover:opacity-80 text-palette-primary-color">
                <i class="fas fa-trash-alt text-palette-primary-color"></i>
            </button>
            <button class="btn-copiar-enlace flex items-center gap-8 border border-palette-primary-color px-6 bg-palette-primary-color py-3 rounded-md font-semibold hover:opacity-80 text-palette-accent-color">
                <i class="fas fa-link text-palette-accent-color"></i> Copy Link
            </button>
        </div>
    `;
    
        // Añadir eventos dinámicos
        const btnVerJugadores = tarjetaReserva.querySelector('.view-players-btn');
        btnVerJugadores.onclick = () => {
            mostrarJugadores(reserva.players, reserva);
            openModal(); // Abre el modal
        };
        
        const btnCancelarReserva = tarjetaReserva.querySelector('.btn-cancelar-reserva');
        btnCancelarReserva.dataset.reserva = JSON.stringify(reserva);
        btnCancelarReserva.removeEventListener("click", cancelReservationHandler);
        btnCancelarReserva.addEventListener("click", cancelReservationHandler);

        const btnCopiarEnlace = tarjetaReserva.querySelector('.btn-copiar-enlace');
        btnCopiarEnlace.onclick = () => copiarEnlace(reserva);

        // Agregar la tarjeta al contenedor de reservas
        contenedorReservas.appendChild(tarjetaReserva);
    });

    // Historial de reservas previas
    contenedorHistorial.innerHTML = '';
    reservasPrevias.forEach(reserva => {
        const tarjetaHistorial = document.createElement('div');
        tarjetaHistorial.className = "bg-palette-tertiary-color rounded-md p-4 shadow-md";
    
        tarjetaHistorial.innerHTML = `
           <div class="text-center md:text-left mb-4 md:mb-0 tracking-widest">
            <div class="flex justify-between items-start">
                <h3 class="text-lg font-semibold mb-4 text-white">${reserva.field.name}</h3>
            </div>
           <div class="space-y-4 text-sm text-gray-400">
            <div class="flex items-center gap-x-4">
                <i class="fas fa-calendar-alt text-gray-400 mr-2"></i>
                <span>Fecha: ${reserva.date}    |    Horario: ${reserva.startTime} - ${reserva.endTime}</span>
            </div>
            <div class="flex items-center gap-x-4"> 
                <i class="fas fa-futbol text-gray-400 mr-2"></i>
                <span>Tamaño: ${reserva.field.size}    |    Tipo: ${reserva.field.fieldType.description}</span>
            </div>
        </div>
        `;
    
        contenedorHistorial.appendChild(tarjetaHistorial);
    });
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

        // Mostrar botón de eliminar solo si el usuario actual es el propietario
        if (parseInt(reservation.ownerUserID) === parseInt(userId) && parseInt(player.id) !== parseInt(userId)) {
            const deleteButton = document.createElement("button");
            deleteButton.innerHTML = `<i class="fas fa-trash-alt"></i>`;
            deleteButton.className = "delete-button text-red-500 hover:text-red-700";

            // Agregar evento de confirmación y eliminación
            deleteButton.onclick = async () => {
                const result = await Swal.fire({
                    title: '¿Está seguro?',
                    text: `¿Desea eliminar a ${player.name}?`,
                    icon: 'warning',
                    showCancelButton: true,
                    heightAuto: false, 
                    scrollbarPadding: false,
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        confirmButton: 'custom-confirm-button',
                        cancelButton: 'custom-cancel-button',
                        popup: 'custom-swal'
                    }
                });

                if (result.isConfirmed) {
                    console.log('Reserva ID:', reservation.reservationID); // Asegúrate de que este valor sea correcto
                    removePlayer(reservation.reservationID, player.id, () => {
                        // Actualizar la lista de jugadores después de eliminar
                        const updatedPlayers = players.filter(p => p.id !== player.id);
                        reservation.players = updatedPlayers; // Actualizar la fuente de datos
                        mostrarJugadores(updatedPlayers, reservation);
                    });
                }
            };

            playerItem.appendChild(deleteButton);
        }

        playersContainer.appendChild(playerItem);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    
    //Chequeo si el usuario que ingreso es admin
    console.log('es Admin:', isAdmin);

    if(isAdmin) {
        window.location.href = '../../src/statistics.html';
        return;
    }

    await detectAddPlayer();
    
    const token = localStorage.getItem('token');
    setupLogoutEvent();
    
    if (!token || !userId) {
        console.log('No se encontró el token o el ID de usuario.');
        return;
    }


 //   const payload = parseJwt(token);
 //   const userId = payload ? payload.nameid : null;

    console.log('Token encontrado:', token);
    await obtenerDatosUsuario(userId);
    
    await getReservationsByUserId(userId);
});



async function detectAddPlayer(){
    
    const token = localStorage.getItem("refreshToken"); 
    console.log(token);
    if (!token) {    
        redirectToLogin();
        return;
    }
    
    const params = new URLSearchParams(window.location.search);
    const reservationId = params.get('id');

    if(reservationId){
        const reservation = await GetData.Get(RESERVATION_URLS.GET_RESERVATION_BY_ID(reservationId));

        const user = await GetData.Get(AUTH_URLS.GET_USER_BY_ID(reservation.ownerUserID));

        console.log(user)
        
        showJoinReservation(reservation, user)
        
    }

    else{
        console.log("no habia ningun id en el link");

    }
    
}

function redirectToLogin() {
    const currentUrl = window.location.href; 
    const loginUrl = `auth.html?redirect=${encodeURIComponent(currentUrl)}`;

    window.location.href = loginUrl;
}

async function showJoinReservation(reservation, user){
    
    const userName = user.name;

    const reservationDate = reservation.date;

    const day = daysInSpanish[getDayFromDate(reservationDate)];

    const hour = convertTimeSpanToHHMM(reservation.startTime);

    if(Swal.isVisible()){
        Swal.close();
    };
    
    const result = await Swal.fire({
        title: `¿Quieres unirte a la reserva de ${userName}?`,
        html: `<p><strong>Día:</strong> ${day}</p>
               <p><strong>Fecha:</strong> ${reservationDate}</p>
               <p><strong>Hora:</strong> ${hour}</p>`,
        icon: 'question',
        confirmButtonText: 'Unirme',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        heightAuto: false, 
        scrollbarPadding: false,
        customClass: {
            confirmButton: 'custom-confirm-button',
            cancelButton: 'custom-cancel-button',
            popup: 'custom-swal'
        },
        allowOutsideClick: true,
        allowEscapeKey: true
    }).then((result) => {
        if (result.isConfirmed) {
            handlerAddPlayer(reservation.reservationID);
            console.log('Te has unido a la reserva.');               
        } else {
            console.log('Decidiste no unirte a la reserva.');
        }
    });
}

