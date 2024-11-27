import { setupPasswordFormHandler , togglePasswordForm} from "../components/changePass.js";
import { AUTH_URLS } from "../components/utilities.js";
import { showSpinner, hideSpinner } from "../components/spinners.js";
import GetData from "../services/getData.js";
import { renewAccessToken } from "../services/renewAccessToken.js";
import { setupLogoutEvent, logout } from "../components/auth.js"

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


document.addEventListener('DOMContentLoaded', () => initializeApp());

async function initializeApp() {
      //Chequeo si el usuario que ingreso es admin
      console.log('es Admin:', isAdmin);

      if(isAdmin) {
          window.location.href = '../../src/statistics.html';
          return;
      }

    
    setupLogoutEvent();
    setupPasswordFormHandler();
    togglePasswordButton();
    getUserInfo();
    setEditUserButton();
    setCancelEditButton();
    saveChangesEvent();
}

function togglePasswordButton() {
    const toggleButton = document.getElementById('toggle-password-btn');
    const toggleIcon = document.getElementById('toggle-icon'); 

    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            togglePasswordForm();

            if (toggleIcon.textContent === 'keyboard_double_arrow_down') {
                toggleIcon.textContent = 'keyboard_double_arrow_up'; 
            } else {
                toggleIcon.textContent = 'keyboard_double_arrow_down'; 
            }
        });
    }
}


async function getUserInfo(){
    try {
        showSpinner();

        const userInfo = await GetData.Get(AUTH_URLS.GET_USER_BY_ID(userId));
    
        hideSpinner();
    
        if (userInfo) {
            document.querySelector('.username').textContent = userInfo.name;  
            document.querySelector('.email').textContent = userInfo.email;
            mostrarDatosUsuario(userInfo);  
        }
        else{
            throw new Error('No se pudo obtener la información del usuario.');
        }
    } catch (error){
        console.error('Error al obtener la información del usuario:', error);

        errorAlert('Ha ocurrido un error inesperado. Por favor, intente ingresar nuevamente más tarde.');
    } finally {
        hideSpinner();
    }
}


function setEditUserButton() {
    const editButton = document.getElementById('edit-user-btn');
    const editForm = document.getElementById('edit-user-form');
    const userDetails = document.querySelector('.grid');  

    if (editButton && editForm) {
        editButton.addEventListener('click', () => {
            showEditForm(editButton, editForm, userDetails);
        });
    }
}

function setCancelEditButton() {
    const cancelButton = document.getElementById('cancel-changes-btn');
    const editForm = document.getElementById('edit-user-form');
    const userDetails = document.querySelector('.grid');  
    const editButton = document.getElementById('edit-user-btn');

    if (cancelButton && editForm) {
        cancelButton.addEventListener('click', () => {
            hideEditForm(editButton, editForm, userDetails);
        });
    }
}

function showEditForm(editButton, editForm, userDetails) {
    editForm.classList.remove('hidden');
    editButton.classList.add('hidden');
    userDetails.classList.add('hidden');

    document.getElementById('username').value = document.querySelector('.username').textContent;
    document.getElementById('email').value = document.querySelector('.email').textContent;
}

function hideEditForm(editButton, editForm, userDetails) {
    editForm.classList.add('hidden'); 
    editButton.classList.remove('hidden'); 
    userDetails.classList.remove('hidden'); 
}

function saveChangesEvent() {
    const saveButton = document.getElementById('save-changes-btn');
    if (saveButton) {
        saveButton.addEventListener('click', (e) => {
            e.preventDefault();
            updateUser(userId); 
        });
    }
}


async function updateUser(userId){
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const editForm = document.getElementById('edit-user-form');
    const userDetails = document.querySelector('.grid');
    const editButton = document.getElementById('edit-user-btn');

    // Captura los valores del formulario
    const userName = usernameInput.value.trim();
    const userEmail = emailInput.value.trim();
    const userImageURL = "";

    //Validaciones

    if (!userName || !userEmail) {
        errorAlert("Todos los campos son obligatorios.");
        return;
    }

    if (!validateEmail(userEmail)) {
        errorAlert("Por favor, introduce un correo electrónico válido.");
        return;
    }

    const requestBody = {
        name: userName,
        email: userEmail,
        imageURL: userImageURL
    };

    try{

        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');

        console.log('TokenViejo:', token);
        console.log('TokenRefreshViejo:', refreshToken);

        showSpinner();

        let response = await fetch(AUTH_URLS.UPDATE_USER(userId), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });
        console.log(response.status);

        if (response.status === 401) {

            const newToken = await renewAccessToken(token, refreshToken);

            if (newToken) {
                response = await fetch(AUTH_URLS.UPDATE_USER(userId), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newToken}`
                    },
                    body: JSON.stringify(requestBody)
                });
            } else {
                console.log('No se pudo renovar el token, cerrando sesión.');
                await logout();
            }
        }

        hideSpinner();

        if (response.ok){
            successAlert();

            document.querySelector('.username').textContent = userName;
            document.querySelector('.email').textContent = userEmail;

            const inicialUsuario = document.getElementById('inicial-usuario');
            if (inicialUsuario) {
                inicialUsuario.textContent = document.querySelector('.username').textContent.charAt(0).toUpperCase(); // Muestra la inicial del nombre
            }

            hideEditForm(editButton, editForm, userDetails);
        }
        else {
            const error = await response.json();
            errorAlert(error.message);
        }
    }
    catch (error) {
        console.error('Error en la solicitud:', error);
        errorAlert('Hubo un problema al procesar la solicitud. Inténtelo nuevamente.');

    }
    finally{
        hideSpinner();
    }
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

function successAlert() {
    if (Swal.isVisible()) {
        return;
    };

    Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: '¡Tus datos han sido actualizados exitosamente!',
        customClass: {
            confirmButton: 'custom-confirm-button',
            popup: 'custom-swal'
        },
    });
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


// Mostrar los datos del usuario
function mostrarDatosUsuario(datos) {
    
    console.log("Datos del usuario:", datos);
    const inicialUsuario = document.getElementById('inicial-usuario');
    if (inicialUsuario) {
        inicialUsuario.textContent = datos.name.charAt(0).toUpperCase(); // Muestra la inicial del nombre
    }
}


