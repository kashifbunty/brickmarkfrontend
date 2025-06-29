"use client";
import React, { useState, useEffect, useRef } from "react";
import ebroker from "@/assets/Logo_Color.png";
import { RiUserSmileLine } from "react-icons/ri";
import { Dropdown } from "react-bootstrap";
import Link from "next/link";
import { FiPhone, FiPlusCircle } from "react-icons/fi";
import LoginModal from "../LoginModal/LoginModal";
import AreaConverter from "../AreaConverter/AreaConverter";
import { GiHamburgerMenu } from "react-icons/gi";
import { useSelector, useDispatch } from "react-redux";
import { logoutSuccess, userSignUpData } from "@/store/reducer/authSlice";
import { selectCurrentLocation, setLocation } from "@/store/reducer/locationSlice";

import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-hot-toast";
import { Fcmtoken, settingsData } from "@/store/reducer/settingsSlice";
import { languageLoaded, setLanguage } from "@/store/reducer/languageSlice";
import {
  handlePackageCheck,
  placeholderImage,
  translate,
  truncate,
} from "@/utils/helper";
import { store } from "@/store/store";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import Image from "next/image";
import FirebaseData from "@/utils/Firebase";
import { beforeLogoutApi, GetLimitsApi } from "@/store/actions/campaign";
import MobileOffcanvas from "./MobileOffcanvas";
import { PackageTypes } from "@/utils/checkPackages/packageTypes";
import { HiOutlineMail } from "react-icons/hi";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
// import LocationPopup from "../LocationSelector/LocationPopup";
import { BiMapPin } from "react-icons/bi";
import LocationModal from "../LocationSelector/LocationPopup";


const Nav = () => {
  const router = useRouter();
  const language = store.getState().Language.languages;
  const dispatch = useDispatch();

  const { signOut } = FirebaseData();
  const signupData = useSelector(userSignUpData);
  const settingData = store.getState().Settings?.data;
  const FcmToken = useSelector(Fcmtoken);
  
  // Use useSelector to directly access the current location from Redux
  const currentLocationFromRedux = useSelector(selectCurrentLocation);
  
  const LanguageList = settingData && settingData.languages;
  const systemDefaultLanguageCode = settingData?.default_language;
  const [showModal, setShowModal] = useState(false);
  const [areaconverterModal, setAreaConverterModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState();
  const [defaultlang, setDefaultlang] = useState(language.name);
  const [show, setShow] = useState(false);
  const [headerTop, setHeaderTop] = useState(0);
  const [scroll, setScroll] = useState(0);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");
  const [formattedLocationText, setFormattedLocationText] = useState('');

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    if (language && language.rtl === 1) {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  }, [language]);


  useEffect(() => {
    const header = document.querySelector(".header");
    setHeaderTop(header.offsetTop);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!language || Object.keys(language).length === 0) {
      languageLoaded(
        systemDefaultLanguageCode,
        "1",
        (response) => {
          const currentLang = response && response.data.name;

          // Dispatch the setLanguage action to update the selected language in Redux
          store.dispatch(setLanguage(currentLang));
          setSelectedLanguage(currentLang);
          setDefaultlang(currentLang);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }, [language]);
  const handleLanguageChange = (languageCode) => {
    languageLoaded(
      languageCode,
      "1",
      (response) => {
        const currentLang = response && response.data.name;
        setSelectedLanguage(currentLang);

        // Dispatch the setLanguage action to update the selected language in Redux
        store.dispatch(setLanguage(currentLang));
      },
      (error) => {
        toast.error(error);
        console.log(error);
      }
    );
  };
  useEffect(() => { }, [selectedLanguage, language, defaultlang]);

  const handleScroll = () => {
    setScroll(window.scrollY);
  };

  const handleOpenModal = () => {
    setShow(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleOpenAcModal = () => {
    setShow(false);
    setAreaConverterModal(true);
  };
  const handleCloseAcModal = () => {
    setAreaConverterModal(false);
  };

  const handleShowDashboard = () => {
    router.push("/user/dashboard"); // Use an absolute path here
  };

  const handleLogout = () => {
    handleClose();
    Swal.fire({
      title: translate("areYouSure"),
      text: translate("youNotAbelToRevertThis"),
      icon: "warning",
      showCancelButton: true,
      customClass: {
        confirmButton: "Swal-confirm-buttons",
        cancelButton: "Swal-cancel-buttons",
      },
      confirmButtonText: translate("yesLogout"),
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          beforeLogoutApi({
            fcm_id: FcmToken,
            onSuccess: (res) => {
              // Perform the logout action
              logoutSuccess();
              signOut();

              toast.success(translate("logoutSuccess"));
            },
            onError: (err) => {
              console.log(err);
            },
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        toast.error(translate("logoutcancel"));
      }
    });
  };

  const CheckActiveUserAccount = () => {
    if (settingData?.is_active === false) {
      Swal.fire({
        title: translate("opps"),
        text: "Your account has been deactivated by the admin. Please contact them.",
        icon: "warning",
        allowOutsideClick: false,
        showCancelButton: false,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        confirmButtonText: translate("logout"),
      }).then((result) => {
        if (result.isConfirmed) {
          logoutSuccess();
          signOut();
          router.push("/contact-us");
        }
      });
    }
  };
  useEffect(() => {
    CheckActiveUserAccount();
  }, [settingData?.is_active]);

  const handleToggleLocationPopup = () => {
    setShowLocationPopup(!showLocationPopup);
    // Toggle body scroll locking
    if (!showLocationPopup) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  };

  const handleCloseLocationPopup = () => {
    setShowLocationPopup(false);
    document.body.classList.remove('no-scroll');
  };

  useEffect(() => {
    if (currentLocationFromRedux) {
      setCurrentLocation(currentLocationFromRedux.formatted_address || '');
    } else {
      setCurrentLocation('');
    }
  }, [currentLocationFromRedux]);

  const handleSelectLocation = (location) => {
    // No need to set local state as it will be updated by the useEffect above
    dispatch(setLocation(location));
  };

  // Format the location display to show city, state, country
  useEffect(() => {
    if (currentLocationFromRedux) {
      let locationParts = [];

      // Add city if available
      if (currentLocationFromRedux.city) {
        locationParts.push(currentLocationFromRedux.city);
      }

      // Add state if available
      if (currentLocationFromRedux.state) {
        locationParts.push(currentLocationFromRedux.state);
      }

      // Add country if available
      if (currentLocationFromRedux.country) {
        locationParts.push(currentLocationFromRedux.country);
      }

      // If we have location parts, join them with commas
      if (locationParts.length > 0) {
        setFormattedLocationText(locationParts.join(', '));
      } else if (currentLocationFromRedux.formatted_address) {
        // Fallback to formatted address if no parts available
        setFormattedLocationText(currentLocationFromRedux.formatted_address);
      } else {
        setFormattedLocationText('');
      }
    } else {
      setFormattedLocationText('');
    }
  }, [currentLocationFromRedux]); // Only depend on currentLocation from Redux

  return (
    <div>
      <div className={`${scroll > headerTop ? "is-sticky" : ""}`}>
        <div className="new-header-dark-top-bar">
          <div className="container">
            <div className="new-header-top-bar-content">
              <div className="new-header-contact-info">

                {settingData?.company_email &&
                  <>
                    <a href={`mailto:${settingData?.company_email}`} className="new-header-contact-item" target="_blank">
                      <HiOutlineMail className="new-header-icon" />
                      <span>{settingData?.company_email}</span>
                    </a>
                    <div className="vertical-divider"></div>
                  </>
                }
                {settingData?.company_tel1 &&
                  <>
                    <a href={`tel:${settingData?.company_tel1}`} className="new-header-contact-item">
                      <FiPhone className="new-header-icon" />
                      <span>{settingData?.company_tel1}</span>
                    </a>
                    <div className="vertical-divider"></div>
                  </>
                }
                {settingData?.company_tel2 &&
                  <>
                    <a href={`tel:${settingData?.company_tel2}`} className="new-header-contact-item">
                      <FiPhone className="new-header-icon" />
                      <span>{settingData?.company_tel2}</span>
                    </a>
                  </>
                }
              </div>
              <div className="new-header-top-right">
                <div className="new-header-language-selector">
                  <Dropdown>
                    <Dropdown.Toggle id="dropdown-basic01" style={{ padding: "0px" }}>
                      {" "}
                      {selectedLanguage ? selectedLanguage : defaultlang}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {LanguageList &&
                        LanguageList.map((ele, index) => (
                          <Dropdown.Item
                            key={index}
                            onClick={() => handleLanguageChange(ele.code)}
                          >
                            <span className="perent_link">
                              <span className="links">{ele.name}</span>
                            </span>
                          </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                {(settingData?.facebook_id || settingData?.instagram_id || settingData?.twitter_id || settingData?.youtube_id) &&
                  <>
                    <div className="vertical-divider"></div>
                    <div className="new-header-social-icons">
                      <span className="new-header-follow-text">{translate("followUs")} :</span>
                      {settingData?.facebook_id &&
                        <a href={settingData?.facebook_id || "#"} className="new-header-social-icon" target="_blank" rel="noreferrer">
                          <FaFacebookF />
                        </a>
                      }
                      {settingData?.instagram_id &&
                        <a href={settingData?.instagram_id || "#"} className="new-header-social-icon" target="_blank" rel="noreferrer">
                          <FaInstagram />
                        </a>
                      }
                      {settingData?.twitter_id &&
                        <a href={settingData?.twitter_id || "#"} className="new-header-social-icon" target="_blank" rel="noreferrer">
                          <FaX />
                        </a>
                      }
                      {settingData?.youtube_id &&
                        <a href={settingData?.youtube_id || "#"} className="new-header-social-icon" target="_blank" rel="noreferrer">
                          <FaYoutube />
                        </a>
                      }
                    </div>
                  </>
                }
              </div>
            </div>
          </div>
        </div>
        <header>
          <nav className={`navbar header navbar-expand-lg`}>
            <div className="container">
              {/* Left Section - Logo and Location */}
              <div className="header-left-section">
                <Link className="navbar-brand" href="/">
                  <Image
                    loading="lazy"
                    src={settingData?.web_logo ? settingData?.web_logo : ebroker}
                    alt="no_img"
                    className="logo"
                    width={0}
                    height={76}
                    style={{ width: "auto", maxHeight: "75px" }}
                    onError={placeholderImage}
                  />
                </Link>
                <div className="location-selector-wrapper">

                  {/* Location Selector */}
                  <div className="location-selector">
                    <button
                      className="location-selector-button"
                      onClick={handleToggleLocationPopup}
                    >
                      <span className="location-icon">
                        <BiMapPin size={20} />
                      </span>
                      <span className="location-text" title={formattedLocationText}>
                        <span>
                          {translate("location")}
                        </span>
                        <span>
                          {formattedLocationText ? formattedLocationText : translate("enterLocation")}
                        </span>
                      </span>
                    </button>
                    <LocationModal
                      show={showLocationPopup}
                      onHide={handleCloseLocationPopup}
                      onSave={handleSelectLocation}
                    />
                  </div>

                  <span onClick={handleShow} id="hamburg" className="mobile-menu-button">
                    <GiHamburgerMenu size={30} />
                  </span>
                </div>

              </div>

              {/* Right Section - Navigation, Login/Register, Add Property */}
              <div className="header-right-section">
                <div className="nav-elements">
                  <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                      <Link
                        className="nav-link active"
                        aria-current="page"
                        href="/"
                      >
                        {translate("home")}
                      </Link>
                    </li>
                    <li className="nav-item dropdown">
                      <Dropdown>
                        <Dropdown.Toggle id="dropdown-basic">
                          {translate("properties")}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item>
                            <Link href="/properties/all-properties/">
                              <span className="links">
                                {translate("allProperties")}
                              </span>
                            </Link>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Link href="/featured-properties">
                              <span className="links">
                                {translate("featuredProp")}
                              </span>
                            </Link>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            {" "}
                            <Link href="/most-viewed-properties">
                              <span className="links">
                                {translate("mostViewedProp")}
                              </span>
                            </Link>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            {" "}
                            <Link href="/properties-nearby-city">
                              <span className="links">
                                {translate("nearbyCities")}
                              </span>
                            </Link>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Link href="/most-favorite-properties">
                              <span className="links">
                                {translate("mostFavProp")}
                              </span>
                            </Link>
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </li>
                    <li className="nav-item dropdown">
                      <Dropdown>
                        <Dropdown.Toggle id="dropdown-basic">
                          {translate("pages")}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item>
                            <Link href="/subscription-plan">
                              <span className="links">
                                {translate("subscriptionPlan")}
                              </span>
                            </Link>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            {" "}
                            <Link href="/articles">
                              <span className="links">{translate("articles")}</span>
                            </Link>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            {" "}
                            <Link href="/faqs">
                              <span className="links">{translate("faqs")}</span>
                            </Link>
                          </Dropdown.Item>
                          <Dropdown.Item onClick={handleOpenAcModal}>
                            <span className="perent_link">
                              <span className="links">
                                {translate("areaConverter")}
                              </span>
                            </span>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Link href="/terms-and-condition">
                              <span className="links">
                                {translate("terms&condition")}
                              </span>
                            </Link>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            {" "}
                            <Link href="/privacy-policy">
                              <span className="links">
                                {translate("privacyPolicy")}
                              </span>
                            </Link>
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </li>
                    <li className="nav-item">
                      <Link href="/about-us" id="a-tags-link">
                        <span className="nav-link">
                          {translate("aboutUs")}
                        </span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/contact-us" id="a-tags-link">
                        <span className="nav-link">
                          {translate("contactUs")}
                        </span>
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="auth-section">
                  <ul className="navbar-nav ml-auto">
                    <li className="nav-item">
                      {
                        // Check if signupData.data is null
                        signupData?.data === null ? (
                          <a
                            className="nav-link user-nav-link"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleOpenModal();
                            }}
                          >
                            <RiUserSmileLine size={20} className="icon" />
                            <span className="auth-text">{translate("login&Register")}</span>
                          </a>
                        ) : signupData?.data?.data.name || signupData?.data?.data.email || signupData?.data?.data.mobile ? (
                          <Dropdown>
                            <Dropdown.Toggle id="dropdown-basic" className="user-dropdown">
                              <RiUserSmileLine size={20} className="icon01" />
                              <span className="auth-text">
                                {signupData.data.data.name ? truncate(signupData.data.data.name, 15) : translate("welcmGuest")}
                              </span>
                            </Dropdown.Toggle>

                            <Dropdown.Menu id="language">
                              <Dropdown.Item onClick={handleShowDashboard}>
                                <span className="perent_link">
                                  <span className="links">
                                    {translate("dashboard")}
                                  </span>
                                </span>
                              </Dropdown.Item>
                              <Dropdown.Item onClick={handleLogout}>
                                <span className="perent_link">
                                  <span className="links">
                                    {translate("logout")}
                                  </span>
                                </span>
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        ) : null
                      }
                    </li>
                    {signupData?.data?.data.name && settingData && (
                      <li className="nav-item">
                        <button
                          className="btn add-property-btn"
                          id="addbutton"
                          onClick={(e) => handlePackageCheck(e, PackageTypes.PROPERTY_LIST, router)}
                        >
                          <FiPlusCircle
                            size={20}
                            className="add-nav-button"
                          />
                          <span className="add-text">{translate("addProp")}</span>
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </nav>
        </header>
      </div>

      <div>
        <MobileOffcanvas
          show={show}
          handleClose={handleClose}
          settingData={settingData}
          signupData={signupData}
          translate={translate}
          handleOpenModal={handleOpenModal}
          handleShowDashboard={handleShowDashboard}
          handleLogout={handleLogout}
          handleLanguageChange={handleLanguageChange}
          LanguageList={LanguageList}
          defaultlang={defaultlang}
          handleOpenAcModal={handleOpenAcModal}
          selectedLanguage={selectedLanguage}
          language={language}
          formattedLocationText={formattedLocationText}
          handleSelectLocation={handleSelectLocation}
          handleCloseLocationPopup={handleCloseLocationPopup}
          currentLocationFromRedux={currentLocationFromRedux}
        />
      </div>
      {showModal && (
        <LoginModal isOpen={showModal} onClose={handleCloseModal} />
      )}

      <AreaConverter isOpen={areaconverterModal} onClose={handleCloseAcModal} />


    </div>
  );
};

export default Nav;
