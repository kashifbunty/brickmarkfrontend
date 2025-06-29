"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import {
  getAddedProjectApi,
} from "@/store/actions/campaign";
import Layout from "../Layout/Layout";
import { CiLocationOn } from "react-icons/ci";
import Loader from "../Loader/Loader";
import { settingsData } from "@/store/reducer/settingsSlice";
import { placeholderImage, translate } from "@/utils/helper";
import { AiOutlineArrowRight } from "react-icons/ai";
import Map from "../GoogleMap/GoogleMap";
import { PiPlayCircleThin } from "react-icons/pi";
import ReactPlayer from "react-player";

import FloorAccordion from "../FloorAccordion/FloorAccordion";
import { BiDownload } from "react-icons/bi";
import SimilerProjectSlider from "../SimilerProjectSlider/SimilerProjectSlider";
import { IoDocumentAttachOutline } from "react-icons/io5";
import LightBox from "../LightBox/LightBox";
import PropertyGallery from "../PropertyDetails/PropertyGallery";
import ChangeStatusCard from "../PropertyDetails/ChangeStatusCard";
import withAuth from "../Layout/withAuth";

const UserProjectDetails = () => {
  const router = useRouter();
  const ProjectSlug = router.query;
  const SettingsData = useSelector(settingsData);
  const isPremiumUser = SettingsData && SettingsData.is_premium;
  const isLoggedIn = useSelector((state) => state.User_signup);
  const userCurrentId =
    isLoggedIn && isLoggedIn.data ? isLoggedIn.data.data.id : null;
  const PlaceHolderImg = SettingsData?.web_placeholder_logo;

  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState();
  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [manualPause, setManualPause] = useState(false); // State to track manual pause
  const [seekPosition, setSeekPosition] = useState(0);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [getSimilerData, setSimilerData] = useState();
  const [projectStatus, setProjectStatus] = useState(null);

  const fetchProjectData = () => {
    getAddedProjectApi({
      slug_id: ProjectSlug.slug,
      get_similar: "1",
      onSuccess: (response) => {
        const ProjectData = response && response.data;
        const SimilerProjectData = response && response.similar_projects;
        setIsLoading(false);
        setProjectData(ProjectData);
        setSimilerData(SimilerProjectData);
        setProjectStatus(ProjectData?.status);
      },
      onError: (error) => {
        setIsLoading(false);
        console.log(error);
      },
    });
  };

  useEffect(() => {
    setIsLoading(true);
    if (ProjectSlug.slug && ProjectSlug.slug != "") {
      fetchProjectData();
    }
  }, [isLoggedIn, ProjectSlug]);

  const onStatusChange = (newStatus) => {
    setProjectStatus(newStatus);
  };

  const handleShowMap = (e) => {
    e.preventDefault();
    setShowMap(true);
  };
  useEffect(() => {
    return () => {
      setShowMap(false);
    };
  }, [userCurrentId, ProjectSlug]);

  useEffect(() => {}, [getSimilerData]);

  const galleryPhotos = projectData && projectData.gallary_images;

  const openLightbox = (index) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  };

  const videoLink = projectData && projectData.video_link;

  const videoId = videoLink
    ? videoLink.includes("youtu.be")
      ? videoLink.split("/").pop().split("?")[0]
      : videoLink.split("v=")[1]?.split("&")[0] ?? null
    : null;

  const backgroundImageUrl = videoId
    ? `https://img.youtube.com/vi/${videoId && videoId}/sddefault.jpg`
    : PlaceHolderImg;

  const handleVideoReady = (state) => {
    setPlaying(state);
    setShowThumbnail(!state);
  };

  const handleSeek = (e) => {
    if (e && typeof e.playedSeconds === "number") {
      setSeekPosition(parseFloat(e.playedSeconds));
      // Avoid pausing the video when seeking
      if (!manualPause) {
        setPlaying(true);
      }
    }
  };
  const handleSeekEnd = () => {
    setShowThumbnail(false);
  };

  const handlePause = () => {
    setManualPause(true); // Manually pause the video
    setShowThumbnail(true); // Reset showThumbnail to true
  };
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
    // if (userCurrentId) {
    //   if (isPremiumUser) {
    router.push(`/agent-details/${projectData?.customer?.slug_id}`);
    //   } else {
    //     Swal.fire({
    //       title: translate("opps"),
    //       text: translate("notPremiumUser"),
    //       icon: "warning",
    //       allowOutsideClick: false,
    //       showCancelButton: false,
    //       customClass: {
    //         confirmButton: "Swal-confirm-buttons",
    //         cancelButton: "Swal-cancel-buttons",
    //       },
    //       confirmButtonText: translate("ok"),
    //     }).then((result) => {
    //       if (result.isConfirmed) {
    //         router.push("/subscription-plan");
    //       }
    //     });
    //   }
    // } else {
    //   Swal.fire({
    //     title: translate("plzLogFirsttoAccess"),
    //     icon: "warning",
    //     allowOutsideClick: false,
    //     showCancelButton: false,
    //     allowOutsideClick: true,
    //     customClass: {
    //       confirmButton: "Swal-confirm-buttons",
    //       cancelButton: "Swal-cancel-buttons",
    //     },
    //     confirmButtonText: translate("ok"),
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //     }
    //   });
    // }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <Layout>
          <Breadcrumb title={translate("projectDetails")} />
          <section id="project_details">
            <div className="project_main_details">
              <div className="container">
                <div className="project_div">
                  <div className="project_right_details">
                    <span className="prop_types">
                      {projectData?.category?.category}
                    </span>
                    <span className="prop_name">{projectData?.title}</span>
                    <span className="project_type_tag">
                      {projectData?.type === "upcoming"
                        ? translate("upcoming")
                        : translate("underconstruction")}
                    </span>
                    <span className="prop_Location">
                      <CiLocationOn size={25} /> {projectData?.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="project_otherDetails">
              <div className="container">
                <div className="row" id="prop-all-deatils-cards">
                  <div
                    className="col-12 col-md-12 col-lg-9"
                    id="prop-deatls-card"
                  >
                    <PropertyGallery
                      galleryPhotos={galleryPhotos}
                      titleImage={projectData?.image}
                      onImageClick={() => openLightbox()}
                      translate={translate}
                      placeholderImage={placeholderImage}
                      PlaceHolderImg={PlaceHolderImg}
                    />

                    <LightBox
                      photos={galleryPhotos}
                      viewerIsOpen={viewerIsOpen}
                      currentImage={currentImage}
                      onClose={setViewerIsOpen}
                      title_image={projectData?.image}
                      setViewerIsOpen={setViewerIsOpen}
                      setCurrentImage={setCurrentImage}
                    />
                    {projectData && projectData.description ? (
                      <div className="card about-propertie">
                        <div className="card-header">
                          {translate("aboutProject")}
                        </div>
                        <div className="card-body">
                          {projectData && projectData.description && (
                            <>
                              <p
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxHeight: expanded ? "none" : "3em",
                                  marginBottom: "0",
                                }}
                              >
                                {projectData.description}
                              </p>
                              {projectData.description.split("\n").length >
                                3 && (
                                <button onClick={() => setExpanded(!expanded)}>
                                  {expanded ? "Show Less" : "Show More"}
                                  <AiOutlineArrowRight
                                    className="mx-2"
                                    size={18}
                                  />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {projectData &&
                    projectData.latitude &&
                    projectData.longitude ? (
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
                                    {projectData && projectData.location}
                                  </span>
                                </div>
                                <div className="adrs_value">
                                  <span className="">
                                    {projectData && projectData.city}
                                  </span>
                                </div>

                                <div className="adrs_value">
                                  <span className="">
                                    {projectData && projectData.state}
                                  </span>
                                </div>
                                <div className="adrs_value">
                                  <span className="">
                                    {projectData && projectData.country}
                                  </span>
                                </div>
                              </div>
                            </>
                          </div>
                          {projectData ? (
                            <div className="card google_map">
                              {showMap ? (
                                <Map
                                  latitude={projectData.latitude}
                                  longitude={projectData.longitude}
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

                    {projectData && projectData.video_link ? (
                      <div className="card" id="prop-video">
                        <div className="card-header">{translate("video")}</div>
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
                                width="100%"
                                height="500px"
                                url={projectData && projectData.video_link}
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
                    {projectData?.plans?.length > 0 && (
                      <div className="card" id="floor_plans">
                        <div className="card-header">
                          {translate("floorPlans")}
                        </div>
                        <div className="card-body">
                          <FloorAccordion plans={projectData?.plans} />
                        </div>
                      </div>
                    )}

                    {projectData && projectData.documents?.length > 0 && (
                      <div className="card" id="download_docs">
                        <div className="card-header">{translate("docs")}</div>
                        <div className="card-body">
                          <div className="row doc_row">
                            {projectData &&
                              projectData?.documents.map((ele, index) => {
                                const fileName = ele.name.split("/").pop();
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
                                        <span>{fileName}</span>
                                      </div>
                                      <div className="doc_download_button">
                                        <button
                                          onClick={() =>
                                            handleDownload(ele.name)
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
                  <div className="col-12 col-md-12 col-lg-3">
                    {projectData?.request_status === "approved" && (
                      <div className="change_status_card">
                        <ChangeStatusCard
                          id={projectData?.id}
                          currentStatus={projectStatus}
                          onStatusChange={() => fetchProjectData()}
                          fetchDetails={() => fetchProjectData()}
                          settingsData={SettingsData}
                          isProject={true}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {getSimilerData && getSimilerData.length > 0 && (
                  <SimilerProjectSlider
                    getSimilerData={getSimilerData}
                    isLoading={isLoading}
                    isUserProject={true}
                  />
                )}
              </div>
            </div>
          </section>
        </Layout>
      )}
    </>
  );
};

export default withAuth(UserProjectDetails);
