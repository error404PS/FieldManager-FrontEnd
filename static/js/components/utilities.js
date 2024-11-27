//Urls Microservicios

const BASE_FIELD_URL = 'https://localhost:7267/api/v1';

const BASE_RESERVATION_URL = 'https://localhost:7295/api';

const BASE_AUTH_URL = 'https://localhost:7130/api/v1';


//Para realizar llamadas a las URL
//Field

export const FIELD_URLS = {
    GET_FIELDS: `${BASE_FIELD_URL}/Field`,
    CREATE_FIELD: `${BASE_FIELD_URL}/Field`,
    GET_FIELDS_BY_ID: (id) => `${BASE_FIELD_URL}/Field/${id}`,
    UPDATE_FIELD: (id) => `${BASE_FIELD_URL}/Field/${id}`,
    CREATE_AVAILABILITY: (id) => `${BASE_FIELD_URL}/Field/${id}/Availability`,
    UPDATE_AVAILABILITY: (id) => `${BASE_FIELD_URL}/Availability/${id}`,
    DELETE_AVAILABILITY: (id) => `${BASE_FIELD_URL}/Availability/${id}`,
    GET_FIELDTYPE: `${BASE_FIELD_URL}/FieldType`,
    GET_FIELDTYPE_BY_ID: (id) => `${BASE_FIELD_URL}/FieldType/${id}`,
    DELETE_FIELD: (id) => `${BASE_FIELD_URL}/Field/${id}`
}

//Reservation

export const RESERVATION_URLS = {
    GET_RESERVATION: `${BASE_RESERVATION_URL}/Reservation`,
    CREATE_RESERVATION: `${BASE_RESERVATION_URL}/Reservation`,
    GET_RESERVATION_BY_ID: (id) => `${BASE_RESERVATION_URL}/Reservation/${id}`,
    UPDATE_RESERVATION: (id) => `${BASE_RESERVATION_URL}/Reservation/${id}`,
    DELETE_RESERVATION: (id) => `${BASE_RESERVATION_URL}/Reservation/${id}`,
    DELETE_RESERVATION_PLAYER: (id, pid) => `${BASE_RESERVATION_URL}/Reservation/${id}/Player/${pid}`,
    CREATE_RESERVATION_PLAYER: `${BASE_RESERVATION_URL}/Reservation/add-player`,
    GET_RESERVATION_PLAYER: `${BASE_RESERVATION_URL}/Reservation/Reservation-player`,
    GET_RESERVATION_STATUS: `${BASE_RESERVATION_URL}/ReservationStatus`
}

//Auth

export const AUTH_URLS = {
    REGISTER_USER: `${BASE_AUTH_URL}/Auth/Register`,
    LOGIN_USER: `${BASE_AUTH_URL}/Auth/Login`,
    REFRESH_TOKEN: `${BASE_AUTH_URL}/Auth/RefreshToken`,
    SIGNOUT_USER: `${BASE_AUTH_URL}/Auth/SignOut`,
    CHANGE_PASSWORD: `${BASE_AUTH_URL}/Auth/ChangePassword`,
    REQUEST_EMAIL: `${BASE_AUTH_URL}/Auth/request`,
    VALIDATE_NEW_PASSWORD: `${BASE_AUTH_URL}/Auth/validate`,
    GET_USER: `${BASE_AUTH_URL}/User`,
    GET_USER_BY_ID: (id) => `${BASE_AUTH_URL}/User/${id}`,
    DELETE_USER: (id) => `${BASE_AUTH_URL}/User/${id}`,
    UPDATE_USER: (id) => `${BASE_AUTH_URL}/User/${id}`,
    REMOVE_USERIMAGE: (id) => `${BASE_AUTH_URL}/User/RemoveImage/${id}`
}

//Days

export function getDayFromDate(dateInput){
   
    const date = new Date(dateInput);
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const dayOfWeek = daysOfWeek[date.getDay()];

    return dayOfWeek
}

export function convertTimeSpanToHHMM(timeSpan) {
    
    const [hours, minutes] = timeSpan.split(':');
    return `${hours}:${minutes}`;
}


export const daysInSpanish = {
    "Sunday": "Domingo",
    "Monday": "Lunes",
    "Tuesday": "Martes",
    "Wednesday": "Miércoles",
    "Thursday": "Jueves",
    "Friday": "Viernes",
    "Saturday": "Sábado"
};

export function parseJwt(token) {
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

export function generateLink(result){
    const baseURL = `${window.location.protocol}//${window.location.host}`;
    const link = `${baseURL}/src/reservations.html?id=${result.reservationID}`;
    console.log(link);
    return link
}


const fieldImagesDictionary = {
    "5_sintetico": "../img/field5sintetico_image.jpg",
    "7_sintetico": "../img/field7sintetico_image.jpg",
    "11_sintetico": "../img/field11sintetico_image.jpg",
    "5_pasto": "../img/field5pasto_image.jpg",
    "7_pasto": "../img/field7pasto_image.jpg",
    "11_pasto": "../img/field11pasto_image.jpg",
    "5_Cemento": "../img/field5cemento_image.png",
    "7_Cemento": "../img/field7cemento_image.jpg",
    "11_Cemento": "../img/field11cemento_image.jpg"
}

export function selectFieldImage(size, type){
    const key = `${size}_${type}`;
    return fieldImagesDictionary[key];
}

   
