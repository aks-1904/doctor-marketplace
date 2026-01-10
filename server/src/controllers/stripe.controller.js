import stripe from "../config/stripe.js";
import Appointment from "../models/Appointment.model.js";
import Patient from "../models/Patient.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { appointmentId, userId } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate("doctorId")
      .populate("patientId");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.payment) {
      return res.status(400).json({ message: "Already paid" });
    }

    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const doctor = appointment.doctorId;
    // if (!doctor.stripeAccountId) {
    //   return res.status(400).json({ message: "Doctor not ready for payments" });
    // }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer: patient.stripeCustomerId || undefined,
      line_items: [
        {
          price_data: {
            currency: doctor.currency.toLowerCase(),
            product_data: {
              name: "Doctor Consultation",
              description: `${appointment.slotDate} at ${appointment.slotTime}`,
            },
            unit_amount: appointment.amount * 100,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        transfer_data: {
          destination: doctor.stripeAccountId,
        },
        metadata: {
          appointmentId: appointment._id.toString(),
        },
      },
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const appointmentId =
      session.payment_intent && session.metadata?.appointmentId;

    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        payment: true,
        status: "confirmed",
      });
    }
  }

  res.json({ received: true });
};
