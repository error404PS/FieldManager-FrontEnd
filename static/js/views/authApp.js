import { hideSpinner, showSpinner } from "../components/spinners.js";
import { AUTH_URLS, parseJwt } from "../components/utilities.js";
import { renewAccessToken } from "../services/renewAccessToken.js";


document.addEventListener("DOMContentLoaded", function () {
    initializeApp();
});


async function initializeApp(){
    await checkLogin();
    loadPage();
}

//Chequear si el usuario esta logeado o no.

async function checkLogin() {
    const token = await renewAccessToken(localStorage.getItem('token'), localStorage.getItem('refreshToken'));

    if (token){
        loginUser(token);
    }
    else{
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    }
}


//Funciones de la pagina.

function loadPage(){
    document.querySelector("#registerForm a").addEventListener("click", showLoginForm);
    document.querySelector("#loginForm a").addEventListener("click", showRegisterForm);
    document.querySelector("#resetPassword").addEventListener("click", showRestoreForm);
    document.querySelector("#restoreAgain").addEventListener("click", showRestoreForm);
    document.querySelector("#restoreButton").addEventListener("click", handleRestore);

    document.querySelector("#registerForm button").addEventListener("click", function (event) {
        event.preventDefault();
        handleRegister();
    });

    document.querySelector("#loginForm button").addEventListener("click", function (event) {
        event.preventDefault();
        handleLogin();
    });

    document.querySelector("#validateResetForm button").addEventListener("click", function (event) {
        event.preventDefault();
        handleValidateReset();
    });
}

function showRegisterForm() {
    document.getElementById("registerForm").classList.remove("hidden");
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("restoreForm").classList.add("hidden");
    document.getElementById("validateResetForm" ).classList.add("hidden");
}

function showLoginForm() {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
    document.getElementById("restoreForm").classList.add("hidden");
    document.getElementById("validateResetForm" ).classList.add("hidden");
}

function showRestoreForm() {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("restoreForm").classList.remove("hidden");
    document.getElementById("validateResetForm" ).classList.add("hidden");
}

function showRestore() {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("restoreForm").classList.add("hidden");
    document.getElementById("validateResetForm" ).classList.remove("hidden");
}

async function handleRegister() {
    const name = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    let errores = [];

    if (!name) errores.push("Debe proporcionar su nombre.");
    if (!email || !validateEmail(email)) errores.push("Debe proporcionar un email valido.");
    if (!password) errores.push("Debe ingresar una contraseña.");
    if (password.length > 0 && password.length < 8) errores.push("La contraseña debe tener al menos 8 caracteres.");

    if (errores.length > 0) {
        Swal.fire({
            title: "Atención",
            html: errores.join("<br>"),
            icon: "warning",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: 'custom-confirm-button',
                popup: 'custom-swal'
            }
        });
        return;
    }

    try {
        showSpinner();
        const response = await fetch(AUTH_URLS.REGISTER_USER, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        console.log(response.status);
        
        
        if (response.ok) {
            Swal.fire({
                title: "¡Éxito!",
                text: "Su cuenta ha sido creada exitosamente.",
                icon: "success",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'custom-confirm-button',
                    popup: 'custom-swal'
                }
            }).then(() => {
                const form = document.getElementById('registerForm');
                clearAllForm();
                showLoginForm();
            });}
         else {
            // Si el código de estado es 4xx o 5xx, maneja el error
            const errorData = await response.json();
            const errorMessage = errorData.message || "No se pudo crear la cuenta.";
            Swal.fire({
                title: "¡Error!",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'custom-confirm-button',
                    popup: 'custom-swal'
                }
            });
        }
    } catch (error) {
        Swal.fire({
            title: "¡Error!",
            text: "Ocurrió un error inesperado durante el registro.",
            icon: "error",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: 'custom-confirm-button',
                popup: 'custom-swal'
            }
        });
    }
    finally{
        hideSpinner();
    }
}

// Manejo de inicio de sesión
async function handleLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    let errores = [];

    if (!email || !validateEmail(email)) errores.push("Debe proporcionar un email valido.");
    if (!password) errores.push("Debe ingresar su contraseña.");

    if (errores.length > 0) {
        Swal.fire({
            title: "Advertencia",
            html: errores.join("<br>"),
            icon: "warning",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: 'custom-confirm-button',
                popup: 'custom-swal'
            }
        });
        return;
    }

    const loginData = {
        email: email,  // Usamos las variables previamente definidas
        password: password
    };

    try {
        showSpinner();
        const response = await fetch(AUTH_URLS.LOGIN_USER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (!response.ok) {
            // Maneja el error si la respuesta no es exitosa
            const errorData = await response.json();
            const errorMessage = errorData.message || "No se pudo crear la cuenta.";
            Swal.fire({
                title: "¡Error!",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'custom-confirm-button',
                    popup: 'custom-swal'
                }
            });
        } else {
            const data = await response.json();
            // Si el login es exitoso
            Swal.fire({
                title: "¡Éxito!",
                text: 'Has iniciado sesión exitosamente.',
                icon: "success",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'custom-confirm-button',
                    popup: 'custom-swal'
                }
            }).then(() => {
                localStorage.setItem('refreshToken', data.refreshToken); 
                localStorage.setItem('token', data.token);

                console.log('refreshToken:', localStorage.getItem('refreshToken'));
                console.log('token:', localStorage.getItem('token'));

                const params = new URLSearchParams(window.location.search);
                const redirectUrl = params.get('redirect');

                if (redirectUrl) {
                window.location.href = redirectUrl; 
                } else {
                    loginUser(data.token);
                }           
            });
        }
    } catch (error) {
        console.error('Error en la solicitud de login:', error);
        Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Hubo un problema al realizar la solicitud.'
        });
    }finally{
        hideSpinner();
    }
}

async function handleRestore() { 
    const email = document.getElementById("restoreEmail").value.trim();
    if (!email || !validateEmail(email)) {
        Swal.fire({
            title: "Advertencia",
            text: "Debe proporcionar un email valido.",
            icon: "warning",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: 'custom-confirm-button',
                popup: 'custom-swal'
            }
        });
        return;
    }

    try {
        showSpinner();

        const response = await fetch(AUTH_URLS.REQUEST_EMAIL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ Email: email })
        });

        console.log(response.status);

        if (response.status === 200) {
            const data = await response.json();
            Swal.fire({
                title: "¡Éxito!",
                text: "Se envió un código de recuperación a su correo electrónico.",
                icon: "success",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'custom-confirm-button',
                    popup: 'custom-swal'
                }
            });

            // Ocultar el formulario de solicitud de restablecimiento
            document.getElementById("restoreForm").classList.add("hidden");
            // Mostrar el formulario de validación de código
            document.getElementById("validateResetForm").classList.remove("hidden");
        } else {
            const errorData = await response.json();
            Swal.fire({
                title: "¡Error!",
                text: errorData.Message,
                icon: "error",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'custom-confirm-button',
                    popup: 'custom-swal'
                }
            });
        }
    } catch (error) {
        Swal.fire({
            title: "¡Error!",
            text: "Hubo un problema con la solicitud de restablecimiento.",
            icon: "error",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: 'custom-confirm-button',
                popup: 'custom-swal'
            }
        });
    }
    finally{
        hideSpinner();
    }
}

async function handleValidateReset() {
    const email = document.getElementById('restoreEmail').value.trim();
    const code = document.getElementById('resetCode').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmNewPasword = document.getElementById('confirmNewPassword').value.trim();

    let errores = [];

    if (!code) errores.push("Debe ingresar el código.");
    if (!newPassword) errores.push("Debe ingresar su contraseña.");
    if (newPassword.length > 0 && newPassword.length < 8) errores.push("La contraseña debe tener al menos 8 caracteres.");
    if (confirmNewPasword != newPassword) errores.push("Ambas contraseñas deben coincidir");

    if (errores.length > 0) {
        Swal.fire({
            title: "Advertencia",
            html: errores.join("<br>"),
            icon: "warning",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: 'custom-confirm-button',
                popup: 'custom-swal'
            }
        });
        return;
    }

    try {
        showSpinner();

        const response = await fetch(AUTH_URLS.VALIDATE_NEW_PASSWORD, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ Email: email, ResetCode: code, NewPassword: newPassword })
        });

        console.log(response.status);

        console.log(response);

        if (response.status === 200) {
            const data = await response.json();
            Swal.fire({
                title: "¡Éxito!",
                text: data.message,
                icon: "success",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'custom-confirm-button',
                    popup: 'custom-swal'
                }
            }).then(() => {
                document.getElementById("validateResetForm").classList.add("hidden");
                document.getElementById("loginForm").classList.remove("hidden");
                clearAllForm();
            });
        } else {
            const errorData = await response.json();
            Swal.fire({
                title: "¡Error!",
                text: errorData.Message,
                icon: "error",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'custom-confirm-button',
                    popup: 'custom-swal'
                }
            });
        }
    } catch (error) {
        Swal.fire({
            title: "¡Error!",
            text: "Hubo un problema con el restablecimiento de la contraseña.",
            icon: "error",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: 'custom-confirm-button',
                popup: 'custom-swal'
            }
        });
    }finally{
        hideSpinner();
    }
}


function showSwal(icon, title, text) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        confirmButtonText: "OK",
        customClass: {
            confirmButton: 'custom-confirm-button',
            popup: 'custom-swal'
        }
    });
}
//export { handleLogin, handleRegister, handleRestore };

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function clearAllForm() {
    const inputs = document.querySelectorAll('input'); 

    inputs.forEach(input => {
        input.value = ''; 
    });
}


function loginUser(token){
    const payload = parseJwt(token);
    const isAdmin = payload ? payload.IsAdmin === 'True' : false;

    if(isAdmin){
        window.location.href = '../../src/statistics.html';
    }
    else{
        window.location.href = '../../src/reservations.html'
    }
}