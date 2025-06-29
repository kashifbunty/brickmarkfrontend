"use client"
import React, { useEffect, useState } from 'react'
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import { getAllprojectsApi } from "@/store/actions/campaign";
import Link from "next/link";
import VerticalCard from "@/Components/Cards/VerticleCard";
import VerticalCardSkeleton from "@/Components/Skeleton/VerticalCardSkeleton";
import { useSelector } from "react-redux";
import { translate } from "@/utils/helper";
import { languageData } from "@/store/reducer/languageSlice";
import NoData from "@/Components/NoDataFound/NoData";
import Layout from '../Layout/Layout';
import ProjectCard from '../Cards/ProjectCard';
import ProjectCardSkeleton from '../Skeleton/ProjectCardSkeleton';

const FeaturedProjects = () => {
    const lang = useSelector(languageData);

    const locationData = useSelector((state) => state.location);
    const userSelectedLocation = locationData?.currentLocation;
    const userSelectedCoordinates = userSelectedLocation?.coordinates;
    const userSelectedRadius = userSelectedLocation?.radius;

    const [isLoading, setIsLoading] = useState(false);
    const [projectData, setProjectData] = useState([]);
    const [offsetdata, setOffsetdata] = useState(0);
    const [hasMoreData, setHasMoreData] = useState(true); // Track if there's more data to load

    useEffect(() => { }, [lang, projectData]);
    const limit = 8;
    const isLoggedIn = useSelector((state) => state.User_signup);

    const fetchProjects = () => {
        if(offsetdata === 0){
            setIsLoading(true)
        }
        try {
          getAllprojectsApi({
                get_featured: 1,
                limit: limit.toString(),
                offset: offsetdata.toString(),
                latitude: userSelectedCoordinates?.latitude,
                longitude: userSelectedCoordinates?.longitude,
                radius: userSelectedRadius,
                onSuccess: (response) => {
                    const FeaturedListingData = response.data;
                    setIsLoading(false);
                    // Append data only if "Load More" is clicked (i.e., offset > 0)
                    if (offsetdata > 0) {
                        setProjectData(prevListings => [...prevListings, ...FeaturedListingData]);
                    } else {
                        // If it's the initial load (i.e., offset === 0), replace the data
                        setProjectData(FeaturedListingData);
                    }

                    setHasMoreData(FeaturedListingData.length === limit);
                },
                onError: (error) => {
                    setIsLoading(true);
                    console.log(error);
                }
            })
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        fetchProjects()
    }, [offsetdata, isLoggedIn, userSelectedCoordinates, userSelectedRadius])


    const handleLoadMore = () => {
        const newOffset = offsetdata + limit;
        setOffsetdata(newOffset);
    };

    return (
        <Layout>
            <Breadcrumb title={translate("featurdAllProjects")} />
            <section id="featured_prop_section">
                <div className="container">
                    <div id="feature_cards" className="row">
                        {isLoading ? ( // Show Skeleton when isLoading is true
                            Array.from({ length: 8 }).map((_, index) => (
                                <div className="col-sm-12 col-md-6 col-lg-3 loading_data" key={index}>
                                    <ProjectCardSkeleton />
                                </div>
                            ))
                        ) : projectData.length > 0 ? (
                            projectData.map((ele, index) => (
                                <div className="col-sm-12 col-md-6 col-lg-6 col-xl-4 col-xxl-3" key={index}>
                                   <ProjectCard ele={ele} />
                                </div>
                            ))
                        ) : (
                            <div className="noDataFoundDiv">
                                <NoData />
                            </div>
                        )}
                        {projectData && projectData.length > 0 && hasMoreData ? (
                            <div className="col-12 loadMoreDiv" id="loadMoreDiv">
                                <button className='loadMore' onClick={handleLoadMore}>{translate("loadmore")}</button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>
        </Layout>
    )
}

export default FeaturedProjects;
