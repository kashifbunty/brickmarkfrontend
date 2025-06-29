"use client";
import { translate } from "@/utils/helper";
import React from "react";
import { FiEye } from "react-icons/fi";
import MobileHeadline from "../MobileHeadlines/MobileHeadline";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import AgentCardSkeleton from "../Skeleton/AgentCardSkeleton";
import AgentCard from "../Cards/AgentCard";
const Agent = ({
  isLoading,
  agentsData,
  language,
  breakpointsAgents,
  handlecheckPremiumUserAgent,
  sectionTitle,
}) => {
  return (
    <div>
      {isLoading ? (
        <>
          <section id="agent_section">
            <div className="container">
              <div className="row">
                <div
                  className="col-sm-12 col-md-4 col-lg-3"
                  id="browse-by-agents"
                >
                  <div className="browse-agent">
                    <span>{sectionTitle}</span>
                    <Link href="/all-agents">
                      <button className="mt-3">
                        {" "}
                        <FiEye className="mx-2" size={25} />
                        {translate("viewAllAgents")}
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="mobile-headline-view">
                  <MobileHeadline
                    data={{
                      text: sectionTitle,
                      link: "/all-agents",
                    }}
                  />
                </div>
                <div
                  className="col-sm-12 col-md-4 col-lg-9"
                  id="agent-slider-cards"
                >
                  <div className="loading_data mt-4">
                    <Swiper
                      key={language.rtl}
                      dir={language.rtl === 1 ? "rtl" : "ltr"}
                      spaceBetween={30}
                      freeMode={true}
                      pagination={{
                        clickable: true,
                      }}
                      modules={[FreeMode, Pagination]}
                      className="agent-swiper"
                      breakpoints={breakpointsAgents}
                    >
                      {Array.from({ length: 6 }).map((_, index) => (
                        <SwiperSlide>
                          <div className="loading_data">
                            <AgentCardSkeleton />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : // Once loading is complete, render the agents section if data is available
      agentsData && agentsData.length > 0 ? (
        <section id="agent_section">
          <div className="container">
            <div className="row">
              <div
                className="col-sm-12 col-md-4 col-lg-3"
                id="browse-by-agents"
              >
                <div className="browse-agent">
                  <span>{sectionTitle}</span>
                  <Link href="/all-agents">
                    <button className="mt-3">
                      <FiEye className="mx-2" size={25} />
                      {translate("viewAllAgents")}
                    </button>
                  </Link>
                </div>
              </div>
              <div className="mobile-headline-view">
                <MobileHeadline
                  data={{
                    text: sectionTitle,
                    link: "/all-agents",
                  }}
                />
              </div>
              <div
                className="col-sm-12 col-md-4 col-lg-9"
                id="agent-slider-cards"
              >
                <div
                  className="agents-cards "
                  dir={language.rtl === 1 ? "rtl" : "ltr"}
                >
                  <Swiper
                    key={language.rtl}
                    dir={language.rtl === 1 ? "rtl" : "ltr"}
                    slidesPerView={3}
                    spaceBetween={30}
                    freeMode={true}
                    pagination={{
                      clickable: true,
                    }}
                    modules={[FreeMode, Pagination]}
                    className="agent-swiper"
                    breakpoints={breakpointsAgents}
                  >
                    {agentsData.map((ele, index) => (
                      <SwiperSlide key={index} id="agent-swiper-slider">
                        <AgentCard
                          ele={ele}
                          handlecheckPremiumUserAgent={
                            handlecheckPremiumUserAgent
                          }
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default Agent;
