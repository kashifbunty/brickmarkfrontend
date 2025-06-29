"use client";
import {
  GetOTPApi,
  userRegisterApi,
  verifyOTPApi,
  forgotPasswordApi,
} from "@/store/actions/campaign";
import { signupLoaded } from "@/store/reducer/authSlice";
import { Fcmtoken, settingsData } from "@/store/reducer/settingsSlice";
import FirebaseData from "@/utils/Firebase";
import { handleFirebaseAuthError, translate } from "@/utils/helper";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
} from "firebase/auth";
import { PhoneNumberUtil } from "google-libphonenumber";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle, FcPhoneAndroid } from "react-icons/fc";
import { RiCloseCircleLine, RiMailSendFill } from "react-icons/ri";
import PhoneInput, { parsePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

// Reusable Google Sign-In Button
const GoogleSignInButton = ({ onClick, icon, text }) => (
  <div className="google_signup mt-3" onClick={onClick}>
    <button className="google_signup_button">
      <div className="google_icon">{icon}</div>
      <span className="google_text">{text}</span>
    </button>
  </div>
);

// Reusable Footer Links
const FooterLinks = () => (
  <span>
    {translate("byclick")}{" "}
    <Link href="/terms-and-condition">{translate("terms&condition")}</Link>{" "}
    <span className="mx-1"> {translate("and")} </span>{" "}
    <Link href="/privacy-policy"> {translate("privacyPolicy")} </Link>
  </span>
);

// Phone Login Form Component
const PhoneLoginForm = ({
  value,
  setValue,
  onSignUp,
  ShowGoogleLogin,
  handleEmailLoginshow,
  CompanyName,
  handleGoogleSignup,
  ShowPhoneLogin,
  showLoader,
}) => (
  <>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSignUp(e);
      }}
    >
      <div className="modal-body-heading">
        <h4>{translate("enterMobile")}</h4>
        <span>{translate("sendCode")}</span>
      </div>
      <div className="mobile-number">
        <label className="is_require" htmlFor="phone">
          {translate("phoneNumber")}
        </label>
        <PhoneInput
          defaultCountry={process.env.NEXT_PUBLIC_DEFAULT_COUNTRY}
          international
          value={value}
          onChange={setValue}
          className="custom-phone-input"
        />
      </div>
      <div className="continue">
        <button type="submit" className="continue-button" disabled={showLoader}>
          {showLoader ? (
            <div className="loader-container-otp">
              <div className="loader-otp"></div>
            </div>
          ) : (
            translate("continue")
          )}
        </button>
      </div>
    </form>

    {ShowGoogleLogin && (
      <div className="or_devider">
        <hr style={{ borderStyle: "dashed" }} />
        <span className="or_divider">{translate("or")}</span>
        <hr style={{ borderStyle: "dashed" }} />
      </div>
    )}

    <GoogleSignInButton
      onClick={handleEmailLoginshow}
      icon={<RiMailSendFill size={25} />}
      text={translate("CWE")}
    />

    {ShowGoogleLogin && (
      <>
        {!ShowPhoneLogin && (
          <div className="modal-body-heading">
            <h4>
              {translate("loginTo")} {CompanyName}
            </h4>
            <span>{translate("connectWithGoogle")}</span>
          </div>
        )}
        <GoogleSignInButton
          onClick={handleGoogleSignup}
          icon={<FcGoogle size={25} />}
          text={translate("CWG")}
        />
      </>
    )}
  </>
);

// OTP Form Component
const OTPForm = ({
  phonenum,
  otp,
  setOTP,
  handleConfirm,
  showLoader,
  isCounting,
  timeLeft,
  formatTime,
  handleResendOTP,
  wrongNumber,
  wrongEmail,
  isEmailOtpEnabled,
  emailOtp = "", // Initialize as a string
  setEmailOtp,
  handleEmailOtpVerification,
  emailTimeLeft,
  isEmailCounting,
  email,
}) => {
  const inputRefs = useRef(Array(6).fill(null)); // Initialize with 6 null values
  const [focusedIndex, setFocusedIndex] = useState(-1); // Initialize with -1 (no focus)
  // Handle phone OTP input change
  const handlePhoneOtpChange = (event, index) => {
    const value = event.target.value;
    if (!isNaN(value) && value !== "") {
      setOTP((prevOTP) => {
        const newOTP = prevOTP.split(""); // Convert string to array
        newOTP[index] = value;
        return newOTP.join(""); // Convert back to string
      });

      // Move focus to the next input field if available
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
        setFocusedIndex(index + 1); // Update focused index
      }
    }
  };

  // Handle email OTP input change
  const handleEmailOtpChange = (event, index) => {
    const value = event.target.value;
    if (!isNaN(value) && value !== "") {
      setEmailOtp((prevOTP) => {
        const newOTP = prevOTP.split(""); // Convert string to array
        newOTP[index] = value;
        return newOTP.join(""); // Convert back to string
      });

      // Move focus to the next input field if available
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
        setFocusedIndex(index + 1); // Update focused index
      }
    }
  };
  // Handle phone OTP backspace and Enter key
  const handlePhoneOtpKeyDown = (event, index) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      setOTP((prevOTP) => {
        const newOTP = prevOTP.split(""); // Convert string to array
        newOTP[index] = ""; // Clear the current input
        return newOTP.join(""); // Convert back to string
      });

      // Move focus to the previous input field if the current field is empty
      if (index > 0 && !otp[index]) {
        inputRefs.current[index - 1].focus();
        setFocusedIndex(index - 1); // Update focused index
      } else {
        inputRefs.current[index].focus(); // Keep focus on the current input field
        setFocusedIndex(index); // Update focused index
      }
    } else if (event.key === "Enter") {
      // If the Enter key is pressed and all OTP fields are filled
      if (
        index === 5 &&
        otp.length === 6 &&
        otp.split("").every((digit) => digit !== "")
      ) {
        handleConfirm(); // Trigger the phone OTP verification function
      }
    }
  };

  // Handle email OTP backspace and Enter key
  const handleEmailOtpKeyDown = (event, index) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      setEmailOtp((prevOTP) => {
        const newOTP = prevOTP.split(""); // Convert string to array
        newOTP[index] = ""; // Clear the current input
        return newOTP.join(""); // Convert back to string
      });

      // Move focus to the previous input field if the current field is empty
      if (index > 0 && !emailOtp[index]) {
        inputRefs.current[index - 1].focus();
        setFocusedIndex(index - 1); // Update focused index
      } else {
        inputRefs.current[index].focus(); // Keep focus on the current input field
        setFocusedIndex(index); // Update focused index
      }
    } else if (event.key === "Enter") {
      // If the Enter key is pressed and all OTP fields are filled
      if (
        index === 5 &&
        emailOtp.length === 6 &&
        emailOtp.split("").every((digit) => digit !== "")
      ) {
        handleEmailOtpVerification(event); // Trigger the email OTP verification function
      }
    }
  };

  return (
    <form>
      <div className="modal-body-heading">
        <h4>{translate("otpVerification")}</h4>
        {email ? (
          <span>{translate("enterOtpSentToEmail")}</span>
        ) : (
          <span>{translate("enterOtp")}</span>
        )}
        <span>
          {""} {email ? email : phonenum}{" "}
        </span>
        {email ? (
          <p className="wrong_number" onClick={wrongEmail}>
            {translate("wrongEmail")}
          </p>
        ) : (
          <p className="wrong_number" onClick={wrongNumber}>
            {translate("wrongNumber")}
          </p>
        )}
      </div>

      {/* OTP Input Fields */}
      <div className="userInput">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            className={`otp-field ${focusedIndex === index ? "focused" : ""}`} // Add "focused" class conditionally
            type="text"
            maxLength={1}
            value={
              isEmailOtpEnabled
                ? emailOtp[index] || "" // Ensure emailOtp[index] is safe to access
                : otp[index] || ""
            }
            onChange={
              isEmailOtpEnabled
                ? (e) => handleEmailOtpChange(e, index)
                : (e) => handlePhoneOtpChange(e, index)
            }
            onKeyDown={
              isEmailOtpEnabled
                ? (e) => handleEmailOtpKeyDown(e, index)
                : (e) => handlePhoneOtpKeyDown(e, index)
            }
            onFocus={() => setFocusedIndex(index)} // Set focused index on focus
            onBlur={() => setFocusedIndex(-1)} // Reset focused index on blur
            ref={(inputRef) => (inputRefs.current[index] = inputRef)} // Assign refs correctly
          />
        ))}
      </div>

      {/* Resend OTP Section */}
      <div className="resend-code">
        {isEmailOtpEnabled ? (
          !isEmailCounting ? (
            <span
              id="re-text"
              onClick={handleResendOTP}
              style={{ cursor: "pointer", color: "blue" }}
            >
              {translate("resendOtp")}
            </span>
          ) : (
            <>
              <span id="re-text">{formatTime(emailTimeLeft)}</span>
            </>
          )
        ) : // Phone OTP Resend
        !isCounting ? (
          <span
            id="re-text"
            onClick={handleResendOTP}
            style={{ cursor: "pointer", color: "blue" }}
          >
            {translate("resendOtp")}
          </span>
        ) : (
          <span id="re-text">{formatTime(timeLeft)}</span>
        )}
      </div>

      {/* Continue Button */}
      <div className="continue">
        <button
          type="submit"
          className="continue-button"
          onClick={(e) =>
            isEmailOtpEnabled ? handleEmailOtpVerification(e) : handleConfirm(e)
          }
          
        >
          {showLoader ? (
            <div className="loader-container-otp">
              <div className="loader-otp"></div>
            </div>
          ) : (
            <span>{translate("confirm")}</span>
          )}
        </button>
      </div>
    </form>
  );
};

// Register Form Component
const RegisterForm = ({
  registerFormData,
  handleRegisterInputChange,
  handleRegisterPhoneChange,
  handleRegisterUser,
  handleSignIn,
  showLoader,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="register-form">
      <form onSubmit={handleRegisterUser}>
        <div className="form-group">
          <label className="is_require" htmlFor="name">
            {translate("username")}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder={translate("enterUsername")}
            value={registerFormData?.name}
            onChange={handleRegisterInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="is_require" htmlFor="email">
            {translate("email")}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder={translate("enterEmail")}
            value={registerFormData?.email}
            onChange={handleRegisterInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">{translate("phoneNumber")}</label>
          <PhoneInput
            defaultCountry={process.env.NEXT_PUBLIC_DEFAULT_COUNTRY}
            international
            value={registerFormData?.phone}
            onChange={handleRegisterPhoneChange}
            className="custom-phone-input"
          />
        </div>

        <div className="form-group">
          <label className="is_require" htmlFor="password">
            {translate("password")}
          </label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder={translate("enterPassword")}
              value={registerFormData?.password}
              onChange={handleRegisterInputChange}
              required
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="is_require" htmlFor="confirmPassword">
            {translate("confirmPassword")}
          </label>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              placeholder={translate("enterConfirmPassword")}
              value={registerFormData?.confirmPassword}
              onChange={handleRegisterInputChange}
              required
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <button type="submit" className="register-button" disabled={showLoader}>
          {showLoader ? (
            <div className="loader-container-otp">
              <div className="loader-otp"></div>
            </div>
          ) : (
            translate("register")
          )}
        </button>

        <p className="sign-up-text">
          {translate("alreadyHaveAccount")}{" "}
          <span className="sign-up" onClick={handleSignIn}>
            {translate("signIn")}
          </span>
        </p>
      </form>
    </div>
  );
};

// Forgot Password Form Component
const ForgotPasswordForm = ({ onSubmit, showLoader, onBackToLogin }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <div className="register-form">
      <form onSubmit={handleSubmit}>
        <div className="modal-body-heading">
          <h4>{translate("forgotPassword")}</h4>
          <span>{translate("enterEmailForReset")}</span>
        </div>

        <div className="form-group">
          <label className="is_require" htmlFor="forgot-email">
            {translate("email")}
          </label>
          <input
            type="email"
            id="forgot-email"
            name="email"
            placeholder={translate("enterEmail")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="register-button" disabled={showLoader}>
          {showLoader ? (
            <div className="loader-container-otp">
              <div className="loader-otp"></div>
            </div>
          ) : (
            translate("submit")
          )}
        </button>

        <p className="back-to-login">
          <span onClick={onBackToLogin}>← {translate("backToLogin")}</span>
        </p>
      </form>
    </div>
  );
};

// Email Login Form Component
const EmailLoginForm = ({
  signInFormData,
  handleSignInInputChange,
  SignInWithEmail,
  handlesignUp,
  ShowGoogleLogin,
  ShowPhoneLogin,
  handlePhoneLogin,
  handleGoogleSignup,
  showLoader,
  emailReverify,
  onForgotPasswordClick,
  handleResendOTP,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="register-form">
      <form>
        <div className="form-group">
          <label className="is_require" htmlFor="email">
            {translate("email")}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder={translate("enterEmail")}
            value={signInFormData?.email}
            onChange={handleSignInInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="is_require" htmlFor="password">
            {translate("password")}
          </label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder={translate("enterPassword")}
              value={signInFormData?.password}
              onChange={handleSignInInputChange}
              required
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="forgot-password-container">
          <span
            className="forgot-password-link"
            onClick={onForgotPasswordClick}
          >
            {translate("forgotPassword")}
          </span>
        </div>

        {emailReverify ? (
          <button
            type="button"
            className="register-button"
            onClick={handleResendOTP}
            disabled={showLoader}
          >
            {showLoader ? (
              <div className="loader-container-otp">
                <div className="loader-otp"></div>
              </div>
            ) : (
              translate("resendVerificationCode")
            )}
          </button>
        ) : (
          <button
            type="button"
            className="register-button"
            onClick={(e) => SignInWithEmail(e)}
          >
            {translate("signIn")}
          </button>
        )}

        <p className="sign-up-text">
          {translate("dontHaveAccount")}{" "}
          <span className="sign-up" onClick={handlesignUp}>
            {translate("registerNow")}
          </span>
        </p>
      </form>

      <div>
        {ShowGoogleLogin && (
          <div className="or_devider">
            <hr style={{ borderStyle: "dashed" }} />
            <span className="or_divider">{translate("or")}</span>
            <hr style={{ borderStyle: "dashed" }} />
          </div>
        )}
        {ShowPhoneLogin && (
          <GoogleSignInButton
            onClick={handlePhoneLogin}
            icon={<FcPhoneAndroid size={25} />}
            text={translate("CWP")}
          />
        )}
        {ShowGoogleLogin && (
          <GoogleSignInButton
            onClick={handleGoogleSignup}
            icon={<FcGoogle size={25} />}
            text={translate("CWG")}
          />
        )}
      </div>
    </div>
  );
};

const LoginModal = ({ isOpen, onClose }) => {
  const SettingsData = useSelector(settingsData);
  const isDemo = SettingsData?.demo_mode;
  const CompanyName = SettingsData?.company_name;

  const ShowPhoneLogin = SettingsData?.number_with_otp_login === "1";
  const ShowGoogleLogin = SettingsData?.social_login === "1";
  const ShowEmailLogin = SettingsData?.email_password_login === "1";
  const isFirebaseOtp = SettingsData?.otp_service_provider === "firebase";
  const isTwilloOtp = SettingsData?.otp_service_provider === "twilio";

  const DefaultToPhoneLogin = !ShowPhoneLogin && !ShowGoogleLogin;
  const navigate = useRouter();
  const { authentication } = FirebaseData();
  const FcmToken = useSelector(Fcmtoken);
  const DemoNumber = "+911234567890";
  const DemoOTP = "123456";

  const [showLoginContent, setShowLoginContent] = useState(false);
  const [showOTPContent, setShowOtpContent] = useState(false);
  const [showRegisterContent, setShowRegisterContent] = useState(false);
  const [showEmailContent, setShowEmailContent] = useState(true);

  const [phonenum, setPhonenum] = useState();
  const [value, setValue] = useState(isDemo ? DemoNumber : "");
  const phoneUtil = PhoneNumberUtil.getInstance();
  const [otp, setOTP] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isCounting, setIsCounting] = useState(false);
  const inputRefs = useRef([]);
  const otpInputRef = useRef(null);

  const [isEmailOtpEnabled, setIsEmailOtpEnabled] = useState(false); // State to track email OTP
  const [emailOtp, setEmailOtp] = useState(""); // Initialize as an array of 6 emp
  const [emailTimeLeft, setEmailTimeLeft] = useState(120); // 2 minutes in seconds
  const [isEmailCounting, setIsEmailCounting] = useState(false); // State to track email OTP coun

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [emailReverify, setEmailReverify] = useState(false);

  // Handle countdown logic
  useEffect(() => {
    let timer;
    if (isCounting && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timer);
      setTimeLeft(0);
      setIsCounting(false);
    }
    return () => clearInterval(timer);
  }, [isCounting, timeLeft]);

  useEffect(() => {
    let timer;
    if (isEmailCounting && emailTimeLeft > 0) {
      timer = setInterval(() => {
        setEmailTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (emailTimeLeft === 0) {
      clearInterval(timer);
      setIsEmailCounting(false);
    }
    return () => clearInterval(timer);
  }, [isEmailCounting, emailTimeLeft]);

  const handleResendOTP = async () => {
    setShowLoader(true);
    try {
      if (isEmailOtpEnabled) {
        // Handle email OTP resend
        await GetOTPApi({
          email: signInFormData?.email || registerFormData?.email,
          onSuccess: (res) => {
            toast.success(res?.message);
            // Ensure these state updates happen after successful API call
            setShowEmailContent(false);
            setShowOtpContent(true);
            setEmailTimeLeft(120); // 10 minutes
            setIsEmailCounting(true); // Explicitly set to true
            setEmailOtp(""); // Reset email OTP input
            setShowLoader(false);
          },
          onError: (err) => {
            console.error(err);
            toast.error(err?.message || translate("failedToSendOTP"));
            // Reset counting if API fails
            setIsEmailCounting(false);
            setEmailTimeLeft(0);
            setShowLoader(false);
          },
        });
      } else {
        // Handle phone OTP resend
        if (isFirebaseOtp) {
          try {
            let appVerifier = window.recaptchaVerifier;
            const confirmationResult = await signInWithPhoneNumber(
              authentication,
              phonenum,
              appVerifier
            );
            window.confirmationResult = confirmationResult;
            toast.success(translate("otpSentsuccess"));

            if (isDemo) {
              setOTP(DemoOTP);
            }
            setTimeLeft(120);
            setIsCounting(true);
            setOTP(""); // Reset phone OTP input
            setShowLoader(false);
          } catch (error) {
            console.error("Firebase OTP error:", error);
            const errorCode = error.code;
            handleFirebaseAuthError(errorCode);
            setIsCounting(false);
            setTimeLeft(0);
            setShowLoader(false);
          }
        } else if (isTwilloOtp) {
          try {
            const parsedNumber = parsePhoneNumber(phonenum);
            const formattedNumber = parsedNumber.format("E.164").slice(1);

            await GetOTPApi({
              number: formattedNumber,
              onSuccess: (res) => {
                toast.success(res?.message);
                setTimeLeft(120);
                setIsCounting(true);
                setOTP(""); // Reset phone OTP input
                setShowLoader(false);
              },
              onError: (error) => {
                console.error(error);
                toast.error(error?.message || translate("failedToSendOTP"));
                setIsCounting(false);
                setTimeLeft(0);
                setShowLoader(false);
              },
            });
          } catch (error) {
            console.error("Twilio OTP error:", error);
            toast.error(translate("failedToSendOTP"));
            setIsCounting(false);
            setTimeLeft(0);
            setShowLoader(false);
          }
        }
      }
    } catch (error) {
      setShowLoader(false);
      console.error("Resend OTP error:", error);
      toast.error(translate("failedToSendOTP"));
      // Reset all counting states in case of error
      if (isEmailOtpEnabled) {
        setIsEmailCounting(false);
        setEmailTimeLeft(0);
      } else {
        setIsCounting(false);
        setTimeLeft(0);
      }
    }
  };

  const wrongNumber = (e) => {
    e.preventDefault();
    setShowOtpContent(false);
    setShowLoginContent(true);
    setTimeLeft(0);
    setIsCounting(false);
  };
  const wrongEmail = (e) => {
    e.preventDefault();
    setShowOtpContent(false);
    setShowLoginContent(false);
    setShowEmailContent(true);
    setTimeLeft(0);
    setIsCounting(false);
  };

  const generateRecaptcha = () => {
    if (!window?.recaptchaVerifier) {
      const recaptchaContainer = document.getElementById("recaptcha-container");
      if (recaptchaContainer) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          authentication,
          recaptchaContainer,
          {
            size: "invisible",
            callback: (response) => {},
          }
        );
      } else {
        console.error("recaptcha-container element not found");
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateRecaptcha();
      // setShowLoader(true);
      return () => {
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          } catch (error) {
            console.error("Error clearing recaptchaVerifier:", error);
          }
        }

        const recaptchaContainer = document.getElementById(
          "recaptcha-container"
        );
        if (recaptchaContainer) {
          recaptchaContainer.remove();
        }
      };
    }
  }, [isOpen]);

  const generateOTPWithTwilio = async (phoneNumber) => {
    setShowLoader(true);
    const parsedNumber = parsePhoneNumber(phoneNumber);
    const formattedNumber = parsedNumber.format("E.164").slice(1);
    try {
      GetOTPApi({
        number: formattedNumber,
        onSuccess: (res) => {
          setShowLoginContent(false);
          setShowOtpContent(true);
          setTimeLeft(120);
          setIsCounting(true);
          toast.success(res?.message);
          setShowLoader(false);
        },
        onError: (error) => {
          console.log(error);
          toast.error(error?.message);
          setShowLoader(false);
        },
      });
    } catch (error) {
      console.error("Error generating OTP with Twilio:", error);
      toast.error(error.message || translate("otpSendFailed"));
      setShowLoader(false);
    }
  };

  const onSignUp = async (e) => {
    e.preventDefault();
    if (!value) {
      toast.error(translate("enterPhoneNumber"));
      return;
    }

    try {
      const phoneNumber = phoneUtil.parseAndKeepRawInput(value, "ZZ");
      if (!phoneUtil.isValidNumber(phoneNumber)) {
        toast.error(translate("validPhonenum"));
        return;
      }

      setShowLoader(true); // Set loader before any async operations
      setPhonenum(value);

      if (isFirebaseOtp) {
        await generateOTP(value);
      } else if (isTwilloOtp) {
        await generateOTPWithTwilio(value);
      }

      // Only change views after successful OTP generation
      setShowLoginContent(false);
      setShowOtpContent(true);

      if (isDemo) {
        setValue(DemoNumber);
      } else {
        setValue("");
      }
    } catch (error) {
      console.error("Error parsing phone number:", error);
      toast.error(translate("validPhonenum"));
      setShowLoader(false);
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const response = await signInWithPopup(authentication, provider);
      signupLoaded({
        name: response?.user?.displayName,
        email: response?.user?.email,
        type: "0",
        auth_id: response?.user?.uid,
        profile: response?.user?.photoURL,
        fcm_id: FcmToken,
        onSuccess: (res) => {
          if (!res.error) {
            toast.success(res.message);
            onCloseLogin();
          }
        },
        onError: (err) => {
          if (
            err ===
            "Account Deactivated by Administrative please connect to them"
          ) {
            onCloseLogin();
            Swal.fire({
              title: translate("opps"),
              text: translate("accountDeactivatedByAdmin"),
              icon: "warning",
              showCancelButton: false,
              customClass: {
                confirmButton: "Swal-confirm-buttons",
                cancelButton: "Swal-cancel-buttons",
              },
              confirmButtonText: translate("ok"),
            }).then((result) => {
              if (result.isConfirmed) {
                navigate.push("/contact-us");
              }
            });
          }
        },
      });
    } catch (error) {
      console.error(error);
      toast.error(translate("popupCancel"));
    }
  };

  const onCloseLogin = (e) => {
    if (e) {
      e.stopPropagation();
    }
    onClose();
    setShowOtpContent(false);
    setOTP("");
    setTimeLeft(0);
    setIsCounting(false);
    setShowLoginContent(true);
  };

  const generateOTP = async (phoneNumber) => {
    if (!window.recaptchaVerifier) {
      console.error("window.recaptchaVerifier is null, unable to generate OTP");
      setShowLoader(false);
      return;
    }

    try {
      let appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        authentication,
        phoneNumber,
        appVerifier
      );
      window.confirmationResult = confirmationResult;
      toast.success(translate("otpSentsuccess"));

      if (isDemo) {
        setOTP(DemoOTP);
      }
      setTimeLeft(120);
      setIsCounting(true);
      setShowLoader(false);
    } catch (error) {
      console.error("Error generating OTP:", error);
      const errorCode = error.code;
      handleFirebaseAuthError(errorCode);
      setShowLoader(false);
    }
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (otp === "") {
      toast.error(translate("pleaseEnterOtp"));
      return;
    }
    setShowLoader(true);
    if (isFirebaseOtp) {
      let confirmationResult = window.confirmationResult;
      confirmationResult
        .confirm(otp)
        .then(async (result) => {
          signupLoaded({
            mobile: result.user.phoneNumber.replace("+", ""),
            type: "1",
            auth_id: result.user.uid,
            fcm_id: FcmToken,
            onSuccess: (res) => {
              if (!res.error) {
                setShowLoader(false);
                toast.success(res.message);
                onCloseLogin();
              }
            },
            onError: (err) => {
              setShowLoader(false);
              console.log(err);
              if (
                err ===
                "Account Deactivated by Administrative please connect to them"
              ) {
                onCloseLogin();
                Swal.fire({
                  title: translate("opps"),
                  text: translate("accountDeactivatedByAdmin"),
                  icon: "warning",
                  showCancelButton: false,
                  customClass: {
                    confirmButton: "Swal-confirm-buttons",
                    cancelButton: "Swal-cancel-buttons",
                  },
                  confirmButtonText: translate("ok"),
                }).then((result) => {
                  if (result.isConfirmed) {
                    navigate.push("/contact-us");
                  }
                });
              }
            },
          });
        })
        .catch((error) => {
          setShowLoader(false);
          console.log(error);
          const errorCode = error.code;
          handleFirebaseAuthError(errorCode);
        });
    } else if (isTwilloOtp) {
      try {
        verifyOTPApi({
          number: phonenum,
          otp: otp,
          onSuccess: (res) => {
            signupLoaded({
              mobile: phonenum?.replace("+", ""),
              type: "1",
              auth_id: res.auth_id,
              onSuccess: (res) => {
                if (!res.error) {
                  setShowLoader(false);
                  toast.success(res.message);
                  onCloseLogin();
                }
              },
              onError: (err) => {
                console.log(err);
                setShowLoader(false);
                toast.error(err);
                if (
                  err ===
                  "Account Deactivated by Administrative please connect to them"
                ) {
                  onCloseLogin();
                  Swal.fire({
                    title: translate("opps"),
                    text: translate("accountDeactivatedByAdmin"),
                    icon: "warning",
                    showCancelButton: false,
                    customClass: {
                      confirmButton: "Swal-confirm-buttons",
                      cancelButton: "Swal-cancel-buttons",
                    },
                    confirmButtonText: translate("ok"),
                  }).then((result) => {
                    if (result.isConfirmed) {
                      navigate.push("/contact-us");
                    }
                  });
                }
              },
            });
          },
          onError: (error) => {
            console.log(error);
            toast.error(error);
            setShowLoader(false);
          },
        });
      } catch (error) {
        console.error("Error verifying OTP with Twilio:", error);
        toast.error(error.message || translate("otpVerificationFailed"));
        setShowLoader(false);
      }
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  const handlesignUp = () => {
    setShowRegisterContent(true);
    setShowLoginContent(false);
    setShowEmailContent(false);
    setShowOtpContent(false);
    setShowForgotPassword(false);
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setShowRegisterContent(false);
    setShowOtpContent(false);
    setShowLoginContent(true);
    setShowEmailContent(false);
  };

  const [registerFormData, setRegisterFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [signInFormData, setSignInFormData] = useState({
    email: "",
    password: "",
  });

  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;

    setRegisterFormData({
      ...registerFormData,
      [name]: value,
    });
  };

  const handleSignInInputChange = (e) => {
    const { name, value } = e.target;
    // Check if the field being changed is the email
    if (name === "email") {
      if (value !== signInFormData.email) {
        setEmailReverify(false); // Email has been changed, set reverify flag
      }
    }

    setSignInFormData({
      ...signInFormData,
      [name]: value,
    });
  };

  const handleRegisterPhoneChange = (value) => {
    setRegisterFormData({
      ...registerFormData,
      phone: value,
    });
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();

    // Validation checks
    if (registerFormData?.password.length < 6) {
      toast.error(translate("passwordLengthError"));
      return;
    }

    if (registerFormData?.password !== registerFormData?.confirmPassword) {
      toast.error(translate("passwordsNotMatch"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerFormData?.email)) {
      toast.error(translate("invalidEmail"));
      return;
    }

    // if (!registerFormData?.phone) {
    //   toast.error(translate("phoneRequired"));
    //   return;
    // }

    // Set loader to true before the API call
    setShowLoader(true);

    try {
      const formattedPhone =
        registerFormData?.phone && registerFormData?.phone.replace("+", "");
      // Make the API call
      await userRegisterApi({
        name: registerFormData?.name,
        email: registerFormData?.email,
        mobile: formattedPhone ? formattedPhone : "",
        password: registerFormData?.password,
        re_password: registerFormData?.confirmPassword,
        onSuccess: (res) => {
          setIsEmailOtpEnabled(true);
          setShowRegisterContent(false);
          setShowOtpContent(true);
          setEmailTimeLeft(120);
          setIsEmailCounting(true);
          toast.success(translate("otpSentToEmail"));
          setShowLoader(false);
        },
        onError: (err) => {
          console.error(err);
          toast.error(err.message);
          setShowLoader(false);
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(translate("registrationFailed"));
      setShowLoader(false);
    }
  };
  const handleEmailLoginshow = (e) => {
    e.preventDefault();
    setShowEmailContent(true);
    setShowLoginContent(false);
  };

  const SignInWithEmail = async (e) => {
    e.preventDefault();

    if (!signInFormData?.email || !signInFormData?.password) {
      toast.error(translate("allFieldsRequired"));
      return;
    }

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      signInFormData?.email
    );
    if (!isEmailValid) {
      toast.error(translate("invalidEmail"));
      return;
    }

    setShowLoader(true);

    try {
      await signupLoaded({
        type: "3",
        email: signInFormData?.email,
        password: signInFormData?.password,
        fcm_id: FcmToken,
        onSuccess: (res) => {
          if (!res.error) {
            setShowLoader(false);
            toast.success(res.message);
            onCloseLogin();
          }
        },
        onError: (error) => {
          console.log("error while login with email", error);
          if (error.message === "Email is not verified") {
            setShowLoader(false);
            setEmailReverify(true);
            setIsEmailOtpEnabled(true);
            toast.error(translate("pleaseVerifyEmail"));
          } else if (
            error.message ===
            "Account Deactivated by Administrative please connect to them"
          ) {
            setShowLoader(false);
            Swal.fire({
              title: translate("opps"),
              text: translate("accountDeactivatedByAdmin"),
              icon: "warning",
              showCancelButton: false,
              customClass: {
                confirmButton: "Swal-confirm-buttons",
                cancelButton: "Swal-cancel-buttons",
              },
              confirmButtonText: translate("ok"),
            }).then((result) => {
              if (result.isConfirmed) {
                navigate.push("/contact-us");
              }
            });
          } else {
            toast.error(error.message || translate("loginFailed"));
            setShowLoader(false);
          }
        },
      });
    } catch (error) {
      console.error("SignInWithEmail error:", error);
      toast.error(translate("somethingWentWrong"));
      setShowLoader(false);
    }
  };

  const handleEmailOtpVerification = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // const otpValue = emailOtp.join(""); // Join the array into a string
    if (emailOtp === "") {
      toast.error(translate("pleaseEnterOTP"));
      return;
    }
    setShowLoader(true);
    try {
      // Call the API to verify the email OTP
      verifyOTPApi({
        email: registerFormData?.email
          ? registerFormData?.email
          : signInFormData?.email,
        otp: emailOtp,
        onSuccess: (res) => {
          toast.success(res?.message);
          setShowOtpContent(false); // Hide OTP section
          setShowEmailContent(true); // Show email login form
          setEmailReverify(false);
          setIsEmailOtpEnabled(false);
          setShowLoader(false);
        },
        onError: (err) => {
          console.log(err);
          toast.error(err.message || "OTP verification failed");
          setShowLoader(false);
        },
      });
    } catch (error) {
      console.log(error);
      setShowLoader(false);
    }
  };

  const handlePhoneLogin = (e) => {
    e.preventDefault();
    setShowLoginContent(true);
    setShowEmailContent(false);
    setShowOtpContent(false);
    setShowRegisterContent(false);
  };

  const handleForgotPasswordSubmit = async (email) => {
    if (!email) {
      toast.error(translate("pleaseEnterEmail"));
      return;
    }

    setShowLoader(true);

    try {
      await forgotPasswordApi({
        email: email,
        onSuccess: (response) => {
          toast.success(
            response?.message || translate("passwordResetEmailSent")
          );
          // Reset form and show email login screen
          setSignInFormData({ email: "", password: "" });
          setShowForgotPassword(false);
          setShowEmailContent(true);
          setShowLoginContent(false);
          setShowOtpContent(false);
          setShowRegisterContent(false);
          setShowLoader(false);
        },
        onError: (error) => {
          toast.error(error.message || translate("failedToSendResetEmail"));
          setShowLoader(false);
        },
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(translate("somethingWentWrong"));
      setShowLoader(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setShowEmailContent(false);
    setShowLoginContent(false);
    setShowOtpContent(false);
    setShowRegisterContent(false);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setShowEmailContent(true);
  };

  return (
    <>
      <Modal
        show={isOpen}
        onHide={onCloseLogin}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="auth-modal"
        backdrop="static"
      >
        <Modal.Header>
          {showLoginContent && (
            <Modal.Title>{translate("login&Register")}</Modal.Title>
          )}
          {showOTPContent && (
            <Modal.Title>{translate("verification")}</Modal.Title>
          )}
          {showRegisterContent && (
          <Modal.Title>{translate("registerAccount")}</Modal.Title>
          )}
          {showEmailContent && (
            <Modal.Title>{translate("loginWithEmail")}</Modal.Title>
          )}
          {showForgotPassword && (
            <Modal.Title>{translate("resetPassword")}</Modal.Title>
          )}
          <RiCloseCircleLine
            className="close-icon"
            size={40}
            onClick={onCloseLogin}
          />
        </Modal.Header>
        <Modal.Body>
          {showForgotPassword ? (
            <ForgotPasswordForm
              onSubmit={handleForgotPasswordSubmit}
              showLoader={showLoader}
              onBackToLogin={handleBackToLogin}
            />
          ) : showEmailContent ? (
            <EmailLoginForm
              signInFormData={signInFormData}
              handleSignInInputChange={handleSignInInputChange}
              SignInWithEmail={(e) => SignInWithEmail(e)}
              handlesignUp={handlesignUp}
              ShowGoogleLogin={ShowGoogleLogin}
              ShowPhoneLogin={ShowPhoneLogin}
              handlePhoneLogin={handlePhoneLogin}
              handleGoogleSignup={handleGoogleSignup}
              showLoader={showLoader}
              emailReverify={emailReverify}
              onForgotPasswordClick={handleForgotPasswordClick}
              handleResendOTP={handleResendOTP}
              formatTime={formatTime}
            />
          ) : showRegisterContent ? (
            <RegisterForm
              registerFormData={registerFormData}
              handleRegisterInputChange={handleRegisterInputChange}
              handleRegisterPhoneChange={handleRegisterPhoneChange}
              handleRegisterUser={handleRegisterUser}
              handleSignIn={handleSignIn}
              showLoader={showLoader}
            />
          ) : showLoginContent ? (
            <PhoneLoginForm
              value={value}
              setValue={setValue}
              onSignUp={onSignUp}
              ShowGoogleLogin={ShowGoogleLogin}
              handleEmailLoginshow={handleEmailLoginshow}
              CompanyName={CompanyName}
              handleGoogleSignup={handleGoogleSignup}
              ShowPhoneLogin={ShowPhoneLogin}
              showLoader={showLoader}
            />
          ) : showOTPContent ? (
            <OTPForm
              phonenum={phonenum}
              wrongNumber={wrongNumber}
              wrongEmail={wrongEmail}
              otp={otp}
              setOTP={setOTP}
              handleConfirm={handleConfirm}
              showLoader={showLoader}
              timeLeft={timeLeft}
              isEmailOtpEnabled={isEmailOtpEnabled}
              emailOtp={emailOtp}
              email={
                registerFormData?.email
                  ? registerFormData?.email
                  : signInFormData?.email
              }
              setEmailOtp={setEmailOtp}
              handleEmailOtpVerification={handleEmailOtpVerification}
              isEmailCounting={isEmailCounting}
              emailTimeLeft={emailTimeLeft}
              formatTime={formatTime}
              isCounting={isCounting}
              handleResendOTP={handleResendOTP}
            />
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <FooterLinks />
        </Modal.Footer>
        <div id="recaptcha-container" style={{ display: "none" }}></div>
      </Modal>
    </>
  );
};

export default LoginModal;
