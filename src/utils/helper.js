"use client";
import { store } from "@/store/store";
import localeTranslations from "./locale/en.json";
import { useJsApiLoader } from "@react-google-maps/api";
import toast from "react-hot-toast";
import {
  checkPackageLimitApi,
  featurePropertyApi,
  GetLimitsApi,
} from "@/store/actions/campaign";
import Swal from "sweetalert2";
import LocaleCurrency from "locale-currency";
import { setLocationData } from "@/store/reducer/momentSlice";
import { setLocation } from "@/store/reducer/locationSlice";
import { checkPackageAvailable } from "./checkPackages/checkPackage";
import { PackageTypes } from "./checkPackages/packageTypes";

// transalte strings

export const translate = (label) => {
  const langLabel =
    store.getState().Language.languages.file_name &&
    store.getState().Language.languages.file_name[label];

  const enTranslation = localeTranslations;

  if (langLabel) {
    return langLabel;
  } else {
    return enTranslation[label] || label;
  }
};

// is login user check
export const isLogin = () => {
  let user = store.getState()?.User_signup;
  if (user) {
    try {
      if (user?.data?.token) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  return false;
};

// Load Google Maps
export const loadGoogleMaps = () => {
  return useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API,
    libraries: ["geometry", "drawing", "places"], // Include 'places' library
  });
};

//  LOAD STRIPE API KEY
export const loadStripeApiKey = () => {
  const STRIPEData = store.getState()?.Settings;
  const StripeKey = STRIPEData?.data?.stripe_publishable_key;
  if (StripeKey) {
    ``;
    return StripeKey;
  }
  return false;
};
//  LOAD Paystack API KEY
export const loadPayStackApiKey = () => {
  const PaystackData = store.getState()?.Settings;
  const PayStackKey = PaystackData?.data?.paystack_public_key;
  if (PayStackKey) {
    ``;
    return PayStackKey;
  }
  return false;
};

// Main function to format numbers with dynamic locale
export const formatNumberWithDynamicLocale = (number, currencyCode) => {
  // Parse number safely
  const parsedNumber = parseFloat(number);

  if (isNaN(parsedNumber)) {
    return ""; // Invalid number
  }

  // Get the dynamic locale
  const locale = getDynamicLocale(currencyCode);

  // Format the number with dynamic locale
  const formattedNumber = parsedNumber.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formattedNumber;
};

// Function to dynamically get locale from currency code or system
const getDynamicLocale = (currencyCode) => {
  // Get system/browser language
  const systemLocale = navigator.language || "en-US";

  // Get locales related to currency code using LocaleCurrency
  const countryCodes =
    LocaleCurrency && LocaleCurrency.getLocales(currencyCode);

  // If a valid country code is found, build the locale (e.g., "en-IN")
  if (countryCodes && countryCodes.length > 0) {
    const countryCode = countryCodes[0];
    const language = systemLocale.split("-")[0]; // Extract language from system locale
    return `${language}-${countryCode}`;
  }

  // Fallback to system locale if no mapping exists
  return systemLocale;
};
const getAbbreviationConfig = (currencyCode) => {
  // Grouping currencies by their numbering systems
  const southAsianCurrencies = ["INR", "BDT", "NPR", "PKR", "LKR"];
  const eastAsianCurrencies = ["JPY", "CNY", "KRW"];
  const westernCurrencies = ["USD", "EUR", "GBP", "AUD", "CAD", "NZD"];
  const middleEasternCurrencies = ["AED", "SAR", "QAR", "KWD", "OMR", "BHD"];
  const africanCurrencies = ["ZAR", "NGN", "EGP", "KES", "GHS"];

  // South Asian System (Lakh/Cr)
  if (southAsianCurrencies.includes(currencyCode)) {
    return [
      { value: 1e7, symbol: "Cr" }, // Crore
      { value: 1e5, symbol: "L" }, // Lakh
      { value: 1e3, symbol: "K" }, // Thousand
    ];
  }

  // East Asian System (万/億)
  if (eastAsianCurrencies.includes(currencyCode)) {
    return [
      { value: 1e8, symbol: "億" }, // 100 Million
      { value: 1e4, symbol: "万" }, // 10 Thousand
    ];
  }

  // Western & Most Others (K/M/B)
  if (
    westernCurrencies.includes(currencyCode) ||
    middleEasternCurrencies.includes(currencyCode) ||
    africanCurrencies.includes(currencyCode)
  ) {
    return [
      { value: 1e9, symbol: "B" }, // Billion
      { value: 1e6, symbol: "M" }, // Million
      { value: 1e3, symbol: "K" }, // Thousand
    ];
  }

  // Fallback to K/M/B if currency isn't explicitly listed
  return [
    { value: 1e9, symbol: "B" },
    { value: 1e6, symbol: "M" },
    { value: 1e3, symbol: "K" },
  ];
};

// Function to format large numbers as strings with K, M, and B abbreviations
export const formatPriceAbbreviated = (price) => {
  const systemSettingsData = store.getState()?.Settings?.data;
  const CurrencySymbol =
    systemSettingsData && systemSettingsData.currency_symbol;
  const FullPriceShow = systemSettingsData?.number_with_suffix === "1";
  const selectedCountry = systemSettingsData?.selected_currency_data;

  const currencyCode = selectedCountry?.code
    ? selectedCountry.code.toUpperCase()
    : "USD"; // Fallback to USD or any default currency

  const abbreviations = getAbbreviationConfig(currencyCode);

  const formattedPrice = formatNumberWithDynamicLocale(price, currencyCode);

  if (!FullPriceShow) {
    return CurrencySymbol + " " + formattedPrice;
  } else {
    // Apply abbreviations
    for (let i = 0; i < abbreviations.length; i++) {
      if (price >= abbreviations[i].value) {
        return (
          CurrencySymbol +
          (price / abbreviations[i].value).toFixed(2) +
          abbreviations[i].symbol
        );
      }
    }

    // For amounts less than the smallest abbreviation
    return CurrencySymbol + " " + price.toString();
  }
};

// Check if the theme color is true
export const isThemeEnabled = () => {
  const systemSettingsData = store.getState().Settings?.data;
  return systemSettingsData?.svg_clr === "1";
};

export const formatNumberWithCommas = (price) => {
  const systemSettingsData = store.getState()?.Settings?.data;
  const CurrencySymbol =
    systemSettingsData && systemSettingsData.currency_symbol;

  const selectedCountry = systemSettingsData?.selected_currency_data;
  const currencyCode = selectedCountry?.code?.toUpperCase();

  const formattedPrice = formatNumberWithDynamicLocale(price, currencyCode);

  return CurrencySymbol + formattedPrice;
};

export const placeholderImage = (e) => {
  const systemSettingsData = store.getState()?.Settings?.data;
  const placeholderLogo = systemSettingsData?.web_placeholder_logo;
  if (placeholderLogo) {
    e.target.src = placeholderLogo;
    e.target.style.opacity = "0.5";
    e.target.style.backgroundColor = "#f5f5f5";
  }
};

// utils/stickyNote.js
export const createStickyNote = () => {
  const systemSettingsData = store.getState()?.Settings?.data;
  const appUrl = systemSettingsData?.appstore_id;

  // Create the sticky note container
  const stickyNote = document.createElement("div");
  stickyNote.style.position = "fixed";
  stickyNote.style.bottom = "0";
  stickyNote.style.width = "100%";
  stickyNote.style.backgroundColor = "#ffffff";
  stickyNote.style.color = "#000000";
  stickyNote.style.padding = "10px";
  stickyNote.style.textAlign = "center";
  stickyNote.style.fontSize = "14px";
  stickyNote.style.zIndex = "99999";

  // Create the close button
  const closeButton = document.createElement("span");
  closeButton.style.cursor = "pointer";
  closeButton.style.float = "right";
  closeButton.innerHTML = "&times;";
  closeButton.onclick = function () {
    document.body.removeChild(stickyNote);
  };

  // Add content to the sticky note
  stickyNote.innerHTML = translate("ChatandNotiNote");
  stickyNote.appendChild(closeButton);

  // Conditionally add the "Download Now" link if appUrl exists
  if (appUrl) {
    const link = document.createElement("a");
    link.style.textDecoration = "underline";
    link.style.color = "#3498db";
    link.style.marginLeft = "10px"; // Add spacing between text and link
    link.innerText = translate("downloadNow");
    link.href = appUrl;
    link.target = "_blank"; // Open link in a new tab
    stickyNote.appendChild(link);
  }

  // Append the sticky note to the document body
  document.body.appendChild(stickyNote);
};

export const truncate = (input, maxLength) => {
  // Check if input is undefined or null
  if (!input) {
    return ""; // or handle the case as per your requirement
  }
  // Convert input to string to handle both numbers and text
  let text = String(input);
  // If the text length is less than or equal to maxLength, return the original text
  if (text.length <= maxLength) {
    return text;
  } else {
    // Otherwise, truncate the text to maxLength characters and append ellipsis
    return text.slice(0, maxLength) + "...";
  }
};

export const truncateArrayItems = (itemsArray, maxLength) => {
  // Check if input is an array
  if (!Array.isArray(itemsArray)) {
    return "";
  }

  // Initialize an empty array to hold the truncated items
  let truncatedItems = [];

  // Iterate over the items in the array
  for (let i = 0; i < itemsArray.length; i++) {
    // Apply the truncate function to each item
    let truncatedItem = truncate(itemsArray[i], maxLength);

    // Add the truncated item to the array
    truncatedItems.push(truncatedItem);
  }

  // Join the truncated items with a comma and add "..." after the second item
  let result = truncatedItems.join(", ");

  // If there are more than two items, add "..."
  if (truncatedItems.length > 2) {
    result += "...";
  }

  return result;
};

// utils/timeAgo.js

export const timeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const secondsAgo = Math.floor((now - date) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(secondsAgo / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
};

export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove invalid characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with a single hyphen
  // .replace(/^-+|-+$/g, ''); // Remove leading or trailing hyphens
};

const ERROR_CODES = {
  "auth/user-not-found": translate("userNotFound"),
  "auth/wrong-password": translate("invalidPassword"),
  "auth/email-already-in-use": translate("emailInUse"),
  "auth/invalid-email": translate("invalidEmail"),
  "auth/user-disabled": translate("userAccountDisabled"),
  "auth/too-many-requests": translate("tooManyRequests"),
  "auth/operation-not-allowed": translate("operationNotAllowed"),
  "auth/internal-error": translate("internalError"),
  "auth/invalid-login-credentials": translate("incorrectDetails"),
  "auth/invalid-credential": translate("incorrectDetails"),
  "auth/admin-restricted-operation": translate("adminOnlyOperation"),
  "auth/already-initialized": translate("alreadyInitialized"),
  "auth/app-not-authorized": translate("appNotAuthorized"),
  "auth/app-not-installed": translate("appNotInstalled"),
  "auth/argument-error": translate("argumentError"),
  "auth/captcha-check-failed": translate("captchaCheckFailed"),
  "auth/code-expired": translate("codeExpired"),
  "auth/cordova-not-ready": translate("cordovaNotReady"),
  "auth/cors-unsupported": translate("corsUnsupported"),
  "auth/credential-already-in-use": translate("credentialAlreadyInUse"),
  "auth/custom-token-mismatch": translate("customTokenMismatch"),
  "auth/requires-recent-login": translate("requiresRecentLogin"),
  "auth/dependent-sdk-initialized-before-auth": translate(
    "dependentSdkInitializedBeforeAuth"
  ),
  "auth/dynamic-link-not-activated": translate("dynamicLinkNotActivated"),
  "auth/email-change-needs-verification": translate(
    "emailChangeNeedsVerification"
  ),
  "auth/emulator-config-failed": translate("emulatorConfigFailed"),
  "auth/expired-action-code": translate("expiredActionCode"),
  "auth/cancelled-popup-request": translate("cancelledPopupRequest"),
  "auth/invalid-api-key": translate("invalidApiKey"),
  "auth/invalid-app-credential": translate("invalidAppCredential"),
  "auth/invalid-app-id": translate("invalidAppId"),
  "auth/invalid-user-token": translate("invalidUserToken"),
  "auth/invalid-auth-event": translate("invalidAuthEvent"),
  "auth/invalid-cert-hash": translate("invalidCertHash"),
  "auth/invalid-verification-code": translate("invalidVerificationCode"),
  "auth/invalid-continue-uri": translate("invalidContinueUri"),
  "auth/invalid-cordova-configuration": translate(
    "invalidCordovaConfiguration"
  ),
  "auth/invalid-custom-token": translate("invalidCustomToken"),
  "auth/invalid-dynamic-link-domain": translate("invalidDynamicLinkDomain"),
  "auth/invalid-emulator-scheme": translate("invalidEmulatorScheme"),
  "auth/invalid-message-payload": translate("invalidMessagePayload"),
  "auth/invalid-multi-factor-session": translate("invalidMultiFactorSession"),
  "auth/invalid-oauth-client-id": translate("invalidOauthClientId"),
  "auth/invalid-oauth-provider": translate("invalidOauthProvider"),
  "auth/invalid-action-code": translate("invalidActionCode"),
  "auth/unauthorized-domain": translate("unauthorizedDomain"),
  "auth/invalid-persistence-type": translate("invalidPersistenceType"),
  "auth/invalid-phone-number": translate("invalidPhoneNumber"),
  "auth/invalid-provider-id": translate("invalidProviderId"),
  "auth/invalid-recaptcha-action": translate("invalidRecaptchaAction"),
  "auth/invalid-recaptcha-token": translate("invalidRecaptchaToken"),
  "auth/invalid-recaptcha-version": translate("invalidRecaptchaVersion"),
  "auth/invalid-recipient-email": translate("invalidRecipientEmail"),
  "auth/invalid-req-type": translate("invalidReqType"),
  "auth/invalid-sender": translate("invalidSender"),
  "auth/invalid-verification-id": translate("invalidVerificationId"),
  "auth/invalid-tenant-id": translate("invalidTenantId"),
  "auth/multi-factor-info-not-found": translate("multiFactorInfoNotFound"),
  "auth/multi-factor-auth-required": translate("multiFactorAuthRequired"),
  "auth/missing-android-pkg-name": translate("missingAndroidPkgName"),
  "auth/missing-app-credential": translate("missingAppCredential"),
  "auth/auth-domain-config-required": translate("authDomainConfigRequired"),
  "auth/missing-client-type": translate("missingClientType"),
  "auth/missing-verification-code": translate("missingVerificationCode"),
  "auth/missing-continue-uri": translate("missingContinueUri"),
  "auth/missing-iframe-start": translate("missingIframeStart"),
  "auth/missing-ios-bundle-id": translate("missingIosBundleId"),
  "auth/missing-multi-factor-info": translate("missingMultiFactorInfo"),
  "auth/missing-multi-factor-session": translate("missingMultiFactorSession"),
  "auth/missing-or-invalid-nonce": translate("missingOrInvalidNonce"),
  "auth/missing-phone-number": translate("missingPhoneNumber"),
  "auth/missing-recaptcha-token": translate("missingRecaptchaToken"),
  "auth/missing-recaptcha-version": translate("missingRecaptchaVersion"),
  "auth/missing-verification-id": translate("missingVerificationId"),
  "auth/app-deleted": translate("appDeleted"),
  "auth/account-exists-with-different-credential": translate(
    "accountExistsWithDifferentCredential"
  ),
  "auth/network-request-failed": translate("networkRequestFailed"),
  "auth/no-auth-event": translate("noAuthEvent"),
  "auth/no-such-provider": translate("noSuchProvider"),
  "auth/null-user": translate("nullUser"),
  "auth/operation-not-supported-in-this-environment": translate(
    "operationNotSupportedInThisEnvironment"
  ),
  "auth/popup-blocked": translate("popupBlocked"),
  "auth/popup-closed-by-user": translate("popupClosedByUser"),
  "auth/provider-already-linked": translate("providerAlreadyLinked"),
  "auth/quota-exceeded": translate("quotaExceeded"),
  "auth/recaptcha-not-enabled": translate("recaptchaNotEnabled"),
  "auth/redirect-cancelled-by-user": translate("redirectCancelledByUser"),
  "auth/redirect-operation-pending": translate("redirectOperationPending"),
  "auth/rejected-credential": translate("rejectedCredential"),
  "auth/second-factor-already-in-use": translate("secondFactorAlreadyInUse"),
  "auth/maximum-second-factor-count-exceeded": translate(
    "maximumSecondFactorCountExceeded"
  ),
  "auth/tenant-id-mismatch": translate("tenantIdMismatch"),
  "auth/timeout": translate("timeout"),
  "auth/user-token-expired": translate("userTokenExpired"),
  "auth/unauthorized-continue-uri": translate("unauthorizedContinueUri"),
  "auth/unsupported-first-factor": translate("unsupportedFirstFactor"),
  "auth/unsupported-persistence-type": translate("unsupportedPersistenceType"),
  "auth/unsupported-tenant-operation": translate("unsupportedTenantOperation"),
  "auth/unverified-email": translate("unverifiedEmail"),
  "auth/user-cancelled": translate("userCancelled"),
  "auth/user-mismatch": translate("userMismatch"),
  "auth/user-signed-out": translate("userSignedOut"),
  "auth/weak-password": translate("weakPassword"),
  "auth/web-storage-unsupported": translate("webStorageUnsupported"),
};

// Error handling function
export const handleFirebaseAuthError = (errorCode) => {
  // Check if the error code exists in the global ERROR_CODES object
  if (ERROR_CODES.hasOwnProperty(errorCode)) {
    // If the error code exists, log the corresponding error message
    toast.error(ERROR_CODES[errorCode]);
  } else {
    // If the error code is not found, log a generic error message
    toast.error(`${translate("errorOccurred")}:${errorCode}`);
  }
  // Optionally, you can add additional logic here to handle the error
  // For example, display an error message to the user, redirect to an error page, etc.
};

export const BadgeSvg = (
  <svg
    width="26"
    height="26"
    viewBox="0 0 20 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 2.9165H5C4.46957 2.9165 3.96086 3.12923 3.58579 3.50788C3.21071 3.88654 3 4.4001 3 4.9356V13.8592C3.00019 14.2151 3.09353 14.5646 3.27057 14.8723C3.44762 15.18 3.70208 15.435 4.00817 15.6115L9.50409 18.7832C9.65504 18.8705 9.82601 18.9165 10 18.9165C10.174 18.9165 10.345 18.8705 10.4959 18.7832L15.9918 15.6115C16.298 15.4351 16.5526 15.1802 16.7296 14.8724C16.9067 14.5647 17 14.2151 17 13.8592V4.9356C17 4.4001 16.7893 3.88654 16.4142 3.50788C16.0391 3.12923 15.5304 2.9165 15 2.9165ZM13.9223 9.31352L9.63897 13.6447L6.71662 10.6889C6.53155 10.4991 6.42828 10.2431 6.42933 9.97675C6.43038 9.7104 6.53565 9.45525 6.72222 9.2669C6.90878 9.07856 7.16151 8.97228 7.42535 8.97122C7.68919 8.97016 7.94275 9.07441 8.13079 9.26126L9.63897 10.7825L12.515 7.88585C12.703 7.69901 12.9566 7.59476 13.2204 7.59582C13.4843 7.59687 13.737 7.70315 13.9236 7.8915C14.1101 8.07984 14.2154 8.33499 14.2164 8.60135C14.2175 8.8677 14.1142 9.12369 13.9292 9.31352H13.9223Z"
      fill="#fff"
    />
  </svg>
);

export const handleCheckLimits = (e, type, router, propertyId) => {
  const systemSettingsData = store.getState()?.Settings?.data;
  const userData = store.getState()?.User_signup?.data?.data;
  const hasSubscription = systemSettingsData?.subscription;

  // Check if user has completed their profile
  const userCompleteData = [
    "name",
    "email",
    "mobile",
    "profile",
    "address",
  ].every((key) => userData?.[key]);

  // Check if verification is required for the user
  const needToVerify = systemSettingsData?.verification_required_for_user;
  const verificationStatus = systemSettingsData?.verification_status;

  // If user has not completed their profile, redirect to profile completion
  if (!userCompleteData) {
    return Swal.fire({
      icon: "error",
      title: translate("opps"),
      text: translate("youHaveNotCompleteProfile"),
      allowOutsideClick: true,
      customClass: { confirmButton: "Swal-confirm-buttons" },
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/user/profile");
      }
    });
  }

  // If user needs to verify and has a pending or failed verification status, show appropriate messages
  if (needToVerify) {
    if (verificationStatus === "pending") {
      return Swal.fire({
        icon: "warning",
        title: translate("verifyPendingTitle"),
        text: translate("verifyPendingDesc"),
        allowOutsideClick: true,
        customClass: { confirmButton: "Swal-confirm-buttons" },
      });
    }

    if (verificationStatus === "failed") {
      return Swal.fire({
        icon: "error",
        title: translate("verifyFailTitle"),
        text: translate("verifyFailDesc"),
        allowOutsideClick: true,
        customClass: { confirmButton: "Swal-confirm-buttons" },
      });
    }

    if (verificationStatus !== "success") {
      return Swal.fire({
        icon: "error",
        title: translate("opps"),
        text: translate("youHaveNotVerifiedUser"),
        allowOutsideClick: true,
        customClass: { confirmButton: "Swal-confirm-buttons" },
      });
    }
  }

  // If user has no subscription, redirect to subscription plan
  if (!hasSubscription) {
    return Swal.fire({
      icon: "error",
      title: translate("opps"),
      text: translate("youHaveNotSubscribe"),
      allowOutsideClick: false,
      customClass: { confirmButton: "Swal-confirm-buttons" },
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/subscription-plan");
      }
    });
  }

  // Proceed with limit checks
  GetLimitsApi(
    type === "project" ? "property" : type,
    (response) => {
      switch (type) {
        case "property":
          router.push("/user/properties");
          break;
        case "project":
          router.push("/user/add-project");
          break;
        case "advertisement":
          featurePropertyApi({
            property_id: propertyId,
            onSuccess: (response) => {
              toast.success(response.message);
              router.push("/user/advertisement");
            },
            onError: (error) => {
              console.error(error);
              toast.error(error);
            },
          });
          break;
        default:
          break;
      }
    },
    (error) => {
      console.error("API Error:", error);
      if (error === "Please Subscribe for Post Property") {
        Swal.fire({
          icon: "error",
          title: translate("opps"),
          text: translate("yourPackageLimitOver"),
          allowOutsideClick: false,
          customClass: { confirmButton: "Swal-confirm-buttons" },
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/subscription-plan");
          }
        });
      }
    }
  );
};

export const fetchLocationData = async (latitude, longitude) => {
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API; // Get API key from environment variables

  const performReverseGeocoding = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data. Status: " + response.status);
      }

      const data = await response.json();
      if (data.status === "OK" && data.results && data.results.length > 0) {
        const result = data.results[0];
        
        const { city, country, state, formatted_address } =
          extractCityFromGeocodeResult(result);

        // Store in old momentSlice (for backward compatibility)
        store.dispatch(
          setLocationData({
            city,
            country,
            state,
            formatted_address,
            latitude,
            longitude,
          })
        );
        
        // Also store in new locationSlice
        store.dispatch(
          setLocation({
            coordinates: {
              latitude,
              longitude
            },
            formatted_address,
            city,
            state,
            country,
          })
        );

        return {
          city,
          country,
          state,
          formatted_address,
          latitude,
          longitude,
        };
      } else {
        throw new Error("No results found");
      }
    } catch (error) {
      console.error("Error performing reverse geocoding:", error);
      return null;
    }
  };

  // Call the reverse geocoding function
  return await performReverseGeocoding(latitude, longitude);
};

const extractCityFromGeocodeResult = (geocodeResult) => {
  let city = null;
  let country = null;
  let state = null;
  let formatted_address = null;

  for (const component of geocodeResult.address_components) {
    if (component.types.includes("locality")) {
      city = component.long_name;
    } else if (component.types.includes("country")) {
      country = component.long_name;
    } else if (component.types.includes("administrative_area_level_1")) {
      state = component.long_name;
    }
  }
  formatted_address = geocodeResult.formatted_address;
  return { city, country, state, formatted_address };
};

export const premiumIcon = (
  <svg
    className="premium_icon"
    width="60"
    height="60"
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_2591_3591)">
      <path
        d="M17.8205 10.4844L16.9222 15.7495C16.8723 16.0489 16.6103 16.2735 16.3108 16.2735H7.72692C7.42748 16.2735 7.16547 16.0489 7.11556 15.7495L6.21725 10.4844C6.17982 10.2598 6.26715 10.0227 6.4543 9.88548C6.64145 9.74824 6.89098 9.72328 7.10309 9.8231L9.51107 10.9959L11.4824 7.44006C11.707 7.04081 12.3557 7.04081 12.5678 7.44006L14.5391 10.9959L16.9471 9.8231C17.1592 9.72328 17.4088 9.74824 17.5959 9.88548C17.7831 10.0227 17.8704 10.2598 17.833 10.4844H17.8205Z"
        fill="white"
      />
      <path
        d="M21.476 14.0656L20.7523 12.481C20.6151 12.1816 20.6151 11.8322 20.7523 11.5328L21.476 9.94828C21.7504 9.36188 21.7629 8.67567 21.5134 8.07679C21.2639 7.47791 20.7773 7.0038 20.1659 6.77922L18.5315 6.16787C18.2196 6.05558 17.9825 5.80605 17.8577 5.49413L17.2464 3.8597C17.0218 3.24834 16.5477 2.76175 15.9363 2.51222C15.3375 2.26269 14.6513 2.27517 14.0649 2.54965L12.4803 3.27329C12.1809 3.41054 11.8315 3.41054 11.5321 3.27329L9.94757 2.54965C9.36117 2.27517 8.67496 2.26269 8.07608 2.51222C7.4772 2.76175 7.00309 3.24834 6.76604 3.8597L6.15468 5.49413C6.04239 5.80605 5.79286 6.0431 5.48095 6.16787L3.84651 6.77922C3.23516 7.0038 2.74857 7.47791 2.49904 8.07679C2.24951 8.67567 2.26198 9.36188 2.53647 9.94828L3.26011 11.5328C3.39735 11.8322 3.39735 12.1816 3.26011 12.481L2.53647 14.0656C2.26198 14.652 2.24951 15.3382 2.49904 15.937C2.74857 16.5359 3.23516 17.01 3.84651 17.2346L5.48095 17.846C5.79286 17.9583 6.02992 18.2078 6.15468 18.5197L6.76604 20.1541C6.99062 20.7655 7.46473 21.2521 8.07608 21.5016C8.36304 21.6264 8.67496 21.6763 8.9744 21.6763C9.31126 21.6763 9.63566 21.6014 9.94757 21.4642L11.5321 20.7405C11.8315 20.6033 12.1809 20.6033 12.4803 20.7405L14.0649 21.4642C14.6513 21.7387 15.3375 21.7511 15.9363 21.5016C16.5352 21.2521 17.0093 20.7655 17.2464 20.1541L17.8577 18.5197C17.97 18.2078 18.2196 17.9707 18.5315 17.846L20.1659 17.2346C20.7773 17.01 21.2639 16.5359 21.5134 15.937C21.7629 15.3382 21.7504 14.652 21.476 14.0656ZM17.6456 10.4224L16.7723 15.5378C16.7224 15.8248 16.4728 16.0369 16.1734 16.0369H7.83902C7.53959 16.0369 7.29005 15.8248 7.24015 15.5378L6.36679 10.4224C6.32936 10.1978 6.41669 9.97323 6.60384 9.83599C6.79099 9.69875 7.02805 9.67379 7.22767 9.77361L9.5608 10.909L11.4822 7.46543C11.6943 7.07866 12.3306 7.07866 12.5427 7.46543L14.4641 10.909L16.7972 9.77361C16.9969 9.67379 17.2464 9.69875 17.4211 9.83599C17.6082 9.97323 17.6955 10.1978 17.6581 10.4224H17.6456Z"
        fill="#FFA928"
      />
      <path
        d="M15.0382 22.0005C14.6639 22.0005 14.2772 21.9256 13.9278 21.7634L12.3433 21.0397C12.1312 20.9399 11.8692 20.9399 11.6571 21.0397L10.0725 21.7634C9.42376 22.0628 8.62526 22.0753 7.95152 21.8008C7.2653 21.5139 6.72881 20.9649 6.47928 20.2662L5.86792 18.6318C5.78059 18.4072 5.60592 18.2325 5.38134 18.1452L3.7469 17.5338C3.06069 17.2718 2.49924 16.7353 2.22476 16.0616C1.95027 15.3878 1.96275 14.6018 2.26219 13.9406L2.98583 12.356C3.08564 12.1315 3.08564 11.8819 2.98583 11.6698L2.26219 10.0853C1.96275 9.41155 1.93779 8.638 2.22476 7.96427C2.51172 7.29053 3.06069 6.74156 3.7469 6.49203L5.38134 5.88067C5.60592 5.79334 5.78059 5.61866 5.86792 5.39409L6.47928 3.75965C6.74129 3.07344 7.27778 2.51199 7.95152 2.2375C8.63773 1.95054 9.41128 1.96302 10.0725 2.27493L11.6571 2.99858C11.8692 3.09839 12.1312 3.09839 12.3433 2.99858L13.9278 2.27493C14.6016 1.9755 15.3751 1.96302 16.0488 2.2375C16.7351 2.52447 17.2715 3.07344 17.5211 3.77213L18.1324 5.40656C18.2198 5.63114 18.3944 5.80581 18.619 5.89315L20.2535 6.5045C20.9397 6.76651 21.5011 7.30301 21.7756 7.97674C22.0501 8.65048 22.0376 9.43651 21.7382 10.0978L21.0145 11.6823C20.9147 11.9069 20.9147 12.1564 21.0145 12.3685L21.7382 13.953C22.0376 14.6268 22.0501 15.4003 21.7756 16.0741C21.4886 16.7478 20.9397 17.2968 20.2535 17.5463L18.619 18.1577C18.3944 18.245 18.2198 18.4197 18.1324 18.6442L17.5211 20.2787C17.2591 20.9649 16.7226 21.5263 16.0488 21.8008C15.7244 21.9381 15.3751 22.0005 15.0258 22.0005H15.0382ZM12.0064 20.3411C12.206 20.3411 12.4181 20.3785 12.6053 20.4658L14.1898 21.1895C14.7014 21.4265 15.3002 21.4265 15.8118 21.2144C16.3358 21.0023 16.7475 20.5656 16.9472 20.0416L17.5585 18.4072C17.7082 18.0079 18.0201 17.696 18.4069 17.5588L20.0414 16.9474C20.5654 16.7478 21.002 16.3361 21.2142 15.8121C21.4263 15.288 21.4263 14.7016 21.1892 14.1901L20.4656 12.6056C20.2909 12.2188 20.2909 11.7821 20.4656 11.3953L21.1892 9.8108C21.4263 9.29926 21.4263 8.70039 21.2142 8.17637C21.002 7.65235 20.5778 7.24062 20.0414 7.041L18.4069 6.42964C18.0077 6.27992 17.7082 5.96801 17.5585 5.58123L16.9472 3.9468C16.7475 3.42278 16.3358 2.9861 15.8118 2.774C15.2878 2.5619 14.7014 2.57437 14.1898 2.79895L12.6053 3.52259C12.2185 3.69727 11.7818 3.69727 11.3951 3.52259L9.81053 2.79895C9.29899 2.5619 8.70011 2.54942 8.18857 2.774C7.66456 2.9861 7.25283 3.4103 7.0532 3.9468L6.44185 5.58123C6.29213 5.98049 5.98021 6.27992 5.59344 6.42964L3.959 7.041C3.43499 7.24062 3.01078 7.65235 2.7862 8.17637C2.5741 8.70039 2.5741 9.28679 2.81116 9.79833L3.5348 11.3829C3.70947 11.7696 3.70947 12.2063 3.5348 12.5931L2.81116 14.1776C2.5741 14.6892 2.56162 15.288 2.7862 15.7996C2.99831 16.3236 3.42251 16.7353 3.959 16.9349L5.59344 17.5463C5.99269 17.696 6.30461 18.0079 6.44185 18.3947L7.0532 20.0291C7.25283 20.5532 7.66456 20.9898 8.18857 21.2019C8.70011 21.414 9.31147 21.4016 9.81053 21.177L11.4075 20.4533C11.5947 20.366 11.8068 20.3286 12.0064 20.3286V20.3411ZM16.1736 16.3485H7.83923C7.39007 16.3485 7.01577 16.0242 6.92844 15.5875L6.05507 10.4721C5.99269 10.1352 6.12993 9.78585 6.40442 9.58623C6.6789 9.37412 7.04073 9.34917 7.35264 9.49889L9.42376 10.5095L11.1954 7.32796C11.4949 6.77899 12.493 6.77899 12.8049 7.32796L14.5766 10.5095L16.6477 9.49889C16.9596 9.34917 17.3215 9.3866 17.5959 9.58623C17.8704 9.79833 18.0077 10.1352 17.9453 10.4721L17.0719 15.5875C16.9971 16.0242 16.6103 16.3485 16.1736 16.3485ZM6.95339 10.0229C6.95339 10.0229 6.82862 10.0479 6.77872 10.0853C6.69138 10.1477 6.64147 10.26 6.66643 10.3723L7.53979 15.4877C7.56474 15.6249 7.68951 15.7372 7.82675 15.7372H16.1611C16.3108 15.7372 16.4231 15.6374 16.4481 15.4877L17.3214 10.3723C17.3339 10.26 17.2965 10.1601 17.2092 10.0853C17.1218 10.0229 17.0095 10.0104 16.9097 10.0603L14.3021 11.333L12.2435 7.6274C12.1437 7.44025 11.8317 7.44025 11.7319 7.6274L9.67329 11.333L7.06568 10.0603C7.06568 10.0603 6.97834 10.0354 6.94091 10.0354L6.95339 10.0229Z"
        fill="#BB8028"
      />
    </g>
    <defs>
      <clipPath id="clip0_2591_3591">
        <rect width="20" height="20" fill="white" transform="translate(2 2)" />
      </clipPath>
    </defs>
  </svg>
);

export const formatDuration = (hours) => {
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} ${translate(`${days > 1 ? "days" : "day"}`)}`;
  } else {
    return `${hours} ${translate(`${hours > 1 ? "hours" : "hour"}`)}`;
  }
};

export const showSwal = ({
  icon,
  title,
  text,
  onConfirm,
  isPremiumCheck,
  router,
}) => {
  return Swal.fire({
    icon,
    title,
    text,
    customClass: { confirmButton: "Swal-confirm-buttons" },
    confirmButtonText: translate("ok"),
  }).then((result) => {
    if (result.isConfirmed) {
      if (isPremiumCheck) {
        router.push("/subscription-plan");
      } else if (onConfirm) {
        onConfirm();
      }
    }
  });
};

export const canRedirectToDetails = (data, router, isUserProperty) => {
  const systemSettingsData = store.getState().Settings?.data;
  const isPremiumUser = systemSettingsData?.is_premium;
  const isPremiumProperty = data?.is_premium;

  const redirectURL = isUserProperty
    ? `/my-property/${data?.slug_id}`
    : `/properties-details/${data?.slug_id}`;

  router.push(redirectURL);
};

const getLimitErrorMessageKey = (type) => {
  const map = {
    [PackageTypes.PROPERTY_LIST]: "propertyListLimitOrPackageNotAvailable",
    [PackageTypes.PROJECT_LIST]: "projectListLimitOrPackageNotAvailable",
    [PackageTypes.PROPERTY_FEATURE]:
      "propertyFeatureLimitOrPackageNotAvailable",
    [PackageTypes.PROJECT_FEATURE]: "projectFeatureLimitOrPackageNotAvailable",
    [PackageTypes.MORTGAGE_CALCULATOR_DETAIL]:
      "mortgageCalculatorLimitOrPackageNotAvailable",
    [PackageTypes.PREMIUM_PROPERTIES]:
      "premiumPropertiesLimitOrPackageNotAvailable",
    [PackageTypes.PROJECT_ACCESS]: "projectAccessLimitOrPackageNotAvailable",
  };
  return map[type] || "limitOrPackageNotAvailable";
};

export const handlePackageCheck = async (
  e,
  type,
  router,
  id,
  propertyData = null,
  isUserProperty = false
) => {
  // e.preventDefault();

  const systemSettingsData = store.getState()?.Settings?.data;
  const userData = store.getState()?.User_signup?.data?.data;

  const userCompleteData = [
    "name",
    "email",
    "mobile",
    "profile",
    "address",
  ].every((key) => userData?.[key]);

  if ([PackageTypes.PROPERTY_LIST, PackageTypes.PROJECT_LIST].includes(type)) {
    if (!userCompleteData) {
      return showSwal({
        icon: "error",
        title: translate("opps"),
        text: translate("youHaveNotCompleteProfile"),
        onConfirm: () => router.push("/user/profile"),
      });
    }

    const needToVerify = systemSettingsData?.verification_required_for_user;
    const verificationStatus = systemSettingsData?.verification_status;

    if (needToVerify && verificationStatus !== "success") {
      const verificationMessages = {
        pending: {
          icon: "warning",
          title: translate("verifyPendingTitle"),
          text: translate("verifyPendingDesc"),
        },
        failed: {
          icon: "error",
          title: translate("verifyFailTitle"),
          text: translate("verifyFailDesc"),
        },
      };
      return showSwal(
        verificationMessages[verificationStatus] || {
          icon: "error",
          title: translate("opps"),
          text: translate("youHaveNotVerifiedUser"),
        }
      );
    }
  }

  // 🔥 Special Handling for Premium Properties
  if (type === PackageTypes.PREMIUM_PROPERTIES) {
    const isPremiumProperty = propertyData?.is_premium;

    if (isPremiumProperty) {
      const isAvailable = await checkPackageAvailable(type);
      if (!isAvailable) {
        return showSwal({
          icon: "error",
          title: translate("opps"),
          text: translate(getLimitErrorMessageKey(type)),
          onConfirm: () => router.push("/subscription-plan"),
        });
      }
    }

    // After checks, just redirect to details
    return canRedirectToDetails(propertyData, router, isUserProperty);
  }

  // 🔥 Special Handling for Project Access (if it requires similar flow)
  if (type === PackageTypes.PROJECT_ACCESS) {
    const isAvailable = await checkPackageAvailable(type);
    if (!isAvailable) {
      return showSwal({
        icon: "error",
        title: translate("opps"),
        text: translate(getLimitErrorMessageKey(type)),
        onConfirm: () => router.push("/subscription-plan"),
      });
    }
    router.push(`/project-details/${id}`);
    return;
  }

  // 🧵 For all other types (Generic Flow)
  const isAvailable = await checkPackageAvailable(type);
  if (!isAvailable) {
    return showSwal({
      icon: "error",
      title: translate("opps"),
      text: translate(getLimitErrorMessageKey(type)),
      onConfirm: () => router.push("/subscription-plan"),
    });
  }

  // ✅ Handle Success Actions (After All Checks)
  switch (type) {
    case PackageTypes.PROPERTY_LIST:
      router.push("/user/properties");
      break;

    case PackageTypes.PROJECT_LIST:
      router.push("/user/add-project");
      break;

    case PackageTypes.PROPERTY_FEATURE:
      featurePropertyApi({
        feature_for: "property",
        property_id: id,
        onSuccess: (res) => {
          toast.success(res.message);
          router.push("/user/advertisement");
        },
        onError: (err) => toast.error(err.message),
      });
      break;

    case PackageTypes.PROJECT_FEATURE:
      featurePropertyApi({
        feature_for:"project",
        project_id: id,
        onSuccess: (res) => {
          toast.success(res.message);
          router.push("/user/advertisement");
        },
        onError: (err) => toast.error(err.message),
      });
      break;

    case PackageTypes.MORTGAGE_CALCULATOR_DETAIL:
      console.log("Open mortgage calculator - Add navigation if needed.");
      break;

    default:
      console.warn("No action defined for:", type);
  }
};

/**
 * Detects if the current device is a mobile device
 * @returns {boolean} True if the current device is a mobile device
 */
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  return mobileRegex.test(userAgent);
};
