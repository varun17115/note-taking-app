const API_URL = 'http://localhost:3000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const getNotes = async ({ search = '', sort = '-date' } = {}) => {
  try {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    
    if (search) queryParams.append('search', search);
    if (sort) queryParams.append('sort', sort);

    const response = await fetch(`${API_URL}/notes?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch notes');
    return await response.json();
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
};

export const createNote = async (noteData) => {
  try {
    const response = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(noteData),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteNote = async (noteId) => {
  try {
    const response = await fetch(`${API_URL}/notes/${noteId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete note');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

export const updateNote = async (noteId, noteData) => {
  try {
    const response = await fetch(`${API_URL}/notes/${noteId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(noteData),
    });
    if (!response.ok) {
      throw new Error('Failed to update note');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
}; 