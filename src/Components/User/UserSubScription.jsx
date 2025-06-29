"use client";
import React, { useEffect, useState } from "react";
import ProgressBar from "../ProgressBar/ProgressBar.jsx";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/reducer/settingsSlice";
import { getPackagesApi } from "@/store/actions/campaign";
import { Progress } from "antd";
import { formatPriceAbbreviated, translate } from "@/utils/helper.js";
import { languageData } from "@/store/reducer/languageSlice.js";
import dynamic from "next/dynamic.js";
import { useRouter } from "next/router.js";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import withAuth from "../Layout/withAuth.jsx";
import UserSubscriptionCard from "../Cards/UserSubscriptionCard.jsx";
import NoData from "../NoDataFound/NoData.jsx";
const VerticleLayout = dynamic(
  () => import("../AdminLayout/VerticleLayout.jsx"),
  { ssr: false }
);
const UserSubScription = () => {
  const [packagedata, setPackageData] = useState([]);
  const [allFeatures, setAllFeatures] = useState([]);
  const packageDetails = useSelector(settingsData);

  const router = useRouter();
  const CurrencySymbol = packageDetails && packageDetails?.currency_symbol;

  const lang = useSelector(languageData);

  useEffect(() => {}, [lang, packagedata, allFeatures]);

  const fetchActivePackages = () => {
    try {
      getPackagesApi(
        (res) => {
          const filteredData = res?.active_packages;
          setPackageData(filteredData);
          setAllFeatures(res?.all_features);
        },
        (err) => {
          console.log(err);
        }
      );
    } catch (error) {
      console.log("Error in fetchActivePackages", error);
    }
  };

  useEffect(() => {
    fetchActivePackages();
}, []);

  const formatDate = (inputDate) => {
    if (inputDate === null) {
      return "Lifetime";
    }

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const date = new Date(inputDate);
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayOfWeek}, ${day} ${month}, ${year}`;
  }

  return (
    <VerticleLayout>
      <div className="container">
        <div className="dashboard_titles">
          <h3>{translate("mySub")}</h3>
        </div>
        <div className="row user_packages">
          {packagedata && packagedata?.length > 0 ? (
            packagedata.map((ele, index) => (
              <div className="col-sm-12" id="subscription_card_col" key={index}>
                <UserSubscriptionCard CurrencySymbol={CurrencySymbol} ele={ele} formatDate={formatDate} allFeatures={allFeatures}/>
               
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <NoData />
            </div>
          )}
        </div>
      </div>
    </VerticleLayout>
  );
};

export default UserSubScription;
