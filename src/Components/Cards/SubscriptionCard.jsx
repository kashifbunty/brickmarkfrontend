import { formatDuration, translate } from "@/utils/helper";
import { Tooltip } from "antd";
import Link from "next/link";
import React, { useState } from "react";
import { BiSolidCheckCircle, BiSolidXCircle } from "react-icons/bi";
import { FaUpload } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";
import UploadReceiptModal from "../User/UploadReceiptModal";
// import "./SubscriptionCard.css";

const SubscriptionCard = ({
  elem,
  subscribePayment,
  systemsettings,
  allFeatures,
}) => {
  const isActive = elem.is_active === 1;
  const isReview = elem.package_status === "review";
  const isRejected = elem.package_status === "rejected";
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  // Determine the correct class name based on conditions
  let packageClass = "other-package";
  if (isActive) {
    packageClass = "active-package";
  } else if (isReview) {
    packageClass = "review-package";
  }

  const handleUploadReceipt = (id) => {
    setIsUploadModalOpen(true);
  }



  return (
    <div className={`userPackages card ${packageClass}`}>

      <div className="package-name">
        {elem?.name}
      </div>

      <div className="package-price">
        {elem.package_type === "paid"
          ? systemsettings?.currency_symbol + elem.price
          : translate("free")}
      </div>

      <div className="package-features">
        <div className="feature-item">
          <BiSolidCheckCircle className="feature-icon" />
          <span className="feature-text">
            {translate("validity")} {formatDuration(elem.duration)}
          </span>
        </div>

        {allFeatures.map((feature, index) => {
          const assignedFeature = elem.features.find(
            (f) => f.id === feature.id
          );

          return (
            <div className="feature-item" key={index}>
              {assignedFeature ? (
                <BiSolidCheckCircle className="feature-icon" />
              ) : (
                <BiSolidXCircle className="feature-icon not-assigned" />
              )}
              <span className="feature-text">
                {feature?.name}: {" "}
                {assignedFeature
                  ? assignedFeature.limit_type === "limited"
                    ? assignedFeature.limit
                    : translate("unlimited")
                  : translate("notIncluded")}
              </span>
            </div>
          );
        })}
      </div>

      {isActive ? (
        <div className="card-spacer"></div>
      ) : isReview ? (
        <div className="admin-verification-container">
          <div className="admin-verification">
            <div className="verification-content">
              <Tooltip title={translate("pendingVerificationDescription")}>

                <FiInfo size={18} className="info-icon" />
              </Tooltip>
              <span>{translate("pendingVerification")}</span>
            </div>
            <Link href="/user/transaction-history">
              <button
                type="button"
                className="view-btn"
              >
                {translate("view")} →
              </button>
            </Link>
          </div>
        </div>
      ) : isRejected ? (
        <div className="admin-verification-container">
          <div className="admin-verification">
            <div className="verification-content">
              <Tooltip title={translate("rejectedVerificationDescription")}>
                <FiInfo size={18} className="info-icon text-danger" />
              </Tooltip>
              <span className="text-danger">{translate("verificationRejected")}</span>
            </div>
            <Tooltip title={translate("reuploadReceipt")}>
              <button
                type="button"
                className="view-btn"
                onClick={() => handleUploadReceipt(elem.id)}
            >
                <FaUpload size={18} />
              </button>
            </Tooltip>
          </div>
        </div>
      ) : (
        <div className="subscribe-container">
          <button
            type="submit"
            className="subscribe-btn"
            onClick={(e) => subscribePayment(e, elem)}
          >
            {translate("subscribe")}
          </button>
        </div>
      )}
      <UploadReceiptModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        transactionId={elem?.payment_transaction_id}
      />
    </div>
  );
};

export default SubscriptionCard;
