"use client";
import React, { useEffect, useState } from "react";
import Layout from "../Layout/Layout";
import { useRouter } from "next/router";
import { languageData } from "@/store/reducer/languageSlice";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/reducer/settingsSlice";
import { store } from "@/store/store";
import {
  categoriesCacheData,
  saveIsProject,
} from "@/store/reducer/momentSlice";
import { getHomePageApi } from "@/store/actions/campaign";
import NearByProperty from "./NearByProperty";
import FeaturedProperty from "./FeaturedProperty";
import HomeCategory from "./HomeCategory";
import MostViewedProperty from "./MostViewedProperty";
import Agent from "./Agent";
import UserRecommendationProperty from "./UserRecommendationProperty";
import Projects from "./Projects";
import MostFavProperty from "./MostFavProperty";
import ProprtiesNearbyCity from "./ProprtiesNearbyCity";
import HomeArticles from "./HomeArticles";
import { translate } from "@/utils/helper";
import NoData from "../NoDataFound/NoData";
import FAQS from "./FAQS";
import FeaturedProjects from "./FeaturedProjects";
import HeroSlider from "./HeroSlider";
import PremiumProperties from "./PremiumProperties";
import Swal from "sweetalert2";
import LocationModal from "../LocationSelector/LocationPopup";
import { setLocation } from "@/store/reducer/locationSlice";
import { useDispatch } from "react-redux";

const index = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const locationData = useSelector((state) => state.location);
  const userSelectedLocation = locationData?.currentLocation;
  const userSelectedCoordinates = userSelectedLocation?.coordinates;
  const userSelectedRadius = userSelectedLocation?.radius;

  // Add state to track if warning has been shown
  const [hasShownWarning, setHasShownWarning] = useState(false);

  const userLocation = useSelector((state) => state?.User_signup?.data?.data?.city);

  const lang = useSelector(languageData);
  useEffect(() => { }, [lang]);

  const settingData = useSelector(settingsData);
  const isPremiumUser = settingData && settingData.is_premium;

  const [isLoading, setIsLoading] = useState(true);

  const [sliderData, setSliderData] = useState([]);

  const [sections, setSections] = useState([]);

  const isLoggedIn = useSelector((state) => state.User_signup);

  const userCurrentLocation = userSelectedLocation?.city;
  const language = store.getState().Language.languages;
  const Categorydata = useSelector(categoriesCacheData);


  const handlecheckPremiumUserAgent = (e, ele) => {
    e.preventDefault();
    if (ele?.property_count === 0 && ele?.projects_count !== 0) {
      router.push(
        `/agent-details/${ele?.slug_id}${ele?.is_admin ? "?is_admin=1" : ""}`
      );
      saveIsProject(true);
    } else {
      router.push(
        `/agent-details/${ele?.slug_id}${ele?.is_admin ? "?is_admin=1" : ""}`
      );
      saveIsProject(false);
    }
  };

  const breakpoints = {
    0: {
      slidesPerView: 1.5,
    },
    375: {
      slidesPerView: 1.5,
    },
    576: {
      slidesPerView: 2.5,
    },
    768: {
      slidesPerView: 3,
    },
    992: {
      slidesPerView: 4,
    },
    1200: {
      slidesPerView: 3,
    },
    1400: {
      slidesPerView: 4,
    },
  };

  const breakpointsMostFav = {
    0: {
      slidesPerView: 1,
    },
    375: {
      slidesPerView: 1.5,
    },
    576: {
      slidesPerView: 2,
    },
    1200: {
      slidesPerView: 3,
    },
    1400: {
      slidesPerView: 4,
    },
  };

  const breakpointsProjects = {
    0: {
      slidesPerView: 1,
    },
    375: {
      slidesPerView: 1.5,
    },
    576: {
      slidesPerView: 2,
    },
    1200: {
      slidesPerView: 3,
    },
    1400: {
      slidesPerView: 4,
    },
  };
  const breakpointsAgents = {
    0: {
      slidesPerView: 1,
    },
    375: {
      slidesPerView: 1.5,
    },
    576: {
      slidesPerView: 2,
    },
    1200: {
      slidesPerView: 2.5,
    },
    1400: {
      slidesPerView: 4,
    },
  };

  const [showLocationPopup, setShowLocationPopup] = useState(false);

  const handleCloseLocationPopup = () => {
    setShowLocationPopup(false);
  };

  const handleSelectLocation = (location) => {
    setIsLoading(true); // Set loading when location changes
    dispatch(setLocation(location));
    setShowLocationPopup(false);
  };


  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        await fetchHomePageData();
      } catch (error) {
        console.error("Error fetching home page data:", error);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn, userSelectedCoordinates?.latitude, userSelectedCoordinates?.longitude, userSelectedRadius]);

  const fetchHomePageData = () => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      try {
        // Only pass location params if they exist
        const apiParams = {};
        if (userSelectedCoordinates?.latitude && userSelectedCoordinates?.longitude) {
          apiParams.latitude = userSelectedCoordinates.latitude;
          apiParams.longitude = userSelectedCoordinates.longitude;
          apiParams.radius = userSelectedRadius;
        }

        getHomePageApi({
          ...apiParams,
          onSuccess: (res) => {
            const responseData = res?.data;
            const sectionsData = responseData?.sections;

            // Check if we have coordinates and location data is not available
            if (
              userSelectedCoordinates?.latitude && 
              userSelectedCoordinates?.longitude && 
              responseData?.homepage_location_data_available === false
            ) {
                Swal.fire({
                  title: translate("locationDataNotAvailable"),
                  text: translate("pleaseChangeLocationOrContinue"),
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: translate("changeLocation"),
                  cancelButtonText: translate("continue"),
                  customClass: {
                    confirmButton: "Swal-confirm-buttons",
                    cancelButton: "Swal-cancel-buttons",
                  },
                }).then((result) => {
                  if (result.isConfirmed) {
                    setShowLocationPopup(true);
                  }
                });
            }

            setSections(sectionsData || []);
            setSliderData(responseData?.slider_section);
            setIsLoading(false);
            resolve();
          },
          onError: (err) => {
            setIsLoading(false);
            console.log(err);
            reject(err);
          },
        });
      } catch (error) {
        setIsLoading(false);
        console.log(error);
        reject(error);
      }
    });
  };

  // Function to render the appropriate component based on section type
  const renderSectionByType = (section) => {
    const { type, title, data } = section;

    switch (type) {
      case 'agents_list_section':
        return (
          <Agent
            key={type}
            isLoading={isLoading}
            agentsData={data}
            language={language}
            sectionTitle={title}
            handlecheckPremiumUserAgent={handlecheckPremiumUserAgent}
            breakpointsAgents={breakpointsAgents}
          />
        );
      case 'articles_section':
        return (
          <HomeArticles
            key={type}
            isLoading={isLoading}
            getArticles={data}
            language={language}
            sectionTitle={title}
          />
        );
      case 'categories_section':
        return (
          <HomeCategory
            key={type}
            isLoading={isLoading}
            categoryData={data}
            language={language}
            sectionTitle={title}
            breakpoints={breakpoints}
          />
        );
      case 'faqs_section':
        return (
          <FAQS
            key={type}
            data={data}
            language={language}
            sectionTitle={title}
          />
        );
      case 'featured_properties_section':
        return (
          <FeaturedProperty
            key={type}
            isLoading={isLoading}
            getFeaturedListing={data}
            language={language}
            sectionTitle={title}
          />
        );
      case 'nearby_properties_section':
        return (
          <FeaturedProperty
            key={type}
            isLoading={isLoading}
            getFeaturedListing={data}
            language={language}
            sectionTitle={userLocation ? title + " in " + userLocation : title}
          />
        );
      case 'featured_projects_section':
        return (
          <FeaturedProjects
            key={type}
            isLoading={isLoading}
            featuredProjects={data}
            language={language}
            sectionTitle={title}
            breakpointsProjects={breakpointsProjects}
          />
        );
      case 'most_liked_properties_section':
        return (
          <MostFavProperty
            key={type}
            isLoading={isLoading}
            language={language}
            getMostFavProperties={data}
            sectionTitle={title}
            breakpointsMostFav={breakpointsMostFav}
          />
        );
      case 'most_viewed_properties_section':
        return (
          <MostViewedProperty
            key={type}
            isLoading={isLoading}
            getMostViewedProp={data}
            language={language}
            sectionTitle={title}
          />
        );
      case 'projects_section':
        return (
          <Projects
            key={type}
            isLoading={isLoading}
            isPremiumUser={isPremiumUser}
            language={language}
            getProjects={data}
            sectionTitle={title}
            breakpointsProjects={breakpointsProjects}
          />
        );
      case 'premium_properties_section':
        return (
          <PremiumProperties
            key={type}
            isLoading={isLoading}
            getFeaturedListing={data}
            language={language}
            sectionTitle={title}
            isPremium={true}
          />
        );
      case 'user_recommendations_section':
        return (
          <UserRecommendationProperty
            key={type}
            isLoading={isLoading}
            language={language}
            sectionTitle={title}
            userRecommendationData={data}
            breakpointsMostFav={breakpointsMostFav}
          />
        );
      case "properties_by_cities_section":
        return (
          <ProprtiesNearbyCity
            key={type}
            isLoading={isLoading}
            language={language}
            sectionTitle={title}
            getNearByCitysData={data}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      {/* slider section */}
      <HeroSlider
        sliderData={sliderData}
        Categorydata={Categorydata}
        isLoading={isLoading}
      />

      <div
        style={{
          marginTop: sliderData && sliderData.length > 0 ? "0px" : "0px",
        }}
      >
        {/* Dynamic sections based on API response */}
        {sections && sections.length > 0 && (
          sections.map((section) => renderSectionByType(section))
        )}

        {/* WHEN NO DATA IN ADMIN PANEL  */}
        {!isLoading && sections && sections.length === 0 && sliderData && sliderData.length === 0 && (
          <div className="noData_container">
            <NoData />
          </div>
        )}
      </div>

      <LocationModal
        show={showLocationPopup}
        onHide={handleCloseLocationPopup}
        onSave={handleSelectLocation}
      />
    </Layout>
  );
};

export default index;
