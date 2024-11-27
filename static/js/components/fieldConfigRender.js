import { daysInSpanish, selectFieldImage } from "./utilities.js";


export async function fieldConfigRender(fieldData) {
    const fieldList = document.querySelector('.field-list-config');

    fieldList.innerHTML = '';

    fieldData.forEach(field => {
        renderField(fieldList, field);
    })
        
}

export function renderField(fieldList, field){
    const fieldElement = document.createElement('div');
    fieldElement.className = "field-data-config px-10 py-7 bg-palette-secundary-color rounded-lg mb-5 mt-5";
    fieldElement.setAttribute("field-id", field.id);
    fieldElement.setAttribute('data-field', JSON.stringify(field));
    fieldElement.innerHTML = `
        <li class="flex flex-col gap-2 p-2 rounded text-white">
            <div class="preview flex items-center cursor-pointer" onclick="toggleExpandFieldConfig(this.closest('.field-data-config'))">
                <div class="field-preview-data flex gap-8 flex-grow">
                    <span class="field-name-preview flex item-center font-bold  text-xl"><i class="material-icons mr-4">sports_soccer</i>${field.name}</span>
                    <span class="field-size-preview flex item-center text-xl"><i class="material-icons mr-4">group</i>Tamaño: ${field.size}</span>
                    <span class="field-type-preview flex item-center text-xl"><i class="material-icons mr-4">grass</i>Terreno: ${field.fieldType.description}</span>
                </div>                                           
                <div class="ml-auto">
                    <i class="material-icons">keyboard_double_arrow_down</i>
                </div>                                          
            </div>                                                                                                                                                                                                                                            

            <div class="content gap-2 hidden px-6 rounded-lg">
                <div class="flex justify-between items-center mb-2 cursor-pointer" onclick="toggleExpandFieldConfig(this.closest('.field-data-config'))">
                    <div class="flex-grow"></div> 
                    <div class="mr-0"> 
                        <i class="material-icons">keyboard_double_arrow_up</i>
                    </div>
                </div>
                <div class="flex">                    
                    <div class="field-image flex-shrink-0">
                        <img src="" alt="Imagen de la cancha" class="object-contain w-[42rem] max-h-[30rem] rounded-lg mb-5">
                    </div>
                    <div class= "border-l-2 border-palette-primary-color h-auto mx-2 my-4 ml-10 mr-24"></div>
                    <div>
                        <div class="flex">
                            <ul>
                                <li class="text-white text-xl w-90 h-10 rounded-lg flex items-center  py-2 mb-2">
                                    <h2 class="flex items-center mr-4"><i class="material-icons mr-4">sports_soccer</i>Nombre</h2>
                                    <input value="${field.name}" placeholder="${field.name}" class="update-name border rounded-md px-4 w-auto mb-0 align-middle border-palette-primary-color bg-palette-tertiary-color"></input>                                              
                                </li>


                                <li class="text-white text-xl w-90 h-10 rounded-lg flex items-center  py-2 mb-2">
                                    <h2 class="flex items-center mr-4"><i class="material-icons mr-4">group</i>Tamaño</h2>
                                    <select name="" id="" class="size-select border rounded-md px-4 w-auto mb-0 align-middle border-palette-primary-color bg-palette-tertiary-color">
                                        <option value="" disabled hidden ></option>
                                        <option value="5">5</option>
                                        <option value="7">7</option>
                                        <option value="11">11</option>
                                    </select>
                                </li>
                                
                                <li class="text-white text-xl w-90 h-10 rounded-lg flex items-center  py-2">
                                    <h2 class="flex items-center mr-4"><i class="material-icons mr-4">grass</i>Terreno</h2>
                                    <select name="" id="" class="field-type-select border rounded-md px-4 w-auto mb-0 align-middle border-palette-primary-color bg-palette-tertiary-color">                                     
                                    </select>
                                </li>
                            </ul>
                        </div>                        
                        <div class="py-2 mb-2">
                            <div class="flex items-center mb-4">
                                <h2 class="text-white text-xl w-auto h-10 rounded-lg flex items-center py-2 mr-4">
                                    <i class="material-icons mr-4 align-middle">update</i>Disponibilidades
                                </h2>
                                <button class="add-availability-button bg-palette-tertiary-color text-xl w-auto h-10 rounded-lg font-mono flex items-center justify-center py-2 px-4" field-id="${field.id}">
                                    <i class="material-icons text-palette-primary-color align-middle">add</i>
                                </button>
                            </div>                                                    
                            <ul class="space-y-1">
                                <div class="day-buttons flex flex-wrap gap-2">                                      
                                </div>
                            </ul>
                        </div>
                        <div class="py-5 mb-2">
                            <div class="field-schedules text-white text-xl w-90 h-10 rounded-lg flex items-center py-2 mb-6">
                                <h2 class= "text-white text-xl w-auto h-10 rounded-lg font-serif flex items-center justify-center mr-4">
                                    <i class="material-icons mr-4 align-middle">update</i>Horarios
                                </h2>                                   
                            </div>                               
                            <ul id="availabilties-${field.id}" class="availabilities-container space-y-1">                                  
                            </ul>
                        </div>                                                                                                                                      
                    </div>                                                                                                             
                </div>
                
                <div class="border-b-2 border-palette-primary-color my-4"></div>
                <div class="w-full flex justify-center mt-10 mb-2">
                    <button class="delete-field-button btn-start-now text-xl block  bg-red-900 py-3 p-5 mx-3 rounded-md font-semibold  hover:bg-white hover:text-red-600 hover:shadow-palette-primary-color text-white">Eliminar</button>
                    <button class="save-field-button btn-start-now text-xl block  bg-palette-primary-color py-3 p-5 mx-3 rounded-md font-semibold  hover:bg-white hover:text-palette-accent-color hover:shadow-palette-primary-color text-palette-accent-color" data-field-id="${field.id}" disabled>Guardar</button>                                             
                </div>
            </div>
        </li>
    `;

    const fieldImg = fieldElement.querySelector('.field-image img');
    fieldImg.src = selectFieldImage(field.size, field.fieldType.description);
    
    
    const deleteButton = fieldElement.querySelector('.delete-field-button');
    deleteButton.setAttribute('data-field', JSON.stringify(field));
    const buttonsContainer = fieldElement.querySelector('.day-buttons');
    generateDayButtons(buttonsContainer, field);

    fieldList.appendChild(fieldElement);
};

const daysOrder = {
    "Monday": 1,
    "Tuesday": 2,
    "Wednesday": 3,
    "Thursday": 4,
    "Friday": 5,
    "Saturday": 6,
    "Sunday": 7
};


export function generateDayButtons(buttonsContainer, field) {
    let days = [];

    // Limpia el contenedor de botones
    buttonsContainer.innerHTML = "";

    const orderAvailabilities = field.availabilities.sort((a, b) => daysOrder[a.day] - daysOrder[b.day]);

    // Itera sobre todas las disponibilidades para identificar días únicos
    orderAvailabilities.forEach(availability => {
        const day = availability.day;

        if (!days.includes(day)) {
            days.push(day);

            const button = document.createElement('button');
            button.className = 'bg-palette-tertiary-color text-white text-xl w-auto h-10 rounded-lg font-mono flex items-center justify-center py-2 px-4';
            button.innerText = convertDay(day);
            button.setAttribute("dayOfWeek", day);

            button.addEventListener('click', () => {
                handleDayButtons(button, buttonsContainer, field);
            });

            buttonsContainer.appendChild(button);
        }
    });

    console.log("Días únicos detectados:", days);
}





function convertDay(day) {
    return daysInSpanish[day];
}


export function renderAvailabilities(field, day){
    
    const availabilitiesContainer = document.querySelector(`#availabilties-${field.id}`);

    const availableTime = field.availabilities.filter(availability => availability.day === day);

    availableTime.sort((a, b) => a.openHour.localeCompare(b.openHour));  
  
    availabilitiesContainer.innerHTML = "";

    availableTime.forEach(availability => {
 
        const scheduleText = `${availability.openHour} - ${availability.closeHour}`;
        const fieldElement = document.createElement('div');
        fieldElement.className = "field-availability flex-col flex-wrap gap-2";

        fieldElement.innerHTML = `
            <li class="text-white text-xl w-90 h-10 rounded-lg flex items-center py-2 mb-2">
                <div class="availability-buttons flex items-center gap-2">
                    <!-- Horario -->
                    <p class="bg-palette-tertiary-color text-white text-xl w-auto h-10 rounded-lg font-mono flex items-center justify-center py-2 px-4">
                        ${scheduleText}
                    </p>
                    <button class="edit-availability bg-palette-tertiary-color  text-xl w-auto h-10 rounded-lg font-mono flex items-center justify-center py-2 px-4">
                        <i class="material-icons text-palette-accent-color align-middle">edit</i>
                    </button>
                    <button class="delete-availability bg-palette-tertiary-color  text-xl w-auto h-10 rounded-lg font-mono flex items-center justify-center py-2 px-4" >
                        <i class="material-icons text-red-900 align-middle">delete</i>
                    </button>                  
                </div>
            </li>
        `;

        const editButton = fieldElement.querySelector('.edit-availability');
        editButton.setAttribute('data-availability', JSON.stringify(availability));

        const deleteButton = fieldElement.querySelector('.delete-availability');
        deleteButton.setAttribute('data-availability', JSON.stringify(availability));

        
        availabilitiesContainer.appendChild(fieldElement);
        
    })

    const event = new CustomEvent('availabilitiesRendered');

    availabilitiesContainer.dispatchEvent(event);


}





export async function handleDayButtons(button, buttonsContainer, field){
       
    const allButtons = buttonsContainer.querySelectorAll('button');
    allButtons.forEach(btn => {
        btn.classList.remove('selected');
        btn.disabled = false;
    });

    button.classList.add('selected');
    button.disabled = true;

    const daySelected = button.getAttribute('dayOfWeek');
    console.log("Día seleccionado:", daySelected);

    await renderAvailabilities(field, daySelected);


}

