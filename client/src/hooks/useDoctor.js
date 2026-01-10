import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import {
  setAppointments,
  updateAppointment,
} from "../store/slices/doctorSlice";

const BACKEND_DOCTOR_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/doctor`;
const TOKEN = localStorage.getItem("token");

const useDoctor = () => {
  const dispatch = useDispatch();

  const getAllAppointments = async () => {
    try {
      const res = await axios.get(`${BACKEND_DOCTOR_URL}/appointments`, {
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

  const updateAppointmentStatus = async (id, status) => {
    try {
      const res = await axios.put(
        `${BACKEND_DOCTOR_URL}/`,
        {
          appointmentId: id,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
          withCredentials: true,
        }
      );

      if (res.data?.success) {
        console.log(res.data?.data);
        dispatch(updateAppointment(res.data?.data));
        toast.success(res.data?.message || "Appointment status updated");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to update the appointment status"
      );
    }
  };

  return { getAllAppointments, updateAppointmentStatus };
};

export default useDoctor;
