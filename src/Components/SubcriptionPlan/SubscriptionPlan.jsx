"use client";
import React, { useCallback, useEffect, useState } from "react";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
import { BiSolidCheckCircle } from "react-icons/bi";
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
  createAllPaymentIntentApi,
  createPaymentIntentApi,
  flutterwaveApi,
  generateRazorpayOrderIdApi,
  getPackagesApi,
  getPaymentSettingsApi,
  paymentTransactionFailApi,
  paypalApi,
} from "@/store/actions/campaign";
import PackageCard from "@/Components/Skeleton/PackageCard";
import { settingsData } from "@/store/reducer/settingsSlice";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import Swal from "sweetalert2";
import NoData from "@/Components/NoDataFound/NoData";
import { useRouter } from "next/router";
import Layout from "../Layout/Layout";
import { userSignUpData } from "@/store/reducer/authSlice";
import LoginModal from "../LoginModal/LoginModal";
// Import Razorpay component
import useRazorpay from "react-razorpay";
import PaystackPop from "@paystack/inline-js";
import StripePayment from "../Payment/StripePayment";
import SubscriptionCard from "../Cards/SubscriptionCard";

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

  const [showPaypalModal, setShowPaypal] = useState(false);

  const [showFlutterwaveModal, setShowFlutterwaveModal] = useState(false);

  const language = store.getState().Language.languages;

  const systemsettings = useSelector(settingsData);

  const [showModal, setShowModal] = useState(false);

  const lang = useSelector(languageData);
  // useSelector(languageData)
  useEffect(() => {}, [lang]);
  // Check if Stripe gateway is active
  const stripeActive = paymentSettingsdata.some(
    (item) => item.type === "stripe_gateway" && item.data === "1"
  );

  // Check if Razorpay gateway is active
  const razorpayActive = paymentSettingsdata.some(
    (item) => item.type === "razorpay_gateway" && item.data === "1"
  );

  // Check if PayStack gateway is active
  const payStackActive = paymentSettingsdata.some(
    (item) => item.type === "paystack_gateway" && item.data === "1"
  );

  // Check if PayStack gateway is active
  const payPalActive = paymentSettingsdata.some(
    (item) => item.type === "paypal_gateway" && item.data === "1"
  );
  // Check if Flutterwave gateway is active
  const FlutterwaveActive = paymentSettingsdata.some(
    (item) => item.type === "flutterwave_status" && item.data === "1"
  );

  const getPaystackCurrency = (paymentSettings) => {
    const paystackCurrencySetting = paymentSettings.find(
      (setting) => setting.type === "paystack_currency"
    );
    return paystackCurrencySetting ? paystackCurrencySetting.data : null;
  };

  const paystackCurrency = getPaystackCurrency(paymentSettingsdata);

  const razorKeyObject = paymentSettingsdata.find(
    (item) => item.type === "razor_key"
  );
  const razorKey = razorKeyObject ? razorKeyObject.data : null;

  const payStackKeyObject = paymentSettingsdata.find(
    (item) => item.type === "paystack_public_key"
  );
  const payStackPublicKey = payStackKeyObject ? payStackKeyObject.data : null;

  const stripeKeyObject = paymentSettingsdata.find(
    (item) => item.type === "stripe_currency"
  );
  const stripeCurrency = stripeKeyObject ? stripeKeyObject.data : null;

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const breakpoints = {
    0: {
      slidesPerView: 1.2,
    },
    768: {
      slidesPerView: 2.2,
    },
    992: {
      slidesPerView: 3.2,
    },
    1200: {
      slidesPerView: 4,
    },
  };

  const isUserLogin = isLogin();

  // get packages api
  const fetchPackages = () => {
    try {
      setLoading(true);
      getPackagesApi(
        (res) => {
          setLoading(false);
          const packageData = res?.data || [];
          const allFeatures = res?.all_features || [];
          const allActivePackages = res?.active_packages || [];

          // Combine both lists (active packages + all packages)
          const combinedPackages = [...allActivePackages, ...packageData];

          // Sort to ensure active packages (is_active === 1) appear first
          const sortedPackages = combinedPackages.sort((a, b) => {
            return b.is_active - a.is_active;
          });

          // Set final sorted data
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

  // payment settings api
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

  // subscribe payment
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
      return false;
    }
    if (systemsettings.demo_mode) {
      Swal.fire({
        title: translate("opps"),
        text: translate("notAllowdDemo"),
        icon: "warning",
        showCancelButton: false,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        confirmButtonText: translate("ok"),
      });
      return false;
    }
    setPriceData(data);
    // here condition based on if before subscription is active
    if (isUserLogin) {
      paymentModalChecker(e, data);
    }
  };

  // paymentModalChecker
  const paymentModalChecker = (e, data) => {
    e.preventDefault();
    
    if (data?.package_type === "free") {
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
    } else {
      if (
        !stripeActive &&
        !razorpayActive &&
        !payStackActive &&
        !payPalActive &&
        !FlutterwaveActive
      ) {
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
          // Redirect to contact us page or handle accordingly
          router.push("/contact-us");
        });
      } else {
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
      }
    }
  };

  // Example usage of the filter function
  const stripe_currency = systemsettings?.currency_symbol;

  const createPaymentIntent = () => {
    try {
      // create payment api
      createAllPaymentIntentApi({
        package_id: priceData?.id,
        platform_type: "web",
        onSuccess: (res) => {
          const paymentData = res?.data;
          setPaymentTransactionId(paymentData?.payment_intent?.payment_transaction_id);
          setclientKey(
            paymentData?.payment_intent?.payment_gateway_response?.client_secret
          );
        },
        onError: (err) => {
          console.log(err);
          // Set loading state to false in case of error
          setLoading(false);
        },
      });
    } catch (error) {
      console.error("An error occurred during payment submission:", error);
      // Set loading state to false in case of an exception
      setLoading(false);
    }
  };
  useEffect(() => {
    if (stripeformModal) {
      createPaymentIntent();
    }
  }, [stripeformModal]);

  useEffect(() => {}, [priceData]);

  const [Razorpay, isLoaded] = useRazorpay();
  const handlePayment = useCallback(async () => {
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
              ondismiss: function() {
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
  }, [systemsettings, priceData, user]);

  useEffect(() => {
    if (showRazorpayModal) {
      handlePayment();
    }
  }, [showRazorpayModal, handlePayment]);

  // paystack submit
  const handlePayStackPayment = async () => {
    try {
   
      // // Open the payment iframe
      // handler.openIframe();
      createAllPaymentIntentApi({
        package_id: priceData?.id,
        platform_type: "web",
        onSuccess: (res) => {
          const payStackLink = res?.data?.payment_intent?.payment_gateway_response?.data?.authorization_url;
          if (payStackLink) {
            // Open payStackLink in new tab
            window.location.href = payStackLink;
          }
        },
        onError: (err) => {
          console.log("err", err);
        },
      });
    } catch (error) {
      // Handle unexpected errors
      console.error("An error occurred while processing the payment:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };
  // paypal payment method
  const handlePaypalPayment = async () => {
    try {
      await new Promise((resolve, reject) => {
        paypalApi({
          package_id: priceData?.id,
          amount: priceData?.price,
          onSuccess: (res) => {
            // Create a temporary DOM element to parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(res, "text/html");

            // Find the form
            const form = doc.querySelector('form[name="paypal_auto_form"]');

            if (form) {
              // Get the form action URL
              const paypalUrl = form.action;

              // Collect form data
              const formData = new FormData(form);
              const urlParams = new URLSearchParams(formData);

              // Redirect to PayPal with the form data
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
      // Handle the error (e.g., show an error message to the user)
    }
  };
  const handleFlutterwavePayment = () => {
    try {
      flutterwaveApi({
        package_id: priceData?.id,
        onSuccess: (res) => {
          const flutterwaveLink = res?.data?.data?.link;
          if (flutterwaveLink) {
            // Open flutterwaveLink in new tab
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
  useEffect(() => {
    if (showPaystackModal) {
      handlePayStackPayment();
    }
    if (showPaypalModal) {
      handlePaypalPayment();
    }
    if (showFlutterwaveModal) {
      handleFlutterwavePayment();
    }
  }, [
    showPaystackModal,
    showPaypalModal,
    showFlutterwaveModal,
    priceData.price,
    user?.email,
    priceData.id,
  ]);

  return (
    <Layout>
      <Breadcrumb title={translate("subscriptionPlan")} />

      <section id="subscription" className="mb-5">
        <div className="container">
          <div>
            <span className="headline">
              {translate("chooseA")}{" "}
              <span>
                <span className=""> {translate("plan")}</span>
              </span>{" "}
              {translate("thatsRightForYou")}
            </span>
          </div>

          <div className="subsCards-Wrapper pt-3">
            {/* this is for packages buy */}
            <Swiper
              dir={language.rtl === 1 ? "rtl" : "ltr"}
              slidesPerView={4}
              // loop={true}
              spaceBetween={30}
              freeMode={true}
              pagination={{
                clickable: true,
              }}
              modules={[FreeMode, Pagination]}
              className="subscription-swiper"
              breakpoints={breakpoints}
            >
              {loading ? (
                <>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Swiper
                      dir={language.rtl === 1 ? "rtl" : "ltr"}
                      slidesPerView={4}
                      // loop={true}
                      spaceBetween={30}
                      freeMode={true}
                      pagination={{
                        clickable: true,
                      }}
                      modules={[FreeMode, Pagination]}
                      className="subscription-swiper"
                      breakpoints={breakpoints}
                    >
                      <SwiperSlide key={index}>
                        <div
                          className="col-lg-3 col-md-6 col-12 main_box"
                          key={index}
                        >
                          <PackageCard />
                        </div>
                      </SwiperSlide>
                    </Swiper>
                  ))}
                </>
              ) : (
                <>
                  {packagedata.length > 0 ? (
                    packagedata.map((elem, index) => (
                      <SwiperSlide key={index}>
                        <SubscriptionCard
                          elem={elem}
                          subscribePayment={subscribePayment}
                          systemsettings={systemsettings}
                          allFeatures={allFeatures}
                        />
                      </SwiperSlide>
                    ))
                  ) : (
                    <>
                      <div className="noDataFoundDiv">
                        <NoData />
                      </div>
                    </>
                  )}
                </>
              )}
            </Swiper>
          </div>
        </div>
      </section>

      {stripeActive && stripeformModal && (
        <>
          <StripePayment
            clientKey={clientKey}
            open={stripeformModal}
            setOpen={setStripeFormModal}
            currency={stripe_currency}
            payment_transaction_id={paymentTransactionId}
          />
        </>
      )}
      {showModal && (
        <LoginModal isOpen={showModal} onClose={handleCloseModal} />
      )}
    </Layout>
  );
};

export default SubscriptionPlan;
