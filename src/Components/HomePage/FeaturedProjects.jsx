import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import ProjectCardSkeleton from "../Skeleton/ProjectCardSkeleton";
import { handlePackageCheck, translate } from "@/utils/helper";
import { IoIosArrowForward } from "react-icons/io";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import ProjectCard from "../Cards/ProjectCard";
import { PackageTypes } from "@/utils/checkPackages/packageTypes";
import { useRouter } from "next/router";
import MobileHeadline from "../MobileHeadlines/MobileHeadline";

const FeaturedProjects = ({
  isLoading,
  featuredProjects,
  language,
  breakpointsProjects,
  sectionTitle,
}) => {
  const router = useRouter();
  return (
    <div>
      {isLoading ? (
        // Show skeleton loading when data is being fetched
        <section id="featured_projects">
          <div className="container">
            <div className="feature_header">
                  <h3 className="headline">{sectionTitle} </h3>
            </div>
            <div className="mobile-headline-view-project">
              <div id="mobile_headline_projects">
                <div className="main_headline_projects">
                  <span className="headline">
                        {sectionTitle}{" "}
                  </span>
                </div>
                <div>
                  <button className="mobileViewArrowProject">
                    <IoIosArrowForward size={25} />
                  </button>
                </div>
              </div>
            </div>
            <div id="projects_cards" dir={language.rtl === 1 ? "rtl" : "ltr"}>
              <Swiper
                key={language.rtl}
                slidesPerView={4}
                spaceBetween={30}
                freeMode={true}
                pagination={{
                  clickable: true,
                }}
                modules={[FreeMode, Pagination]}
                className="all_project_swiper"
                breakpoints={breakpointsProjects}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <SwiperSlide key={index}>
                    <div className="loading_data">
                      <ProjectCardSkeleton />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      ) : // Check if featuredProjects exists and has valid data
      featuredProjects && featuredProjects.length > 0 ? (
        <section id="featured_projects">
          <div className="container">
            <div style={{ padding: "40px 0" }}>
              <div>
                <div className="feature_header">
                  <span className="headline">
                    {sectionTitle}
                  </span>
                  <div className="rightside_header">
                    {featuredProjects.length > 4 ? (
                      <Link href="/featured-projects">
                        <button className="learn-more" id="viewall">
                          <span aria-hidden="true" className="circle">
                            <div className="icon_div">
                              <span className="icon arrow">
                                {language.rtl === 1 ? (
                                  <BsArrowLeft />
                                ) : (
                                  <BsArrowRight />
                                )}
                              </span>
                            </div>
                          </span>
                          <span className="button-text">
                              {translate("seeAllProjects")}
                          </span>
                        </button>
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="mobile-headline-view">
                  <MobileHeadline
                    data={{
                      text: sectionTitle,
                      link:
                        featuredProjects.length > 4
                          ? "/featured-projects"
                          : "",
                    }}
                  />
                </div>
              </div>
              <div
                id="feature-section-cards"
                dir={language.rtl === 1 ? "rtl" : "ltr"}
              >
                <Swiper
                  key={language.rtl}
                  slidesPerView={4}
                  spaceBetween={30}
                  freeMode={true}
                  pagination={{
                    clickable: true,
                  }}
                  modules={[FreeMode, Pagination]}
                  breakpoints={breakpointsProjects}
                >
                  {featuredProjects.map((ele, index) => (
                    <SwiperSlide
                      key={index}
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
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default FeaturedProjects;
