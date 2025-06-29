import React from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
import PackageCard from "@/Components/Skeleton/PackageCard";
import SubscriptionCard from "@/Components/Cards/SubscriptionCard";
import NoData from "@/Components/NoDataFound/NoData";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

const SubscriptionSwiper = ({
  loading,
  packagedata,
  language,
  breakpoints,
  subscribePayment,
  systemsettings,
  allFeatures
}) => {
  return (
    <Swiper
      dir={language.rtl === 1 ? "rtl" : "ltr"}
      slidesPerView={4}
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
            <SwiperSlide key={index}>
              <div className="col-lg-3 col-md-6 col-12 main_box">
                <PackageCard />
              </div>
            </SwiperSlide>
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
            <div className="noDataFoundDiv">
              <NoData />
            </div>
          )}
        </>
      )}
    </Swiper>
  );
};

export default SubscriptionSwiper; 