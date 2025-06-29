"use client";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import React, { useEffect, useState } from "react";
import { CiLocationOn } from "react-icons/ci";
import { FiPhoneCall } from "react-icons/fi";
import { RiMailSendLine } from "react-icons/ri";
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
import Link from "next/link";
import { languageData } from "@/store/reducer/languageSlice";
import { useSelector } from "react-redux";
import Image from "next/image";
import Layout from "../Layout/Layout";
import { useRouter } from "next/router";
import { getAgentPropertyApi } from "@/store/actions/campaign";
import VerticalCard from "../Cards/VerticleCard";
import {
  BadgeSvg,
  handlePackageCheck,
  placeholderImage,
  translate,
  truncate,
} from "@/utils/helper";
import fb from "../../assets/Images/fb.svg";
import insta from "../../assets/Images/insta.svg";
import twitter from "../../assets/Images/twitter.svg";
import youtube from "../../assets/Images/youtube.svg";
import ProjectCard from "../Cards/ProjectCard";
import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";
import ProjectCardSkeleton from "../Skeleton/ProjectCardSkeleton";
import { getIsProject } from "@/store/reducer/momentSlice";
import NoData from "../NoDataFound/NoData";
import { PackageTypes } from "@/utils/checkPackages/packageTypes";
import Skeleton from "react-loading-skeleton";

const AgentDeatils = () => {
  const lang = useSelector(languageData);

  useEffect(() => { }, [lang]);

  const router = useRouter();
  const isLoggedIn = useSelector((state) => state.User_signup);
  const userCurrentId =
    isLoggedIn && isLoggedIn.data ? isLoggedIn.data.data.id : null;
  const slug = router?.query?.slug;
  const isAdmin = router?.query?.is_admin;
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState();
  const [agentData, setAgentData] = useState({});
  const isProjectActive = useSelector(getIsProject);
  const [agentProperty, setAgentProperty] = useState([]);
  const [agentProject, setAgentProject] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    isProjectActive ? "projects" : "properties"
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const limit = 6;
  const [offset, setOffset] = useState(0); // Pagination offset
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isFeatureAvailable, setIsFeatureAvailable] = useState(false);
  const [premiumPropertyCount, setPremiumPropertyCount] = useState(0);


  const handleSelectCategory = (e, category) => {
    e.preventDefault();
    setSelectedCategory(category);
    setOffset(0);
    setHasMoreData(true);
    setIsFeatureAvailable(false);
  };
  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };
  
  const fetchAgentProerties = () => {
    setIsLoading(true);
    try {
      getAgentPropertyApi({
        is_admin: isAdmin ? isAdmin : "",
        slug_id: slug,
        limit: limit.toString(),
        offset: offset.toString(),
        onSuccess: (res) => {
          setIsLoading(false);
          setAgentData(res?.data?.customer_data);
          setIsFeatureAvailable(res?.data?.feature_available);
          setPremiumPropertyCount(res?.data?.premium_properties_count);
          if (offset > 0) {
            setAgentProperty((prevListings) => [
              ...prevListings,
              ...res?.data?.properties_data,
            ]);
          } else {
            // If it's the initial load (i.e., offset === 0), replace the data
            setAgentProperty(res?.data?.properties_data);
          }
          setTotal(res?.total);
          setHasMoreData(res?.data?.properties_data.length === limit);
        },
        onError: (error) => {
          console.log(error);
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
  const fetchAgentProjects = () => {
    setIsLoading(true);
    try {
      getAgentPropertyApi({
        is_admin: isAdmin ? isAdmin : "",
        slug_id: slug,
        is_projects: 1,
        limit: limit.toString(),
        offset: offset.toString(),
        onSuccess: (res) => {
          setIsLoading(false);
          setAgentData(res?.data?.customer_data);
          setTotal(res?.total);
          setIsFeatureAvailable(res?.data?.feature_available);
          setPremiumPropertyCount(res?.data?.premium_properties_count);
          if (offset > 0) {
            setAgentProject((prevListings) => [
              ...prevListings,
              ...res?.data?.projects_data,
            ]);
          } else {
            // If it's the initial load (i.e., offset === 0), replace the data
            setAgentProject(res?.data?.projects_data);
          }
          setTotal(res?.total);
          setHasMoreData(res?.data?.projects_data.length === limit);
        },
        onError: (error) => {
          console.log(error);
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (slug) {
      if (selectedCategory === "properties") {
        fetchAgentProerties();
      } else {
        fetchAgentProjects();
      }
    }
  }, [slug, selectedCategory, offset, userCurrentId]);

  const handleLoadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
  };
  useEffect(() => { }, [isFeatureAvailable, premiumPropertyCount]);

  return (
    <Layout>
      <section id="agentDetailsSect">
        <Breadcrumb title={translate("agentDetails")} />
        <div className="agentContainer container">
          <div className="row mt-3 agentDetailsDiv3">
            <div className="col-12 col-md-12 col-lg-3">
              <div className="card" id="owner-deatils-card">
                <div className="card-header" id="card-owner-header">
                  <div className="agent_img_div">
                    <Image
                      loading="lazy"
                      width={200}
                      height={200}
                      src={agentData?.profile}
                      className="owner-img"
                      alt="no_img"
                      onError={placeholderImage}
                    />
                  </div>
                  <div className="owner-deatils">
                    <div className="verified-owner">
                      <span className="owner-name">
                        {truncate(agentData?.name, 30)}
                      </span>
                      {agentData?.is_verify && <span>{BadgeSvg}</span>}
                    </div>
                    <div className="socialIcons">
                      {agentData?.facebook_id && (
                        <Link href={agentData?.facebook_id} target="_blank">
                          <button>
                            <Image
                              src={fb}
                              width={0}
                              height={0}
                              alt="fb"
                              onError={placeholderImage}
                            />
                          </button>
                        </Link>
                      )}
                      {agentData?.instagram_id && (
                        <Link href={agentData?.instagram_id} target="_blank">
                          <button>
                            <Image
                              src={insta}
                              width={0}
                              height={0}
                              alt="fb"
                              onError={placeholderImage}
                            />
                          </button>
                        </Link>
                      )}
                      {agentData?.twitter_id && (
                        <Link href={agentData?.twitter_id} target="_blank">
                          <button>
                            <Image
                              src={twitter}
                              width={0}
                              height={0}
                              alt="fb"
                              onError={placeholderImage}
                            />
                          </button>
                        </Link>
                      )}
                      {agentData?.youtube_id && (
                        <Link href={agentData?.youtube_id} target="_blank">
                          <button>
                            <Image
                              src={youtube}
                              width={0}
                              height={0}
                              alt="fb"
                              onError={placeholderImage}
                            />
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {agentData?.address && agentData?.address !== "null" && (
                    <div className="owner-contact">
                      <div>
                        <CiLocationOn id="mail-o" size={60} />
                      </div>
                      <div className="deatilss">
                        <span className="o-d"> {translate("location")}</span>
                        <span className="value">{agentData?.address}</span>
                      </div>
                    </div>
                  )}
                  {agentData?.mobile && agentData?.mobile !== "null" && (
                    <a
                      href={`tel:${agentData?.mobile}`}
                      target="_blank"
                    >
                      <div className="owner-contact">
                        <div>
                          <FiPhoneCall id="call-o" size={60} />
                        </div>
                        <div className="deatilss">
                          <span className="o-d"> {translate("call")}</span>
                          <span className="value">{agentData?.mobile}</span>
                        </div>
                      </div>
                    </a>
                  )}
                  {agentData?.email && agentData?.email !== "null" && (
                    <a
                      href={`mailto:${agentData?.email}`}
                      target="_blank"
                    >
                      <div className="owner-contact">
                        <div>
                          <RiMailSendLine id="chat-o" size={60} />
                        </div>
                        <div className="deatilss">
                          <span className="o-d"> {translate("mail")}</span>
                          <span className="value">{agentData?.email}</span>
                        </div>
                      </div>
                    </a>
                  )}
                </div>
              </div>
              {isLoading ? (
                // Skeleton or loader when loading
                <div
                  style={{
                    width: "100%",
                    height: "485px",
                    borderRadius: "10px",
                  }}
                >
                  <Skeleton width={"100%"} height={"100%"} />
                </div>
              ) : selectedCategory === "properties" && !isFeatureAvailable && premiumPropertyCount > 0 ? (
                <div className="premium-card">
                  <div className="premium-card-overlay">
                    <div>
                      <h2 className="premium-card-title">
                        {translate("unlockPremiumProperties")}
                      </h2>
                      <p className="premium-card-description">
                        {translate("thisAgentHas")} {premiumPropertyCount} {translate("exclusivePremiumListingsAvailable")}.
                      </p>
                    </div>
                    <div>
                      <Link href="/subscription-plan">
                        <button className="premium-card-button">
                          {translate("subscribeNow")}
                        </button>
                      </Link>
                      <p className="premium-card-footer">
                        {translate("accessDetailedInfo")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="col-12  col-md-12 col-lg-9">
              <div className="row aboutOwnerRow2">
                <div>
                  {agentData?.about_me && (
                    <div className="aboutOwner card">
                      <span className="ownerNameSpan">
                        {translate("about")}{" "}
                        <span id="ownerName">{translate("agent")}</span>
                      </span>
                      <p>
                        {isExpanded
                          ? agentData?.about_me
                          : `${agentData?.about_me.substring(0, 300)}...`}
                      </p>
                      <span
                        className="readMore"
                        onClick={toggleReadMore}
                        style={{ cursor: "pointer" }}
                      >
                        {isExpanded ? (
                          <>
                            {translate("showless")} <AiFillCaretUp />
                          </>
                        ) : (
                          <>
                            {translate("showMore")} <AiFillCaretDown />
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-12 col-lg-12">
                  <div className="all-prop-rightside">
                    <div className="card sortby_header">
                      <div className="card-body" id="all-prop-headline-card">
                        <div className="proprty_projects">
                          {/* {agentProperty && agentProperty?.length > 0 && */}
                          <button
                            className={`${selectedCategory === "properties" ? "active" : ""
                              }`}
                            onClick={(e) =>
                              handleSelectCategory(e, "properties")
                            }
                          >
                            {translate("properties")}
                          </button>
                          {/* } */}
                          {/* {agentProject && agentProject?.length > 0 && */}
                          <button
                            className={`${selectedCategory === "projects" ? "active" : ""
                              }`}
                            onClick={(e) => handleSelectCategory(e, "projects")}
                          >
                            {translate("projects")}
                          </button>
                          {/* } */}
                        </div>
                        {selectedCategory === "properties" ? (
                          <div className="total">
                            <span>
                              {total > 0 &&
                                `${total} ${total > 1
                                  ? translate("proertiesFound")
                                  : translate("proertyFound")
                                }`}
                            </span>
                          </div>
                        ) : (
                          <div className="total">
                            <span>
                              {total > 0 &&
                                `${total} ${total > 1
                                  ? translate("projectsfound")
                                  : translate("projectfound")
                                }`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedCategory === "properties" ? (
                      <div id="columnCards">
                        <div className="row" id="all-prop-col-cards">
                          {isLoading
                            ? Array.from({ length: 6 }).map((_, index) => (
                              <div
                                className="col-12 col-md-6 col-lg-4 loading_data"
                                key={index}
                              >
                                <VerticalCardSkeleton />
                              </div>
                            ))
                            : agentProperty?.map((ele) => (
                              <div className="col-12 col-md-6 col-lg-4">
                                <VerticalCard ele={ele} />
                              </div>
                            ))}

                          {agentProperty &&
                            agentProperty.length > 0 &&
                            hasMoreData ? (
                            <div
                              className="col-12 loadMoreDiv"
                              id="loadMoreDiv"
                            >
                              <button
                                className="loadMore"
                                onClick={handleLoadMore}
                              >
                                {translate("loadmore")}
                              </button>
                            </div>
                          ) : null}
                        </div>
                        {agentProperty.length === 0 && (
                          <div className="col-12">
                            <NoData />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div id="columnCards">
                        
                        {isLoading ? (
                          // Loading skeleton
                          <div className="row" id="all-prop-col-cards">
                            {Array.from({ length: 6 }).map((_, index) => (
                              <div className="col-12 col-md-6 col-lg-4 loading_data" key={index}>
                                <ProjectCardSkeleton />
                              </div>
                            ))}
                          </div>
                        ) :
                        !isFeatureAvailable && total > 0 ? (
                          // Not premium - show upgrade card
                          <div
                            className="d-flex flex-column align-items-center justify-content-center text-center"
                            style={{
                              height: "250px",
                              padding: "16px",
                              backgroundColor: "#fff",
                              borderRadius: "8px",
                              border: "1px solid lightgray",
                            }}
                          >
                            <h2 className="fw-bold">{translate("unlockPremiumProjects")}</h2>
                            <p className="mb-3">
                              {translate("thisAgentHas")} {total}{" "}
                              {translate("exclusivePremiumListingsAvailable")}.
                            </p>
                            <Link href="/subscription-plan">
                              <button className="subscribe-button">
                                {translate("subscribeNow")}
                              </button>
                            </Link>
                          </div> 
                        ) :
                        agentProject && agentProject.length === 0 ? (
                          // No projects - show No Data
                          <div className="col-12">
                            <NoData />
                          </div>
                        ) : (
                          // Premium + projects exist - show projects
                          <div className="row" id="all-prop-col-cards">
                            {agentProject?.map((ele) => (
                              <div
                                className="col-12 col-md-6 col-lg-4"
                                key={ele?.slug_id}
                                onClick={(e) =>
                                  handlePackageCheck(e, PackageTypes.PROJECT_ACCESS, router, ele.slug_id)
                                }
                              >
                                <ProjectCard ele={ele} />
                              </div>
                            ))}

                            {agentProject && agentProject.length > 0 && hasMoreData && (
                              <div className="col-12 loadMoreDiv" id="loadMoreDiv">
                                <button className="loadMore" onClick={handleLoadMore}>
                                  {translate("loadmore")}
                                </button>
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AgentDeatils;
