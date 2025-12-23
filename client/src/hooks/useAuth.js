import axios from "axios";

const BACKEND_AUTH_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth`;

const useAuth = () => {
  const register = async (data) => {
    try {
      const res = await axios.post(`${BACKEND_AUTH_URL}/register`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(res.data?.message);
    } catch (error) {
      console.log(error);
    }
  };

  const login = async (data) => {
    try {
      const res = await axios.post(`${BACKEND_AUTH_URL}/login`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(res.data?.message);
    } catch (error) {
      console.log(error);
    }
  };

  return { register, login };
};

export default useAuth;
