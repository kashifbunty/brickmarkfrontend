"use client";
import {
  changePropertyStatusApi,
  deletePropertyApi,
  getAddedPropertiesApi,
} from "@/store/actions/campaign";
import HomeIcon from "@mui/icons-material/Home";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Avatar, Button, Dropdown, Menu, Tooltip, Switch } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import ChangeStatusModal from "@/Components/ChangeStatusModal/ChangeStatusModal.jsx";
import { languageData } from "@/store/reducer/languageSlice.js";
import { settingsData } from "@/store/reducer/settingsSlice";
import {
  handlePackageCheck,
  BadgeSvg,
  formatPriceAbbreviated,
  placeholderImage,
  translate,
  truncate,
} from "@/utils/helper.js";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic.js";
import Image from "next/image";
import Link from "next/link.js";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { BsFillQuestionCircleFill, BsThreeDotsVertical } from "react-icons/bs";
import { FaCrown, FaRegEye, FaUser, FaUserFriends } from "react-icons/fa";
import { MdOutlineSell } from "react-icons/md";
import Swal from "sweetalert2";
import Loader from "../../../src/Components/Loader/Loader.jsx";
import ReactPagination from "../../../src/Components/Pagination/ReactPagination.jsx";
import withAuth from "../Layout/withAuth.jsx";
import CustomPopoverTooltip from "../Breadcrumb/CustomPopoverTooltip.jsx";
import { PackageTypes } from "@/utils/checkPackages/packageTypes.js";
import premiumIcon from "../../assets/premium.svg";

const VerticleLayout = dynamic(
  () => import("../AdminLayout/VerticleLayout.jsx"),
  { ssr: false }
);
const UserDashboard = () => {
  const limit = 8;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [getFeaturedListing, setGetFeaturedListing] = useState([]);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState(0);
  const [offsetdata, setOffsetdata] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [propertyIdToDelete, setPropertyIdToDelete] = useState(null);
  const [propertyId, setPropertyId] = useState(null);
  const [propertyType, setPropertyType] = useState(null);
  const [changeStatus, setChangeStatus] = useState(false);
  const [changestatusModal, setChangestatusModal] = useState(false);

  const SettingsData = useSelector(settingsData);
  const lang = useSelector(languageData);
  const systemSettingsData = useSelector(settingsData);
  const isLoggedIn = useSelector((state) => state.User_signup);
  const userData = isLoggedIn?.data?.data?.name;
  const userVerificationStatus = systemSettingsData?.verification_status;

  // Function to fetch properties
  const fetchProperties = async () => {
    setIsLoading(true);
    getAddedPropertiesApi({
      offset: offsetdata.toString(),
      limit: limit.toString(),
      onSuccess: (response) => {
        setTotal(response.total);
        setView(response.total_views);
        setGetFeaturedListing(response.data);
        setIsLoading(false);
      },
      onError: (error) => {
        console.log(error);
        setIsLoading(false);
      },
    });
  };

  // Handle property deletion
  const handleClickDelete = (propertyId) => {
    if (SettingsData.demo_mode === true) {
      Swal.fire({
        title: translate("opps"),
        text: translate("notAllowdDemo"),
        icon: "warning",
        showCancelButton: false,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        confirmButtonText: translate("ok"),
      });
      return false;
    }

    Swal.fire({
      icon: "warning",
      title: translate("areYouSure"),
      text: translate("youWantToDeleteProperty"),
      customClass: {
        confirmButton: "Swal-confirm-buttons",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setPropertyIdToDelete(propertyId);
        setIsLoading(true);
        deletePropertyApi(
          propertyId,
          (response) => {
            toast.success(response.message);
            fetchProperties(); // Refresh properties after deletion
          },
          (error) => {
            setIsLoading(false);
            toast.error(error);
          }
        );
      }
    });
  };

  // Handle status toggle
  const handleStatusToggle = async (propertyId, currentStatus) => {
    if (SettingsData.demo_mode === true) {
      Swal.fire({
        title: translate("opps"),
        text: translate("notAllowdDemo"),
        icon: "warning",
        showCancelButton: false,
        customClass: {
          confirmButton: "Swal-buttons",
        },
        confirmButtonText: translate("ok"),
      });
      return false;
    }

    try {
      setIsLoading(true);
      const newStatus = currentStatus === 1 ? 0 : 1;

      changePropertyStatusApi({
        property_id: propertyId,
        status: newStatus,
        onSuccess: (response) => {
          toast.success(translate("statusUpdatedSuccessfully"));
          fetchProperties(); // Refresh properties after status change
        },
        onError: (error) => {
          setIsLoading(false);
          toast.error(error || translate("failedToUpdateStatus"));
        },
      });
    } catch (error) {
      setIsLoading(false);
      toast.error(translate("failedToUpdateStatus"));
    }
  };

  // Handle page change
  const handlePageChange = (selectedPage) => {
    const newOffset = selectedPage.selected * limit;
    setOffsetdata(newOffset);
    window.scrollTo(0, 0);
  };

  // Other handlers
  const handleClickEdit = (propertyId) => {
    router.push(`/user/edit-property/${propertyId}`);
  };

  const handleFeatureClick = (e, propertyId) => {
    if (SettingsData.demo_mode === true) {
      Swal.fire({
        title: translate("opps"),
        text: translate("notAllowdDemo"),
        icon: "warning",
        showCancelButton: false,
        customClass: {
          confirmButton: "Swal-buttons",
        },
        confirmButtonText: translate("ok"),
      });
      return false;
    }
    handlePackageCheck(e, PackageTypes.PROPERTY_FEATURE, router, propertyId);
  };

  const handleChangeStatusClick = (propertyId, propertyType) => {
    if (SettingsData.demo_mode === true) {
      Swal.fire({
        title: translate("opps"),
        text: translate("notAllowdDemo"),
        icon: "warning",
        showCancelButton: false,
        customClass: {
          confirmButton: "Swal-buttons",
        },
        confirmButtonText: translate("ok"),
      });
      return false;
    }
    setPropertyId(propertyId);
    setPropertyType(propertyType);
    setChangestatusModal(true);
  };

  // Effects
  useEffect(() => {
    fetchProperties();
  }, [offsetdata, isLoggedIn, propertyIdToDelete, changeStatus]);

  useEffect(() => {
    setChangeStatus(false);
  }, [changeStatus]);

  const renderContent = () => {
    switch (userVerificationStatus) {
      case "success":
        return (
          <>
            <div>
              <h1>{translate("verifySuccessTitle")}</h1>
              <p>{translate("verifySuccessDesc")}</p>
            </div>
            <div className="verified_badge">
              <span>{translate("verified")}</span>
              <span>{BadgeSvg}</span>
            </div>
          </>
        );
      case "failed":
        return (
          <>
            <div>
              <h1>{translate("verifyFailTitle")}</h1>
              <p>{translate("verifyFailDesc")}</p>
            </div>
            <Link href="/user/verification-form">
              <button>{translate("reApply")}</button>
            </Link>
          </>
        );
      case "pending":
        return (
          <>
            <div>
              <h1>{translate("verifyPendingTitle")}</h1>
              <p>{translate("verifyPendingDesc")}</p>
            </div>
          </>
        );
      case "initial":
      default:
        return (
          <>
            <div>
              <h1>{translate("verifyIntialTitle")}</h1>
              <p>{translate("verifyIntialDesc")}</p>
            </div>
            <Link href="/user/verification-form">
              <button>{translate("applyForVerification")}</button>
            </Link>
          </>
        );
    }
  };

  const UserAvatars = ({ users }) => {
    if (!users || users.length === 0) {
      return (
        <div className="interested-users">
          <span style={{ color: "var(--secondary-color)" }}>-</span>
        </div>
      );
    }

    return (
      <div className="interested-users">
        <Avatar.Group
          maxCount={4} // Show only 4 avatars
          maxStyle={{
            backgroundColor: "var(--primary-color)", // Background color for the "+X" count
            color: "#fff", // Text color for the "+X" count
            cursor: "pointer", // Make it clickable
          }}
        >
          {users.map((user, index) => (
            <Avatar
              key={index}
              src={user?.profile} // User profile image
              style={{
                backgroundColor: user?.profile
                  ? "transparent"
                  : `#${Math.floor(Math.random() * 16777215)
                      .toString(16)
                      .padStart(6, "0")}`, // Random background color if no profile image
              }}
              icon={!user?.profile && <FaUser />} // Fallback icon if no profile image
            >
              {!user?.profile && user?.name
                ? user?.name.charAt(0).toUpperCase()
                : null}
            </Avatar>
          ))}
        </Avatar.Group>
      </div>
    );
  };

  return (
    <VerticleLayout>
      <div className="container">
        <div className="row" id="dashboard_top_card">
          <div className="col-12">
            <div className="row" id="dashboard_top_card">
              <div className="col-12 col-md-12 col-lg-4">
                <div className="card" id="dashboard_card">
                  <div id="dashboard_user">
                    <div>
                      <span className="dashboard_user_title">
                        {translate("hy")} {""} {truncate(userData, 15)}
                      </span>
                      <p className="card-text">
                        {translate("manageYourProfile")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-12 col-lg-4">
                <div className="card" id="dashboard_total_prop_card">
                  <div className="totalprop">
                    <span>{translate("totalProperty")}</span>
                    {total > 0 ? <h4>{total}</h4> : <h4>0</h4>}
                  </div>
                  <div className="total_prop_icon">
                    <span>
                      <HomeIcon sx={{ fontSize: "35px" }} />
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-12 col-lg-4">
                <div className="card" id="dashboard_total_prop_card">
                  <div className="totalprop">
                    <span>{translate("totalViews")}</span>
                    {view > 0 ? <h4>{view}</h4> : <h4>0</h4>}
                  </div>
                  <div className="total_prop_icon">
                    <span>
                      <FaUserFriends sx={{ fontSize: "35px" }} size={35} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="get_verification_badge">{renderContent()}</div>
          </div>
          <div className="col-12">
            <div className="table_content card bg-white">
              <div className="table-responsive">
                <Table>
                  <TableHead
                    sx={{
                      background: "#f5f5f5",
                    }}
                  >
                    <TableRow>
                      <TableCell sx={{ fontWeight: "600" }}>
                        {translate("property")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "600" }} align="center">
                        {translate("propertyType")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "600" }} align="center">
                        {translate("rentSale")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "600" }} align="center">
                        {translate("interestedUsers")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "600" }} align="center">
                        {translate("adminStatus")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "600" }} align="center">
                        {translate("propertyStatus")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "600" }} align="center">
                        {translate("price")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "600" }} align="center">
                        {translate("action")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Loader />
                        </TableCell>
                      </TableRow>
                    ) : getFeaturedListing && getFeaturedListing.length > 0 ? (
                      getFeaturedListing.map((elem, index) => (
                        <TableRow key={index}>
                          <TableCell component="th" scope="row" align="center">
                            <div className="property-cell">
                              <div className="property-image">
                                <Image
                                  src={elem.title_image}
                                  alt={elem.title}
                                  width={60}
                                  height={60}
                                  style={{
                                    borderRadius: "8px",
                                    objectFit: "cover",
                                    backgroundColor:
                                      "var(--primary-category-background)",
                                  }}
                                  onError={placeholderImage}
                                />
                                {elem?.is_premium ? (
                                  <Tooltip
                                    title={translate("premiumProperty")}
                                    placement="top"
                                  >
                                    <Image
                                    className="premium-icon"
                                      loading="lazy"
                                      src={premiumIcon.src}
                                      alt="no_img"
                                      width={20}
                                      height={20}
                                      onError={placeholderImage}
                                    />
                                  </Tooltip>
                                ) : null}
                              </div>

                              <div className="property-info">
                                <div className="property-title">
                                  {truncate(elem.title, 40)}
                                </div>
                                {elem?.promoted ? (
                                  <span className="feature_tag">
                                    {translate("featured")}
                                  </span>
                                ) : null}
                                <div className="property-location">
                                  <span>
                                    {elem.city}, {elem.state}, {elem.country}
                                  </span>
                                  {elem.total_click > 0 && (
                                    <span className="view-count">
                                      <FaRegEye className="eye-icon" />{" "}
                                      {elem.total_click}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell align="center">
                            {elem.category?.category}
                          </TableCell>
                          <TableCell align="center">
                            <span
                              className={`status-tag ${elem.property_type}`}
                            >
                              {translate(elem.property_type)}
                            </span>
                          </TableCell>
                          <TableCell align="center">
                            <Link href={`/user/interested/${elem.slug_id}`}>
                              <UserAvatars users={elem.interested_users} />
                            </Link>
                          </TableCell>
                          <TableCell align="center">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px",
                              }}
                            >
                              <span
                                className={`status-tag ${elem.request_status?.toLowerCase()}`}
                              >
                                {translate(elem.request_status)}
                              </span>
                              {elem.request_status === "rejected" && (
                                <CustomPopoverTooltip
                                  text={elem?.reject_reason?.reason}
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell align="center">
                            <div className="status-toggle-container">
                              <Switch
                                checked={elem.status === 1}
                                onChange={() =>
                                  handleStatusToggle(elem.id, elem.status)
                                }
                                className={`custom-switch ${
                                  elem.status === 1 ? "active" : "inactive"
                                }`}
                                disabled={
                                  elem.request_status === "pending" ||
                                  elem.request_status === "rejected"
                                }
                                title={
                                  elem.request_status === "pending"
                                    ? translate("cantToggleStatusPending")
                                    : elem.request_status === "rejected"
                                    ? translate("cantToggleStatusRejected")
                                    : ""
                                }
                              />
                              <span
                                className={`status-label ${
                                  elem.status === 1 ? "active" : "inactive"
                                } ${
                                  elem.request_status === "pending" ||
                                  elem.request_status === "rejected"
                                    ? "disabled"
                                    : ""
                                }`}
                              >
                                {elem.status === 1
                                  ? translate("active")
                                  : translate("deactive")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell align="center">
                            {formatPriceAbbreviated(elem.price)}
                          </TableCell>
                          <TableCell align="center">
                            <div className="action-buttons">
                              <Button
                                className="view-btn"
                                onClick={() =>
                                  router.push(`/my-property/${elem.slug_id}`)
                                }
                                icon={<RemoveRedEyeIcon />}
                              />

                              <Dropdown
                                visible={anchorEl === index}
                                onVisibleChange={(visible) => {
                                  if (visible) {
                                    setAnchorEl(index);
                                  } else {
                                    setAnchorEl(null);
                                  }
                                }}
                                overlay={
                                  <Menu>
                                    {/* Only show edit option if request status is not pending */}
                                    {elem.request_status !== "pending" &&
                                      elem.property_type !== "sold" && (
                                        <Menu.Item
                                          key="edit"
                                          onClick={() =>
                                            handleClickEdit(elem.slug_id)
                                          }
                                        >
                                          <Button
                                            type="text"
                                            icon={<EditOutlined />}
                                          >
                                            {translate("edit")}
                                          </Button>
                                        </Menu.Item>
                                      )}

                                    {elem.request_status !== "pending" &&
                                    elem?.is_feature_available ? (
                                      <Menu.Item
                                        key="feature"
                                        onClick={(e) =>
                                          handleFeatureClick(e, elem?.id)
                                        }
                                      >
                                        <Button type="text" icon={<FaCrown />}>
                                          {translate("featured")}
                                        </Button>
                                      </Menu.Item>
                                    ) : null}

                                    {elem.request_status !== "pending" &&
                                    elem.status === 1 &&
                                    elem.property_type !== "sold" ? (
                                      <Menu.Item
                                        key="change_status"
                                        onClick={() =>
                                          handleChangeStatusClick(
                                            elem.id,
                                            elem.property_type
                                          )
                                        }
                                      >
                                        <Button
                                          type="text"
                                          icon={<MdOutlineSell />}
                                        >
                                          {translate("change status")}
                                        </Button>
                                      </Menu.Item>
                                    ) : null}

                                    <Menu.Item
                                      key="delete"
                                      onClick={() => handleClickDelete(elem.id)}
                                    >
                                      <Button
                                        type="text"
                                        icon={<DeleteOutlined />}
                                      >
                                        {translate("delete")}
                                      </Button>
                                    </Menu.Item>
                                  </Menu>
                                }
                              >
                                <Button className="menu-btn">
                                  <BsThreeDotsVertical />
                                </Button>
                              </Dropdown>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={12} align="center" width={100}>
                          <p>{translate("noDataAvailable")}</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* <FeatureModal show={isFeatureModalVisible} onHide={() => setIsFeatureModalVisible(false)} propertyId={propertyId} /> */}

              <ChangeStatusModal
                show={changestatusModal}
                onHide={() => setChangestatusModal(false)}
                propertyId={propertyId}
                propertyType={propertyType}
                setChangeStatus={setChangeStatus}
              />

              {total > limit ? (
                <div className="col-12">
                  <ReactPagination
                    pageCount={Math.ceil(total / limit)}
                    onPageChange={handlePageChange}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </VerticleLayout>
  );
};

export default withAuth(UserDashboard);
