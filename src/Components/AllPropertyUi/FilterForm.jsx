"use client";
import React, { useEffect, useRef, useState } from "react";
import { translate } from "@/utils/helper";
import { ButtonGroup } from "react-bootstrap";
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiSendPlane2Line,
} from "react-icons/ri";
import LocationSearchBox from "../Location/LocationSearchBox";
import {
  GetAllCategorieApi,
  getFacilitiesForFilterApi,
} from "@/store/actions/campaign";
import debounce from "lodash.debounce";
import { Autocomplete, TextField } from "@mui/material";

const FilterForm = (props) => {
  
  const [categoryData, setCategoryData] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFacilities, setShowFacilities] = useState(false);

  const handleCategorySearch = (event, newInputValue) => {
    debouncedFetchCategories(newInputValue);
  };

  const fetchAllCategories = (searchTerm = "") => {
    setIsLoading(true);
    try {
      GetAllCategorieApi({
        search: searchTerm,
        onSuccess: (response) => {
          const categories = response?.data;
          setCategoryData(categories);
          setIsLoading(false);
        },
        onError: (error) => {
          console.log(error);
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.log("error", error);
    }
  };
  const fetchFacilitiesForFilter = () => {
    try {
      getFacilitiesForFilterApi({
        onSuccess: (res) => {
          setFacilities(res?.data);
        },
        onError: (err) => {
          console.log(err);
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchAllCategories();
    fetchFacilitiesForFilter();
  }, []);

  useEffect(() => {}, [categoryData]);

  // Debounced function to handle search
  const debouncedFetchCategories = debounce((searchTerm) => {
    fetchAllCategories(searchTerm);
  }, 1000); // Adjust delay as needed

  const handleCategoryChange = (event, newValue) => {
    props?.setFilterData((prev) => ({
      ...prev,
      category: newValue ? newValue.id : "", // Handles default option
    }));
  };
  return (
    <div className="card" id="filter-card">
      <div className="card title" id="filter-title">
        <span>{translate("filterProp")}</span>
        <button onClick={props.handleClearFilter}>
          {translate("clearFilter")}
        </button>
      </div>
      <div className="card-body">
        <div className="filter-button-box">
          <ButtonGroup id="propertie_button_grup">
            <ul className="nav nav-tabs" id="props-tabs">
              <li className="">
                <a
                  className={`nav-link ${
                    props.filterData.propType === 0 ? "active" : ""
                  }`}
                  aria-current="page"
                  id="prop-sellbutton"
                  onClick={() => props?.handleTabClick("sell")}
                >
                  {translate("forSell")}
                </a>
              </li>
              <li className="">
                <a
                  className={`nav-link ${
                    props.filterData.propType === 1 ? "active" : ""
                  }`}
                  onClick={() => props.handleTabClick("rent")}
                  aria-current="page"
                  id="prop-rentbutton"
                >
                  {translate("forRent")}
                </a>
              </li>
            </ul>
          </ButtonGroup>
        </div>

        {props.type !== "categories" && (
          <div className="prop-type filter_label_title">
            <span>{translate("propTypes")}</span>
            <Autocomplete
              disableCloseOnSelect
              options={categoryData}
              getOptionLabel={(option) => option.category || ""}
              onChange={handleCategoryChange}
              onInputChange={handleCategorySearch}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  fullWidth
                  placeholder="Select Property Type" // Simple placeholder text
                  style={{ color: "#000", opacity: "0.66" }}
                />
              )}
              loading={isLoading}
              value={
                categoryData.find(
                  (cat) => cat.id === props.filterData.category
                ) || null
              }
              style={{ width: "100%", padding: "0px", border: "none" }}
            />
          </div>
        )}
        {props.type !== "city" && (
          <div className="prop-location filter_label_title">
            <span>{translate("selectYourLocation")}</span>
            <LocationSearchBox
              onLocationSelected={props.handleLocationSelected}
              selectedLocation={props?.selectedLocation}
              clearfilterLocation={props?.clearfilterLocation}
            />
          </div>
        )}
        <div className="budget-price filter_label_title">
          <span>{translate("budget")}</span>
          <div className="budget-inputs">
            <input
              className="price-input"
              type="number"
              placeholder={translate("minPrice")}
              name="minPrice"
              value={props.filterData.minPrice}
              onChange={props.handleInputChange}
            />
            <input
              className="price-input"
              type="number"
              placeholder={translate("maxPrice")}
              name="maxPrice"
              value={props.filterData.maxPrice}
              onChange={props.handleInputChange}
            />
          </div>
        </div>
        <div className="posted-since filter_label_title">
          <span>{translate("postedSince")}</span>
          <div className="posted-duration">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="flexRadioDefault"
                id="flexRadioDefault1"
                value="anytime"
                checked={props.filterData.postedSince === "anytime"}
                onChange={(e) => props.handlePostedSinceChange(e.target.value)}
              />
              <label className="form-check-label" htmlFor="flexRadioDefault1">
                {translate("anytime")}
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="flexRadioDefault"
                id="flexRadioDefault2"
                value="lastWeek"
                checked={props.filterData.postedSince === "lastWeek"}
                onChange={(e) => props.handlePostedSinceChange(e.target.value)}
              />
              <label className="form-check-label" htmlFor="flexRadioDefault2">
                {translate("lastWeek")}
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="flexRadioDefault"
                id="flexRadioDefault3"
                value="yesterday"
                checked={props.filterData.postedSince === "yesterday"}
                onChange={(e) => props.handlePostedSinceChange(e.target.value)}
              />
              <label className="form-check-label" htmlFor="flexRadioDefault3">
                {translate("yesterday")}
              </label>
            </div>
          </div>
        </div>
        <div className="facilities-toggle filter_label_title">
          <span>{translate("facilities")}</span>
          <button
            onClick={() => setShowFacilities(!showFacilities)}
            className="toggle-button"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontSize: "16px",
            }}
          >
            {showFacilities ? translate("hide") : translate("show")}
            {showFacilities ? (
              <RiArrowUpSLine size={20} />
            ) : (
              <RiArrowDownSLine size={20} />
            )}
          </button>
        </div>

        {/* Facilities Section with Animation */}
        <div
          className={`facilities-section ${showFacilities ? "show" : "hide"}`}
          style={{
            overflow: "hidden",
            maxHeight: showFacilities ? "100%" : "0",
            transition: "max-height 0.5s ease-in-out",
          }}
        >
          <div className="facilities_data">
            {facilities?.map((facility) => (
              <div key={facility.id} className="custom-checkbox">
                <input
                  type="checkbox"
                  className="custom-checkbox-input"
                  id={`facility-${facility.id}`}
                  onChange={
                    (event) => props?.handleFacilityChange(event, facility.id) // Handle checkbox change
                  }
                  checked={
                    Array.isArray(props?.filterData.facilitiesIds)
                      ? props?.filterData.facilitiesIds.includes(facility.id) // If it's an array, check directly
                      : (
                          props?.filterData.facilitiesIds?.split(",") || []
                        ).includes(facility.id.toString()) // Otherwise, handle it as a string
                  }
                />
                <label
                  className="custom-checkbox-label"
                  htmlFor={`facility-${facility.id}`}
                >
                  {facility.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="apply-filter" onClick={props.handleApplyfilter}>
          <RiSendPlane2Line size={25} />
          <button id="apply-filter-button">{translate("applyFilter")}</button>
        </div>
      </div>
    </div>
  );
};

export default FilterForm;
