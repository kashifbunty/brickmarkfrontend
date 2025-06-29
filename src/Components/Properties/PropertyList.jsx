"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import VerticalCard from "@/Components/Cards/VerticleCard";
import FilterForm from "@/Components/AllPropertyUi/FilterForm";
import GridCard from "@/Components/AllPropertyUi/GridCard";
import AllPropertieCard from "@/Components/AllPropertyUi/AllPropertieCard";
import { getPropertyListApi } from "@/store/actions/campaign";
import CustomHorizontalSkeleton from "@/Components/Skeleton/CustomHorizontalSkeleton";
import { useSelector } from "react-redux";
import { isLogin, translate } from "@/utils/helper";
import { languageData } from "@/store/reducer/languageSlice";
import NoData from "@/Components/NoDataFound/NoData";
import Layout from "../Layout/Layout";
import { useRouter } from "next/router";
import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";

const PropertyList = ({ type }) => {
  const router = useRouter();
  const isLoggedIn = isLogin();

  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [grid, setGrid] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [filterData, setFilterData] = useState({
    propType: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    postedSince: "",
    selectedLocation: null,
    facilitiesIds: [],
  });
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);

  const [categoryName, setCategoryName] = useState("");

  const limit = 9;
  const lang = useSelector(languageData);

  const cityName = router.query;

  useEffect(() => {}, [lang]);
  useEffect(() => {}, [grid]);

  useEffect(() => {
    if (router.isReady) {
      fetchProperties(0, false);
    }
  }, [router.isReady, isLoggedIn]);

  const fetchProperties = (newOffset, isAppend = false) => {
    setIsLoading(true);

    getPropertyListApi({
      city:
        type === "city"
          ? router.query.slug
          : filterData?.selectedLocation?.city,
      category_slug_id: type === "categories" ? router.query.slug : "",
      offset: newOffset.toString(),
      limit: limit.toString(),
      category_id: filterData?.category ? filterData?.category : "",
      property_type: filterData?.propType !== "" ? filterData?.propType : "",
      max_price: filterData?.maxPrice ? filterData?.maxPrice : "",
      min_price: filterData?.minPrice ? filterData?.minPrice : "",
      posted_since:
        filterData?.postedSince === "yesterday"
          ? "1"
          : filterData?.postedSince === "lastWeek"
          ? "0"
          : "",
      parameter_id: filterData?.facilitiesIds ? filterData?.facilitiesIds : "",

      onSuccess: (response) => {
        const propertyData = response.data;
        setCategoryName(propertyData[0]?.category?.category);
        setProperties(
          isAppend ? [...properties, ...propertyData] : propertyData
        );
        setTotal(response.total);
        setHasMoreData(propertyData.length === limit);
        setIsLoading(false);
      },
      onError: (error) => {
        console.error(error);
        setIsLoading(false);
      },
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFilterData((prev) => ({
      ...prev,
      [name]: type === "number" ? Math.max(0, parseInt(value)) || "" : value,
    }));
  };

  const handleTabClick = (tab) => {
    setFilterData((prev) => ({
      ...prev,
      propType: tab === "sell" ? 0 : 1,
    }));
  };

  const handlePostedSinceChange = (since) => {
    
    setFilterData((prev) => ({
      ...prev,
      postedSince: since,
    }));
  };

  const handleLocationSelected = (location) => {
    setFilterData((prev) => ({
      ...prev,
      selectedLocation: location,
    }));
  };

  const handleFacilityChange = (event, facilityId) => {
    const isChecked = event.target.checked;
    const currentFacilities = filterData.facilitiesIds
      ? String(filterData.facilitiesIds).split(",").filter(Boolean)
      : [];
    const updatedFacilities = isChecked
      ? [...new Set([...currentFacilities, facilityId.toString()])]
      : currentFacilities.filter((id) => id !== facilityId.toString());
    setFilterData((prev) => ({
      ...prev,
      facilitiesIds: updatedFacilities.join(","),
    }));
  };

  const clearfilterLocation = () => {
    setFilterData({
      ...filterData,
      selectedLocation: null,
    });
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    setIsFilterApplied(true);
    fetchProperties(0, false);
  };

  const handleClearFilter = () => {
    // First, clear the location filter
    clearfilterLocation();
    // Reset the filterData to its initial state
    const clearedFilterData = {
      propType: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      postedSince: "",
      selectedLocation: null,
      facilitiesIds: [],
    };
    setFilterData(clearedFilterData); // Reset the filter data
    setIsFilterApplied(true);
  };
  useEffect(() => {
    if (isFilterApplied) {
      // Call the API with the current filterData
      fetchProperties(0, false);

      // Reset the flag after the API call
      setIsFilterApplied(false);
    }
  }, [isFilterApplied]); // This will trigger the effect when isFilterApplied is set to true
  const handleLoadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchProperties(newOffset, true);
  };

  useEffect(() => {}, [filterData]);

  const breadCrumbTitle =
    type === "all"
      ? translate("allProperties")
      : type === "categories"
      ? `${categoryName} ${translate("properties")}`
      : type === "city"
      ? cityName.slug
        ? `${translate("propertiesListedIn")} ${cityName.slug}`
        : `${translate("noPropertiesListedIn")} ${cityName}`
      : "";

  useEffect(() => {
  }, [categoryName]);
  return (
    <Layout>
      <Breadcrumb title={breadCrumbTitle} />
      <div id="all-prop-containt">
        <div className="all-properties container">
          <div className="row " id="main-all-prop">
            <div className="col-12 col-md-12 col-lg-3">
              <FilterForm
                filterData={filterData}
                getCategories={properties}
                handleInputChange={handleInputChange}
                handleTabClick={handleTabClick}
                handlePostedSinceChange={handlePostedSinceChange}
                handleLocationSelected={handleLocationSelected}
                handleApplyfilter={handleApplyFilter}
                handleClearFilter={handleClearFilter}
                selectedLocation={filterData?.selectedLocation}
                clearfilterLocation={clearfilterLocation}
                setFilterData={setFilterData}
                handleFacilityChange={handleFacilityChange}
                type={type}
              />
            </div>
            <div className="col-12 col-md-12 col-lg-9">
              <div className="all-prop-rightside">
                {!isLoading && properties && properties.length > 0 ? (
                  <GridCard total={total} setGrid={setGrid} grid={grid} />
                ) : null}

                {isLoading ? (
                  !grid ? (
                    <div className="all-prop-cards" id="rowCards">
                      {Array.from({ length: limit }).map((_, index) => (
                        <div className="col-sm-12 loading_data" key={index}>
                          <CustomHorizontalSkeleton />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div id="columnCards">
                      <div className="row" id="all-prop-col-cards">
                        {Array.from({ length: limit }).map((_, index) => (
                          <div className="col-12 col-md-6 col-lg-4" key={index}>
                            <VerticalCardSkeleton />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ) : properties && properties.length > 0 ? (
                  !grid ? (
                    <div className="all-prop-cards" id="rowCards">
                      {properties.map((ele, index) => (
                        <Link
                          href="/properties-details/[slug]"
                          as={`/properties-details/${ele.slug_id}`}
                          passHref
                          key={index}
                        >
                          <AllPropertieCard ele={ele} />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div id="columnCards">
                      <div className="row" id="all-prop-col-cards">
                        {properties.map((ele, index) => (
                          <div
                            className="col-12 col-md-6 col-lg-4"
                            key={index}
                          >
                            <VerticalCard ele={ele} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="noDataFoundDiv">
                    <NoData />
                  </div>
                )}

                {!isLoading && properties && properties.length > 0 && hasMoreData ? (
                  <div className="col-12 loadMoreDiv" id="loadMoreDiv">
                    <button className="loadMore" onClick={handleLoadMore}>
                      {translate("loadmore")}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyList;
