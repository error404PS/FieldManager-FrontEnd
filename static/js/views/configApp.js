import { FIELD_URLS, AUTH_URLS, selectFieldImage, parseJwt} from "../components/utilities.js";
import GetData from '../services/getData.js';
import PutData from "../services/putData.js";
import PatchDataWithBody from "../services/patchDataWithBody.js";
import DeleteData from "../services/deleteData.js";
import { fieldConfigRender, renderField, generateDayButtons, handleDayButtons} from "../components/fieldConfigRender.js";
import { showSpinner, hideSpinner } from "../components/spinners.js";
import { showErrorAlertAdmin, showAvailabilityAddSuccesAlert, showFieldAddSuccesAlert,showFieldUpdateSuccesAlert } from "../components/alerts.js";
import PostData from "../services/postData.js";
import { setupLogoutEvent } from "../components/auth.js";

const payload = parseJwt(localStorage.getItem('token'));
const userId = payload ? payload.nameid : null;
const isAdmin = payload ? payload.IsAdmin === 'True' : false;

document.addEventListener('DOMContentLoaded', () =>
    
    initializeApp());

async function initializeApp() {

    console.log('es Admin:', isAdmin);

    if(!isAdmin) {
        window.location.href = '../../src/reservations.html';
        return;
    }

    await obtenerDatosUsuario(userId);
    setupLogoutEvent();
    loadFields() 
    newFieldButton()
}


async function loadFields() {
    
    try{
        showSpinner();

        let fieldData = await GetData.Get(FIELD_URLS.GET_FIELDS);   
   
        await fieldConfigRender(fieldData);
    
        await loadAllSelectFieldTypes();
        
        await loadedFieldsSetOptions();
        

        await fieldsAvailabilitiesDaysEvents(); 
        await updateAllFieldListener();
        await updateFieldAllButtonsEvent();
        await deleteFieldAllButtonEvent()
        await addAvailabilityAllField();
        await AwaitingAvailabilities();  
    }
    catch(error){
        showErrorAlertAdmin();
    }
    finally{
        hideSpinner();
    }
       
}


async function loadAllSelectFieldTypes(){   
    
    let fieldTypes = await fetchFieldTypes();
    
    const selects = document.querySelectorAll('.field-type-select');
    
    selects.forEach(select => {
        loadSelectFieldTypes(select, fieldTypes);
    })
}

async function loadSelectFieldTypes(select, fieldTypes){
    
    fieldTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.description;
        select.appendChild(option);
    })    
};

async function fetchFieldTypes(){
    let fieldTypes = await GetData.Get(FIELD_URLS.GET_FIELDTYPE);
    return fieldTypes;
}

function getSelectFieldType(fieldElement){
    const select = fieldElement.querySelector('.field-type-select');
    return select;
}

async function loadedFieldsSetOptions(){
    const fieldElements = document.querySelectorAll('.field-data-config');
    
    fieldElements.forEach(fieldElement => {
        setFieldSelectOptions(fieldElement);
    })

    
}

function setFieldSelectOptions(fieldElement){

    const fieldData = JSON.parse(fieldElement.getAttribute('data-field'));
    const fieldTypeSelect = fieldElement.querySelector('.field-type-select');      
    fieldTypeSelect.value = fieldData.fieldType.id;
    fieldTypeSelect.defaultValue = fieldTypeSelect.value     
    const fieldSizeSelect = fieldElement.querySelector('.size-select');
    fieldSizeSelect.value = fieldData.size;
    fieldSizeSelect.defaultValue = fieldSizeSelect.value;
}

async function updateFieldAllButtonsEvent() {
    const fieldElements = document.querySelectorAll('.field-data-config');  
    fieldElements.forEach(fieldElement => {
        updateFieldButtonEvent(fieldElement);
    })
}

async function updateFieldButtonEvent(fieldElement){
    const saveButton = fieldElement.querySelector('.save-field-button');
   
    saveButton.addEventListener('click', () =>{
        const fieldId = saveButton.getAttribute('data-field-id');
        const fieldElement = saveButton.closest('.field-data-config');
        updateField(fieldId, fieldElement);
    })
    
}

async function updateField(fieldId, fieldElement){
     
    let name = "";
    const nameInput = fieldElement.querySelector('.update-name');
    if(nameInput.value === ""){
        name = nameInput.defaultValue;
    }else{
        name = nameInput.value;
    }
    
    let size = fieldElement.querySelector('.size-select').value;
    let type = fieldElement.querySelector('.field-type-select').value;
    let fieldToUpdate = {
        name: name,
        size: size,
        fieldType: type
    }

    const updatedField = await PutData.Put(FIELD_URLS.UPDATE_FIELD(fieldId), fieldToUpdate);
    showFieldUpdateSuccesAlert();
    disableSaveFieldButton(fieldElement);
    renderUpdatedField(updatedField, fieldElement);
    
}

function renderUpdatedField(field, fieldElement){

    const nameElement = fieldElement.querySelector('.field-name-preview');
    const sizeElement = fieldElement.querySelector('.field-size-preview');
    const typeElement = fieldElement.querySelector('.field-type-preview');

    const sizeSelect = fieldElement.querySelector('.size-select');
    const typeSelect = fieldElement.querySelector('.field-type-select');
    const nameInput = fieldElement.querySelector('.update-name');

    nameElement.lastChild.textContent = field.name;
    sizeElement.lastChild.textContent = `Tamaño: ${field.size}`;
    typeElement.lastChild.textContent = `Terreno: ${field.fieldType.description}`;

    sizeSelect.value = field.size;
    sizeSelect.defaultValue = field.size;
    
    nameInput.value = field.name;
    nameElement.defaultValue = field.name;

    const options = Array.from(typeSelect.options);
    const matchingOption = options.find(option => option.textContent.trim() === field.fieldType.description);
    
    typeSelect.value = matchingOption.value;
    typeSelect.defaultValue = matchingOption.value;

    const imageUrl = selectFieldImage(field.size, field.fieldType.description);
    const fieldImage = fieldElement.querySelector('.field-image img');
    fieldImage.src = imageUrl; 

}


async function fieldsAvailabilitiesDaysEvents() {
    
    const fieldItems = document. querySelectorAll('.field-data-config .days-buttons button');
    
    fieldItems.forEach(dayButton => {
        dayButton.addEventListener('click', () => {

            fieldItems.forEach(button => {
                button.classList.remove('selected');
                button.disabled = false;
            });

            const selectedDay = dayButton.getAttribute("dayOfWeek");

            dayButton.classList.add('selected');
            dayButton.disabled = true;
            
            
        })
    });

}


async function updateFieldListener(fieldElement){
    
    const selects = fieldElement.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', () =>{         
            enableSaveFieldButton(fieldElement);
        })
    })
    fieldElement.querySelector('.update-name').addEventListener('change', () =>{         
        enableSaveFieldButton(fieldElement);
    })
    fieldElement.querySelector('.update-name').addEventListener('input', () =>{         
        enableSaveFieldButton(fieldElement);
    })

}

function updateAllFieldListener(){
    const fieldElements = document.querySelectorAll('.field-data-config');
    fieldElements.forEach(fieldElement => {
        updateFieldListener(fieldElement);
    })
}

function enableSaveFieldButton(fieldElement){
    const saveButton = fieldElement.querySelector('.save-field-button');
    saveButton.disabled = false;
}

function disableSaveFieldButton(fieldElement){
    const saveButton = fieldElement.querySelector('.save-field-button');
    saveButton.disabled = true;
}



async function deleteFieldButtonEvent(fieldElement){
    const button = fieldElement.querySelector('.delete-field-button');
    button.addEventListener('click', () => {
        const fieldJson = JSON.parse(button.getAttribute('data-field'));
        showAlertDeleteField(fieldJson);
    })
}

async function deleteFieldAllButtonEvent(){
    const fieldElements = document.querySelectorAll('.field-data-config');
    fieldElements.forEach(fieldElement => {
        deleteFieldButtonEvent(fieldElement);
    })
}

async function addAvailabilityAllField(){
    const fieldElements = document.querySelectorAll('.field-data-config');
    fieldElements.forEach(fieldElement => {
        addAvailability(fieldElement);
    })   
}

async function addAvailability(fieldElement){
    const button = fieldElement.querySelector('.add-availability-button');
    button.addEventListener('click', () => {
        const buttonsContainer = fieldElement.querySelector('.day-buttons');
        showForm(fieldElement, buttonsContainer);
    })
}

async function AwaitingAvailabilities() { 
    const events = document.querySelectorAll('.field-data-config .availabilities-container');
    events.forEach(event => {
        event.addEventListener('availabilitiesRendered', () => {
            editAvailability();
            deleteAvailability();
        })
    })
    
}

async function editAvailability(){
    const editButtons = document.querySelectorAll('.field-data-config .edit-availability');    
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const availability = button.getAttribute('data-availability');
            const availabilityObject = JSON.parse(availability);
            const fieldElement = button.closest('.field-data-config');        
            const buttonsContainer = fieldElement.querySelector('.day-buttons');
            showEditAvailabilityForm(availabilityObject, fieldElement, buttonsContainer);
        })
    })
}



async function showEditAvailabilityForm(availability, fieldElement, buttonsContainer){
    
    
    Swal.fire({
        title: 'Editar Disponibilidad',
        html: `
            <div class="flex justify-center items-center bg-gray-900"> <!-- Centrado en pantalla -->
                <div class="space-y-8 w-full"> <!-- Tamaño ajustado del formulario -->
                    <!-- Hora de inicio -->
                    <div class="flex flex-col items-start py-6">
                        <label for="startHour" class="text-2xl text-white mb-4 flex items-start text-left">
                            <i class="material-icons mr-4">schedule</i>Hora de Inicio
                        </label>
                        <input type="time" id="openHour" class="border-palette-primary-color bg-palette-tertiary-color text-white border rounded-lg w-full h-16 text-xl px-8 py-4 focus:outline-none focus:ring-2 focus:ring-green-500" value="${availability.openHour}" step="3600" oninput="this.value = this.value.replace(/:[0-9]{2}/, ':00')">
                    </div>

                    <!-- Hora de finalización -->
                    <div class="flex flex-col items-start py-6">
                        <label for="endHour" class="text-2xl text-white mb-4 flex items-start text-left">
                            <i class="material-icons mr-4">schedule</i>Hora de Finalización                                                                                                                                                      
                        </label>
                        <input type="time" id="closeHour" class="border-palette-primary-color bg-palette-tertiary-color text-white border rounded-lg w-full h-16 text-xl px-8 py-4 focus:outline-none focus:ring-2 focus:ring-green-500" value="${availability.closeHour}" step="3600" oninput="this.value = this.value.replace(/:[0-9]{2}/, ':00')">
                    </div>

                </div>
            </div>

        `,
        heightAuto: false, // Evita el ajuste automático de altura
        scrollbarPadding: false, // Evita desplazamiento relacionado con el scroll
        width: '500px',
        reverseButtons: true,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Guardar',
        customClass: {  
            popup: 'custom-swal w-auto max-w-2xl', // Mayor tamaño de la alerta
            cancelButton: 'custom-cancel-button',
            confirmButton: 'custom-confirm-button'
        },
        allowOutsideClick: true,
        allowEscapeKey: true,
        scrollbarPadding: false,
        preConfirm: () => {
            const day = availability.day;
            const openHour = document.getElementById('openHour').value;
            const closeHour = document.getElementById('closeHour').value; 
            
            if (!day || !openHour || !closeHour) {
                Swal.showValidationMessage('Por favor, completa todos los campos.');
                return false;
            }

            return {
                day,
                openHour,
                closeHour
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const availabilityToUpdate = result.value;           
            availability.openHour = availabilityToUpdate.openHour
            availability.closeHour = availabilityToUpdate.closeHour
            editAvailabilityHandler(availability, fieldElement, buttonsContainer);
        }
    });
    
}

async function showForm(fieldElement, buttonsContainer) {
    const result = await Swal.fire({
        title: 'Agregar disponibilidad',
        html: `
            <div class="flex justify-center items-center bg-gray-900"> <!-- Centrado en pantalla -->
                <div class="space-y-8 w-full"> <!-- Tamaño ajustado del formulario -->
                    <!-- Día de la semana -->
                    <div class="flex flex-col items-start py-6"> <!-- items-start para alinear el label arriba -->
                        <label for="dayOfWeek" class="text-2xl text-white mb-4 flex items-start text-left"><i class="material-icons mr-4">calendar_today</i>Dia</label>
                        <select id="day" class="border-palette-primary-color bg-palette-tertiary-color text-white border rounded-lg w-full h-16 text-xl px-8 py-4 focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="">Seleccione un dia</option>
                            <option value="Monday">Lunes</option>
                            <option value="Tuesday">Martes</option>
                            <option value="Wednesday">Miércoles</option>
                            <option value="Thursday">Jueves</option>
                            <option value="Friday">Viernes</option>
                            <option value="Saturday">Sábado</option>
                            <option value="Sunday">Domingo</option>
                        </select>
                    </div>

                    <!-- Hora de inicio -->
                    <div class="flex flex-col items-start py-6">
                        <label for="openHour" class="text-2xl text-white mb-4 flex items-start text-left">
                            <i class="material-icons mr-4">schedule</i>Hora de Inicio
                        </label>
                        <input type="time" id="openHour" class="border-palette-primary-color bg-palette-tertiary-color text-white border rounded-lg w-full h-16 text-xl px-8 py-4 focus:outline-none focus:ring-2 focus:ring-green-500" value="00:00" step="3600" oninput="this.value = this.value.replace(/:[0-9]{2}/, ':00')">
                    </div>

                    <div class="flex flex-col items-start py-6">
                        <label for="closeHour" class="text-2xl text-white mb-4 flex items-start text-left">
                            <i class="material-icons mr-4">schedule</i>Hora de Finalización
                        </label>
                        <input type="time" id="closeHour" class="border-palette-primary-color bg-palette-tertiary-color text-white border rounded-lg w-full h-16 text-xl px-8 py-4 focus:outline-none focus:ring-2 focus:ring-green-500" value="00:00" step="3600" oninput="this.value = this.value.replace(/:[0-9]{2}/, ':00')">
                    </div>

                </div>
            </div>

            

        `,
        heightAuto: false, 
        scrollbarPadding: false, 
        width: '500px',
        icon: 'info',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Guardar',
        reverseButtons: true,
        customClass: {
            popup: 'custom-swal w-auto max-w-2xl', // Mayor tamaño de la alerta
            cancelButton: 'custom-cancel-button',
            confirmButton: 'custom-confirm-button'
        },
        allowOutsideClick: true,
        allowEscapeKey: true,
        preConfirm: () => {
            const day = document.getElementById('day').value;
            const openHour = document.getElementById('openHour').value;
            const closeHour = document.getElementById('closeHour').value;
    
            // Validar que todos los campos estén completos
            if (!day || !openHour || !closeHour) {
                Swal.showValidationMessage('Por favor, completa todos los campos.');
                return false;
            }
    
            return { openHour, closeHour, day };
        }
    });

    if (result.isConfirmed) {
        const availability = result.value;     
        await addAvailabilityToField(availability, fieldElement, buttonsContainer);
    }
}

async function showCreateFieldForm() {

    const result = await Swal.fire({
        title: 'Crear Cancha',
        html: `
            <div class="flex justify-center items-center bg-gray-900">
                <div class="space-y-8 w-full">

                    <!-- Nombre -->
                    <div class="flex flex-col items-start py-6">
                        <label for="nameField" class="text-2xl text-white mb-4 flex items-start text-left">
                            Nombre
                        </label>
                        <input type="text" id="newFieldName" placeholder="Escriba un nombre para la cancha" class="border-palette-primary-color bg-palette-tertiary-color text-white border rounded-lg w-full h-16 text-xl px-8 py-4 focus:outline-none focus:ring-2 focus:ring-green-500">
                    </div>

                    <div class="flex gap-6">
                        <!-- Tamaño -->
                        <div class="flex mr-4 flex-col items-start flex-1">
                            <label for="sizeField" class="text-2xl text-white mb-4 flex items-center">
                                <i class="material-icons mr-2">group</i> Tamaño
                            </label>
                            <select id="sizeField" class="border-palette-primary-color bg-palette-tertiary-color text-white border rounded-lg h-16 text-xl px-8 py-4 focus:outline-none focus:ring-2 focus:ring-green-500">
                                <option value="" disabled hidden>Seleccione</option>
                                <option value="5">5</option>
                                <option value="7">7</option>
                                <option value="11">11</option>
                            </select>
                        </div>

                        <!-- Terreno -->
                        <div class="flex flex-col items-start flex-1">
                            <label for="terrainField" class="text-2xl text-white mb-4 flex items-center">
                                <i class="material-icons mr-2">grass</i> Terreno
                            </label>
                            <select id="terrainField" class="field-type-select border-palette-primary-color bg-palette-tertiary-color text-white border rounded-lg w-full h-16 text-xl px-8 py-4 focus:outline-none focus:ring-2 focus:ring-green-500">
                                <option value="" disabled hidden>Seleccione</option>
                            </select>
                        </div>
                    </div>

                </div>
            </div>
        `,
        width: '500px',
        heightAuto: false, 
        scrollbarPadding: false, 
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Guardar',
        customClass: {
            popup: 'custom-swal w-auto max-w-2xl',
            cancelButton: 'custom-cancel-button',
            confirmButton: 'custom-confirm-button'
        },
        allowOutsideClick: true,
        allowEscapeKey: true,
        didOpen: async () => {
            await selecttypes();
        },
        preConfirm: () => {
            
            const name = document.getElementById('newFieldName').value;
            const size = document.getElementById('sizeField').value;
            const fieldType = document.getElementById('terrainField').value;

            if (!name || !size || !fieldType) {
                Swal.showValidationMessage('Por favor, completa todos los campos.');
                return false;
            }

            return {
                name,
                size,
                fieldType
            };
        }       

    })
    
    if(result.isConfirmed){
        const formData = result.value;    
        await addField(formData);
    }
}






async function editAvailabilityHandler(availability, fieldElement, buttonsContainer){
    
    try{
        showSpinner();

        const availabilityToUpdate = {
            day: availability.day,
            openHour: availability.openHour,
            closeHour: availability.closeHour
        }     

        const updatedAvailability = await PutData.Put(FIELD_URLS.UPDATE_AVAILABILITY(availability.id), availabilityToUpdate);
        
        let fieldJson = JSON.parse(fieldElement.getAttribute('data-field'));

        fieldJson.availabilities = fieldJson.availabilities.map(existingAvailability =>
            existingAvailability.id === updatedAvailability.id ? updatedAvailability : existingAvailability
        );

        fieldElement.setAttribute('data-field', JSON.stringify(fieldJson));

        
        generateDayButtons(buttonsContainer, fieldJson);

        const selectedDayButton = buttonsContainer.querySelector(`[dayOfWeek="${updatedAvailability.day}"]`);
        if (selectedDayButton) {
            selectedDayButton.click();
        }
               
        showAvailabilityAddSuccesAlert();


    }catch(error){
        
        showErrorAlertAdmin();
        
    }finally{

        hideSpinner();
    }


    
        
}

async function addAvailabilityToField(availability, fieldElement,  buttonsContainer) {   
    try {
        showSpinner();

        let fieldJson = JSON.parse(fieldElement.getAttribute('data-field'));

        const newAvailability = await PatchDataWithBody.Patch(FIELD_URLS.CREATE_AVAILABILITY(fieldJson.id), availability);  
       
        fieldJson.availabilities.push(newAvailability);     
        
        fieldElement.setAttribute('data-field', JSON.stringify(fieldJson));

        generateDayButtons(buttonsContainer, fieldJson);
        
        const selectedDayButton = buttonsContainer.querySelector(`[dayOfWeek="${newAvailability.day}"]`);
        if (selectedDayButton) {
            selectedDayButton.click();
        }

        showAvailabilityAddSuccesAlert();
    } catch (error) {      
        showErrorAlertAdmin();
    } finally {     
        hideSpinner();
    }
}

function newFieldButton(){
    const button = document.querySelector('#new-field');
    button.addEventListener('click', showCreateFieldForm);
}


async function selecttypes() {
    // Llamada a la API para obtener los tipos de campo
    let fieldTypes = await GetData.Get(FIELD_URLS.GET_FIELDTYPE);

    // Selecciona el elemento terrainField dentro del contexto de SweetAlert
    const select = document.querySelector('#terrainField');

    // Crea las opciones dinámicamente y añádelas al select
    fieldTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.description;
        select.appendChild(option);
    });
}

async function addField(formData){
   

    try{
        showSpinner();

        const field = await PostData.Post(FIELD_URLS.CREATE_FIELD, formData);
        
        const fieldList = document.querySelector('.field-list-config');      

        renderField(fieldList, field);

        const fieldElement = fieldList.querySelector(`.field-data-config[field-id="${field.id}"]`);

        loadDataNewField(fieldElement);

        showFieldAddSuccesAlert();
    }catch(error){
        showErrorAlertAdmin();
    }finally{
        hideSpinner();
    }   
    
    


}

async function loadDataNewField(fieldElement){
    
    const select = getSelectFieldType(fieldElement);
    const fieldTypes =  await fetchFieldTypes();
    await loadSelectFieldTypes(select, fieldTypes);
    await setFieldSelectOptions(fieldElement);
    await deleteFieldButtonEvent(fieldElement);
    await updateFieldListener(fieldElement);
    await updateFieldButtonEvent(fieldElement);
    await addAvailability(fieldElement);
    await AwaitingAvailabilities(); 
}

async function deleteAvailability(){
    const deleteButtons = document.querySelectorAll('.field-data-config .delete-availability');    
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const availability = button.getAttribute('data-availability');
            const availabilityJson = JSON.parse(availability);            
            const fieldElement = button.closest('.field-data-config');        
            const buttonsContainer = fieldElement.querySelector('.day-buttons');
            showDeleteAvailabilityAlert(availabilityJson, fieldElement, buttonsContainer);
        })
    })
}
      
async function showDeleteAvailabilityAlert(availabilityJson, fieldElement, buttonsContainer) {
    
    Swal.fire({
        title: '¿Estás seguro de eliminar esta disponibilidad?',
        text: `Horario: ${availabilityJson.openHour} - ${availabilityJson.closeHour}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        heightAuto: false, 
        scrollbarPadding: false, 
        customClass: {
            confirmButton: 'custom-cancel-button',
            cancelButton: 'custom-confirm-button',
            popup: 'custom-swal'
        },
    }).then(async (result) => {
        if (result.isConfirmed) {
            deleteAvailabilityHandler(availabilityJson, fieldElement, buttonsContainer);
        }
    });
}

async function deleteAvailabilityHandler(availabilityJson, fieldElement, buttonsContainer){
    try{
        showSpinner();

        const fieldJson = JSON.parse(fieldElement.getAttribute('data-field'));

        await DeleteData.Delete(FIELD_URLS.DELETE_AVAILABILITY(availabilityJson.id));

        fieldJson.availabilities = fieldJson.availabilities.filter(avail => avail.id !== availabilityJson.id);
             
        fieldElement.setAttribute('data-field', JSON.stringify(fieldJson));

        const availabilitiesFromDay = fieldJson.availabilities.filter(avail => avail.day === availabilityJson.day);

        const selectedDayButton = buttonsContainer.querySelector(`[dayOfWeek="${availabilityJson.day}"]`);

        if(availabilitiesFromDay.length > 0){

            generateDayButtons(buttonsContainer, fieldJson);

            let newDayButton = buttonsContainer.querySelector(`[dayOfWeek="${availabilityJson.day}"]`);
            
            newDayButton.click();
        }else{
            
            handleDayButtons(selectedDayButton, buttonsContainer, fieldJson);
            
            selectedDayButton.remove();
        }

    }
    catch (error) {
        console.error('Error al eliminar la disponibilidad:', error);
        showErrorAlertAdmin();
    } finally {
        hideSpinner();
    }
}



function showAlertDeleteField(field) {
    Swal.fire({
        title: `¿Seguro que quieres eliminar la cancha ${field.name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        heightAuto: false, 
        scrollbarPadding: false,
        customClass: {
            confirmButton: 'custom-cancel-button',
            cancelButton: 'custom-confirm-button',
            popup: 'custom-swal'
        },
    }).then(async (result) => {
        if (result.isConfirmed) {
            deleteFieldHandler(field);
        }
    });
}

async function deleteFieldHandler(field){
    try {
        showSpinner();
        
        await DeleteData.Delete(FIELD_URLS.DELETE_FIELD(field.id));
 
        document.querySelector(`[field-id="${field.id}"]`).remove();

        Swal.fire({
            title: '¡La cancha ha sido eliminada!',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            heightAuto: false, 
            scrollbarPadding: false,
            customClass: {
                confirmButton: 'custom-confirm-button',
                popup: 'custom-swal'
            },
            allowOutsideClick: true, 
            allowEscapeKey: true
        });

    } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar la cancha', 'error');
    } finally {
        hideSpinner();
    }
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
        hideSpinner();
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