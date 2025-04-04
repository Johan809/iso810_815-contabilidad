import axios from "axios";

const API_URL = "/api";

export const getTiposMoneda = async () => {
  try {
    const response = await axios.get(`${API_URL}/TipoMoneda`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Tipos de Moneda", error);
    return [];
  }
};

export const createTipoMoneda = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/TipoMoneda`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating Tipo de Moneda", error);
    throw error;
  }
};

export const updateTipoMoneda = async (id: number, data) => {
  try {
    const response = await axios.put(`${API_URL}/TipoMoneda/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating Tipo de Moneda", error);
    throw error;
  }
};

export const deleteTipoMoneda = async (id: number) => {
  try {
    await axios.delete(`${API_URL}/TipoMoneda/${id}`);
  } catch (error) {
    console.error("Error deleting Tipo de Moneda", error);
    throw error;
  }
};

export const updateTasaMoneda = async (id: number) => {
  try {
    const response = await axios.post(
      `${API_URL}/TipoMoneda/${id}/actualizar-tasa`
    );
    return response.data;
  } catch (error) {
    console.error("Error updating exchange rate Tipo de Moneda", error);
    throw error;
  }
};
