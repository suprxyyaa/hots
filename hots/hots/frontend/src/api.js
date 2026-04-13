const BASE = import.meta.env.VITE_API_URL || '';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`
});

const get  = (url)       => fetch(BASE + url, { headers: authHeaders() }).then(r => r.json());
const post = (url, body) => fetch(BASE + url, { method: 'POST',   headers: authHeaders(), body: JSON.stringify(body) }).then(r => r.json());
const put  = (url, body) => fetch(BASE + url, { method: 'PUT',    headers: authHeaders(), body: JSON.stringify(body) }).then(r => r.json());
const del  = (url)       => fetch(BASE + url, { method: 'DELETE', headers: authHeaders() }).then(r => r.json());

export const api = {
  // Auth
  login:    (d) => fetch(BASE + '/api/auth/login',    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),
  register: (d) => fetch(BASE + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),

  // Departments — DaaS
  getDepartments:   ()      => get('/api/departments'),
  addDepartment:    (d)     => post('/api/departments', d),
  deleteDepartment: (id)    => del(`/api/departments/${id}`),

  // Doctors — DaaS
  getDoctors:   ()      => get('/api/doctors'),
  getDoctor:    (id)    => get(`/api/doctors/${id}`),
  addDoctor:    (d)     => post('/api/doctors', d),
  updateDoctor: (id, d) => put(`/api/doctors/${id}`, d),
  deleteDoctor: (id)    => del(`/api/doctors/${id}`),

  // Tokens — DaaS
  getTokens:   (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/api/tokens${q ? '?' + q : ''}`);
  },
  getQueue:    (doctorId)  => get(`/api/tokens/queue/${doctorId}`),
  bookToken:   (d)         => post('/api/tokens', d),
  updateStatus:(id, status)=> put(`/api/tokens/${id}/status`, { status }),

  // Analytics — DaaS
  getAnalytics: () => get('/api/analytics'),
};
