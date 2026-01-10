import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

let stripePromise;

const BACKEND_STRIPE = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;
const TOKEN = localStorage.getItem("token");

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

const useStripePayment = () => {
  const redirectToCheckout = async (appointmentId, userId) => {
    if (!appointmentId) {
      throw new Error("Appointment ID is required");
    }

    const res = await axios.post(
      `${BACKEND_STRIPE}/payments/create-checkout-session`,
      { appointmentId, userId },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    if (!res?.data?.url) {
      throw new Error("Failed to create checkout session");
    }

    window.location.href = res.data.url;
  };

  return { redirectToCheckout };
};

export default useStripePayment;
