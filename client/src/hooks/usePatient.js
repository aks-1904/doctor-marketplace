import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setDoctors } from "../store/slices/patientSlice";

const BACKEND_PATIENT_URL = `${
  import.meta.env.VITE_BACKEND_URL
}/api/v1/patient`;
const TOKEN = localStorage.getItem("token");

const usePatient = () => {
  const dispatch = useDispatch();

  const getDoctors = async () => {
    try {
      const res = await axios.get(`${BACKEND_PATIENT_URL}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
        withCredentials: true,
      });

      if (res.data?.success) {
        dispatch(setDoctors(res.data?.data));
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable of get doctor details"
      );
    }
  };

  return { getDoctors };
};

export default usePatient;
