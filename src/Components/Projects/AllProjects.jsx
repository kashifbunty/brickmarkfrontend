"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import { getAllprojectsApi } from "@/store/actions/campaign";
import Pagination from "@/Components/Pagination/ReactPagination";
import { useSelector } from "react-redux";
import { handlePackageCheck, translate } from "@/utils/helper";
import { languageData } from "@/store/reducer/languageSlice";
import NoData from "@/Components/NoDataFound/NoData";
import Layout from "../Layout/Layout";
import ProjectCard from "../Cards/ProjectCard";
import { useRouter } from "next/router";
import { settingsData } from "@/store/reducer/settingsSlice";
import Swal from "sweetalert2";
import ProjectCardSkeleton from "../Skeleton/ProjectCardSkeleton";
import LoginModal from "../LoginModal/LoginModal";
import { PackageTypes } from "@/utils/checkPackages/packageTypes";

const AllProjects = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] = useState([]);
  const [total, setTotal] = useState(0);
  const [offsetdata, setOffsetdata] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true); // Track if there's more data to load

  const locationData = useSelector((state) => state.location);
  const userSelectedLocation = locationData?.currentLocation;
  const userSelectedCoordinates = userSelectedLocation?.coordinates;
  const userSelectedRadius = userSelectedLocation?.radius;

  const limit = 8;
  const router = useRouter();

  const lang = useSelector(languageData);

  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => {
    setShowModal(false);
  };


  useEffect(() => {}, [lang]);

  useEffect(() => {
    setIsLoading(true);
    getAllprojectsApi({
      offset: offsetdata.toString(),
      limit: limit.toString(),
      latitude: userSelectedCoordinates?.latitude,
      longitude: userSelectedCoordinates?.longitude,
      radius: userSelectedRadius,
      onSuccess: (response) => {
        const ProjectData = response && response.data;
        setIsLoading(false);
        setProjectData((prevListings) => [...prevListings, ...ProjectData]);
        setTotal(response.total);
        setHasMoreData(ProjectData.length === limit);
      },
      onError: (error) => {
        setIsLoading(false);
        console.log(error);
      },
    });
  }, [offsetdata, userSelectedCoordinates, userSelectedRadius]);

  const handleLoadMore = () => {
    const newOffset = offsetdata + limit;
    setOffsetdata(newOffset);
  };

  return (
    <Layout>
      <Breadcrumb title={translate("projects")} />
      <section id="featured_prop_section">
        {isLoading ? ( // Show Skeleton when isLoading is true
          <div className="container">
            <div id="feature_cards" className="row">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  className="col-sm-12 col-md-6 col-lg-3 loading_data"
                  key={index}
                >
                  <ProjectCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        ) : projectData && projectData.length > 0 ? (
          <>
            <div className="container">
              <div id="feature_cards" className="row">
                {projectData.map((ele, index) => (
                  <div
                    className="col-sm-12 col-md-6 col-lg-6 col-xl-4 col-xxl-3"
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
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="noDataFoundDiv">
            <NoData />
          </div>
        )}
        {projectData && projectData.length > 0 && hasMoreData ? (
          <div className="col-12 loadMoreDiv" id="loadMoreDiv">
            <button className="loadMore" onClick={handleLoadMore}>
              {translate("loadmore")}
            </button>
          </div>
        ) : null}
      </section>

      {showModal && (
        <LoginModal isOpen={showModal} onClose={handleCloseModal} />
      )}
    </Layout>
  );
};

export default AllProjects;
