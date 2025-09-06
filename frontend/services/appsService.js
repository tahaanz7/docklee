import api from './api';

export async function fetchApps() {
    const res = await api.get('/apps');
    return res.data;
}