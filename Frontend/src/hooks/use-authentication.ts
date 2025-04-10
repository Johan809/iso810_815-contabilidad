import { useState, useEffect, useCallback } from "react";
import ApiService from "@/lib/apiService";
import axios from "axios";

type UsuarioLogin = {
  id: number;
  nombre: string;
  email: string;
  sistemaAuxiliarId: number;
};

type AuthResponse = {
  token: string;
  usuario: UsuarioLogin;
};

const API_BASE_URL = "/api/Autenticacion";

export function useAuthentication() {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<UsuarioLogin | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUsuario(JSON.parse(storedUser));
      setToken(storedToken);
      ApiService.setToken(storedToken);
    }
  }, []);

  const saveAuthData = useCallback((data: AuthResponse) => {
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
    localStorage.setItem("token", data.token);
    setUsuario(data.usuario);
    setToken(data.token);
    ApiService.setToken(data.token);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await axios.post<AuthResponse>(
          `${API_BASE_URL}/login`,
          {
            email,
            password,
          }
        );
        saveAuthData(response.data);
      } catch (error) {
        throw new Error("Credenciales inválidas");
      }
    },
    [saveAuthData]
  );

  const register = useCallback(
    async (
      nombre: string,
      email: string,
      password: string,
      sistemaAuxiliarId: number
    ) => {
      try {
        const response = await axios.post<AuthResponse>(
          `${API_BASE_URL}/register`,
          {
            nombre,
            email,
            password,
            sistemaAuxiliarId,
          }
        );
        saveAuthData(response.data);
      } catch (error) {
        throw new Error("Error al registrar");
      }
    },
    [saveAuthData]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setUsuario(null);
    setToken(null);
    ApiService.setToken(null);
  }, []);

  return { usuario, token, login, register, logout, autenticado: !!token };
}
