// Form handling with Axios
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('rsvpForm');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Get form data
        const formData = {
            nombre: document.getElementById('nombre').value.trim(),
            apellido: document.getElementById('apellido').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            numAsistentes: parseInt(document.getElementById('numAsistentes').value)
        };

        // Validate form data
        if (!validateForm(formData)) {
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'ENVIANDO...';
        submitBtn.disabled = true;

        try {
            // Send data to backend using dynamic API URL
            const response = await axios.post(getApiUrl('/api/rsvp'), formData);

            if (response.status === 200) {
                showMessage('¡Gracias por confirmar tu asistencia!', 'success');
                form.reset();
            }
        } catch (error) {
            console.error('Error sending RSVP:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            });

            if (error.response) {
                // Server responded with error
                const errorMessage = error.response.data?.message ||
                    `Error del servidor (${error.response.status}: ${error.response.statusText})`;
                showMessage(`Error: ${errorMessage}`, 'error');
            } else if (error.request) {
                // No response received
                showMessage('Error: No se pudo conectar con el servidor. Verifica que esté ejecutándose.', 'error');
            } else {
                // Other error
                showMessage(`Error: ${error.message || 'Ocurrió un problema inesperado.'}`, 'error');
            }
        } finally {
            // Restore button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});

// Form validation
function validateForm(data) {
    if (!data.nombre || data.nombre.length < 2) {
        showMessage('Por favor ingresa un nombre válido (mínimo 2 caracteres)', 'error');
        return false;
    }

    if (!data.apellido || data.apellido.length < 2) {
        showMessage('Por favor ingresa un apellido válido (mínimo 2 caracteres)', 'error');
        return false;
    }

    if (!data.email || !isValidEmail(data.email)) {
        showMessage('Por favor ingresa un email válido', 'error');
        return false;
    }

    if (!data.telefono || data.telefono.length < 10) {
        showMessage('Por favor ingresa un teléfono válido (mínimo 10 dígitos)', 'error');
        return false;
    }

    if (!data.numAsistentes || data.numAsistentes < 1 || data.numAsistentes > 10) {
        showMessage('Por favor ingresa un número válido de asistentes (1-10)', 'error');
        return false;
    }

    return true;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show message to user
function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;

    // Add styles
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;

    if (type === 'success') {
        messageDiv.style.backgroundColor = '#28a745';
    } else {
        messageDiv.style.backgroundColor = '#dc3545';
    }

    // Add to page
    document.body.appendChild(messageDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Navigation functions
function openGoogleMaps() {
    const address = 'Paseo de la Reforma 925, Lomas de Chapultepec, Ciudad de México';
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
}

function openWaze() {
    const address = 'Paseo de la Reforma 925, Lomas de Chapultepec, Ciudad de México';
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://waze.com/ul?q=${encodedAddress}`, '_blank');
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
