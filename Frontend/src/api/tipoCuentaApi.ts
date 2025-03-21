import axios from "axios";

const API_URL = "/api/TipoCuenta";

export const getTiposCuenta = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching Tipos de Cuenta:", error);
    return [];
  }
};

export const createTipoCuenta = async (tipoCuenta) => {
  try {
    const response = await axios.post(API_URL, tipoCuenta);
    return response.data;
  } catch (error) {
    console.error("Error creating Tipo de Cuenta:", error);
    throw error;
  }
};

export const updateTipoCuenta = async (id, tipoCuenta) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, tipoCuenta);
    return response.data;
  } catch (error) {
    console.error("Error updating Tipo de Cuenta:", error);
    throw error;
  }
};

export const deleteTipoCuenta = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error("Error deleting Tipo de Cuenta:", error);
    throw error;
  }
};
