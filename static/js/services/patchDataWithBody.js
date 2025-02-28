import { renewAccessToken } from "../services/renewAccessToken.js";
import { logout } from "../components/auth.js";

const patchDataWithBody = async (url, body) => {
    let result = [];

    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    try {
        let response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        console.log('code:', response.status);

        if (response.status === 401) {
            const newToken = await renewAccessToken(token, refreshToken);

            if (newToken) {
                response = await fetch(url, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newToken}`
                    },
                    body: JSON.stringify(body)
                });

                if (!response.ok) {
                    throw new Error('Error en la solicitud PATCH después de renovar el token.');
                }
            } else {
                console.log('No se pudo renovar el token, cerrando sesión.');
                await logout();
            }
        }

        if (!response.ok) {
            throw new Error('Se ha registrado un error en la solicitud PATCH.');
        }

        result = await response.json();
        return result;
    } 
    catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const PatchDataWithBody = {
    Patch: patchDataWithBody
};

export default PatchDataWithBody;
