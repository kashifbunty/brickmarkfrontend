import React, { useState, useEffect } from 'react';
import { Offcanvas } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';
import { RiArrowRightSLine, RiUserSmileLine } from 'react-icons/ri';
import { FiPlusCircle } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { handlePackageCheck, truncate } from '@/utils/helper';
import { PackageTypes } from '@/utils/checkPackages/packageTypes';
import { FiMapPin } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import LocationModal from '../LocationSelector/LocationPopup';
import { BiMapPin } from 'react-icons/bi';
import { selectCurrentLocation } from '@/store/reducer/locationSlice';

const MobileOffcanvas = ({
  show,
  handleClose,
  settingData,
  signupData,
  translate,
  handleOpenModal,
  handleShowDashboard,
  handleLogout,
  handleLanguageChange,
  LanguageList,
  defaultlang,
  handleOpenAcModal,
  selectedLanguage,
  language,
  formattedLocationText,
  handleSelectLocation,
  handleCloseLocationPopup
}) => {
  const router = useRouter();
  const [expandedItem, setExpandedItem] = useState(null);
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  // Get current location from Redux
  const currentLocationFromRedux = useSelector(selectCurrentLocation);

  // Toggle expand/collapse with animation
  const toggleExpand = (item) => {
    if (expandedItem === item) {
      // First set a class for animation
      const submenu = document.querySelector(`.mobile-submenu[data-name="${item}"]`);
      if (submenu) {
        submenu.classList.add('collapsing');
        // After animation completes, reset the state
        setTimeout(() => {
          setExpandedItem(null);
        }, 300); // Match transition duration
      }
    } else {
      setExpandedItem(item);
    }
  };

  const MenuItem = ({ title, onClick, hasSubmenu = false, name }) => (
    <div
      className={`mobile-menu-item ${expandedItem === name ? 'isSelected' : ''}`}
      onClick={onClick}
    >
      <span>{title}</span>
      {hasSubmenu && (
        <RiArrowRightSLine
          className={`mobile-arrow ${expandedItem === name ? 'rotated' : ''}`}
        />
      )}
    </div>
  );

  const handlePropertyRoute = (routerPath) => {
    if (routerPath) {
      handleClose();
      router.push(routerPath);
    }
  };

  const handlePageRoute = (routerPath) => {
    if (routerPath) {
      handleClose();
      router.push(routerPath);
    } else {
      handleOpenAcModal();
    }
  };

  const PropertyPages = [
    { name: translate('allProperties'), route: '/properties/all-properties' },
    { name: translate('featuredProp'), route: '/featured-properties' },
    { name: translate('mostViewedProp'), route: '/most-viewed-properties' },
    { name: translate('nearbyCities'), route: '/properties-nearby-city' },
    { name: translate('mostFavProp'), route: '/most-favorite-properties' },
  ];

  const Pages = [
    { name: translate('subscriptionPlan'), route: '/subscription-plan' },
    { name: translate('articles'), route: '/articles' },
    { name: translate('faqs'), route: '/faqs' },
    { name: translate('areaConverter'), route: '' },
    { name: translate('terms&condition'), route: '/terms-and-condition' },
    { name: translate('privacyPolicy'), route: '/privacy-policy' },
  ];

  const handleToggleLocationPopup = () => {
    setShowLocationPopup(!showLocationPopup);
    
    // Toggle body scroll locking
    if (!showLocationPopup) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    handleClose();
  };

  // Handle mobile location popup close
  const handleMobileLocationClose = () => {
    setShowLocationPopup(false);
    document.body.classList.remove('no-scroll');
  };

  // Handle location selection in mobile view
  const handleMobileLocationSelect = (location) => {
    handleSelectLocation(location);
    setShowLocationPopup(false);
    document.body.classList.remove('no-scroll');
  };

  return (
    <>
      <Offcanvas show={show} onHide={handleClose} placement={language.rtl === 1 ? 'start' : 'end'} className="mobile-offcanvas">
        <Offcanvas.Header closeButton className="mobile-offcanvas-header">
          <Offcanvas.Title>
            {settingData?.web_footer_logo && (
              <Link href="/">
                <Image
                  src={settingData.web_logo}
                  alt="logo"
                  width={150}
                  height={40}
                  className="mobile-logo"
                />
              </Link>
            )}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="mobile-offcanvas-body">
          <div className="mobile-menu">
            {/* Location Selector */}
            <MenuItem
              title={<span className="location-item-title">
                <FiMapPin size={20} />
                <div className="location-display">
                  <div className="location-label">{translate('location')}</div>
                  <div className="location-value">
                    {formattedLocationText ? formattedLocationText : translate('selectLocation')}
                  </div>
                </div>
              </span>}
              onClick={handleToggleLocationPopup}
              hasSubmenu
              name="selectLocation"
            />

            <MenuItem
              title={translate('home')}
              onClick={() => {
                router?.push('/'),
                  handleClose()
              }}
            />

            {/* Properties Section */}
            <MenuItem
              title={translate('properties')}
              onClick={() => toggleExpand('properties')}
              hasSubmenu
              name="properties"
            />
            <div
              className={`mobile-submenu ${expandedItem === 'properties' ? 'expanded' : ''}`}
              data-name="properties"
            >
              {PropertyPages.map((property, index) => (
                <div
                  key={index}
                  className="mobile-submenu-item"
                  onClick={() => handlePropertyRoute(property?.route)}
                >
                  <span>{property.name}</span>
                  <RiArrowRightSLine className="mobile-arrow" />
                </div>
              ))}
            </div>

            {/* Pages Section */}
            <MenuItem
              title={translate('pages')}
              onClick={() => toggleExpand('pages')}
              hasSubmenu
              name="pages"
            />
            <div
              className={`mobile-submenu ${expandedItem === 'pages' ? 'expanded' : ''}`}
              data-name="pages"
            >
              {Pages.map((page, index) => (
                <div
                  key={index}
                  className="mobile-submenu-item"
                  onClick={() => handlePageRoute(page?.route)}
                >
                  <span>{page.name}</span>
                  <RiArrowRightSLine className="mobile-arrow" />
                </div>
              ))}
            </div>

            {/* Contact and About */}
            <MenuItem
              title={translate('contactUs')}
              onClick={() => {
                router?.push('/contact-us'),
                  handleClose(); // Navigate to contact us
              }}
            />
            <MenuItem
              title={translate('aboutUs')}
              onClick={() => {
                router?.push('/about-us'),
                  handleClose(); // Navigate to about us
              }}
            />

            {/* Language Section */}
            <MenuItem
              title={selectedLanguage || defaultlang}
              onClick={() => toggleExpand('language')}
              hasSubmenu
              name="language"
            />
            <div
              className={`mobile-submenu ${expandedItem === 'language' ? 'expanded' : ''}`}
              data-name="language"
            >
              {LanguageList &&
                LanguageList.map((ele, index) => (
                  <div
                    key={index}
                    onClick={() => handleLanguageChange(ele.code)}
                    className="mobile-submenu-item"
                  >
                    <span>{ele.name}</span>
                    <RiArrowRightSLine className="mobile-arrow" />
                  </div>
                ))}
            </div>

            {/* User Section */}
            {signupData?.data?.data?.name || signupData?.data?.data?.email || signupData?.data?.data?.mobile ? (
              <>
                <MenuItem
                  title={signupData.data.data.name ? truncate(signupData.data.data.name, 15) : translate("welcmGuest")}
                  onClick={() => toggleExpand('user')}
                  hasSubmenu
                  name="user"
                />
                <div
                  className={`mobile-submenu ${expandedItem === 'user' ? 'expanded' : ''}`}
                  data-name="user"
                >
                  <div className="mobile-submenu-item" onClick={handleShowDashboard}>
                    <span>{translate('dashboard')}</span>
                    <RiArrowRightSLine className="mobile-arrow" />
                  </div>
                  <div className="mobile-submenu-item" onClick={handleLogout}>
                    <span>{translate('logout')}</span>
                    <RiArrowRightSLine className="mobile-arrow" />
                  </div>
                </div>
              </>
            ) : (
              <MenuItem
                title={translate('login&Register')}
                onClick={handleOpenModal}
              />
            )}
          </div>

          {/* Add Property Button */}
          {signupData?.data?.data?.name && settingData && (
            <button className="mobile-add-property" onClick={(e) => handlePackageCheck(e, PackageTypes.PROPERTY_LIST, router)}>
              <FiPlusCircle size={20} className="mobile-icon" />
              {translate('addProp')}
            </button>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Location Modal for Mobile */}
      <LocationModal
        show={showLocationPopup}
        onHide={handleMobileLocationClose}
        onSave={handleMobileLocationSelect}
      />
    </>
  );
};

export default MobileOffcanvas;
