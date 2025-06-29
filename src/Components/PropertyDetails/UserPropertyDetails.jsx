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
  isThemeEnabled,
  placeholderImage,
  translate,
  truncate,
} from "@/utils/helper";
import { useRouter } from "next/router";
import { getAddedPropertiesApi } from "@/store/actions/campaign";
import LightBox from "@/Components/LightBox/LightBox";
import Loader from "@/Components/Loader/Loader";
import { isSupported } from "firebase/messaging";
import { ImageToSvg } from "@/Components/Cards/ImageToSvg";
import Swal from "sweetalert2";
import Layout from "../Layout/Layout";
import NoData from "../NoDataFound/NoData";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { BiDownload } from "react-icons/bi";
import MortgageCalculator from "../MortgageCalculator/MortgageCalculator";
import FeaturedPropertyCard from "./FeaturedPropertyCard";
import ChangePropertyTypeStatusCard from "./ChangePropertyTypeStatusCard";
import PropertyGallery from "./PropertyGallery";
import ChangeStatusCard from "./ChangeStatusCard";

const UserPropertyDetails = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [propertyData, setPropertyData] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [interested, setInterested] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [propertyStatus, setPropertyStatus] = useState(null);
  const [getSimilerData, setSimilerData] = useState([]);
  const [isMessagingSupported, setIsMessagingSupported] = useState(false);
  const [notificationPermissionGranted, setNotificationPermissionGranted] =
    useState(false);
  const [isReporteModal, setIsReporteModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
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
  const [manualPause, setManualPause] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [imageURL, setImageURL] = useState("");

  const lang = useSelector(languageData);
  const isLoggedIn = useSelector((state) => state.User_signup);
  const SettingsData = useSelector(settingsData);

  const themeEnabled = isThemeEnabled();
  const DistanceSymbol = SettingsData && SettingsData?.distance_option;

  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {}, [lang]);
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

  const fetchPropertyDetails = () => {
    setIsLoading(true);

    if (slug && slug != "") {
      getAddedPropertiesApi({
        current_user: isLoggedIn ? userCurrentId : "",
        slug_id: slug,
        onSuccess: (response) => {
          const propertyData = response && response.data;
          const similarProperties = response?.similiar_properties;
          setIsLoading(false);
          setPropertyData(propertyData[0]);
          setSimilarProperties(similarProperties);
          setIsReported(propertyData[0]?.is_reported);
          setPropertyStatus(propertyData[0]?.status);
        },
        onError: (error) => {
          setIsLoading(true);
          console.log(error);
        },
      });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchPropertyDetails();
  }, [isLoggedIn, slug, interested, isReported]);

  useEffect(() => {
    if (propertyData && propertyData?.three_d_image) {
      setImageURL(propertyData?.three_d_image);
    }
  }, [propertyData]);

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

      setTimeout(initializePanorama, 3000);
    }
  }, [imageURL]);

  const userCurrentId =
    isLoggedIn && isLoggedIn?.data ? isLoggedIn?.data?.data.id : null;
  const userCompleteData = [
    "name",
    "email",
    "mobile",
    "profile",
    "address",
  ].every((key) => isLoggedIn?.data?.data?.[key]);

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
  const videoLink = propertyData && propertyData.video_link;

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
    setManualPause(true);
    setShowThumbnail(true);
  };

  const galleryPhotos = propertyData && propertyData.gallery;

  const openLightbox = (index) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  };

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };
  const handleShowMap = () => {
    setShowMap(true);
  };
  useEffect(() => {
    return () => {
      setShowMap(false);
      setIsReported(false);
    };
  }, [userCurrentId, slug]);
  useEffect(() => {
    return () => {
      setIsReported(false);
      setInterested(false);
    };
  }, [userCurrentId, slug]);
  useEffect(() => {
    if (userCurrentId) {
      if (propertyData?.is_interested === 1) {
        setInterested(true);
      }
    }
  }, [userCurrentId, slug]);
  useEffect(() => {
    if (userCurrentId === propertyData?.added_by) {
      setShowChat(false);
    } else {
      setShowChat(true);
    }
  }, [slug, showChat, isLoggedIn, propertyData?.added_by]);

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

  useEffect(() => {}, [chatData, isReported, interested]);

  const handleDownload = async (fileName) => {
    try {
      const fileUrl = `${fileName}`;
      const response = await fetch(fileUrl);

      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;

      link.setAttribute("download", fileName);

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };
  const onStatusChange = (newStatus) => {
    setPropertyStatus(newStatus);
  };

  // Check if right column has any content
  const hasRightColumnContent =
    (propertyData?.request_status === "approved" ) ||
    (propertyData?.request_status === "approved" &&
      propertyData?.is_featured_available);

  if (isLoading) return <Loader />;
  if (!propertyData) return <NoData />;

  return (
    <Layout>
      <div className="property-details-container">
        <div className="row">
          <div className="col-lg-12">
            <Breadcrumb
              data={{
                type: propertyData && propertyData.category.category,
                title: propertyData && propertyData.title,
                loc: propertyData && propertyData.address,
                propertyType: propertyData && propertyData.property_type,
                time: propertyData && propertyData.post_created,
                price: propertyData && propertyData.price,
                is_favourite: propertyData && propertyData.is_favourite,
                propId: propertyData && propertyData.id,
                title_img: propertyData && propertyData.title_image,
                rentduration: propertyData && propertyData.rentduration,
                admin_status: propertyData && propertyData.request_status,
                propertyStatus: propertyData && propertyData.status,
                isUser: true,
                promoted: propertyData?.promoted,
              }}
            />
            <section className="properties-deatil-page">
              <div id="all-prop-deatil-containt">
                <div className="container">
                  <div className="row" id="prop-all-deatils-cards">
                    <div
                      className={`${
                        hasRightColumnContent
                          ? "col-12 col-md-12 col-lg-9"
                          : "col-12"
                      }`}
                      id="prop-deatls-card"
                    >
                      <PropertyGallery
                        galleryPhotos={galleryPhotos}
                        titleImage={propertyData?.title_image}
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
                        title_image={propertyData?.title_image}
                        setViewerIsOpen={setViewerIsOpen}
                        setCurrentImage={setCurrentImage}
                      />
                      {propertyData && propertyData.description ? (
                        <div className="card about-propertie">
                          <div className="card-header">
                            {translate("aboutProp")}
                          </div>
                          <div className="card-body">
                            {propertyData && propertyData.description && (
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
                                  {propertyData.description}
                                </p>

                                <button
                                  onClick={() => setExpanded(!expanded)}
                                  style={{
                                    display:
                                      propertyData.description.split("\n")
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

                      {propertyData &&
                      propertyData.parameters.length > 0 &&
                      propertyData.parameters.some(
                        (elem) => elem.value !== null && elem.value !== ""
                      ) ? (
                        <div className="card " id="features-amenities">
                          <div className="card-header">
                            {translate("feature&Amenties")}
                          </div>
                          <div className="card-body">
                            <div className="row">
                              {propertyData &&
                                propertyData.parameters.map((elem, index) =>
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
                                            {typeof elem?.value === "string" &&
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
                      {propertyData &&
                      propertyData.assign_facilities.length > 0 &&
                      propertyData.assign_facilities.some(
                        (elem) =>
                          elem.distance !== null &&
                          elem.distance !== "" &&
                          elem.distance !== 0
                      ) ? (
                        <div className="card " id="features-amenities">
                          <div className="card-header">{translate("OTF")}</div>
                          <div className="card-body">
                            <div className="row">
                              {propertyData &&
                                propertyData.assign_facilities.map(
                                  (elem, index) =>
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
                      {propertyData &&
                      propertyData.latitude &&
                      propertyData.longitude ? (
                        <div className="card" id="propertie_address">
                          <div className="card-header">
                            {translate("address")}
                          </div>
                          <div className="card-body">
                            <div className="row" id="prop-address">
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
                                      {propertyData && propertyData.address}
                                    </span>
                                  </div>
                                  <div className="adrs_value">
                                    <span className="">
                                      {propertyData && propertyData.city}
                                    </span>
                                  </div>

                                  <div className="adrs_value">
                                    <span className="">
                                      {propertyData && propertyData.state}
                                    </span>
                                  </div>
                                  <div className="adrs_value">
                                    <span className="">
                                      {propertyData && propertyData.country}
                                    </span>
                                  </div>
                                </div>
                              </>
                            </div>
                            {propertyData ? (
                              <div className="card google_map">
                                {showMap ? (
                                  <Map
                                    latitude={propertyData.latitude}
                                    longitude={propertyData.longitude}
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

                      {propertyData && propertyData.video_link ? (
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
                                  url={propertyData && propertyData.video_link}
                                  playing={playing}
                                  controls={true}
                                  onPlay={() => handleVideoReady(true)}
                                  onPause={() => {
                                    setManualPause(true);
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

                      {propertyData && propertyData.documents.length > 0 && (
                        <div className="card" id="download_docs">
                          <div className="card-header">{translate("docs")}</div>
                          <div className="card-body">
                            <div className="row doc_row">
                              {propertyData &&
                                propertyData?.documents.map((ele, index) => {
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
                                          <IoDocumentAttachOutline size={30} />
                                        </div>
                                        <div className="doc_title">
                                          <span>{truncate(fileName, 30)}</span>
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
                                            <span>{translate("download")}</span>
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

                    {hasRightColumnContent && (
                      <div className="col-12 col-md-12 col-lg-3">
                        {propertyData?.request_status === "approved" && (
                          <div className="change_status_card">
                            <ChangeStatusCard
                              id={propertyData?.id}
                              currentStatus={propertyStatus}
                              onStatusChange={() => fetchPropertyDetails()}
                              fetchDetails={() => fetchPropertyDetails()}
                              settingsData={SettingsData}
                            />
                          </div>
                        )}
                        {propertyData.property_type === "sell" && (
                          <div className="mortage_cal_details">
                            <MortgageCalculator data={propertyData} />
                          </div>
                        )}
                        {propertyData?.request_status === "approved" &&
                          propertyData?.is_featured_available && (
                            <FeaturedPropertyCard
                              settingsData={SettingsData}
                              propertyId={propertyData?.id}
                              isPremiumProperty={propertyData?.is_premium}
                            />
                          )}
                        {propertyData?.request_status === "approved" &&
                          propertyData?.status === 1 &&
                          propertyData?.property_type !== "sold" && (
                            <ChangePropertyTypeStatusCard
                              id={propertyData?.id}
                              propertyType={propertyData?.property_type}
                              onStatusChange={() => fetchPropertyDetails()}
                              fetchDetails={() => fetchPropertyDetails()}
                            />
                          )}
                      </div>
                    )}
                  </div>
                  {similarProperties && (
                    <SimilerPropertySlider
                      getSimilerData={similarProperties}
                      isLoading={isLoading}
                      isUserProperty={true}
                    />
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserPropertyDetails;
