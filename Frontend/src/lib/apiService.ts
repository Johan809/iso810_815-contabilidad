import axios from "axios";

class ApiService {
  private token: string | null = null;

  constructor() {
    //esto es para que este api service tenga acceso al token
    this.setToken(localStorage.getItem("token"));
  }

  setToken(token: string | null) {
    this.token = token;

    // Configura el token para todas las solicitudes futuras
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }

  async get(url: string) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error in GET request to ${url}:`, error);
      throw error;
    }
  }

  async post(url: string, data) {
    try {
      const response = await axios.post(url, data);
      return response.data;
    } catch (error) {
      console.error(`Error in POST request to ${url}:`, error);
      throw error;
    }
  }

  async put(url: string, data) {
    try {
      const response = await axios.put(url, data);
      return response.data;
    } catch (error) {
      console.error(`Error in PUT request to ${url}:`, error);
      throw error;
    }
  }

  async delete(url: string) {
    try {
      const response = await axios.delete(url);
      return response.data;
    } catch (error) {
      console.error(`Error in DELETE request to ${url}:`, error);
      throw error;
    }
  }
}

export default new ApiService();
