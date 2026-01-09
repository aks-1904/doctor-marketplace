import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import {
  addAppointment,
  setAppointments,
  setDoctors,
} from "../store/slices/patientSlice";

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

  const bookAppointment = async ({
    doctorId,
    patientId,
    slotDate,
    slotTime,
  }) => {
    try {
      const res = await axios.post(
        `${BACKEND_PATIENT_URL}/book`,
        { doctorId, patientId, slotDate, slotTime },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
          withCredentials: true,
        }
      );

      if (res.data?.success) {
        dispatch(addAppointment(res.data?.appointment));
        toast.success(res.data?.message);
        return true;
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to book appointments"
      );
      return false;
    }
  };

  const getAllAppointments = async () => {
    try {
      const res = await axios.get(`${BACKEND_PATIENT_URL}/appointments`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
        withCredentials: true,
      });

      if (res.data?.success) {
        dispatch(setAppointments(res.data?.appointments));
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to get your appointments"
      );
    }
  };

  return { getDoctors, bookAppointment, getAllAppointments };
};

export default usePatient;
