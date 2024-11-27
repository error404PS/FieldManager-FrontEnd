function toggleExpand(element) {
  const allFields = document.querySelectorAll('.field-data');

  resetButtons();

  allFields.forEach((field) => {
    if (field !== element) {
      const content = field.querySelector('.content');
      const preview = field.querySelector('.preview');
      content.classList.add('hidden');
      preview.classList.remove('hidden');
    }
  });

  const content = element.querySelector('.content');
  const preview = element.querySelector('.preview');
  content.classList.toggle('hidden');
  preview.classList.toggle('hidden');

  resetCreateReservationButton();
}



function toggleExpandFieldConfig(element){
  const allFields = document.querySelectorAll('.field-data-config');

  resetButtonsDays();
  resetSelectDefaultValues();
  allFields.forEach((field) => {
    if (field !== element) {
      const content = field.querySelector('.content');
      const preview = field.querySelector('.preview');
      content.classList.add('hidden');
      preview.classList.remove('hidden');
    }
  });

  const content = element.querySelector('.content');
  const preview = element.querySelector('.preview');
  content.classList.toggle('hidden');
  preview.classList.toggle('hidden');

  reserSaveFieldButton();
}

function resetButtons() {
  const fieldItems = document.querySelectorAll('.field-data .time-buttons button');

  fieldItems.forEach(button => {
    button.classList.remove('selected');  
    button.disabled = false;              
  });
}

function resetButtonsDays(){
  const fieldItems = document.querySelectorAll('.field-data-config .day-buttons button');
  
  fieldItems.forEach(button => {
    button.classList.remove('selected');  
    button.disabled = false;              
  });

  const availabilitiesContainers = document.querySelectorAll('.availabilities-container');
  availabilitiesContainers.forEach(container => {
      container.innerHTML = '';
      
      container.innerHTML = `
        <p class="text-white text-xl w-auto h-10 rounded-lg font-serif flex items-center justify-center mr-4">Seleccione un dia para ver los horarios.</p>
      `;
  });
}

function resetCreateReservationButton() {
  const createReservaButtons = document.querySelectorAll('.field-data .create-Reservation');

  createReservaButtons.forEach(button => {
    button.disabled = true;
  });
}

function reserSaveFieldButton(){
  const saveButtons = document.querySelectorAll('.field-data-config .save-field-button');

  saveButtons.forEach(button => {
    button.disabled = true;
  });
}


function resetSelectDefaultValues(){
  
  const sizeSelects = document.querySelectorAll('.size-select');
  const typeSelects = document.querySelectorAll('.field-type-select');
  const nameInputs = document.querySelectorAll('.update-name');

  sizeSelects.forEach(select =>{
    select.value = select.defaultValue;
  })

  nameInputs.forEach(input => {
    input.value = input.defaultValue;
  })

  typeSelects.forEach(select => {
    select.value = select.defaultValue;
  })
  
}
