import React from 'react';
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import {
  createAllPaymentIntentApi,
  flutterwaveApi,
  paypalApi,
  paymentTransactionFailApi,
  generateRazorpayOrderIdApi
} from '@/store/actions/campaign';
import { translate } from "@/utils/helper";

const PaymentHandlers = ({
  priceData,
  user,
  systemsettings,
  razorKey,
  setPaymentTransactionId,
  setclientKey,
  setLoading
}) => {
  const router = useRouter();

  const handleRazorpayPayment = (Razorpay) => {
    try {
      createAllPaymentIntentApi({
        package_id: priceData?.id,
        platform_type: "web",
        onSuccess: (response) => {

          const razorPayPaymentTransactionId = response?.data?.payment_intent?.payment_transaction_id;
          const razorPayOrderId = response?.data?.payment_intent?.id;
          const options = {
            key: razorKey,
            amount: priceData?.price * 100,
            order_id: razorPayOrderId,
            name: systemsettings?.company_name,
            description: systemsettings?.company_name,
            image: systemsettings?.web_logo,
            handler: (res) => {
              router.push("/");
              toast.success("Payment successful!");
            },
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: user?.mobile,
            },
            notes: {
              address: user?.address,
              user_id: user?.id,
              package_id: priceData?.id,
            },
            theme: {
              color: systemsettings?.system_color,
            },
            modal: {
              ondismiss: function () {
                paymentTransactionFailApi({
                  payment_transaction_id: razorPayPaymentTransactionId,
                  onSuccess: () => {
                    console.log("Payment transaction cancelled by user");
                    toast.error(translate("paymentCancelled"));
                  },
                  onError: (error) => {
                    console.error("Error updating cancelled payment:", error);
                  }
                });
              },
              escape: false,
            }
          };

          const rzpay = new Razorpay(options);
          rzpay.open();

          rzpay.on("payment.failed", function (response) {
            setShowRazorpayModal(false);
            paymentTransactionFailApi({
              payment_transaction_id: razorPayPaymentTransactionId,
              onSuccess: () => {
                console.log("Payment transaction failed");
              },
              onError: (error) => {
                console.error("Error updating failed payment:", error);
              }
            });
            console.error(response.error.description);
            toast.error(response.error.description);
          });
        },
        onError: (error) => {
          console.error(error);
          toast.error(error);
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handlePayStackPayment = async () => {
    try {
      createAllPaymentIntentApi({
        package_id: priceData?.id,
        platform_type: "web",
        onSuccess: (res) => {
          const payStackLink = res?.data?.payment_intent?.payment_gateway_response?.data?.authorization_url;
          if (payStackLink) {
            window.location.href = payStackLink;
          }
        },
        onError: (err) => {
          console.log("err", err);
        },
      });
    } catch (error) {
      console.error("An error occurred while processing the payment:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handlePaypalPayment = async () => {
    try {
      await new Promise((resolve, reject) => {
        paypalApi({
          package_id: priceData?.id,
          amount: priceData?.price,
          onSuccess: (res) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(res, "text/html");
            const form = doc.querySelector('form[name="paypal_auto_form"]');

            if (form) {
              const paypalUrl = form.action;
              const formData = new FormData(form);
              const urlParams = new URLSearchParams(formData);
              window.location.href = `${paypalUrl}?${urlParams.toString()}`;
            } else {
              reject(new Error("PayPal form not found in the response"));
            }
          },
          onError: (error) => {
            console.log("error", error);
            reject(new Error("PayPal API error: " + error));
          },
        });
      });
    } catch (error) {
      console.error("PayPal payment error:", error);
      alert(`Payment error: ${error.message}`);
    }
  };

  const handleFlutterwavePayment = () => {
    try {
      flutterwaveApi({
        package_id: priceData?.id,
        onSuccess: (res) => {
          const flutterwaveLink = res?.data?.data?.link;
          if (flutterwaveLink) {
            window.location.href = flutterwaveLink;
          }
        },
        onError: (err) => {
          console.log("err", err);
        },
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleStripePayment = () => {
    try {
      createAllPaymentIntentApi({
        package_id: priceData?.id,
        platform_type: "web",
        onSuccess: (res) => {
          const paymentData = res?.data;
          setPaymentTransactionId(paymentData?.payment_intent?.payment_transaction_id);
          setclientKey(paymentData?.payment_intent?.payment_gateway_response?.client_secret);
        },
        onError: (err) => {
          console.log(err);
          setLoading(false);
        },
      });
    } catch (error) {
      console.error("An error occurred during payment submission:", error);
      setLoading(false);
    }
  };

  return {
    handleRazorpayPayment,
    handlePayStackPayment,
    handlePaypalPayment,
    handleFlutterwavePayment,
    handleStripePayment
  };
};

export default PaymentHandlers; 