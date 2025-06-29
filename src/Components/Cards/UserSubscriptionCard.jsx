import React from "react";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";
import { formatDuration, translate } from "@/utils/helper";
import DualColorCircularProgressBar from "../SemiDonutChart/DualColorCircularProgressBar";

const UserSubscriptionCard = ({ CurrencySymbol, ele, formatDate }) => {
  // Helper to get feature limit and inclusion status
  const getFeatureLimit = (featureId) => {
    const feature = ele?.features?.find((f) => f.id === featureId);

    if (!feature) {
      return { included: false, limit: null };
    }

    if (feature.limit_type === "unlimited") {
      return {
        included: true,
        limit: null,
        type: feature.limit_type,
      };
    } else {
      return {
        included: true,
        limit: feature.total_limit,
        usedLimit: feature.used_limit,
        type: feature.limit_type,
      };
    }
  };

  // Get limits for each relevant feature
  const propertyList = getFeatureLimit(1); // Property List
  const projectList = getFeatureLimit(2); // Project List
  const propertyFeatureList = getFeatureLimit(3); // Property Feature
  const projectFeatureList = getFeatureLimit(4); // Project Feature
  const mortgageCalculator = getFeatureLimit(5); // Mortgage Calculator
  const premiumProperties = getFeatureLimit(6); // Premium Properties
  const projectListAccess = getFeatureLimit(7); // Project List Access

  const calculateRemainingTime = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const timeDiff = end - now;

    if (timeDiff <= 0) return "0 " + translate("timeLeft"); // Expired

    const hours = timeDiff / (1000 * 60 * 60);

    if (hours < 24) {
      // Less than 24 hours left, show hours
      const remainingHours = Math.ceil(hours);
      return `${remainingHours} ${translate("hoursLeft")}`;
    } else {
      // 24 hours or more, show days
      const remainingDays = Math.ceil(hours / 24);
      return `${remainingDays} ${translate("daysLeft")}`;
    }
  };

  // Get feature limits
  const propertyListLimit = propertyList?.limit;
  const projectListLimit = projectList?.limit;
  const propertyFeatureListLimit = propertyFeatureList?.limit;
  const projectFeatureListLimit = projectFeatureList?.limit;

  // Get used limits
  const usedPropertyListLimit = propertyList?.usedLimit;
  const usedProjectListLimit = projectList?.usedLimit;
  const usedPropertyFeatureListLimit = propertyFeatureList?.usedLimit;
  const usedProjectFeatureListLimit = projectFeatureList?.usedLimit;

  // Get total limits
  const totalListLimit = propertyListLimit + projectListLimit;
  const totalUsedListLimit = usedPropertyListLimit + usedProjectListLimit;

  const totalFeatureLimit = propertyFeatureListLimit + projectFeatureListLimit;
  const totalUsedFeatureLimit =
    usedPropertyFeatureListLimit + usedProjectFeatureListLimit;

  return (
    <div className="user_subscription_card card">
      {/* Header */}
      <div className="card-header">
        <p className="package-name">{ele?.name}</p>
        <div className="packagePriceAndTime">
          <span className="packagePrice">
            {ele?.price ? `${CurrencySymbol}${ele?.price}` : translate("free")}
          </span>
          <span className="dvr">/</span>
          <span className="packageTime">{formatDuration(ele?.duration)}</span>
        </div>
          <div className="activeTag">{translate("active")}</div>
      </div>

      {/* Body */}
      <div className="card-body">
        <div className="row">
          {/* Listing */}
          <div className="col-md-12 col-lg-6 section">
            <div className="listing box">
              <p className="section-title">{translate("listing")}</p>
              <div className="section-details">
                {propertyList?.included || projectList?.included ? (
                  <>
                    <div className="chart">
                      {/* <DualColorCircularProgressBar
                        packageId={ele?.id}
                        propertyUsed={usedPropertyListLimit}
                        projectUsed={usedProjectListLimit}
                        propertyLimit={propertyListLimit}
                        projectLimit={projectListLimit}
                        isPropertyUnlimited={propertyList?.type === "unlimited"}
                        isProjectUnlimited={projectList?.type === "unlimited"}
                        isPropertyIncluded={propertyList?.included}
                        isProjectIncluded={projectList?.included}
                      /> */}
                      <DualColorCircularProgressBar
                        propertyUsed={usedPropertyListLimit}
                        projectUsed={usedProjectListLimit}
                        propertyLimit={propertyListLimit}
                        projectLimit={projectListLimit}
                        isPropertyUnlimited={propertyList?.type === "unlimited"}
                        isProjectUnlimited={projectList?.type === "unlimited"}
                        isPropertyIncluded={propertyList?.included}
                        isProjectIncluded={projectList?.included}
                      />
                    </div>
                    <div className="listing-details">
                      <div className="property">
                        <span className="label">{translate("property")}</span>
                        <span className="value">
                          {propertyList?.included
                            ? propertyList?.type === "unlimited"
                              ? translate("unlimited")
                              : `${usedPropertyListLimit ?? 0} / ${propertyListLimit ?? ""
                              }`
                            : translate("notIncluded")}
                        </span>
                      </div>
                      <div className="project">
                        <span className="label">{translate("project")}</span>
                        <span className="value">
                          {projectList?.included
                            ? projectList?.type === "unlimited"
                              ? translate("unlimited")
                              : `${usedProjectListLimit ?? 0} / ${projectListLimit ?? ""
                              }`
                            : translate("notIncluded")}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="center-message">
                    {translate("listingNotIncluded")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Featured Ad */}
          <div className="col-md-12 col-lg-6 section">
            <div className="featureAds box">
              <p className="section-title">{translate("featureAd")}</p>
              <div className="section-details">
                {propertyFeatureList?.included ||
                  projectFeatureList?.included ? (
                  <>
                    <div className="chart">
                      <DualColorCircularProgressBar
                        propertyUsed={usedPropertyFeatureListLimit}
                        projectUsed={usedProjectFeatureListLimit}
                        propertyLimit={propertyFeatureListLimit}
                        projectLimit={projectFeatureListLimit}
                        isPropertyUnlimited={
                          propertyFeatureList?.type === "unlimited"
                        }
                        isProjectUnlimited={
                          projectFeatureList?.type === "unlimited"
                        }
                        isPropertyIncluded={propertyFeatureList?.included}
                        isProjectIncluded={projectFeatureList?.included}
                      />

                    </div>
                    <div className="listing-details">
                      <div className="property">
                        <span className="label">
                          {translate("propertyFeature")}
                        </span>
                        <span className="value">
                          {propertyFeatureList?.included ? (
                            propertyFeatureList?.type === "unlimited" ? (
                              translate("unlimited")
                            ) : (
                              <>
                                {usedPropertyFeatureListLimit ?? 0}
                                {propertyFeatureListLimit
                                  ? ` / ${propertyFeatureListLimit}`
                                  : ""}
                              </>
                            )
                          ) : (
                            translate("notIncluded")
                          )}
                        </span>
                      </div>
                      <div className="project">
                        <span className="label">
                          {translate("projectFeature")}
                        </span>
                        <span className="value">
                          {projectFeatureList?.included ? (
                            projectFeatureList?.type === "unlimited" ? (
                              translate("unlimited")
                            ) : (
                              <>
                                {usedProjectFeatureListLimit ?? 0}
                                {projectFeatureListLimit
                                  ? ` / ${projectFeatureListLimit}`
                                  : ""}
                              </>
                            )
                          ) : (
                            translate("notIncluded")
                          )}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="center-message">
                    {translate("featureNotIncluded")}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Remaining Time */}
          <div className="remaining-time">
            <span className="label">
              {ele?.duration < 24
                ? translate("remainingHours")
                : translate("remainingDays")}
            </span>
            <span className="value">
              {calculateRemainingTime(ele?.end_date)}
            </span>
          </div>

          {/* Included Benefits */}
          <div className="included-benefits-container">
            <span className="included-benefits-title">
              {translate("includedBenefits")}
            </span>
            <div className="included-benefits">
              {[
                {
                  label: translate("mortgageCalculatorDetailAccess"),
                  feature: mortgageCalculator,
                },
                {
                  label: translate("premiumPropertiesAccess"),
                  feature: premiumProperties,
                },
                {
                  label: translate("projectListAccess"),
                  feature: projectListAccess,
                },
              ].map(({ label, feature }, idx) => (
                <div className="benefit" key={idx}>
                  <span className={feature.included ? "check" : "cross"}>
                    {feature.included ? (
                      <IoCheckmarkCircleOutline size={22} />
                    ) : (
                      <IoCloseCircleOutline size={22} />
                    )}
                  </span>
                  <div className="benefit_content">
                    <span className="label">{label}</span>
                    <strong className="value">
                      {feature.included
                        ? translate("included")
                        : translate("notIncluded")}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="card-footer">
        <div className="started_on">
          <div className="icon_div">
            <CalendarMonthOutlinedIcon className="cal_icon" size={20} />
          </div>
          <div className="dates">
            <span className="dates_title">{translate("startOn")}</span>
            <span className="dates_value">{formatDate(ele?.start_date)}</span>
          </div>
        </div>
        <div className="ends_on">
          <div className="dates">
            <span className="dates_title">{translate("endsOn")}</span>
            <span className="dates_value">{formatDate(ele?.end_date)}</span>
          </div>
          <div className="icon_div">
            <CalendarMonthOutlinedIcon className="cal_icon" size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSubscriptionCard;
