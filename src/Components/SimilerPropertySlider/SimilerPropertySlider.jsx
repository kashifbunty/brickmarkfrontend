"use client"
import React, { useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
// import required modules
import { FreeMode, Pagination } from "swiper/modules";
import VerticalCard from "../Cards/VerticleCard";
import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";


import { store } from "@/store/store";
import { translate } from "@/utils/helper";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import ComparePropertyModal from "../CompareProperties/ComparePropertyModal";


const SimilerPropertySlider = ({ data, isLoading, isUserProperty, currentPropertyId }) => {

    const [showCompareModal, setShowCompareModal] = useState(false);


    // Calculate the number of subscription plans, default to 0 if undefined/null
    const planCount = data?.length || 0;

    // Determine the base slidesPerView dynamically
    // If the number of plans is less than 3.5, use the plan count.
    // Otherwise, use the default 3.5. This prevents layout issues when few plans exist.
    const baseSlidesPerView = planCount < 3 ? planCount : 3;

    // Disable loop if there are not enough slides to loop meaningfully (less than slidesPerView)
    // Note: We compare against the *base* slidesPerView here for simplicity.
    // A more complex logic could check against breakpoint values too.
    const enableLoop = planCount >= baseSlidesPerView;

    const breakpoints = {
        320: {
            slidesPerView: 1,
        },
        375: {
            slidesPerView: 1.5,
        },
        576: {
            slidesPerView: 2,
        },
        768: {
            slidesPerView: 2,
        },
        992: {
            slidesPerView: 3,
        },
        1200: {
            slidesPerView: 3,
        },
        1400: {
            slidesPerView: 3,
        },
    };

    const language = store.getState().Language.languages;

    const handleOpenCompareModal = () => {
        setShowCompareModal(true);
    };

    const handleCloseCompareModal = () => {
        setShowCompareModal(false);
    };

    return (
        <div id="similer-properties">
            {data?.length > 0 ? (
                <>
                    <div className="similer-headline">
                        <span className="headline">
                            {translate("compareWithSimilar")} {" "}
                            <span>
                                <span className=""> {translate("properties")}</span>
                            </span>
                        </span>
                    </div>
                    <div className="property-comparison-container">
                        <div className="property-slider-container">
                            {data?.length > 3 ? (
                                <Swiper
                                    dir={language.rtl === 1 ? "rtl" : "ltr"}
                                    slidesPerView={baseSlidesPerView}
                                    spaceBetween={20}
                                    freeMode={true}
                                    pagination={{
                                        clickable: true,
                                    }}
                                    loop={enableLoop}
                                    modules={[FreeMode, Pagination]}
                                    className="similer-swiper"
                                    breakpoints={breakpoints}
                                >
                                    {isLoading ? (
                                        Array.from({ length: 6 }).map((_, index) => (
                                            <SwiperSlide key={index}>
                                                <div className="loading_data">
                                                    <VerticalCardSkeleton />
                                                </div>
                                            </SwiperSlide>
                                        ))
                                    ) : (
                                        data &&
                                        data.map((ele, index) => (
                                            <SwiperSlide id="similer-swiper-slider" key={index}>
                                                <VerticalCard ele={ele} isUserProperty={isUserProperty} />
                                            </SwiperSlide>
                                        ))
                                    )}
                                </Swiper>
                            ) : (
                                <div className="row">
                                    {data.map((ele, index) => (
                                        <div className="col-sm-12 col-md-6 col-lg-4" key={index}>
                                            <VerticalCard ele={ele} isUserProperty={isUserProperty} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="comparison-card">
                            <div className="comparison-card-inner">
                                <div className="comparison-icon">
                                    <FaArrowRightArrowLeft size={20} />
                                </div>
                                <h3>{translate("compareTitle")}</h3>
                                <p>{translate("compareDesc")}</p>
                                <button className="compare-now-btn" onClick={handleOpenCompareModal}>
                                    {translate("compareNow")}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Property Compare Modal */}
                    <ComparePropertyModal
                        show={showCompareModal}
                        handleClose={handleCloseCompareModal}
                        similarProperties={data}
                        currentPropertyId={currentPropertyId}
                    />
                </>
            ) : null}
        </div>
    );
};

export default SimilerPropertySlider;
