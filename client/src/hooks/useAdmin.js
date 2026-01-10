import axios from "axios";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  addApprovedDoctors,
  removeApprovedDoctor,
  removeUnverifiedDoctors,
  setAllUsers,
  setApprovedDoctors,
  setUnverifiedDoctors,
} from "../store/slices/adminSlice";

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

  const updateVerificationStatus = async ({
    doctorId,
    updatedVerificationStatus,
    rejectedReason,
  }) => {
    try {
      const res = await axios.post(
        `${BACKEND_ADMIN_URL}/update-verification-status`,
        {
          updatedVerificationStatus,
          doctorId,
          rejectedReason,
        },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
          withCredentials: true,
        }
      );

      if (res.data?.success) {
        if (updatedVerificationStatus === "approved") {
          dispatch(addApprovedDoctors(res.data?.doctor));
          dispatch(removeUnverifiedDoctors(res.data?.doctor));
        } else if (updatedVerificationStatus === "rejected") {
          dispatch(removeUnverifiedDoctors(res.data?.doctor));
          dispatch(removeApprovedDoctor(res.data?.doctor));
        }
        toast.success(res.data?.message);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to update verification status"
      );
    }
  };

  const getAllApprovedDoctors = async () => {
    try {
      const res = await axios.get(`${BACKEND_ADMIN_URL}/doctors`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
        withCredentials: true,
      });

      if (res.data?.success) {
        dispatch(setApprovedDoctors(res.data?.doctors));
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to get all approved doctors"
      );
    }
  };

  const getAllUsers = async () => {
    try {
      const res = await axios.get(`${BACKEND_ADMIN_URL}/users`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
        withCredentials: true,
      });

      if (res.data?.success) {
        dispatch(setAllUsers(res.data?.users));
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to get all approved users"
      );
    }
  };

  const blockAndUnblockUser = async ({ status, userId }) => {
    try {
      const res = await axios.post(
        `${BACKEND_ADMIN_URL}/${status}`,
        {
          userId,
        },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
          withCredentials: true,
        }
      );

      if (res.data?.success) {
        getAllUsers();
        toast.success(res.data?.message || "Updated user status");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return {
    getAllUnverifiedDoctors,
    updateVerificationStatus,
    getAllApprovedDoctors,
    getAllUsers,
    blockAndUnblockUser,
  };
};

export default useAdmin;
