// Simple in-memory auth storage (in production, use localStorage + backend)
let currentUser = null;
let authToken = null;

export const auth = {
  // Check if user is logged in
  isAuthenticated: () => {
    return !!currentUser;
  },

  // Get current user
  getUser: () => {
    return currentUser;
  },

  // Login
  login: async (email, password) => {
    // In production, make API call to your backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock validation
        if (email && password.length >= 6) {
          currentUser = {
            id: "user-" + Date.now(),
            email,
            name: email.split("@")[0],
            avatar: "🇪🇹",
            isOnline: true,
            joinedAt: new Date().toISOString(),
          };
          authToken = "mock-jwt-token";
          resolve(currentUser);
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 1000);
    });
  },

  // Signup
  signup: async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (
          userData.email &&
          userData.password &&
          userData.password.length >= 6
        ) {
          currentUser = {
            id: "user-" + Date.now(),
            ...userData,
            avatar: "🇪🇹",
            isOnline: true,
            joinedAt: new Date().toISOString(),
          };
          authToken = "mock-jwt-token";
          resolve(currentUser);
        } else {
          reject(new Error("Invalid user data"));
        }
      }, 1000);
    });
  },

  // Logout
  logout: () => {
    currentUser = null;
    authToken = null;
  },

  // Update profile
  updateProfile: async (profileData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (currentUser) {
          currentUser = { ...currentUser, ...profileData };
          resolve(currentUser);
        } else {
          reject(new Error("Not authenticated"));
        }
      }, 500);
    });
  },

  // Get token
  getToken: () => {
    return authToken;
  },
};
