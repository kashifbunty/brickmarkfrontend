import React from 'react';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import { translate } from '@/utils/helper';

const PaymentGatewaySelector = ({
  stripeActive,
  razorpayActive,
  payStackActive,
  payPalActive,
  FlutterwaveActive,
  setStripeFormModal,
  setShowRazorpayModal,
  setShowPaystackModal,
  setShowPaypal,
  setShowFlutterwaveModal,
  router
}) => {
  const handlePaymentSelection = () => {
    if (!stripeActive && !razorpayActive && !payStackActive && !payPalActive && !FlutterwaveActive) {
      Swal.fire({
        title: translate("opps"),
        text: translate("noPaymenetActive"),
        icon: "warning",
        showCancelButton: false,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        confirmButtonText: translate("ok"),
      }).then(() => {
        router.push("/contact-us");
      });
      return false;
    }

    if (stripeActive) {
      setStripeFormModal(true);
    } else if (razorpayActive) {
      setShowRazorpayModal(true);
    } else if (payStackActive) {
      setShowPaystackModal(true);
    } else if (payPalActive) {
      setShowPaypal(true);
    } else if (FlutterwaveActive) {
      setShowFlutterwaveModal(true);
    }
  };

  return { handlePaymentSelection };
};

export default PaymentGatewaySelector; 