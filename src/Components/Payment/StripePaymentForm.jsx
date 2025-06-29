import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { translate } from "@/utils/helper";
import toast from "react-hot-toast";

const StripePaymentForm = ({ open, setOpen, clientKey }) => {

  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      console.error("Stripe has not loaded yet.");
      setLoading(false);
      return;
    }
    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
        clientKey,
        redirect: "if_required",
      });
      const { error, paymentIntent } = result;

      if (error) {
        toast.error(`Payment failed: ${error.message}`);
        setLoading(false);

        // Handle failed payment

      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Payment Successful!");
        setOpen(false)
        router.push('/')
      }
    } catch (error) {
      console.error("Error during payment confirmation:", error);
      toast.error("An error occurred during payment.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Address Element */}
      <div className="mt-3">
        <AddressElement
          options={{
            mode: "billing", // Collect billing address
          }}
        />
      </div>

      {/* Payment Element */}
      <div className="mt-2">
        <PaymentElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>

      {/* Submit Button */}
      {stripe  &&

        <button
          type="submit"
          disabled={!stripe || loading}
          className="stripe_payment_button"
        >
          {loading ? translate("processing") : translate("pay")}
        </button>
      }
    </form>
  );
};

export default StripePaymentForm;
