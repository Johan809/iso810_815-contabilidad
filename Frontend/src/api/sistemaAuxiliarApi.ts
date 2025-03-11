import axios from "axios";

const API_URL = "http://localhost:5012/api/SistemaAuxiliar";

export const getSistemasAuxiliares = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching Sistemas Auxiliares:", error);
    return [];
  }
};

export const createSistemaAuxiliar = async (sistemaAuxiliar) => {
  try {
    const response = await axios.post(API_URL, sistemaAuxiliar);
    return response.data;
  } catch (error) {
    console.error("Error creating Sistema Auxiliar:", error);
    throw error;
  }
};

export const updateSistemaAuxiliar = async (id, sistemaAuxiliar) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, sistemaAuxiliar);
    return response.data;
  } catch (error) {
    console.error("Error updating Sistema Auxiliar:", error);
    throw error;
  }
};

export const deleteSistemaAuxiliar = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error("Error deleting Sistema Auxiliar:", error);
    throw error;
  }
};