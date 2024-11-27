import {sendWhatsAppMessage} from '../components/contact.js';

document.addEventListener('DOMContentLoaded', () => initializeApp());

function initializeApp() {
    showCalendar();
    login();
    contact();
    selectDate();
}
function showCalendar (){ 
    document.getElementById("calendar-icon").addEventListener("click", function() {
    document.getElementById("dateInput").showPicker();             
    }); 
}

function contact(){
    const contact = document.getElementById('contact');
    contact.addEventListener('click',  sendWhatsAppMessage   );
}

function login() {
    const login = document.getElementById('loginButton');
    
    login.addEventListener('click', loginScreen);
}

function loginScreen(){
    window.location.href = '../../src/auth.html';
}

function selectDate() {
    const dateInput = document.getElementById('dateInput');
    const buttonDate = document.getElementById('buttonDate');

    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    dateInput.addEventListener('change', function () {
        const selectedDate = new Date(dateInput.value);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); 

        if (selectedDate >= currentDate) {
            buttonDate.disabled = false; 
        } else {
            buttonDate.disabled = true; 
        }
    });
}