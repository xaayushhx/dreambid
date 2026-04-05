import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: !!localStorage.getItem('token'), // Only load if there's an existing token
  isAuthenticated: false,
  error: null,
};

// Action types
const AUTH_SUCCESS = 'AUTH_SUCCESS';
const AUTH_FAILURE = 'AUTH_FAILURE';
const LOGOUT = 'LOGOUT';
const SET_LOADING = 'SET_LOADING';
const SET_ERROR = 'SET_ERROR';
const CLEAR_ERROR = 'CLEAR_ERROR';

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case AUTH_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    case CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set token in API headers and localStorage when token changes
  useEffect(() => {
    if (state.token) {
      // Set authorization header for all subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Watch for token changes in localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        const token = localStorage.getItem('token');
        if (token && !state.token) {
          // Token was set in localStorage (likely from login in another tab)
          const verifyAuth = async () => {
            try {
              const response = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
              });
              dispatch({
                type: AUTH_SUCCESS,
                payload: {
                  user: response.data.user,
                  token: token,
                },
              });
            } catch (error) {
              console.error('Auth verification failed:', error);
              dispatch({ type: AUTH_FAILURE });
            }
          };
          verifyAuth();
        } else if (!token && state.token) {
          // Token was removed in another tab
          dispatch({ type: LOGOUT });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [state.token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          dispatch({ type: SET_LOADING, payload: true });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await api.get('/auth/me');
          dispatch({
            type: AUTH_SUCCESS,
            payload: {
              user: response.data.user,
              token: token,
            },
          });
        } catch (error) {
          console.error('Session restore failed:', error);
          dispatch({ type: AUTH_FAILURE, payload: error.response?.data?.message });
          // Clear invalid token
          localStorage.removeItem('token');
        }
      } else {
        dispatch({ type: SET_LOADING, payload: false });
      }
    };

    restoreSession();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      dispatch({ type: CLEAR_ERROR });
      
      const response = await api.post('/auth/login', credentials);
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user: response.data.user,
          token: response.data.token,
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: AUTH_FAILURE, payload: errorMessage });
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      dispatch({ type: CLEAR_ERROR });
      
      const response = await api.post('/auth/register', userData);
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user: response.data.user,
          token: response.data.token,
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: AUTH_FAILURE, payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Try to log the logout on the server
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout notification failed:', error);
    } finally {
      dispatch({ type: LOGOUT });
    }
  };

  // Fetch current user data
  const fetchUser = async () => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      const response = await api.get('/user/me');
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user: response.data,
          token: state.token,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      dispatch({ type: CLEAR_ERROR });
      const response = await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      dispatch({ type: SET_ERROR, payload: errorMessage });
      throw error;
    }
  };

  // Verify token
  const verifyToken = async () => {
    try {
      const response = await api.post('/auth/verify');
      return response.data.valid;
    } catch (error) {
      return false;
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return state.user?.role === 'admin' || state.user?.role === 'staff';
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    fetchUser,
    changePassword,
    verifyToken,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;