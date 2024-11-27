export function sendWhatsAppMessage() {
    const message = "Hola! Tenia una consulta sobre las reservas.";

    const phoneNumber = '5491112345678'; // Reemplaza esto con tu número de WhatsApp
    const whatsappMessage = `${message}`;
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    window.open(whatsappURL, '_blank');
}