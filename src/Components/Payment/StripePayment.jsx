import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePaymentForm from "./StripePaymentForm"; // Import the StripePaymentForm component
import { CloseOutlined } from "@ant-design/icons";
import { Modal, Button } from "antd";
import { loadStripeApiKey, translate } from "@/utils/helper";
import { paymentTransactionFailApi } from "@/store/actions/campaign";

const stripeLoadKey = loadStripeApiKey();
const stripePromise = loadStripe(stripeLoadKey);

const StripePayment = ({ clientKey, open, setOpen, currency, payment_transaction_id }) => {
    const options = {
        clientSecret: clientKey,
        shipping:null,
        appearance: {
            theme: "stripe",
        },
    };

    const handleClose = async () => {
        // Handle failed payment
        setOpen(false); // Close the modal
        paymentTransactionFailApi({
            payment_transaction_id: payment_transaction_id,
            onSuccess: () => {
                console.log("Payment transaction failed");
            },
        });

    };
    return (
        <Modal
            centered
            open={open}
            footer={null}
            onCancel={handleClose}
        >
            <div>
                <span style={{fontWeight:"bold"}}>{translate("pay_with_stripe")}</span>
            </div>
            {clientKey && (
                <Elements stripe={stripePromise} options={options}>
                    <StripePaymentForm
                        currency={currency}
                        open={open}
                        setOpen={setOpen}
                        clientKey={clientKey}
                    />
                </Elements>
            )}
        </Modal>
    );
};
export default StripePayment;
