import { getDayFromDate, convertTimeSpanToHHMM, daysInSpanish } from "./utilities.js";

export async function showAvailabilityAddSuccesAlert(){
    
    if(Swal.isVisible()){
        Swal.close();
    };
    
    await Swal.fire({
        title: '¡La disponibilidad ha sido agregada!',
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
    })
}

export async function showFieldAddSuccesAlert(){
    
    if(Swal.isVisible()){
        Swal.close();
    };
    
    await Swal.fire({
        title: '¡La cancha ha sido agregada!',
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
    })
}

export async function showFieldUpdateSuccesAlert(){
    
    if(Swal.isVisible()){
        Swal.close();
    };
    
    await Swal.fire({
        title: '¡La cancha ha sido actualizada con exito!',
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
    })
}

export async function showErrorAlert(){
    
    if(Swal.isVisible()){
        Swal.close();
    };
    
    await Swal.fire({
        icon: "error",
        title: "¡Error!",
        text: "¡Ha ocurrido un error! ¡Intente nuevamente mas tarde!",
        footer: '<a href="https://wa.me/5491112345678">¿Aun tiene problemas? ¡Puede contactarnos!</a>',
        heightAuto: false, 
        scrollbarPadding: false,
        customClass: {
            confirmButton: 'custom-confirm-button',
            popup: 'custom-swal'
        },
      });
}


export async function showReservationSuccess(link) {
    if (Swal.isVisible()) {
        Swal.close();
    }

    const swalResult = await Swal.fire({
        title: '¡La reserva ha sido creada exitosamente!',
        html: `
            <p>¡Copiar link de invitación!</p>
            <button id="copyButton" style="margin-top: 10px; padding: 10px; background-color: transparent; border: none; cursor: pointer;">
                <i class="fas fa-link hover:text-palette-accent-color"></i>
            </button>
        `,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        heightAuto: false, 
        scrollbarPadding: false,
        customClass: {
            confirmButton: 'custom-confirm-button',
            popup: 'custom-swal'
        },
        allowOutsideClick: true,
        allowEscapeKey: true,
        didOpen: () => {
            // Configurar el botón de copiar cuando el popup esté visible
            const copyButton = document.getElementById('copyButton');
            if (copyButton) {
                copyButton.addEventListener('click', () => copyLink(link));
            }
        }
    });

    if (swalResult.isConfirmed) {
        await anotherReservationAlert();
    }

    handleOutsideClick();
}


async function anotherReservationAlert() {
    if (Swal.isVisible()) {
        Swal.close();
    }

    const result = await Swal.fire({
        title: '¿Quiere realizar otra reserva?',
        icon: 'question',
        confirmButtonText: 'Si',
        cancelButtonText: 'No',
        showCancelButton: true, 
        reverseButtons: true,
        heightAuto: false, 
        scrollbarPadding: false,
        customClass: {
            confirmButton: 'custom-confirm-button',
            cancelButton: 'custom-cancel-button',
            popup: 'custom-swal'
        },
        allowOutsideClick: true,
        allowEscapeKey: true,
    });

    if (result.isConfirmed) {
        
        window.location.href = 'newReservation.html'; 
    } else if (result.dismiss === Swal.DismissReason.cancel) {
        window.location.href = 'reservations.html'; 
    }

    handleOutsideClickAnotherReservation();
}


function copyLink(link) {
    if (!link) {
        console.error("No hay un enlace válido para copiar.");
        return;
    }

    navigator.clipboard.writeText(link)
        .then(() => {
            Swal.fire({
                title: '¡Copiado!',
                text: 'El enlace ha sido copiado al portapapeles.',
                icon: 'success',
                heightAuto: false, 
                scrollbarPadding: false,
                timer: 3000,
                showConfirmButton: false,
                didClose: () => {
                    anotherReservationAlert();
                }
            });
        })
        .catch((err) => console.error('Error al copiar el enlace:', err));

}


function handleOutsideClick() {
    const swalPopup = document.querySelector('.swal2-popup');

    if (!swalPopup) return;


    document.addEventListener('click', function handleClick(event) {
        if (!swalPopup.contains(event.target)) {
            anotherReservationAlert();
            document.removeEventListener('click', handleClick); 
        }
    }, { once: true }); 
}

function handleOutsideClickAnotherReservation() {
    const swalPopup = document.querySelector('.swal2-popup');

    if (!swalPopup) return;


    document.addEventListener('click', function handleClick(event) {
        if (!swalPopup.contains(event.target)) {
            window.location.href = 'reservations.html'
            document.removeEventListener('click', handleClick); 
        }
    }, { once: true }); 
}

export async function showErrorAlertAdmin(){
    if(Swal.isVisible()){
       Swal.close();
    };
    
    await Swal.fire({
        icon: "error",
        title: "¡Error!",
        text: "Error al procesar la solicitud! Intente nuevamente!",
        heightAuto: false, 
        scrollbarPadding: false,
        customClass: {
            confirmButton: 'custom-confirm-button',
            popup: 'custom-swal'
        },
      });
}

export async function showPlayerAddSucces(){

    if(Swal.isVisible()){
        Swal.close();
    };
    
    const result = await Swal.fire({
        title: '¡Te has unido a la reserva!',
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
    })

    if (result.isConfirmed) {
        
        window.location.href = 'reservations.html'; 
    }
}




export async function showErrorJoinReservation(error){
    if(Swal.isVisible()){
        Swal.close();
     };
     
    const result = await Swal.fire({
         icon: "error",
         title: "¡Error!",
         text: error,
         heightAuto: false, 
        scrollbarPadding: false,
         customClass: {
             confirmButton: 'custom-confirm-button',
             popup: 'custom-swal'
         },
       })
     
    if(result.isConfirmed){
        window.location.href = 'reservations.html';
    }
}


