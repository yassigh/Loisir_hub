import { authApi,api } from './api';

// export const getAllEntreprises = async () => {
//     try {
//         const response = await authApi.get('/admin/entreprises');
//         return Array.isArray(response.data) ? response.data : [];
//     } catch (error) {
//         console.error('Error fetching entreprises:', error);
//         return [];
//     }
// };

export const getAllEntreprises = async () => {
    try {
        // Utilisez authApi car les données d'entreprise viennent du service d'auth
        const response = await authApi.get('/admin/entreprises');
        return response.data?.map(entreprise => ({
            ...entreprise,
            // Assurez-vous que l'ID est correctement formaté
            id: entreprise.id.toString()
        }));
    } catch (error) {
        console.error('Error fetching entreprises:', error);
        return [];
    }
};
export const getEntrepriseById = async (id) => {
    try {
        const response = await authApi.get(`/entreprises/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching entreprise:', error);
        throw error;
    }
};