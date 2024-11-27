function loginRedirection(){
    let timerInterval;
  // Obtener el valor del input de fecha
  let dateValue = document.getElementById('dateInput').value;
    
  // Guardar el valor en el localStorage
  localStorage.setItem('selectedDate', dateValue);
    
Swal.fire({
  title: "Redireccionando",
  timer: 2000,
  timerProgressBar: true,
  didOpen: () => {
    Swal.showLoading();
    
  },
  willClose: () => {
    clearInterval(timerInterval);
  }
}).then((result) => {
  /* Read more about handling dismissals below */
  if (result.dismiss === Swal.DismissReason.timer) {
    console.log("I was closed by the timer");
    window.location.href = 'newReservation.html';
  }
});
}


