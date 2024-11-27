export function fieldRender(fieldData) {
    const fieldList = document.querySelector('.field-list'); 

    fieldList.innerHTML = '';


    fieldData.forEach(field => {

        console.log(field.fieldType.description);
        
        

                
        const fieldElement = document.createElement('div');
        fieldElement.className = "field-data px-10 py-7 bg-palette-secundary-color rounded-lg mb-5 mt-5";
        fieldElement.setAttribute('field-id', field.id);        

        fieldElement.innerHTML = `
            <li class="flex flex-col gap-2 p-2 rounded text-white">
                                        <div class="preview flex items-center cursor-pointer" onclick="toggleExpand(this.closest('.field-data'))">
                                            <div class="flex gap-8 flex-grow">
                                                <span class="flex item-center font-bold  text-xl"><i class="material-icons mr-4">sports_soccer</i>${field.name}</span>
                                                <span class="flex item-center text-xl"><i class="material-icons mr-4">group</i>Tamaño: ${field.size}</span>
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
                                                <div class="flex">
                                                    <img src="" alt="Imagen de la cancha" class="w-[42rem] h-auto rounded-lg mb-5">
                                                </div>
                                                <div class= "border-l-2 border-palette-primary-color h-auto mx-2 my-4 ml-36 mr-36"></div>
                                                <div>
                                                    <div class="flex">
                                                        <ul>
                                                            <li class="text-white text-xl w-90 h-10 rounded-lg flex items-center  py-2 mb-2">
                                                                <h2 class="flex items-center mr-4"><i class="material-icons mr-2">group</i>Tamaño:</h2>
                                                                <input type="number" min="1" placeholder="${field.size}" class="border rounded-md pl-4 w-1/6 mb-0 align-middle border-palette-primary-color bg-palette-tertiary-color" disabled>
                                                            </li>
                                                            
                                                            <li class="text-white text-xl w-90 h-10 rounded-lg flex items-center  py-2">
                                                                <h2 class="flex items-center mr-4"><i class="material-icons mr-4">grass</i>Terreno:</h2>
                                                                <select name="" id="" class="border rounded-md px-4 w-auto mb-0 align-middle border-palette-primary-color bg-palette-tertiary-color" disabled>
                                                                    <option value="" disabled hidden >${field.fieldType.description}</option>
                                                                    <option value="1">Cesped natural</option>
                                                                    <option value="2">Cesped sintetico</option>
                                                                    <option value="3">Vinilico</option>
                                                                </select>
                                                            </li>
                                                        </ul>
                                                    </div>                        
                                                    <div class="py-5 mb-2">                                      
                                                        <h2 class= "text-white text-xl mb-6"><i class="material-icons mr-4 align-middle">update</i>Dias disponibles</h2>
                                                        <ul class="space-y-1">
                                                            <div class="flex flex-wrap gap-2 day-buttons">
                                                                <button class="bg-palette-tertiary-color text-white text-xl w-auto h-10 rounded-lg font-mono flex items-center justify-center py-2 px-4">
                                                                    Lunes
                                                                </button>
                                                                <button class="bg-palette-tertiary-color text-white text-xl w-auto h-10 rounded-lg font-mono  flex items-center justify-center py-2 px-4">
                                                                    Martes
                                                                </button>
                                                                <button class="bg-palette-tertiary-color text-white text-xl w-auto h-10 rounded-lg font-mono flex items-center justify-center py-2 px-4">
                                                                    Miercoles
                                                                </button>
                                                                <button class="bg-palette-tertiary-color text-white text-xl w-auto h-10 rounded-lg font-mono  flex items-center justify-center py-2 px-4">
                                                                    Jueves
                                                                </button>
                                                                <button class="bg-palette-tertiary-color text-white text-xl w-auto h-10 rounded-lg font-mono flex items-center justify-center py-2 px-4">
                                                                    Viernes
                                                                </button>
                                                                <button class="bg-palette-tertiary-color text-white text-xl w-auto h-10 rounded-lg font-mono  flex items-center justify-center py-2 px-4">
                                                                    Sabado
                                                                </button>
                                                                <button class="bg-palette-tertiary-color  text-white text-xl w-auto h-10 rounded-lg font-mono  flex items-center justify-center py-2 px-4">
                                                                    Domingo
                                                                </button>
                                                          </div>
                                                        </ul>
                                                    </div>
                                                    <div class="py-5 mb-2">                                      
                                                        <h2 class= "text-white text-xl mb-6"><i class="material-icons mr-4 align-middle">update</i>Horarios</h2>
                                                        <ul class="space-y-1">
                                                            <div class="flex flex-wrap gap-2">
                                                                <p class="bg-palette-tertiary-color text-white text-xl w-auto h-10 rounded-lg font-mono flex items-center justify-center py-2 px-4">8:00 - 16:00</p>
                                                                <p class="bg-palette-tertiary-color text-white text-xl w-auto h-10 rounded-lg font-mono flex items-center justify-center py-2 px-4">18:00 - 22:00</p>            
                                                          </div>
                                                        </ul>
                                                    </div>
                                                    
                                   
                                                </div>                                                                                                             
                                            </div>
                                            
                                            <div class="border-b-2 border-palette-primary-color my-4"></div>
                                            <div class="w-full flex justify-center mt-10 mb-2">
                                                <button class="btn-start-now text-xl block  bg-palette-primary-color py-3 p-5 mx-3 rounded-md font-semibold  hover:bg-white hover:text-palette-accent-color hover:shadow-palette-primary-color text-palette-accent-color">Editar</button>
                                                <button class="btn-start-now text-xl block  bg-red-900 py-3 p-5 mx-3 rounded-md font-semibold  hover:bg-white hover:text-red-600 hover:shadow-palette-primary-color text-white">Eliminar</button>
                                            </div>
                                        </div>
                                    </li>
        `;
        
        const buttonsContainer = fieldElement.querySelector('.day-buttons');
        console.log('container:', buttonsContainer);
        generateDayButtons(buttonsContainer, field.availabilities);

        fieldList.appendChild(fieldElement);
    });
}


function generateDayButtons(buttonsContainer, availabilities) {
    
    availabilities.forEach(day => {
        const button = document.createElement('button');
        button.className = 'bg-palette-tertiary-color text-white text-xl w-auto h-10 rounded-lg font-mono flex items-center justify-center py-2 px-4';
        button.innerText = day.day;

        buttonsContainer.appendChild(button);
    });
}