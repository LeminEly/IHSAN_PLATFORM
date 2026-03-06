import api from "./api";

class AuthService {
  // Stockage des tokens
  setTokens(data) {
    localStorage.setItem("token", data.token);
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    }
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  }

  // Récupérer l'utilisateur connecté
  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  // Récupérer le token
  getToken() {
    return localStorage.getItem("token");
  }

  // Récupérer le refresh token
  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return !!this.getToken();
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  // Déconnexion
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  // Inscription
  async register(userData) {
    try {
      const response = await api.post("/auth/register", userData);
      if (response.data.token) {
        this.setTokens(response.data);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Connexion
  async login(credentials) {
    try {
      const response = await api.post("/auth/login", credentials);
      if (response.data.token) {
        this.setTokens(response.data);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Vérification téléphone
  async verifyPhone(data) {
    try {
      const response = await api.post("/auth/verify-phone", data);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Renvoyer code SMS
  async resendCode(phone) {
    try {
      const response = await api.post("/auth/resend-code", { phone });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Rafraîchir le token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      const response = await api.post("/auth/refresh-token", { refreshToken });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  // Récupérer le profil
  async getProfile() {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Gestion des erreurs
  handleError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data.error || "Une erreur est survenue",
        details: error.response.data.details,
      };
    }
    return {
      status: 500,
      message: "Erreur réseau ou serveur indisponible",
    };
  }

  // Headers pour les requêtes authentifiées
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export default new AuthService();
