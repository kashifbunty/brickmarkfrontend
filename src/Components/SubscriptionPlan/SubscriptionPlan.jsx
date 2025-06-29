"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import { languageData } from "@/store/reducer/languageSlice";
import { useSelector } from "react-redux";
import {
    isLogin,
    loadPayStackApiKey,
    loadStripeApiKey,
    translate,
} from "@/utils/helper";
import { store } from "@/store/store";
import {
    assignFreePackageApi,
    getPackagesApi,
    getPaymentSettingsApi,
    uploadBankReceiptFileApi,
} from "@/store/actions/campaign";
import { settingsData } from "@/store/reducer/settingsSlice";
import { loadStripe } from "@stripe/stripe-js";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import Layout from "../Layout/Layout";
import { userSignUpData } from "@/store/reducer/authSlice";
import LoginModal from "../LoginModal/LoginModal";
import useRazorpay from "react-razorpay";
import StripePayment from "../Payment/StripePayment";
import toast from "react-hot-toast";

// Import new components
import PaymentGatewaySelector from './components/PaymentGatewaySelector';
import PaymentHandlers from './components/PaymentHandlers';
import SubscriptionHeader from './components/SubscriptionHeader';
import SubscriptionSwiper from './components/SubscriptionSwiper';
import PaymentSelectionModal from './components/PaymentSelectionModal';
import UploadReceiptModal from "../User/UploadReceiptModal";

const stripeLoadKey = loadStripeApiKey();
const stripePromise = loadStripe(stripeLoadKey);
const paystackLoadKey = loadPayStackApiKey();

const SubscriptionPlan = () => {
    const router = useRouter();
    const [packagedata, setPackageData] = useState([]);
    const [allFeatures, setAllFeatures] = useState([]);
    const userData = useSelector(userSignUpData);
    const user = userData?.data?.data;
    const [loading, setLoading] = useState(false);
    const [paymentSettingsdata, setPaymentSettingsData] = useState([]);
    const [clientKey, setclientKey] = useState("");
    const [paymentTransactionId, setPaymentTransactionId] = useState("");
    const [priceData, setPriceData] = useState("");
    const [stripeformModal, setStripeFormModal] = useState(false);
    const [showRazorpayModal, setShowRazorpayModal] = useState(false);
    const [showPaystackModal, setShowPaystackModal] = useState(false);
    const [showPaypal, setShowPaypal] = useState(false);
    const [showFlutterwaveModal, setShowFlutterwaveModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showPaymentSelection, setShowPaymentSelection] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const language = store.getState().Language.languages;
    const systemsettings = useSelector(settingsData);
    const lang = useSelector(languageData);
    const [Razorpay, isLoaded] = useRazorpay();

    const bankDetails = systemsettings?.bank_details;

    // Payment gateway active states
    const stripeActive = paymentSettingsdata.some(
        (item) => item.type === "stripe_gateway" && item.data === "1"
    );
    const razorpayActive = paymentSettingsdata.some(
        (item) => item.type === "razorpay_gateway" && item.data === "1"
    );
    const payStackActive = paymentSettingsdata.some(
        (item) => item.type === "paystack_gateway" && item.data === "1"
    );
    const payPalActive = paymentSettingsdata.some(
        (item) => item.type === "paypal_gateway" && item.data === "1"
    );
    const FlutterwaveActive = paymentSettingsdata.some(
        (item) => item.type === "flutterwave_status" && item.data === "1"
    );

    const bankTransferActive = paymentSettingsdata.some(
        (item) => item.type === "bank_transfer_status" && item.data === "1"
    );

    // Payment settings
    const razorKeyObject = paymentSettingsdata.find(
        (item) => item.type === "razor_key"
    );
    const razorKey = razorKeyObject ? razorKeyObject.data : null;

    const stripeKeyObject = paymentSettingsdata.find(
        (item) => item.type === "stripe_currency"
    );
    const stripe_currency = stripeKeyObject ? stripeKeyObject.data : null;

    const breakpoints = {
        0: { slidesPerView: 1.2 },
        768: { slidesPerView: 2.5 },
        992: { slidesPerView: 3 },
        1200: { slidesPerView: 3.5 },
    };

    const isUserLogin = isLogin();

    // Fetch packages
    const fetchPackages = () => {
        try {
            setLoading(true);
            getPackagesApi(
                (res) => {
                    setLoading(false);
                    const packageData = res?.data || [];
                    const allFeatures = res?.all_features || [];
                    const allActivePackages = res?.active_packages || [];
                    const combinedPackages = [...allActivePackages, ...packageData];
                    // Custom sort logic: Active first, then review, then others
                const sortedPackages = combinedPackages.sort((a, b) => {
                    const getPriority = (pkg) => {
                        if (pkg.is_active) return 3;
                        if (pkg.package_status === "review") return 2;
                        if (pkg.package_status === "rejected") return 1;
                        return 0;
                    };
                    return getPriority(b) - getPriority(a);
                });
                    setPackageData(sortedPackages);
                    setAllFeatures(allFeatures);
                },
                (err) => {
                    setLoading(false);
                    console.log(err);
                }
            );
        } catch (error) {
            console.log("Error fetching packages:", error);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, [isUserLogin]);

    // Fetch payment settings
    useEffect(() => {
        if (isUserLogin) {
            getPaymentSettingsApi(
                (res) => {
                    setPaymentSettingsData(res.data);
                },
                (err) => {
                    toast.error(err);
                }
            );
        }
    }, [isUserLogin]);

    // Handle bank transfer
    const handleBankTransfer = ({ data, isReceiptUpload, onSuccess, onError }) => {
        // If it's a receipt upload request
        if (isReceiptUpload && data) {
            uploadBankReceiptFileApi({
                data,
                onSuccess: (response) => {
                    if (response.error) {
                        onError({ message: response.message || "Failed to upload receipt" });
                        return;
                    }
                    onSuccess(response);
                },
                onError: (error) => {
                    const errorMessage = error?.message || "Receipt upload failed";
                    toast.error(errorMessage);
                    onError({ message: errorMessage });
                }
            });
            return;
        }

        // Regular bank transfer initiation

    };

    // Function to check if any online payment gateway is active
    const hasActiveOnlinePayment = () => {
        return stripeActive || razorpayActive || payStackActive || payPalActive || FlutterwaveActive;
    };

    // Subscribe payment handler
    const subscribePayment = (e, data) => {
        e.preventDefault();

        if (!isUserLogin) {
            Swal.fire({
                title: translate("opps"),
                text: "You need to login!",
                icon: "warning",
                allowOutsideClick: false,
                showCancelButton: false,
                customClass: {
                    confirmButton: "Swal-confirm-buttons",
                    cancelButton: "Swal-cancel-buttons",
                },
                confirmButtonText: translate("ok"),
            }).then((result) => {
                if (result.isConfirmed) {
                    setShowModal(true);
                }
            });
            return;
        }

        setPriceData(data);

        if (data?.package_type === "free") {
            // Confirm before assigning free package
            Swal.fire({
                title: translate("areYouSure"),
                text: translate("areYouSureToBuyThisFreePackage"),
                icon: "warning",
                showCancelButton: true,
                customClass: {
                    confirmButton: "Swal-confirm-buttons",
                    cancelButton: "Swal-cancel-buttons",
                },
                cancelButtonColor: "#d33",
                confirmButtonText: translate("yes"),
            }).then((result) => {
                if (result.isConfirmed) {
                    assignFreePackageApi(
                        data.id,
                        (res) => {
                            router.push("/");
                            toast.success(res.message);
                        },
                        (err) => {
                            console.log(err);
                        }
                    );
                }
            });
            return;
        }

        // Handle paid packages based on active payment methods
        const hasOnlinePayment = hasActiveOnlinePayment();

        if (hasOnlinePayment && bankTransferActive) {
            setShowPaymentSelection(true);
        } else if (hasOnlinePayment) {
            handleOnlinePayment();
        } else if (bankTransferActive) {
            setShowPaymentSelection(true);
            handleDirectBankTransfer();
        } else {
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
        }
    };


    // Handle direct bank transfer (when only bank transfer is active)
    const handleDirectBankTransfer = () => {
        const modal = document.querySelector('.bank-transfer-modal');
        if (modal) {
            const bankTransferButton = modal.querySelector('.bt-option-card:last-child');
            if (bankTransferButton) {
                bankTransferButton.click();
            }
        }
    };

    // Handle online payment selection
    const handleOnlinePayment = () => {
        setShowPaymentSelection(false);
        const { handlePaymentSelection } = PaymentGatewaySelector({
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
        });
        handlePaymentSelection();
    };

    // Payment handlers
    const {
        handleRazorpayPayment,
        handlePayStackPayment,
        handlePaypalPayment,
        handleFlutterwavePayment,
        handleStripePayment
    } = PaymentHandlers({
        priceData,
        user,
        systemsettings,
        razorKey,
        setPaymentTransactionId,
        setclientKey,
        setLoading
    });

    // Effects for payment handling
    useEffect(() => {
        if (stripeformModal) {
            handleStripePayment();
        }
    }, [stripeformModal]);

    useEffect(() => {
        if (showRazorpayModal && isLoaded) {
            handleRazorpayPayment(Razorpay);
        }
    }, [showRazorpayModal, isLoaded]);

    useEffect(() => {
        if (showPaystackModal) {
            handlePayStackPayment();
        }
        if (showPaypal) {
            handlePaypalPayment();
        }
        if (showFlutterwaveModal) {
            handleFlutterwavePayment();
        }
    }, [showPaystackModal, showPaypal, showFlutterwaveModal]);

    // Function to determine which payment gateway is active
    const getActivePaymentGateway = () => {
        if (stripeActive) return 'stripe';
        if (razorpayActive) return 'razorpay';
        if (payStackActive) return 'paystack';
        if (payPalActive) return 'paypal';
        if (FlutterwaveActive) return 'flutterwave';
        return null;
    };

    return (
        <Layout>
            <Breadcrumb title={translate("subscriptionPlan")} />

            <section id="subscription" className="mb-5">
                <div className="container">
                    <SubscriptionHeader />

                    <div className="subsCards-Wrapper">
                        <SubscriptionSwiper
                            loading={loading}
                            packagedata={packagedata}
                            language={language}
                            breakpoints={breakpoints}
                            subscribePayment={subscribePayment}
                            systemsettings={systemsettings}
                            allFeatures={allFeatures}
                        />
                    </div>
                </div>
            </section>

            {stripeActive && stripeformModal && (
                <StripePayment
                    clientKey={clientKey}
                    open={stripeformModal}
                    setOpen={setStripeFormModal}
                    currency={stripe_currency}
                    payment_transaction_id={paymentTransactionId}
                />
            )}
            {showModal && (
                <LoginModal isOpen={showModal} onClose={() => setShowModal(false)} />
            )}
            <PaymentSelectionModal
                isOpen={showPaymentSelection}
                onClose={() => setShowPaymentSelection(false)}
                onOnlinePayment={handleOnlinePayment}
                packageId={priceData?.id}
                onBankTransfer={handleBankTransfer}
                bankDetails={bankDetails}
                activePaymentGateway={getActivePaymentGateway()}
                bankTransferActive={bankTransferActive}
                hasOnlinePayment={hasActiveOnlinePayment()}
            />
            
        </Layout>
    );
};

export default SubscriptionPlan; 