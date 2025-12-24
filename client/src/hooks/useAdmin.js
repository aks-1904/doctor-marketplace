import axios from "axios";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { setUnverifiedDoctors } from "../store/slices/adminSlice";

const BACKEND_ADMIN_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin`;
const TOKEN = localStorage.getItem("token");

const useAdmin = () => {
  const dispatch = useDispatch();

  const getAllUnverifiedDoctors = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_ADMIN_URL}/get-unverified-doctors`,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
          withCredentials: true,
        }
      );

      if (res.data?.success) {
        dispatch(setUnverifiedDoctors(res.data?.doctors));
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to get unverified doctors"
      );
    }
  };

  return { getAllUnverifiedDoctors };
};

export default useAdmin;
