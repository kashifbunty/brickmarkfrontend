"use client";
import {
  checkPackageLimitApi,
  MortgagegetAllProjectsLoanCalApi,
} from "@/store/actions/campaign";
import { settingsData } from "@/store/reducer/settingsSlice";
import { formatNumberWithCommas, translate } from "@/utils/helper";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import SemiDonutChart from "../SemiDonutChart/SemiDonutChart";
import { Modal } from "react-bootstrap";
import CollapsibleTable from "../SemiDonutChart/CollapsibleTable";
import LoginModal from "../LoginModal/LoginModal";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import { checkPackageLimit } from "@/utils/api";
import { PackageTypes } from "@/utils/checkPackages/packageTypes";

const MortgageCalculator = ({ data }) => {
  const systemSettings = useSelector(settingsData);
  const CurrencySymbol = systemSettings?.currency_symbol || "$";
  const isLoggedIn = useSelector((state) => state.User_signup);
  const userCurrentId =
    isLoggedIn && isLoggedIn.data ? isLoggedIn.data.data.id : null;
  const themeColor = systemSettings?.system_color;
  const router = useRouter();

  const minRateInterest = 1;
  const maxRateInterest = 100;
  const maxInterestYears = 30;

  const [interestRate, setInterestRate] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [downPaymentType, setDownPaymentType] = useState("price");
  const [years, setYears] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [totalEmiData, setTotalEmiData] = useState();
  const [totalEmiYearlyData, setTotalEmiYearlyData] = useState([]);

  const handleInputChangeforInterest = (event) => {
    let value = parseFloat(event.target.value.trim()) || 0;
    if (value > maxRateInterest) {
      toast.error(`Interest rate cannot exceed ${maxRateInterest}%`);
      value = maxRateInterest;
    }
    setInterestRate(value);
  };

  const handleInputChangeforDownPayment = (event) => {
    let value = parseFloat(event.target.value.trim()) || 0;

    if (downPaymentType === "price") {
      if (value > data?.price) {
        toast.error(
          `Down payment cannot exceed property price of ${CurrencySymbol}${data.price}`
        );
        value = data.price;
      }
    } else if (downPaymentType === "rate") {
      if (value > 100) {
        toast.error("Down payment rate cannot exceed 100%");
        value = 100;
      }
    }

    setDownPayment(value);
  };

  const calculatedDownPayment =
    downPaymentType === "price"
      ? downPayment
      : (downPayment / 100) * data?.price;

  const handleInputChangeforYear = (event) => {
    let value = parseInt(event.target.value.trim(), 10) || 1;
    if (value > maxInterestYears) {
      toast.error(`Loan term cannot exceed ${maxInterestYears} years`);
      value = maxInterestYears;
    } else if (value < 1) {
      toast.error("Loan term must be at least 1 year");
      value = 1;
    }
    setYears(value);
  };

  const fetchLoanCalculation = (isFeatureAvailable) => {

    MortgagegetAllProjectsLoanCalApi({
      loan_amount: data?.price,
      down_payment: calculatedDownPayment > 0 ? calculatedDownPayment : "",
      interest_rate: interestRate,
      loan_term_years: years,
      show_all_details: isFeatureAvailable ? 1 : "",
      onSuccess: (res) => {
        setTotalEmiData(res.data.main_total);
        setTotalEmiYearlyData(res.data.yearly_totals);
        setShowModal(true);
      },
      onError: (err) => {
        console.error("Calculation Error:", err);
      },
    });
  };

  const handleCalculate = async () => {
    if (
      downPaymentType === "price" &&
      (downPayment < 0 || downPayment >= data?.price)
    ) {
      toast.error(
        `Down payment should be less than ${CurrencySymbol}${data.price}`
      );
      return;
    }

    if (downPaymentType === "rate" && (downPayment < 0 || downPayment > 100)) {
      toast.error("Down payment rate should be between 0% and 100%");
      return;
    }

    if (interestRate < minRateInterest || interestRate > maxRateInterest) {
      toast.error(
        `Interest rate should be between ${minRateInterest}% and ${maxRateInterest}%`
      );
      return;
    }

    if (years < 1 || years > maxInterestYears) {
      toast.error(
        `Loan term should be between 1 and ${maxInterestYears} years`
      );
      return;
    }

    try {
     const res = await checkPackageLimitApi({
        type: PackageTypes.MORTGAGE_CALCULATOR_DETAIL,
      });
      
      const { feature_available } = res?.data;
      fetchLoanCalculation(feature_available);
    } catch (error) {
      console.error("Error in package limit check:", error);
      toast.error("Unexpected error occurred. Please try again.");
    }
  };

  
  const TotalEMIData = [
    { name: "Principal Amount", value: totalEmiData?.principal_amount },
    { name: "Principal Amount", value: totalEmiData?.principal_amount },
    { name: "Interest Payable", value: totalEmiData?.payable_interest },
  ];

  const COLORS = [themeColor, "#282f39"];

  useEffect(() => {}, [totalEmiData, totalEmiYearlyData]);

  return (
    <div>
      <div className="mortgage_form_card card">
        <div className="card_header">
          <span>{translate("MLC")}</span>
        </div>
        <div className="card_body">
          <div className="loan_amount">
            <span className="title">{translate("propAmount")}</span>
            <div className="loan_price">
              {""}
              <span>{formatNumberWithCommas(data?.price)}</span>
            </div>
          </div>
          <div className="downpayment">
            <span className="title">{translate("downpayment")}</span>
            <div className="input_div">
              <span>{downPaymentType === "price" ? CurrencySymbol : "%"}</span>
              <input
                type="number"
                placeholder={`${translate("EnterDownPayment")} ${
                  downPaymentType === "rate"
                    ? translate("rate")
                    : translate("price")
                }`}
                className="sliderInput"
                value={downPayment}
                onChange={handleInputChangeforDownPayment}
                min={0}
                max={downPaymentType === "rate" ? 100 : data?.price}
              />
              <select
                value={downPaymentType}
                onChange={(e) => setDownPaymentType(e.target.value)}
              >
                <option value="price">{CurrencySymbol}</option>
                <option value="rate">%</option>
              </select>
            </div>
          </div>
          <div className="intrest">
            <span className="title">{translate("intrestRate")}</span>
            <div className="input_div">
              <span>%</span>
              <input
                type="number"
                placeholder={translate("enterIntrestRate")}
                className="sliderInput"
                value={interestRate}
                onChange={handleInputChangeforInterest}
                min={minRateInterest}
                max={maxRateInterest}
              />
            </div>
          </div>
          <div className="year">
            <span className="title">{translate("years")}</span>
            <div className="input_div">
              <span>{translate("yrs")}</span>
              <input
                type="number"
                placeholder={translate("enterYears")}
                className="sliderInput"
                value={years}
                onChange={handleInputChangeforYear}
                min={1}
                max={maxInterestYears}
              />
            </div>
          </div>
        </div>
        <div className="card_footer">
          <div className="calculate_button">
            <button onClick={handleCalculate}>{translate("Calculate")}</button>
          </div>
        </div>
      </div>
      {showModal && (
        <EMIModal
          show={showModal}
          TotalEMIData={TotalEMIData}
          data={totalEmiData}
          handleClose={() => setShowModal(false)}
          COLORS={COLORS}
          totalEmiYearlyData={totalEmiYearlyData}
          router={router}
          userCurrentId={userCurrentId}
          showLoginModal={showLoginModal}
          setShowLoginModal={setShowLoginModal}
        />
      )}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
};

export default MortgageCalculator;
const EMIModal = ({
  show,
  handleClose,
  data,
  TotalEMIData,
  COLORS,
  totalEmiYearlyData,
  router,
  userCurrentId,
  setShowLoginModal,
}) => {
  const handleSubscribe = () => {
    if (userCurrentId) {
      router.push("/subscription-plan");
    } else {
      Swal.fire({
        title: translate("plzLogFirsttoAccess"),
        icon: "warning",
        allowOutsideClick: false,
        showCancelButton: false,
        allowOutsideClick: true,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        confirmButtonText: translate("ok"),
      }).then((result) => {
        if (result.isConfirmed) {
          setShowLoginModal(true);
          handleClose();
        }
      });
    }
  };
  return (
    <Modal show={show} onHide={handleClose} centered size="xl">
      <Modal.Header closeButton>
        <Modal.Title>{translate("MLCEMIData")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {data ? (
          <div className="card total_card">
            <div className="card-body">
              <div className="chart-container">
                <SemiDonutChart
                  width={400}
                  height={300}
                  stroke={50}
                  data={TotalEMIData}
                  colors={COLORS}
                  totalEmiData={data}
                />

                <div className="other_details_total">
                  <div className="row details_row">
                    <div className="col-sm-12 col-md-6 col-lg-3">
                      <div className="total_div">
                        <span className="total_title_emi">
                          {translate("MonthlyEMI")}
                        </span>
                        <span className="total_value">
                          {formatNumberWithCommas(data?.monthly_emi)}
                        </span>
                      </div>
                    </div>
                    {data?.down_payment && (
                      <div className="col-sm-12 col-md-6 col-lg-3">
                        <div className="total_div">
                          <span className="total_downpayment_emi">
                            {translate("downpayment")}
                          </span>
                          <span className="total_value">
                            {formatNumberWithCommas(data?.down_payment)}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="col-sm-12 col-md-6 col-lg-3">
                      <div className="total_div">
                        <span className="total_title_principal">
                          {translate("PrincipalAmount")}
                        </span>
                        <span className="total_value">
                          {formatNumberWithCommas(data?.principal_amount)}
                        </span>
                      </div>
                    </div>
                    <div className="col-sm-12 col-md-6 col-lg-3">
                      <div className="total_div">
                        <span className="total_title_interest">
                          {translate("InterestPayable")}
                        </span>
                        <span className="total_value">
                          {formatNumberWithCommas(data?.payable_interest)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>{translate("NoDataAvailable")}</p>
        )}
      </Modal.Body>
      <Modal.Footer className="mlc_modal_footer">
        {totalEmiYearlyData && totalEmiYearlyData.length > 0 ? (
          <>
            <CollapsibleTable data={totalEmiYearlyData} />
          </>
        ) : (
          <div className="access_tabel">
            <div className="headlines">
              <span className="title">{translate("accessTable")}</span>
              <span className="text">{translate("viewTable")}</span>
            </div>
            <button onClick={handleSubscribe}>
              {translate("subScribeNow")}
            </button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};
