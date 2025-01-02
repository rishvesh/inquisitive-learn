import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Use localhost keyword

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
      headers: {
          'Content-Type': 'application/json',
      }
});

// Interceptor to handle potential 401 errors (unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
            console.log("Unauthorized access, redirecting to login page...");
            window.location.href = '/login'; // Or use your router's navigate function
        }
        return Promise.reject(error);
    }
);

export const getIndexData = () => api.get('/index');
export const createFolder = (data) => api.post('/create_folder', data);
export const viewFolder = (id) => api.get(`/view_folder/${id}`);
export const getPublicFolders = (search) => api.get('/public_folders', { params: { search } });
export const login = (data) => api.post('/login', data, {headers: {'Content-Type': 'application/json'}});
export const logout = () => api.post('/logout');
export const uploadFile = (formData) => {
    return axios.post(`${API_BASE_URL}/generate_questions`, formData, {
        withCredentials: true, // Include credentials if necessary
        headers: {
            'Content-Type': 'multipart/form-data', // Explicitly set to multipart/form-data
        },
    });
};
export const getGeneratedQuestions = () => api.get('/get_generated_questions');
export const register = (data) => api.post('/register', data, {headers: {'Content-Type': 'application/json'}});
export const changePassword = (data) => api.post('/change_password', data, {headers: {'Content-Type': 'application/json'}});
export const getFolders = (isPublic = false, limit, offset) =>
    api.get('/getfolders', { params: { public: isPublic ? 'y' : 'n', limit, offset } });
export const pushFolder = (data) => api.post('/pushfolder', data, {headers: {'Content-Type': 'application/json'}});
export const addToFolder = (data) => api.post('/add_to_folder', data, {headers: {'Content-Type': 'application/json'}});






export default api;