import axios from "axios";
import { useDispatch } from "react-redux";
import { loginSuccess, logout as logoutUser } from "../store/slices/authSlice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const BACKEND_AUTH_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth`;

const useAuth = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const register = async (data) => {
    setLoading(true);
    setError(null);
    try {
      // Register api call for both doctor and patient
      const res = await axios.post(`${BACKEND_AUTH_URL}/register`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(
        `${res.data?.message}, please login to continue with your account`
      );
      return true; // True if api call is success
    } catch (error) {
      setError(error?.response?.data?.message || error?.response?.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data) => {
    setLoading(true);
    setError(null);
    try {
      // Login api call
      const res = await axios.post(`${BACKEND_AUTH_URL}/login`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      localStorage.setItem("token", res.data?.token);
      dispatch(loginSuccess(res.data)); // Setting the user to storage using react-redux
      navigate(`/${res.data?.user?.role}`); // Navigate user to there respective dashboard if success
      toast.success(`${res.data?.message}`);
    } catch (error) {
      setError(error?.response?.data?.message || error?.response?.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.get(`${BACKEND_AUTH_URL}/logout`); // Logout api call
      dispatch(logoutUser());
      navigate("/auth"); // navigate to login page if success
      toast.success("Loggedout successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.response?.message);
    } finally {
      setLoading(false);
    }
  };

  return { register, login, logout, error, loading };
};

export default useAuth;
