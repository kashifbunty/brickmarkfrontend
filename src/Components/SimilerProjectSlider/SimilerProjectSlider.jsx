"use client";
import React, { useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
// import required modules
import { FreeMode, Pagination } from "swiper/modules";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { store } from "@/store/store";
import { handlePackageCheck, translate } from "@/utils/helper";
import ProjectCard from "../Cards/ProjectCard";
import Swal from "sweetalert2";
import { settingsData } from "@/store/reducer/settingsSlice";
import ProjectCardSkeleton from "../Skeleton/ProjectCardSkeleton";
import LoginModal from "../LoginModal/LoginModal";
import Link from "next/link";
import { PackageTypes } from "@/utils/checkPackages/packageTypes";

const SimilerProjectSlider = ({ isLoading, getSimilerData, isUserProject }) => {
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const isLoggedIn = useSelector((state) => state.User_signup);
  const userCurrentId =
    isLoggedIn && isLoggedIn.data ? isLoggedIn.data.data.id : null;
  const router = useRouter();

  const breakpoints = {
    320: {
      slidesPerView: 1,
    },
    375: {
      slidesPerView: 1.5,
    },
    576: {
      slidesPerView: 1.5,
    },
    768: {
      slidesPerView: 2,
    },
    992: {
      slidesPerView: 2,
    },
    1200: {
      slidesPerView: 3,
    },
    1400: {
      slidesPerView: 4,
    },
  };
  const settingData = useSelector(settingsData);
  const isPremiumUser = settingData && settingData.is_premium;
  const language = store.getState().Language.languages;


  return (
    <div div id="similer-properties">
      <>
        <div className="similer-headline">
          <span className="headline">
            {translate("upcoming")}{" "}
            <span>
              <span className=""> {translate("projects")}</span>
            </span>
          </span>
        </div>
        <div className="similer-prop-slider">
          <Swiper
            dir={language.rtl === 1 ? "rtl" : "ltr"}
            slidesPerView={4}
            spaceBetween={30}
            freeMode={true}
            pagination={{
              clickable: true,
            }}
            modules={[FreeMode, Pagination]}
            className="similer-swiper"
            breakpoints={breakpoints}
          >
            {isLoading ? (
              <Swiper
                dir={language.rtl === 1 ? "rtl" : "ltr"}
                slidesPerView={4}
                spaceBetween={30}
                freeMode={true}
                pagination={{
                  clickable: true,
                }}
                modules={[FreeMode, Pagination]}
                className="most-view-swiper"
                breakpoints={breakpoints}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <SwiperSlide>
                    <div className="loading_data">
                      <ProjectCardSkeleton />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              getSimilerData &&
              getSimilerData?.map((ele, index) => (
                <SwiperSlide id="similer-swiper-slider" key={index}>
                  {isUserProject ? (
                    <Link href={`/my-project/${ele.slug_id}`}>
                      <ProjectCard ele={ele} />
                    </Link>
                  ) : (
                    <div
                      onClick={(e) =>
                        handlePackageCheck(
                          e,
                          PackageTypes.PROJECT_ACCESS,
                          router,
                          ele.slug_id
                        )
                      }
                    >
                      <ProjectCard ele={ele} />
                    </div>
                  )}
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </div>
      </>
      {showModal && (
        <LoginModal isOpen={showModal} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default SimilerProjectSlider;
