"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import { useSelector } from "react-redux";
import Loader from "../Loader/Loader";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import under_maintain from "../../../public/under_maintain.svg";
import { placeholderImage, translate } from "@/utils/helper";
import Image from "next/image";
import SomthingWentWrong from "../SomthingWentWrong/SomthingWentWrong";
import { loadSystemSettings } from "@/store/reducer/settingsSlice";
import { loadCategories } from "@/store/reducer/momentSlice";
import CookieComponent from "../Cookie/Cookie";

const Layout = ({ children }) => {
  const isLoggedIn = useSelector((state) => state.User_signup);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState(false);
  const [settingsData, setSettingsData] = useState([]);

  
  useEffect(() => {
    loadSystemSettings({
      onSuccess: (res) => {
        setSettingsData(res?.data);
        setIsLoading(false);
        document.documentElement.style.setProperty(
          "--primary-color",
          res?.data?.system_color
        );
        document.documentElement.style.setProperty(
          "--primary-category-background",
          res?.data?.category_background
        );
        document.documentElement.style.setProperty(
          "--primary-sell",
          res?.data?.sell_web_color
        );
        document.documentElement.style.setProperty(
          "--primary-rent",
          res?.data?.rent_web_color
        );
        document.documentElement.style.setProperty(
          "--primary-sell-bg",
          res?.data?.sell_web_background_color
        );
        document.documentElement.style.setProperty(
          "--primary-rent-bg",
          res?.data?.rent_web_background_color
        );
      },
      onError: (err) => {
        console.log(err);
        setIsLoading(false);
        setSettingsError(true);
      },
    });
  }, [isLoggedIn]);

  useEffect(() => {}, [settingsData]);

  const underMaintance = settingsData?.web_maintenance_mode === "1";

  const allowCookies = settingsData?.allow_cookies;

  useEffect(() => {
    loadCategories();
  }, []);


  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {settingsError ? ( // Check for error while fetching settings
            <div className="somthing_wentWrong">
              <SomthingWentWrong />
            </div>
          ) : (
            <Suspense fallback={<Loader />}>
              {underMaintance ? (
                <div className="under_maintance">
                  <div className="col-12 text-center">
                    <div>
                      <Image
                        loading="lazy"
                        src={under_maintain.src}
                        alt="underMaintance"
                        width={600}
                        height={600}
                        onError={placeholderImage}
                      />
                    </div>
                    <div className="no_page_found_text">
                      <h3>{translate("underMaintance")}</h3>
                      <span>{translate("pleaseTryagain")}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Header />
                  {children}
                  <Footer />
                  {allowCookies && <CookieComponent />}
                </>
              )}
            </Suspense>
          )}
        </>
      )}
    </div>
  );
};

export default Layout;
