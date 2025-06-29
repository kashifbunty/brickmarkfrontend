"use client";
import Link from "next/link";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { FreeMode, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import VerticalCard from "../Cards/VerticleCard";
import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";
// Import Swiper styles
import { translate } from "@/utils/helper";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import MobileHeadline from "../MobileHeadlines/MobileHeadline";

const MostFavProperty = ({
  isLoading,
  getMostFavProperties,
  language,
  breakpointsMostFav,
  sectionTitle,
}) => {
  return (
    <div>
      {isLoading ? (
        // Show skeleton loading when data is being fetched
        <section id="most_fav_loading">
          <div className="container">
            <div className="most_fav_header mt-4">
              <div>
                <h3 className="headline">
                  <span>{sectionTitle}</span>
                  </h3>
              </div>
              <div className="rightside_most_fav_header">
                {getMostFavProperties.length > 6 ? (
                  <Link href="/most-favorite-properties">
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
                        {translate("seeAllProp")}
                      </span>
                    </button>
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="loading_data_section mt-4">
              <Swiper
                key={language.rtl}
                dir={language.rtl === 1 ? "rtl" : "ltr"}
                slidesPerView={4}
                spaceBetween={30}
                freeMode={true}
                pagination={{
                  clickable: true,
                }}
                modules={[FreeMode, Pagination]}
                className="most-view-swiper"
                breakpoints={breakpointsMostFav}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <SwiperSlide key={index}>
                    <div className="loading_data">
                      <VerticalCardSkeleton />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      ) : // Show actual data when loading is complete
      getMostFavProperties && getMostFavProperties.length > 0 ? (
        <section id="most_fav">
          <div className="container">
            <div className="most_fav_header">
              <div>
                <h3 className="headline">
                {sectionTitle}
                </h3>
              </div>
              <div className="rightside_most_fav_header">
                {getMostFavProperties.length > 6 ? (
                  <Link href="/most-favorite-properties">
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
                        {translate("seeAllProp")}
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
                    getMostFavProperties.length > 6
                      ? "/most-favorite-properties"
                      : "",
                }}
              />
            </div>
            <div
              id="most-view-properties"
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
                className="most-view-swiper"
                breakpoints={breakpointsMostFav}
              >
                {getMostFavProperties.map((ele, index) => (
                  <SwiperSlide key={index} id="most-view-swiper-slider">
                    <VerticalCard ele={ele} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default MostFavProperty;
