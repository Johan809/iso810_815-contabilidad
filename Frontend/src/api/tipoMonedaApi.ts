import axios from "axios";

const API_URL = "/api"; // Adjust if needed

// ✅ Get all Tipos de Moneda
export const getTiposMoneda = async () => {
  try {
    const response = await axios.get(`${API_URL}/TipoMoneda`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Tipos de Moneda", error);
    return [];
  }
};

// ✅ Create a new Tipo de Moneda
export const createTipoMoneda = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/TipoMoneda`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating Tipo de Moneda", error);
    throw error;
  }
};

// ✅ Update an existing Tipo de Moneda
export const updateTipoMoneda = async (id: number, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/TipoMoneda/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating Tipo de Moneda", error);
    throw error;
  }
};

// ✅ Delete a Tipo de Moneda
export const deleteTipoMoneda = async (id: number) => {
  try {
    await axios.delete(`${API_URL}/TipoMoneda/${id}`);
  } catch (error) {
    console.error("Error deleting Tipo de Moneda", error);
    throw error;
  }
};
