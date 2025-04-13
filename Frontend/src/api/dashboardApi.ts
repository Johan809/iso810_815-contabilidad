import axios from "axios";

const API_URL = "/api";

export const getConteoDashboard = async (): Promise<{
  totalCuentasContables: number;
  totalSistemasAuxiliares: number;
  totalTipoCuentas: number;
  totalTipoMonedas: number;
}> => {
  try {
    const response = await axios.get(`${API_URL}/Dashboard`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cuentas contables:", error);
    return {
      totalCuentasContables: 0,
      totalSistemasAuxiliares: 0,
      totalTipoCuentas: 0,
      totalTipoMonedas: 0,
    };
  }
};

export const getCuentasContables = async () => {
  try {
    const response = await axios.get(`${API_URL}/CuentaContable`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cuentas contables:", error);
    return [];
  }
};

export const getTiposMoneda = async () => {
  try {
    const response = await axios.get(`${API_URL}/TipoMoneda`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tipos de moneda:", error);
    return [];
  }
};

export const getTiposCuentas = async () => {
  try {
    const response = await axios.get(`${API_URL}/TipoCuenta`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tipos de cuenta:", error);
    return [];
  }
};

export const getSistemasAuxiliares = async () => {
  try {
    const response = await axios.get(`${API_URL}/SistemaAuxiliar`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sistemas auxiliares:", error);
    return [];
  }
};
