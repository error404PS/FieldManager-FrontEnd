import { AUTH_URLS, FIELD_URLS, RESERVATION_URLS,getDayFromDate, generateLink, parseJwt } from "../components/utilities.js";
import GetData from '../services/getData.js';
import PostData from "../services/postData.js";
import { fieldRender  } from "../components/fieldRender.js";
import { hideSpinner, showSpinner } from "../components/spinners.js";
import { showErrorAlert, showReservationSuccess} from "../components/alerts.js";
import { setupLogoutEvent } from "../components/auth.js";

// Función para decodificar el JWT y obtener el payload

const payload = parseJwt(localStorage.getItem('token'));
const userId = payload ? payload.nameid : null;
const isAdmin = payload ? payload.IsAdmin === 'True' : false;

document.addEventListener('DOMContentLoaded', () => initializeApp());

async function initializeApp() {
    //Chequeo si el usuario que ingreso es admin
    console.log('es Admin:', isAdmin);

    if(isAdmin) {
        window.location.href = '../../src/statistics.html';
        return;
    }
    await obtenerDatosUsuario(userId);
    setupLogoutEvent();
    showCalendar();
    SearchField();
    selectDate();   
    loadDateSelection();
}

function showCalendar (){ 
    document.getElementById("calendar-icon").addEventListener("click", function() {
    document.getElementById("date-search").showPicker();             
    }); 
}

function validateDate(dateValue, searchButton) {
    const selectedDate = new Date(dateValue + 'T00:00:00'); 
    const currentDate = new Date();

    currentDate.setHours(0, 0, 0, 0);

    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate >= currentDate) {
        searchButton.disabled = false;
    } else {
        searchButton.disabled = true;
    }
}


function selectDate() {
    const dateInput = document.getElementById('date-search');
    const searchButton = document.getElementById('searchDate');
    
    dateInput.addEventListener('change', function() {
        validateDate(dateInput.value, searchButton); 
    });

    validateDate(dateInput.value, searchButton);
}

function SearchField(){
    const searchButton = document.getElementById('searchDate');
    searchButton.addEventListener('click', () => {
        const searchValue = document.getElementById('date-search').value;
        loadFields(searchValue);
    });
}



async function loadFields(dateFilter) {

    localStorage.setItem('Fecha', dateFilter);

    try {
        
        showSpinner();
        const [fieldData, reservationData] = await Promise.all([
            GetData.Get(FIELD_URLS.GET_FIELDS),
            GetData.Get(`${RESERVATION_URLS.GET_RESERVATION}?${new URLSearchParams({ date: dateFilter }).toString()}`)
        ]);

        if(fieldData && reservationData){
            
            const day = getDayFromDate(dateFilter);

            let filteredFields = fieldData.filter(field =>
                field.availabilities.some(availability => availability.day === day)
            );

            console.log('Canchas DISPONIBLES DOMINGO:', filteredFields);

            console.log("Reservas:", reservationData);

            const activeReservations = reservationData.filter(reservation => reservation.status.id === 1);
       
            fieldRender(filteredFields, activeReservations, day);

            createReservation();
        
            checkFields();
        }     
    } catch (error) {
        console.error("Error al cargar los campos o las reservas:", error);
        showErrorAlert();   
    } finally{
        hideSpinner();
    }
}


async function checkFields(){
    const ulElement = document.querySelector('.field-list');
    const liCount = ulElement.querySelectorAll('.field-data').length; 
    console.log("Número de elementos <li> en la lista:", liCount);

    if (liCount < 1){

        const noItemsMessage = document.createElement('li');
        noItemsMessage.className = 'no-items-message text-white text-left text-xl py-4';
        noItemsMessage.textContent = 'No hay canchas disponibles.';

        ulElement.appendChild(noItemsMessage);
    }
    else{
        fieldsButtonsEvents();
    }
}

async function fieldsButtonsEvents() {
    
    const fieldItems = document.querySelectorAll('.field-data .time-buttons button');

    fieldItems.forEach(timeButton => {
        timeButton.addEventListener('click', () => {

            fieldItems.forEach(button => {
                button.classList.remove('selected');
                button.disabled = false;
            });

            const selectedTime = timeButton.getAttribute("data-time");
            console.log("Hora seleccionada: " + selectedTime);

            timeButton.classList.add('selected');
            timeButton.disabled = true;
            

            const fieldElement = timeButton.closest('.field-data');
            enableReservationButton(fieldElement);
        })
    });
}



function enableReservationButton(fieldElement){
    const reservationButton = fieldElement.querySelector('.create-Reservation');
    reservationButton.disabled = false;
}

async function generateReservation(fieldID, fieldData) {

    try{
        showSpinner();

        const dateString = localStorage.getItem('Fecha');

        console.log('fecha local storage:', dateString);

        const date = new Date(dateString);   
        const day = date.getUTCDate();   
        const month = date.getMonth() + 1;
        const year = date.getFullYear(); 
        const startHourContainer = fieldData.querySelector('.time-buttons .selected');
        const startHourValue = parseInt(startHourContainer.getAttribute('data-time'));
        const endHour = startHourValue + 1;   
        const maxPlayersContainer = fieldData.querySelector('.max-player-input');
        const maxPlayer = maxPlayersContainer.value;
        
        const payload = parseJwt(localStorage.getItem('token'));
        const userId = payload ? payload.nameid : null;
        
        const reservationData = {
            fieldID: fieldID,
            userId: userId,
            day: day,
            month: month,
            year: year,
            startHour: startHourValue,
            endHour: endHour,
            maxJugadores: maxPlayer
        }

        const result = await PostData.Post(RESERVATION_URLS.CREATE_RESERVATION, reservationData);
        const invitationLink = generateLink(result)
        showReservationSuccess(invitationLink);

    } catch (error){
        showErrorAlert();
    } finally {
        hideSpinner();
    }
             
}

function createReservation(){
    const createReservationButton = document.querySelectorAll('.create-Reservation');
    createReservationButton.forEach(button => {
        button.addEventListener('click', () =>{
            const fieldId = button.getAttribute('data-field-id');
            const fieldData = button.closest('.field-data');
            generateReservation(fieldId, fieldData);
        });
    });
}

function loadDateSelection() {
    const date = localStorage.getItem('selectedDate');
    const dateSelect = document.getElementById("date-search");
    const token = localStorage.getItem("refreshToken"); 

    if (!token) {
        
        redirectToLogin();
        return;
    }
    if (date) {
        console.log(`fecha seleccionada: ${date}`);
        dateSelect.value = date;
        loadFields(date); 
        localStorage.removeItem('selectedDate');
    }
    
}

function redirectToLogin() {
    const currentUrl = window.location.href; 
    const loginUrl = `auth.html?redirect=${encodeURIComponent(currentUrl)}`;

    window.location.href = loginUrl;
}


// Obtener datos del usuario
async function obtenerDatosUsuario(userId) {
      try {
        
        showSpinner();

        const data = await GetData.Get(AUTH_URLS.GET_USER_BY_ID(userId));
  
        hideSpinner();

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







