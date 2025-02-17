const API_URL = 'http://localhost:5003/api/auth';

export const login = async (credentials) => { 
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Login failed');
    }
    
    const data = await response.json();
    
    if (!data.user || !data.user.id) {
      throw new Error('Invalid user data received');
    }
    
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    console.error('Login service error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...userData, token: localStorage.getItem('token') }),
  });
  
  if (!response.ok) {
    throw new Error('Registration failed');
  }
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
}; 