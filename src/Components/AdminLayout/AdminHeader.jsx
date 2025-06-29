"use client";
import { Box, IconButton, Menu, MenuItem, Toolbar } from "@mui/material";
import React, { useEffect, useState } from "react";
import GTranslateIcon from "@mui/icons-material/GTranslate";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import MoreIcon from "@mui/icons-material/MoreVert";
import { store } from "@/store/store";
import { settingsData } from "@/store/reducer/settingsSlice";
import { useSelector } from "react-redux";
import { Dropdown } from "react-bootstrap";
import { FiPlusCircle } from "react-icons/fi";
import { languageLoaded, setLanguage } from "@/store/reducer/languageSlice";
import { handlePackageCheck, translate } from "@/utils/helper";
import { useRouter } from "next/router";
import { PackageTypes } from "@/utils/checkPackages/packageTypes";

const AdminHeader = () => {
  const router = useRouter();
  const AddPropertyPath = router.pathname === "/user/properties";
  const isMyPropertyPath = router?.pathname === "/user/dashboard";
  const isMyProjectPath = router?.pathname === "/user/projects";
  const language = store.getState().Language.languages;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const settingData = useSelector(settingsData);
  const LanguageList = settingData && settingData.languages;

  const [selectedLanguage, setSelectedLanguage] = useState(language.name);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  useEffect(() => {
    if (language && language.rtl === 1) {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
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
  useEffect(() => {}, [selectedLanguage]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = "primary-search-account-menu";
  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
          <GTranslateIcon />
        </IconButton>
        <Dropdown id="dropdown">
          <Dropdown.Toggle id="dropdown-basic-dashboard">
            {selectedLanguage}
          </Dropdown.Toggle>
          <Dropdown.Menu id="language">
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
      </MenuItem>

      {isMyPropertyPath ? (
        <MenuItem onClick={(e) => handlePackageCheck(e, PackageTypes.PROPERTY_LIST, router)}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            color="inherit"
          >
            <AddCircleOutlineIcon />
          </IconButton>
          <span style={{ color: "#000" }}>{translate("addProp")}</span>
        </MenuItem>
      ) : null}
      {isMyProjectPath ? (
        <MenuItem onClick={(e) => handlePackageCheck(e, PackageTypes.PROJECT_LIST, router)}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            color="inherit"
          >
            <AddCircleOutlineIcon />
          </IconButton>
          <span style={{ color: "#000" }}>{translate("addProject")}</span>
        </MenuItem>
      ) : null}
    </Menu>
  );

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, color: "#000" }} />
          <Box
            sx={{
              display: { xs: "none", sm: "none", md: "none", lg: "flex" },
              alignItems: "center",
            }}
          >
            <Dropdown id="dropdown">
              <Dropdown.Toggle id="dropdown-basic-dashboard">
                {selectedLanguage}
              </Dropdown.Toggle>
              <Dropdown.Menu id="language">
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
            <Box>
              {isMyPropertyPath ? (
                <button
                  className="btn"
                  id="dashboard_add"
                  onClick={(e) => handlePackageCheck(e, PackageTypes.PROPERTY_LIST, router)}
                >
                  <FiPlusCircle size={20} className="mx-2 add-nav-button" />
                  {translate("addProp")}
                </button>
              ) : null}
              {isMyProjectPath ? (
                <button
                  className="btn"
                  id="dashboard_add"
                  onClick={(e) => handlePackageCheck(e, PackageTypes.PROJECT_LIST, router)}
                >
                  <FiPlusCircle size={20} className="mx-2 add-nav-button" />
                  {translate("addProject")}
                </button>
              ) : null}
            </Box>
          </Box>
          <Box sx={{ display: { md: "flex", lg: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="#000"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>

        {renderMobileMenu}
      </Box>
    </>
  );
};

export default AdminHeader;
