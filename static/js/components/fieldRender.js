import { selectFieldImage } from "./utilities.js";

export function fieldRender(fieldData, reservationData, date) {
    const fieldList = document.querySelector('.field-list'); 

    fieldList.innerHTML = '';


    fieldData.forEach(field => { 
        
        
        const availableTime = field.availabilities.filter(availability => availability.day === date);
        const fieldReservations = reservationData.filter(reservation =>
            reservation.field.id === field.id);


        let countHours = 0;     
        
        let availableTimes = [];
        
        availableTime.forEach(availability =>{
            const openHour = timeToHour(availability.openHour);
            const closeHour = timeToHour(availability.closeHour);
            countHours += closeHour - openHour;
        })

        console.log("CountHours: ", countHours);
        console.log("fIELDRESERVATIONSLENGHT: ", fieldReservations.length);

        if (countHours <= fieldReservations.length) {
            return;
        }

        availableTime.sort((a, b) => a.openHour.localeCompare(b.openHour));        
        
        //Nuevo
        const currentDate = new Date();
        const currentHour = currentDate.getHours();
        
        // Formatear la fecha correctamente según la hora local
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
        const day = String(currentDate.getDate()).padStart(2, '0'); // Día del mes
        
        const formattedCurrentDate = `${year}-${month}-${day}`;
        
        console.log('Fecha actual formateada en Argentina:', formattedCurrentDate);
        console.log('Hora actual:', currentHour);
        
    
        const storedData = localStorage.getItem('Fecha');
        const reservationDate = new Date(storedData);

        console.log('storedData:', storedData);
        console.log('Formated current data:', formattedCurrentDate);
        console.log('Current Date:', currentDate);

        const isReservationToday = storedData === formattedCurrentDate;

        if (isReservationToday){

            availableTime.forEach( availability => {
                let openHour = timeToHour(availability.openHour);
                let closeHour = timeToHour(availability.closeHour);

                console.log("Horarios:", openHour);
                console.log("Horarios:", closeHour);

                console.log('Hora Actual:', currentHour);

                let startHour = currentHour + 1;

                if (startHour < openHour){
                    startHour = openHour;
                }

                if (startHour < closeHour){
                    for (let hour = startHour; hour < closeHour; hour++){
                        availableTimes.push(hour);
                    }
                }
            });

            /*
            const lastAvailability = availableTime[availableTime.length - 1];
            const lastOpenHour = timeToHour(lastAvailability.openHour);
            const lastCloseHour = timeToHour(lastAvailability.closeHour);

            let startHour = currentHour + 1;

            if (startHour < lastOpenHour) {
                

                startHour = lastOpenHour;
            }

            if (startHour < lastCloseHour){
                for (let hour = startHour; hour < lastCloseHour; hour++){
                    availableTimes.push(hour);
                }
            } 
            */

            console.log('Horarios disponibles:', availableTimes);

            fieldReservations.forEach(reservation => {
                const reservationTime = timeToHour(reservation.startTime);

                const index = availableTimes.indexOf(reservationTime);

                if (index !== -1){
                    availableTimes.splice(index, 1);
                }
            });

            if (availableTimes.length === 0){
                return;
            }
            console.log('Nuevos horarios disponibles:', availableTimes);
        }
        //Termina
        
        const scheduleText = `Horarios: ${availableTime.map(time => `${time.openHour} - ${time.closeHour}`).join(', ')}`;
        
        const fieldElement = document.createElement('div');
        fieldElement.className = "field-data px-10 py-7 bg-palette-secundary-color rounded-lg mb-5 mt-5";
        fieldElement.setAttribute('field-id', field.id);        

        fieldElement.innerHTML = `
            <li class="flex flex-col gap-2 p-4 rounded text-white">
                <div class="preview flex items-center cursor-pointer" onclick="toggleExpand(this.closest('.field-data'))">
                    <div class="flex gap-8 flex-grow">
                        <span class="flex item-center font-bold text-xl"><i class="material-icons mr-4">sports_soccer</i>${field.name}</span>
                        <span class="flex item-center text-xl"><i class="material-icons mr-4">schedule</i>${scheduleText}</span>
                        <span class="max-players flex item-center text-xl"><i class="material-icons mr-4">group</i>Jugadores recomendados: ${field.size * 2}</span>
                        <span class="flex item-center text-xl"><i class="material-icons mr-4">grass</i>Terreno: ${field.fieldType.description}</span>
                    </div>
                    <div class="ml-auto">
                        <i class="material-icons">keyboard_double_arrow_down</i>
                    </div>
                </div>
                <div class="content gap-2 hidden px-6 rounded-lg">
                    <div class="flex justify-between items-center mb-2 cursor-pointer" onclick="toggleExpand(this.closest('.field-data'))">
                        <div class="flex-grow"></div> 
                        <div class="mr-0"> 
                            <i class="material-icons">keyboard_double_arrow_up</i>
                        </div>
                    </div>
                    <div class="flex items-stretch">                                                                                   
                        <div class="field-image flex-shrink-0">
                            <img src="" alt="Imagen de la cancha" class="object-contain w-[42rem] max-h-[30rem] rounded-lg mb-5">
                        </div>
                        <div class="border-l-2 border-palette-primary-color h-auto mx-2 my-4 ml-10 mr-24"></div>
                        <div>
                            <div class="flex">
                                <ul>
                                    <li class="text-white text-xl w-90 h-10 rounded-lg flex py-2 mb-4">
                                        <i class="material-icons mr-4">schedule</i>${scheduleText}
                                    </li>
                                    <li class="text-white text-xl w-90 h-10 rounded-lg flex py-2 mb-4">
                                        <i class="material-icons mr-4">group</i>Jugadores recomendados: ${field.size * 2}
                                    </li>
                                    <li class="text-white text-xl w-90 h-10 rounded-lg flex py-2">
                                        <i class="material-icons mr-4">grass</i>Terreno: ${field.fieldType.description}
                                    </li>
                                </ul>
                            </div>
                            <div class="py-5 mb-2">                                      
                                <h2 class="text-white text-xl mb-6"><i class="material-icons mr-4 align-middle">update</i>Seleccione un horario disponible</h2>
                                <ul class="space-y-1">
                                    <div class="time-buttons flex flex-wrap gap-2">                              
                                    </div>
                                </ul>
                            </div>
                            <div class="flex flex-col gap-2 align-middle mb-12">
                                <div>
                                    <h2 class="text-white text-xl mb-6"><i class="material-icons mr-4 align-middle text-xl">group_add</i>Seleccione la cantidad de jugadores</h2>                                                          
                                </div>                                 
                                <div>
                                    <input type="number" value="${field.size * 2}" min="1" placeholder="${field.size * 2}" oninput="if(this.value === '') this.value = ${field.size * 2};" class="max-player-input border rounded-md px-5 w-3/12 py-3 mb-0 align-middle border-palette-primary-color bg-palette-tertiary-color">
                                </div>   
                            </div>                                                                                    
                        </div>                                                         
                    </div>
                    <div class="border-b-2 border-palette-primary-color my-4"></div>
                    <div class="w-full flex justify-center mt-10 mb-2">
                        <button class="create-Reservation text-xl block bg-palette-primary-color py-3 p-5 rounded-md font-semibold text-palette-accent-color hover:bg-white hover:text-palette-accent-color hover:shadow-palette-primary-color" disabled 
                        data-field-id="${field.id}">Realizar reserva</button>
                    </div>
                </div>
            </li>
        `;
        const fieldImg = fieldElement.querySelector('.field-image img');
        fieldImg.src = selectFieldImage(field.size, field.fieldType.description);
        
        const buttonsContainer = fieldElement.querySelector('.time-buttons');
        console.log('container:', buttonsContainer);
        generateTimeButtons(availableTime, reservationData ,buttonsContainer, field.id);

        fieldList.appendChild(fieldElement);
    });
}

function timeToHour(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60; 
}

function hourToTime(hour) {
    const hours = Math.floor(hour);
    const minutes = Math.round((hour - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function timeSpanToMinutes(timeSpan) {
    const [hours, minutes] = timeSpan.split(':').map(Number);
    return hours * 60 + minutes;
}

function generateTimeButtons(availabilities, reservationData, buttonsContainer, fieldId) {
    
    buttonsContainer.innerHTML = '';

    //Nuevo contenido
    const currentDate = new Date();
    const currentHour = currentDate.getHours();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    const day = String(currentDate.getDate()).padStart(2, '0'); // Día del mes
    
    const formattedCurrentDate = `${year}-${month}-${day}`;

    console.log('Dia actual:', currentDate);
    console.log('Hora Actual:', currentHour);

    const storedData = localStorage.getItem('Fecha');
    const reservationDate = new Date(storedData);

    console.log('Fecha storage:', reservationDate.toDateString());
    console.log('Fecha comparacion:', currentDate.toDateString());

    console.log('Fecha storage 2:', storedData);
    console.log('Fecha comparacion 2:', formattedCurrentDate);


    const isReservationToday = storedData === formattedCurrentDate;
    
    availabilities.forEach(availability => {
        const openHour = timeToHour(availability.openHour);
        const closeHour = timeToHour(availability.closeHour);
        
        const fieldReservations = reservationData.filter(reservation =>
            reservation.field.id === fieldId);

        console.log(fieldReservations);

        if (isNaN(openHour) || isNaN(closeHour) || openHour >= closeHour) {
            console.error(`Invalid hours for availability: ${availability}`);
            return; 
        }
            
        for (let hour = openHour; hour < closeHour; hour += 1) {

            //Nuevo contenido 2.0

            console.log('True o false', isReservationToday);

            if (isReservationToday && hour <= currentHour){
                continue;
            }

            const button = document.createElement("button");
            button.className = "bg-palette-tertiary-color text-white text-xl w-16 h-10 rounded-lg font-mono flex items-center justify-center py-2 px-4";           
            button.innerText = `${hour.toString().padStart(2, '0')}:00`;
            
            const buttonTimeInMinutes = hour * 60;

            button.setAttribute("data-time", hour);

            console.log(hour);
            
            const isReserved = fieldReservations.some(reservation => {
                const reservationTimeInMinutes = timeSpanToMinutes(reservation.startTime);
                console.log(`Comparing buttonTime: ${buttonTimeInMinutes} with reservationTime: ${reservationTimeInMinutes}`);
                return reservationTimeInMinutes === buttonTimeInMinutes;
            });

            console.log(isReserved);

            if(!isReserved){
                buttonsContainer.appendChild(button);
            }
        }
    });                 
}






