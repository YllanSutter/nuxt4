interface User {
  id: string;
  email: string;
  name: string;
  budget: number;
  role_id: string;
  created_at: string;
  user_label_visibility?: Array<{
    label_id: string;
    visible: boolean;
    id: string;
  }>;
  role?: {
    id: string;
    name: string;
  };
}

export const useAuth = () => {
  const userCookie = useCookie<User | null>('user', {
    default: () => null,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 
  });

  const user = computed(() => userCookie.value);
  const isLoggedIn = computed(() => !!user.value);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      const response = await $fetch<{ success: boolean; user: User }>('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      if (response.success && response.user) {
        userCookie.value = response.user;
        return { success: true, user: response.user };
      }
      
      throw new Error('Erreur de connexion');
    } catch (error: any) {
      throw new Error(error.data?.message || error.message || 'Erreur de connexion');
    }
  };

  // Fonction d'inscription
  const signup = async (userData: { email: string, password: string, name: string, budget?: number, roles:any, labels:any }) => {
    try {
      const roleId = typeof userData.roles === 'string' ? userData.roles : userData.roles?.id || 'user-role-id';
      const userLabelVisibility = Array.isArray(userData.labels?.value)
        ? userData.labels.value.map((label: any) => ({ label_id: label.id, visible: true }))
        : [];

      const response = await $fetch<User>('/api/users', {
        method: 'POST',
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          budget: userData.budget || 0,
          role_id: roleId,
          user_label_visibility: userLabelVisibility
        }
      });

      return { success: true, user: response };
    } catch (error: any) {
      throw new Error(error.data?.message || error.message || 'Erreur lors de l\'inscription');
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    userCookie.value = null;
  };

  // Fonction pour mettre à jour le profil utilisateur
  const updateProfile = async (updates: { name?: string, budget?: number, password?: string }) => {
    if (!user.value?.email) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const response = await $fetch<User>(`/api/users/${user.value.email}`, {
        method: 'PUT',
        body: {
          email: user.value.email,
          ...updates
        }
      });

      // Mettre à jour le cookie avec les nouvelles données
      userCookie.value = { ...user.value, ...response };
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || error.message || 'Erreur lors de la mise à jour');
    }
  };

  // Fonction pour récupérer les données complètes de l'utilisateur
  const fetchUserData = async () => {
    if (!user.value?.email) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const response = await $fetch<User>(`/api/users/${user.value.email}`, {
        method: 'GET',
        params: { email: user.value.email }
      });

      userCookie.value = response;
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || error.message || 'Erreur lors du chargement des données');
    }
  };

  return {
    user: readonly(user),
    isLoggedIn: readonly(isLoggedIn),
    login,
    signup,
    logout,
    updateProfile,
    fetchUserData
  };
};
