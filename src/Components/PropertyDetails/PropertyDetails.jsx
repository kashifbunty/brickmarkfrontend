"use client";
import React, { useEffect, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import Image from "next/image";
import { PiPlayCircleThin } from "react-icons/pi";
import ReactPlayer from "react-player";
import SimilerPropertySlider from "@/Components/SimilerPropertySlider/SimilerPropertySlider";
import { settingsData } from "@/store/reducer/settingsSlice";
import { useSelector } from "react-redux";
import Map from "@/Components/GoogleMap/GoogleMap";
import { languageData } from "@/store/reducer/languageSlice";
import {
  isLogin,
  isThemeEnabled,
  placeholderImage,
  translate,
  truncate,
  isMobileDevice,
} from "@/utils/helper";
import { useRouter } from "next/router";
import {
  getPropertyDetailsApi,
  intrestedPropertyApi,
} from "@/store/actions/campaign";
import LightBox from "@/Components/LightBox/LightBox";
import Loader from "@/Components/Loader/Loader";
import toast from "react-hot-toast";
import { isSupported } from "firebase/messaging";
import { ImageToSvg } from "@/Components/Cards/ImageToSvg";
import Swal from "sweetalert2";
import ReportPropertyModal from "@/Components/ReportPropertyModal/ReportPropertyModal";
import { getChatData } from "@/store/reducer/momentSlice";
import OwnerDeatilsCard from "../OwnerDeatilsCard/OwnerDeatilsCard";
import PremiumOwnerDetailsCard from "../OwnerDeatilsCard/PremiumOwnerDetailsCard";
import Layout from "../Layout/Layout";
import LoginModal from "../LoginModal/LoginModal";
import NoData from "../NoDataFound/NoData";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { BiDownload } from "react-icons/bi";
import MortgageCalculator from "../MortgageCalculator/MortgageCalculator";
import PropertyGallery from "./PropertyGallery";
import MobileBottomSheet from "../MobileBottomSheet/MobileBottomSheet";
import withAuth from "../Layout/withAuth";

const PropertyDetails = () => {
  const router = useRouter();
  const propId = router.query;

  const [getSimilerData, setSimilerData] = useState([]);
  const [isMessagingSupported, setIsMessagingSupported] = useState(false);
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(false);
  const [isReporteModal, setIsReporteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [getPropData, setPropData] = useState(null);
  const [interested, setInterested] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showChat, setShowChat] = useState(true);

  const [chatData, setChatData] = useState({
    property_id: "",
    title: "",
    title_image: "",
    user_id: "",
    name: "",
    profile: "",
  });
  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const [playing, setPlaying] = useState(false);
  const [manualPause, setManualPause] = useState(false); // State to track manual pause
  const [seekPosition, setSeekPosition] = useState(0);
  const [showThumbnail, setShowThumbnail] = useState(true);

  const [imageURL, setImageURL] = useState("");
  const isLoggedIn = isLogin();
  const lang = useSelector(languageData);
  const isUserData = useSelector((state) => state.User_signup);
  const SettingsData = useSelector(settingsData);

  const isPremiumUser = SettingsData && SettingsData?.features_available?.premium_properties;

  const themeEnabled = isThemeEnabled();
  const isPremiumProperty = getPropData && getPropData.is_premium;
  const DistanceSymbol = SettingsData && SettingsData?.distance_option;

  const [showModal, setShowModal] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const [isMobile, setIsMobile] = useState(false);

  const isShare = router.query.share === "true";

  // Check if the user is on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice() && window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => { }, [lang]);

  useEffect(() => {
    const checkMessagingSupport = async () => {
      try {
        const supported = await isSupported();
        setIsMessagingSupported(supported);

        if (supported) {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            setNotificationPermissionGranted(true);
          }
        }
      } catch (error) {
        console.error("Error checking messaging support:", error);
      }
    };

    checkMessagingSupport();
  }, [notificationPermissionGranted, isMessagingSupported]);

  useEffect(() => {
    setIsLoading(true);
    if (propId.slug && propId.slug != "") {
      getPropertyDetailsApi({
        slug_id: propId.slug,
        onSuccess: (response) => {
          const propertyData = response && response.data;
          setIsLoading(false);
          setPropData(propertyData[0]);
          setSimilerData(response?.similar_properties);
          if (propertyData[0]?.is_reported) {
            setIsReported(true);
          }
        },
        onError: (error) => {
          setIsLoading(true);
          console.log(error);
          if(error.message === "Cannot Access Premium Property, Feature Not Available"){
            Swal.fire({
              title: translate("opps"),
              text: translate("premiumPropertiesLimitOrPackageNotAvailable"),
              icon: "warning",
              allowOutsideClick: false,
              showCancelButton: false,
              confirmButtonText: translate("ok"),
              customClass: {
                confirmButton: "Swal-confirm-buttons",
                cancelButton: "Swal-cancel-buttons",
              },
            }).then((result) => {
              if (result.isConfirmed) {
                router.push("/subscription-plan");
              }
            });
          }
        },
      });
    }
  }, [propId, isLoggedIn, interested, isReported]);

  useEffect(() => {
    if (getPropData && getPropData?.three_d_image) {
      setImageURL(getPropData?.three_d_image);
    }
  }, [getPropData]);

  useEffect(() => {
    if (imageURL) {
      const initializePanorama = () => {
        const panoramaElement = document.getElementById("panorama");
        if (panoramaElement) {
          pannellum.viewer("panorama", {
            type: "equirectangular",
            panorama: imageURL,
            autoLoad: true,
          });
        } else {
          console.error("Panorama element not found");
        }
      };

      setTimeout(initializePanorama, 3000); // Slight delay to ensure the element is rendered
    }
  }, [imageURL]);

  const userCurrentId =
    isLoggedIn && isUserData?.data ? isUserData?.data?.data.id : null;

  const userCompleteData = [
    "name",
    "email",
    "mobile",
    "profile",
    "address",
  ].every((key) => isUserData?.data?.data?.[key]);

  const PlaceHolderImg = SettingsData?.web_placeholder_logo;

  const getVideoType = (videoLink) => {
    if (
      videoLink &&
      (videoLink.includes("youtube.com") || videoLink.includes("youtu.be"))
    ) {
      return "youtube";
    } else if (videoLink && videoLink.includes("drive.google.com")) {
      return "google_drive";
    } else {
      return "unknown";
    }
  };
  const videoLink = getPropData && getPropData.video_link;

  const videoId = videoLink
    ? videoLink.includes("youtu.be")
      ? videoLink.split("/").pop().split("?")[0]
      : videoLink.split("v=")[1]?.split("&")[0] ?? null
    : null;

  const backgroundImageUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/sddefault.jpg`
    : PlaceHolderImg;

  const handleVideoReady = (state) => {
    setPlaying(state);
    setShowThumbnail(!state);
  };

  const handleSeek = (e) => {
    try {
      if (e && typeof e.playedSeconds === "number") {
        setSeekPosition(parseFloat(e.playedSeconds));
        // Avoid pausing the video when seeking
        if (!manualPause) {
          setPlaying(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSeekEnd = () => {
    setShowThumbnail(false);
  };

  const handlePause = () => {
    setManualPause(true); // Manually pause the video
    setShowThumbnail(true); // Reset showThumbnail to true
  };

  const galleryPhotos = getPropData && getPropData.gallery;

  const openLightbox = (index) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  };

  const closeLightbox = () => {
    // if (viewerIsOpen) {
    setCurrentImage(0);
    setViewerIsOpen(false);
    // }
  };
  const handleShowMap = () => {
    // Check if the property is premium
    if (isPremiumProperty) {
      // If the user is not logged in, show a login prompt
      if (!isLoggedIn) {
        Swal.fire({
          title: translate("opps"),
          text: translate("pleaseLoginFirstToViewMap"),
          icon: "warning",
          allowOutsideClick: true,
          showCancelButton: false,
          customClass: {
            confirmButton: "Swal-confirm-buttons",
            cancelButton: "Swal-cancel-buttons",
          },
          confirmButtonText: translate("ok"),
        }).then((result) => {
          if (result.isConfirmed) {
            setShowModal(true); // Open the login modal
          }
        });
      } else {
        // If the user is logged in but not a premium user, show a premium property prompt
        if (!isPremiumUser) {
          Swal.fire({
            title: translate("opps"),
            text: translate("itsPrivatePrperty"),
            icon: "warning",
            allowOutsideClick: true,
            showCancelButton: false,
            customClass: {
              confirmButton: "Swal-confirm-buttons",
              cancelButton: "Swal-cancel-buttons",
            },
          }).then((result) => {
            if (result.isConfirmed) {
              router.push("/subscription-plan"); // Redirect to the subscription plan page
            }
          });
        } else {
          // If the user is a premium user, directly show the map
          setShowMap(true);
        }
      }
    } else {
      // If the property is not premium, directly show the map
      setShowMap(true);
    }
  };
  useEffect(() => {
    return () => {
      setShowMap(false);
      setIsReported(false);
    };
  }, [userCurrentId, propId]);
  useEffect(() => {
    if (getPropData) {
      if (getPropData.is_interested === 1) {
        setInterested(true);
      } else {
        setInterested(false);
      }
    }
  }, [getPropData]);
  useEffect(() => {
    if (userCurrentId === getPropData?.added_by) {
      setShowChat(false);
    } else {
      setShowChat(true);
    }
  }, [propId, showChat, userCurrentId, getPropData?.added_by]);

  const handleInterested = (e) => {
    e.preventDefault();
    if (userCurrentId) {
      intrestedPropertyApi(
        getPropData.id,
        "1",
        (response) => {
          setInterested(true);
          toast.success(response.message);
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      Swal.fire({
        title: translate("plzLogFirstIntrest"),
        icon: "warning",
        allowOutsideClick: false,
        showCancelButton: false,
        allowOutsideClick: true,
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
    }
  };

  const handleNotInterested = (e) => {
    e.preventDefault();

    intrestedPropertyApi(
      getPropData.id,
      "0",
      (response) => {
        setInterested(false);
        toast.success(response.message);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const handleChat = (e) => {
    e.preventDefault();
    if (SettingsData?.demo_mode === true) {
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
    } else {
      if (userCurrentId) {
        if (userCompleteData) {
          setChatData((prevChatData) => {
            const newChatData = {
              property_id: getPropData.id,
              slug_id: getPropData.slug_id,
              title: getPropData.title,
              title_image: getPropData.title_image,
              user_id: getPropData.added_by,
              name: getPropData.customer_name,
              profile: getPropData.profile,
              is_blocked_by_me: getPropData?.is_blocked_by_me,
              is_blocked_by_user: getPropData?.is_blocked_by_user,
            };

            // Use the updater function to ensure you're working with the latest state
            // localStorage.setItem('newUserChat', JSON.stringify(newChatData));
            getChatData(newChatData);
            return newChatData;
          });

          router.push("/user/chat");
        } else {
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
      } else {
        Swal.fire({
          title: translate("plzLogFirsttoAccess"),
          icon: "warning",
          allowOutsideClick: false,
          showCancelButton: false,
          allowOutsideClick: true,
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
        setShowChat(true);
      }
    }
  };
  const handleReportProperty = (e) => {
    e.preventDefault();
    if (userCurrentId) {
      setIsReporteModal(true);
    } else {
      Swal.fire({
        title: translate("plzLogFirsttoAccess"),
        icon: "warning",
        allowOutsideClick: false,
        showCancelButton: false,
        allowOutsideClick: true,
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
    }
  };

  useEffect(() => { }, [chatData, isReported, interested]);

  const handleDownload = async (fileName) => {
    try {
      // Construct the file URL based on your backend or API
      const fileUrl = `${fileName}`;
      // Fetch the file data
      const response = await fetch(fileUrl);

      // Get the file data as a Blob
      const blob = await response.blob();

      // Create a URL for the Blob object
      const blobUrl = URL.createObjectURL(blob);

      // Create an anchor element
      const link = document.createElement("a");

      // Set the anchor's href attribute to the Blob URL
      link.href = blobUrl;

      // Specify the file name for the download
      link.setAttribute("download", fileName);

      // Append the anchor element to the body
      document.body.appendChild(link);

      // Trigger the download
      link.click();

      // Remove the anchor element from the body
      document.body.removeChild(link);

      // Revoke the Blob URL to release memory
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handlecheckPremiumUserAgent = (e) => {
    e.preventDefault();
    router.push(`/agent-details/${getPropData?.customer_slug_id}`);
  };


  const checkPremiumProperty = () => {
    if (isPremiumProperty && !isPremiumUser) {
      Swal.fire({
        title: translate("opps"),
        text: translate("premiumPropertiesLimitOrPackageNotAvailable") || "You don't have access to premium properties",
        icon: "warning",
        allowOutsideClick: false,
        showCancelButton: false,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/subscription-plan");
        }
      });
    }
  };

  useEffect(() => {
    checkPremiumProperty();
  }, [isPremiumProperty, isPremiumUser]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {getPropData ? (
            <div className={`${isPremiumProperty && !isPremiumUser ? 'blur-background-property-details' : ''}`}>
              <Layout>
                <Breadcrumb
                  data={{
                  type: getPropData && getPropData.category.category,
                  title: getPropData && getPropData.title,
                  loc: getPropData && getPropData.address,
                  propertyType: getPropData && getPropData.property_type,
                  time: getPropData && getPropData.post_created,
                  price: getPropData && getPropData.price,
                  is_favourite: getPropData && getPropData.is_favourite,
                  propId: getPropData && getPropData.id,
                  title_img: getPropData && getPropData.title_image,
                  rentduration: getPropData && getPropData.rentduration,
                  admin_status: getPropData && getPropData.request_status,
                  propertyStatus: getPropData && getPropData.status,
                  isUser: false,
                  promoted: getPropData?.promoted,
                }}
              />
              <section className="properties-deatil-page">
                <div id="all-prop-deatil-containt">
                  <div className="container">
                    <div className="row" id="prop-all-deatils-cards">
                      <div
                        className="col-12 col-md-12 col-lg-9"
                        id="prop-deatls-card"
                      >
                        <PropertyGallery
                          galleryPhotos={galleryPhotos}
                          titleImage={getPropData?.title_image}
                          onImageClick={openLightbox}
                          translate={translate}
                          placeholderImage={placeholderImage}
                          PlaceHolderImg={PlaceHolderImg}
                        />

                        <LightBox
                          photos={galleryPhotos}
                          viewerIsOpen={viewerIsOpen}
                          currentImage={currentImage}
                          onClose={setViewerIsOpen}
                          title_image={getPropData?.title_image}
                          setViewerIsOpen={setViewerIsOpen}
                          setCurrentImage={setCurrentImage}
                        />
                        {getPropData && getPropData.description ? (
                          <div className="card about-propertie">
                            <div className="card-header">
                              {translate("aboutProp")}
                            </div>
                            <div className="card-body">
                              {getPropData && getPropData.description && (
                                <>
                                  <p
                                    style={{
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      maxHeight: expanded ? "none" : "3em",
                                      marginBottom: "0",
                                      whiteSpace: "pre-wrap",
                                    }}
                                  >
                                    {getPropData.description}
                                  </p>

                                  <button
                                    onClick={() => setExpanded(!expanded)}
                                    style={{
                                      display:
                                        getPropData.description.split("\n")
                                          .length > 3
                                          ? "block"
                                          : "none",
                                    }}
                                  >
                                    <span>
                                      {expanded ? "Show Less" : "Show More"}
                                    </span>
                                    {lang?.rtl === 1 ? (
                                      <AiOutlineArrowLeft
                                        className="mx-2"
                                        size={18}
                                      />
                                    ) : (
                                      <AiOutlineArrowRight
                                        className="mx-2"
                                        size={18}
                                      />
                                    )}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ) : null}

                        {getPropData &&
                          getPropData.parameters.length > 0 &&
                          getPropData.parameters.some(
                            (elem) => elem.value !== null && elem.value !== ""
                          ) ? (
                          <div className="card " id="features-amenities">
                            <div className="card-header">
                              {translate("feature&Amenties")}
                            </div>
                            <div className="card-body">
                              <div className="row">
                                {getPropData &&
                                  getPropData.parameters.map((elem, index) =>
                                    // Check if the value is an empty string
                                    elem.value !== "" && elem.value !== "0" ? (
                                      <div
                                        className="col-sm-12 col-md-6 col-lg-4"
                                        key={index}
                                      >
                                        <div id="specification">
                                          <div className="spec-icon">
                                            {themeEnabled ? (
                                              <ImageToSvg
                                                imageUrl={
                                                  elem.image !== undefined &&
                                                    elem.image !== null
                                                    ? elem.image
                                                    : PlaceHolderImg
                                                }
                                                className="custom-svg"
                                              />
                                            ) : (
                                              <Image
                                                loading="lazy"
                                                src={elem?.image}
                                                width={20}
                                                height={16}
                                                alt="no_img"
                                                onError={placeholderImage}
                                              />
                                            )}
                                          </div>
                                          <div id="specs-deatils">
                                            <div>
                                              <span>{elem.name}</span>
                                            </div>
                                            <div className="valueDiv">
                                              {/* Check if the value is a link */}
                                              {typeof elem?.value ===
                                                "string" &&
                                                elem.value.startsWith(
                                                  "https://"
                                                ) ? (
                                                <a
                                                  id="spacs-count"
                                                  href={elem.value}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                >
                                                  {elem.value}
                                                </a>
                                              ) : (
                                                <span id="spacs-count">
                                                  {Array.isArray(elem?.value)
                                                    ? elem.value.join(", ")
                                                    : elem.value}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ) : null
                                  )}
                              </div>
                            </div>
                          </div>
                        ) : null}
                        {getPropData &&
                          getPropData.assign_facilities.length > 0 &&
                          getPropData.assign_facilities.some(
                            (elem) =>
                              elem.distance !== null &&
                              elem.distance !== "" &&
                              elem.distance !== 0
                          ) ? (
                          <div className="card " id="features-amenities">
                            <div className="card-header">
                              {translate("OTF")}
                            </div>
                            <div className="card-body">
                              <div className="row">
                                {getPropData &&
                                  getPropData.assign_facilities.map(
                                    (elem, index) =>
                                      // Check if the value is an empty string
                                      elem.distance !== "" &&
                                        elem.distance !== 0 ? (
                                        <div
                                          className="col-sm-12 col-md-6 col-lg-4"
                                          key={index}
                                        >
                                          <div id="specification">
                                            <div className="spec-icon">
                                              {themeEnabled ? (
                                                <ImageToSvg
                                                  imageUrl={
                                                    elem.image !== undefined &&
                                                      elem.image !== null
                                                      ? elem?.image
                                                      : PlaceHolderImg
                                                  }
                                                  className="custom-svg"
                                                />
                                              ) : (
                                                <Image
                                                  loading="lazy"
                                                  src={
                                                    elem.image !== undefined &&
                                                      elem.image !== null
                                                      ? elem.image
                                                      : PlaceHolderImg
                                                  }
                                                  width={20}
                                                  height={16}
                                                  alt="no_img"
                                                  onError={placeholderImage}
                                                />
                                              )}
                                            </div>

                                            <div id="specs-deatils">
                                              <div>
                                                <span>{elem.name}</span>
                                              </div>
                                              <div className="valueDiv">
                                                <span id="spacs-count">
                                                  {elem.distance} {""}{" "}
                                                  {elem.distance > 1
                                                    ? translate(
                                                      DistanceSymbol + "s"
                                                    )
                                                    : translate(DistanceSymbol)}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ) : null
                                  )}
                              </div>
                            </div>
                          </div>
                        ) : null}
                        {getPropData &&
                          getPropData.latitude &&
                          getPropData.longitude ? (
                          <div className="card" id="propertie_address">
                            <div className="card-header">
                              {translate("address")}
                            </div>
                            <div className="card-body">
                              <div className="row" id="prop-address">
                                {!isPremiumProperty || isPremiumUser ? (
                                  <>
                                    <div className="adrs">
                                      <div>
                                        <span> {translate("address")}</span>
                                      </div>
                                      <div className="">
                                        <span> {translate("city")}</span>
                                      </div>
                                      <div className="">
                                        <span> {translate("state")}</span>
                                      </div>
                                      <div className="">
                                        <span> {translate("country")}</span>
                                      </div>
                                    </div>
                                    <div className="adrs02">
                                      <div className="adrs_value">
                                        <span>
                                          {getPropData && getPropData.address}
                                        </span>
                                      </div>
                                      <div className="adrs_value">
                                        <span className="">
                                          {getPropData && getPropData.city}
                                        </span>
                                      </div>

                                      <div className="adrs_value">
                                        <span className="">
                                          {getPropData && getPropData.state}
                                        </span>
                                      </div>
                                      <div className="adrs_value">
                                        <span className="">
                                          {getPropData && getPropData.country}
                                        </span>
                                      </div>
                                    </div>
                                  </>
                                ) : null}
                              </div>
                              {getPropData ? (
                                <div className="card google_map">
                                  {showMap ? (
                                    <Map
                                      latitude={getPropData.latitude}
                                      longitude={getPropData.longitude}
                                    />
                                  ) : (
                                    <>
                                      <div className="blur-background" />
                                      <div className="blur-container">
                                        <div className="view-map-button-div">
                                          <button
                                            onClick={handleShowMap}
                                            id="view-map-button"
                                          >
                                            {translate("ViewMap")}
                                          </button>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ) : null}

                        {imageURL ? (
                          <div className="card" id="prop-360-view">
                            <div className="card-header">
                              {translate("vertualView")}
                            </div>
                            <div className="card-body">
                              <div id="virtual-view">
                                <div id="panorama"></div>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {getPropData && getPropData.video_link ? (
                          <div className="card" id="prop-video">
                            <div className="card-header">
                              {translate("video")}
                            </div>
                            <div className="card-body">
                              {!playing ? (
                                <div
                                  className="video-background container"
                                  style={{
                                    backgroundImage: `url(${backgroundImageUrl})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center center",
                                  }}
                                >
                                  <div id="video-play-button">
                                    <button onClick={() => setPlaying(true)}>
                                      <PiPlayCircleThin
                                        className="button-icon"
                                        size={80}
                                      />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <ReactPlayer
                                    className="prop_video_player"
                                    url={getPropData && getPropData.video_link}
                                    playing={playing}
                                    controls={true}
                                    onPlay={() => handleVideoReady(true)}
                                    onPause={() => {
                                      setManualPause(true); // Manually pause the video
                                      handlePause();
                                    }}
                                    onEnded={() => setPlaying(false)}
                                    onProgress={handleSeek}
                                    onSeek={handleSeek}
                                    onSeekEnd={handleSeekEnd}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ) : null}

                        {getPropData && getPropData.documents.length > 0 && (
                          <div className="card" id="download_docs">
                            <div className="card-header">
                              {translate("docs")}
                            </div>
                            <div className="card-body">
                              <div className="row doc_row">
                                {getPropData &&
                                  getPropData?.documents.map((ele, index) => {
                                    const fileName = ele.file_name
                                      .split("/")
                                      .pop();
                                    return (
                                      <div
                                        className="col-sm-12 col-md-6 col-lg-6 col-xl-4 col-xxl-3"
                                        key={index}
                                      >
                                        <div className="docs_main_div">
                                          <div className="doc_icon">
                                            <IoDocumentAttachOutline
                                              size={30}
                                            />
                                          </div>
                                          <div className="doc_title">
                                            <span>
                                              {truncate(fileName, 30)}
                                            </span>
                                          </div>
                                          <div className="doc_download_button">
                                            <button
                                              onClick={() =>
                                                handleDownload(ele.file)
                                              }
                                            >
                                              <span>
                                                <BiDownload size={20} />
                                              </span>
                                              <span>
                                                {translate("download")}
                                              </span>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="col-12 col-md-12 col-lg-3">
                        <div className="property_owner_details">
                          <OwnerDeatilsCard
                            getPropData={getPropData}
                            showChat={showChat}
                            userCurrentId={userCurrentId}
                            interested={interested}
                            isReported={isReported}
                            handleInterested={handleInterested}
                            isMessagingSupported={isMessagingSupported}
                            handleNotInterested={handleNotInterested}
                            notificationPermissionGranted={
                              notificationPermissionGranted
                            }
                            handleChat={handleChat}
                            handleReportProperty={handleReportProperty}
                            PlaceHolderImg={PlaceHolderImg}
                            handlecheckPremiumUserAgent={
                              handlecheckPremiumUserAgent
                            }
                          />

                        </div>
                        {getPropData.property_type === "sell" && (
                          <div className="mortage_cal_details">
                            <MortgageCalculator data={getPropData} />
                          </div>
                        )}
                      </div>
                    </div>
                    {getSimilerData && (
                      <SimilerPropertySlider
                        data={getSimilerData}
                        isLoading={isLoading}
                        currentPropertyId={getPropData?.id}
                      />
                    )}

                    {isReporteModal && (
                      <ReportPropertyModal
                        show={handleReportProperty}
                        onHide={() => setIsReporteModal(false)}
                        propertyId={getPropData?.id}
                        setIsReported={setIsReported}
                      />
                    )}
                  </div>
                </div>
              </section>

              {/* Add the MobileBottomSheet component for mobile devices with share=true in URL */}
              {isMobile && isShare && (
                <MobileBottomSheet isOpen={true} />
              )}

            </Layout>
            </div>
          ) : (
            <Layout>
              <Breadcrumb />
              <div className="row">
                <div className="col-12 pb-5">
                  <NoData />
                </div>
              </div>
            </Layout>
          )}
        </>
      )}

      {showModal && (
        <LoginModal isOpen={showModal} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default withAuth(PropertyDetails);
