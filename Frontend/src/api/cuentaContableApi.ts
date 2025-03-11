import axios from 'axios';

const API_URL = 'http://localhost:5012/api/CuentaContable';

export const getCuentasContables = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching cuentas contables:', error);
    return [];
  }
};

export const createCuentaContable = async (cuentaContable) => {
  try {
    const response = await axios.post(API_URL, cuentaContable);
    return response.data;
  } catch (error) {
    console.error('Error creating cuenta contable:', error);
    throw error;
  }
};

export const updateCuentaContable = async (id, cuentaContable) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, cuentaContable);
    return response.data;
  } catch (error) {
    console.error('Error updating cuenta contable:', error);
    throw error;
  }
};

export const deleteCuentaContable = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting cuenta contable:', error);
    return false;
  }
};