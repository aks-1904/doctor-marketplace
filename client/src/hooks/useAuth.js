import axios from "axios";

const BACKEND_AUTH_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth`;

const useAuth = () => {
  const register = async (data) => {
    try {
      console.log(data);
      return;

      const res = await axios.post(`${BACKEND_AUTH_URL}/register`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        console.log(res.data?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const login = async (data) => {
    try {
    } catch (error) {}
  };

  return { register, login };
};

export default useAuth;
