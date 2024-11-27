import { FIELD_URLS, RESERVATION_URLS, AUTH_URLS, parseJwt} from "../components/utilities.js";
import GetData from "../services/getData.js";
import { showSpinner, hideSpinner } from "../components/spinners.js";
import { setupLogoutEvent } from "../components/auth.js";

const payload = parseJwt(localStorage.getItem('token'));
const userId = payload ? payload.nameid : null;
const isAdmin = payload ? payload.IsAdmin === 'True' : false;

document.addEventListener('DOMContentLoaded', () => initializeApp());

async function initializeApp() {

    console.log('es Admin:', isAdmin);
    
    if(!isAdmin) {
   

        window.location.href = '../../src/reservations.html';
        return;
    }

    setupLogoutEvent();

    try {
        showSpinner();

        await obtenerDatosUsuario(userId);

        const fields = await GetData.Get(FIELD_URLS.GET_FIELDS);
       
        const reservations = await GetData.Get(RESERVATION_URLS.GET_RESERVATION);
       
        hideSpinner();
       
        renderFields(fields);
        
        renderReservations(reservations);
       
        renderMostUsedFields(reservations);
       
        renderLast7DaysReservations(reservations);
       
       
       
        console.log(fields);
       
        console.log(reservations);
    }
    catch (error) {
        hideSpinner();
        console.error("Ocurrió un error al obtener los datos:", error);
        errorAlert('Hubo un problema al cargar los datos. Por favor, recargue la página o intente nuevamente más tarde.');
    }
}

function renderLast7DaysReservations(reservations) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normalizar a medianoche UTC
    today.setUTCDate(today.getUTCDate() - 1); 

    const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Generar los últimos 7 días correctamente desde ayer hacia atrás
    const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setUTCDate(today.getUTCDate() - (6 - i)); 
        return {
            date: formatUTCDate(date), 
            day: weekdays[date.getUTCDay()], 
        };
    });

    console.log("Días generados:", days);

    const dailyReservations = days.reduce((acc, { date, day }) => {
        acc[day] = { count: 0, date }; 
        return acc;
    }, {});

    // Filtrar reservas confirmadas (status.id === 1)
    const recentReservations = reservations.filter(reservation => {
        const reservationDate = new Date(reservation.date);
        reservationDate.setUTCHours(0, 0, 0, 0); 
        return (
            reservation.status.id === 1 &&
            reservationDate >= new Date(days[0].date) &&
            reservationDate <= today
        );
    });

    console.log("Reservas recientes filtradas:", recentReservations);

    // Contar las reservas por día
    recentReservations.forEach(reservation => {
        const reservationDate = formatUTCDate(new Date(reservation.date));
        const dayEntry = Object.values(dailyReservations).find(entry => entry.date === reservationDate);
        if (dayEntry) {
            dayEntry.count++;
        }
    });

    console.log("Reservas por día:", dailyReservations);


    const labels = Object.keys(dailyReservations); 
    const data = Object.values(dailyReservations).map(entry => entry.count); 

    console.log("Datos para el gráfico:", { labels, data });

    // Llamamos al método para renderizar el gráfico de barras
    renderBarChart({ labels, data });
}

function formatUTCDate(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}



function renderMostUsedFields(reservations){

    const fieldCount = {};

    reservations.forEach(reservation => {
        if (reservation.status.id === 1) {
            const fieldName = reservation.field.name;  
            if (fieldCount[fieldName]) {
                fieldCount[fieldName] += 1;  
            } else {
                fieldCount[fieldName] = 1;  
            }
        }
    });
    

    // Convertimos el objeto fieldCount en un arreglo de objetos {name, count}
    const fieldArray = Object.entries(fieldCount).map(([name, count]) => ({ name, count }));

    fieldArray.sort((a, b) => b.count - a.count);

    const topFields = fieldArray.slice(0, 4);
    const otherFields = fieldArray.slice(4);

    if (otherFields.length > 0) {
        const otherCount = otherFields.reduce((sum, field) => sum + field.count, 0);
        topFields.push({ name: 'Otros', count: otherCount });
    }


    const labels = topFields.map(field => field.name);
    const data = topFields.map(field => field.count);

    // Llamamos al método para renderizar el gráfico circular
    renderPieChart(labels, data);

}

function renderReservations(reservations){

    const totalReservations = reservations.filter(reservation => reservation.status.id === 1).length;;

    console.log(totalReservations);

    const totalCancelledReservations = reservations.filter(reservation => reservation.status.id === 3).length;

    console.log(totalCancelledReservations);


    const totalReservationsElement = document.getElementById('totalReservations');
    const totalCancelledReservationsElement = document.getElementById('totalCancelledReservations');

    totalReservationsElement.textContent = totalReservations;
    totalCancelledReservationsElement.textContent = totalCancelledReservations;
}


function renderFields(fields){

    const totalFields = fields.length;

    const totalFieldsElement = document.getElementById('totalFields');
    totalFieldsElement.textContent = totalFields;

}

function renderPieChart(labels, data) {
    var pieCtx = document.getElementById('pieChart').getContext('2d');

    new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: labels, 
            datasets: [{
                data: data, 
                backgroundColor: ['#47ea47', '#012107', '#096a03', '#78d02c', '#b6f57e'], 
                borderWidth: 0 
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'bottom', 
                    labels: {
                        boxWidth: 20, 
                        font: {
                            size: 14 
                        },
                        padding: 10, 
                        usePointStyle: true, 
                    },
                    onClick: null 
                },
                tooltip: {
                    enabled: true 
                }
            },
            layout: {
                padding: {
                    top: 10,
                    bottom: 10,
                }
            },
            aspectRatio: 1 
        }
    });
}



function renderBarChart({ labels, data }) {
    const barCtx = document.getElementById('barChart').getContext('2d');

    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: labels, 
            datasets: [{
                label: 'Reservas por Día', 
                data: data, 
                backgroundColor: '#97FB57', 
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { 
                    title: { 
                        display: true, 
                        text: 'Días' 
                    } 
                },
                y: { 
                    title: { 
                        display: true, 
                        text: 'Reservas' 
                    } 
                },
            },
        },
    });
}

function errorAlert(errorText){
    if(Swal.isVisible()){
        return;
    };

    Swal.fire({
        icon: "error",
        title: "¡Error!",
        text: errorText,
        footer: '<a href="https://wa.me/5491112345678">¿Aun tiene problemas? ¡Puede contactarnos!</a>',
        customClass: {
            confirmButton: 'custom-confirm-button',
            popup: 'custom-swal'
        },
      });
}

// Obtener datos del usuario
async function obtenerDatosUsuario(userId) {
    try {
      const data = await GetData.Get(AUTH_URLS.GET_USER_BY_ID(userId));

      mostrarDatosUsuario(data);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

// Mostrar los datos del usuario
function mostrarDatosUsuario(datos) {
  
  console.log("Datos del usuario:", datos);
  const inicialUsuario = document.getElementById('inicial-usuario');
  if (inicialUsuario) {
      inicialUsuario.textContent = datos.name.charAt(0).toUpperCase(); // Muestra la inicial del nombre
  }
}
