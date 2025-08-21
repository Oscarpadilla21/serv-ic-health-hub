import { useState, useEffect } from "react";

interface User {
  username: string;
  fullName: string;
  email: string;
  specialty: string;
  licenseNumber: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  fullName: string;
  specialty: string;
  licenseNumber: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simular base de datos local con localStorage
  const USERS_KEY = "servir_hc_users";
  const CURRENT_USER_KEY = "servir_hc_current_user";

  useEffect(() => {
    // Verificar si hay usuario logueado al inicializar
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
    setIsLoading(false);
  }, []);

  const getUsersFromStorage = (): User[] => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  };

  const saveUsersToStorage = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login = (credentials: LoginCredentials): boolean => {
    const users = getUsersFromStorage();
    const user = users.find(
      u => u.username === credentials.username && 
      // En una app real, la contraseña estaría hasheada
      localStorage.getItem(`password_${credentials.username}`) === credentials.password
    );

    if (user) {
      setUser(user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  };

  const register = (userData: RegisterData): boolean => {
    const users = getUsersFromStorage();
    
    // Verificar si el usuario ya existe
    if (users.some(u => u.username === userData.username || u.email === userData.email)) {
      return false;
    }

    // Crear nuevo usuario
    const newUser: User = {
      username: userData.username,
      fullName: userData.fullName,
      email: userData.email,
      specialty: userData.specialty,
      licenseNumber: userData.licenseNumber,
    };

    // Guardar usuario y contraseña (separadas por seguridad básica)
    const updatedUsers = [...users, newUser];
    saveUsersToStorage(updatedUsers);
    localStorage.setItem(`password_${userData.username}`, userData.password);

    // Auto-login después del registro
    setUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
};