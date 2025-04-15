import ApiService from "@/lib/apiService";

const API_URL = "/api/CuentaContable";

export const getCuentasContables = async () => {
  try {
    return await ApiService.get(`${API_URL}?EsPaginable=false`);
  } catch (error) {
    console.error("Error fetching cuentas contables:", error);
    return [];
  }
};

export const createCuentaContable = async (cuentaContable) => {
  try {
    return await ApiService.post(API_URL, cuentaContable);
  } catch (error) {
    console.error("Error creating cuenta contable:", error);
    throw error;
  }
};

export const updateCuentaContable = async (id, cuentaContable) => {
  try {
    return await ApiService.put(`${API_URL}/${id}`, cuentaContable);
  } catch (error) {
    console.error("Error updating cuenta contable:", error);
    throw error;
  }
};

export const deleteCuentaContable = async (id) => {
  try {
    await ApiService.delete(`${API_URL}/${id}`);
    return true;
  } catch (error) {
    console.error("Error deleting cuenta contable:", error);
    return false;
  }
};
