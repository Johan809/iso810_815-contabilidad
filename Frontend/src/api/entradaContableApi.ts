import ApiService from "@/lib/apiService";
import axios from "axios";

const API_URL = "/api/EntradaContable";


export const getEntradaContable = async () => {
  try {
    return await ApiService.get(`${API_URL}?EsPaginable=false`);
  } catch (error) {
    console.error("Error fetching entrada contable:", error);
    return [];
  }
};

// show
export const getEntradaContableById = async (id: number) => {
  try {
    return await ApiService.get(`${API_URL}/${id}`);
  } catch (error) {
    console.error("Error fetching entrada contable by id:", error);
    return null;
  }
};