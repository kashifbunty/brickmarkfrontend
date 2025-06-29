"use client";
import React, { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import {
  changeProjectStatusApi,
  deleteProjectApi,
  getAddedProjectApi,
} from "@/store/actions/campaign";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { Menu, Dropdown, Button, Space, Switch, Popover } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { settingsData } from "@/store/reducer/settingsSlice";
import { useRouter } from "next/router";
import { BsFillQuestionCircleFill, BsThreeDotsVertical } from "react-icons/bs";
import ReactPagination from "../../../src/Components/Pagination/ReactPagination.jsx";
import Loader from "../../../src/Components/Loader/Loader.jsx";
import toast from "react-hot-toast";

import { handlePackageCheck, placeholderImage, translate, truncate } from "@/utils/helper.js";
import { languageData } from "@/store/reducer/languageSlice.js";
import Swal from "sweetalert2";
import Image from "next/image";
import dynamic from "next/dynamic.js";
import withAuth from "../Layout/withAuth.jsx";
import CustomPopoverTooltip from "../Breadcrumb/CustomPopoverTooltip.jsx";
import { FaCrown } from "react-icons/fa";
import { PackageTypes } from "@/utils/checkPackages/packageTypes.js";

const VerticleLayout = dynamic(
  () => import("../AdminLayout/VerticleLayout.jsx"),
  { ssr: false }
);
const UserProjects = () => {
  const limit = 8;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [getProjects, setGetProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState(0);
  const [offsetdata, setOffsetdata] = useState(0);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [propertyIdToDelete, setPropertyIdToDelete] = useState(null);
  const [propertyId, setPropertyId] = useState(null);

  const startIndex = total > 0 ? offsetdata * limit + 1 : 0;
  const endIndex = Math.min((offsetdata + 1) * limit, total);
  const SettingsData = useSelector(settingsData);

  const lang = useSelector(languageData);

  useEffect(() => {}, [lang]);

  const handleClickEdit = (projectId) => {
    router.push(`/user/edit-project/${projectId}`);
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      getAddedProjectApi({
        offset: offsetdata.toString(),
        limit: limit.toString(),
        onSuccess: (response) => {
          setTotal(response.total);
          setView(response.total_clicks);
          const ProjectData = response.data.reverse();
          setIsLoading(false);
          setGetProjects(ProjectData);
        },
        onError: (error) => {
          setIsLoading(false);
          console.log(error);
        },
      });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleClickDelete = (projectId) => {
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
      text: translate("youWantToDeleteProject"),
      customClass: {
        confirmButton: "Swal-confirm-buttons",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // setPropertyIdToDelete(projectId);
        setIsLoading(true);
        deleteProjectApi(
          projectId,
          (response) => {
            setIsLoading(true);
            toast.success(response.message);

            fetchProjects();
          },
          (error) => {
            setIsLoading(false);
            toast.error(error);
          }
        );
      }
    });
  };

  useEffect(() => {
    setIsLoading(true);
    fetchProjects();
  }, [offsetdata, propertyIdToDelete]);

  useEffect(() => {}, [propertyId, propertyIdToDelete]);

  const handlePageChange = (selectedPage) => {
    const newOffset = selectedPage.selected * limit;
    setOffsetdata(newOffset);
    window.scrollTo(0, 0);
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

      changeProjectStatusApi({
        project_id: propertyId,
        status: newStatus,
        onSuccess: (response) => {
          toast.success(translate("statusUpdatedSuccessfully"));
          fetchProjects(); // Refresh properties after status change
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

  const handleFeatureClick = (e, projectId) => {
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
    handlePackageCheck(e, PackageTypes.PROJECT_FEATURE, router, projectId);
  };

  return (
    <VerticleLayout>
      <div className="container">
        <div className="dashboard_titles">
          <h3>{translate("myProjects")}</h3>
        </div>
        <div className="row" id="dashboard_top_card">
          <div className="col-12">
            <div className="table_content card bg-white">
              <TableContainer
                component={Paper}
                sx={{
                  background: "#fff",
                  padding: "10px",
                }}
              >
                <Table sx={{ minWidth: 650 }} aria-label="caption table">
                  <TableHead
                    sx={{
                      background: "#f5f5f5",
                    }}
                  >
                    <TableRow>
                      <TableCell sx={{ fontWeight: "600" }}>
                        {translate("listingTitle")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "600" }} align="center">
                        {translate("category")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "600" }} align="center">
                        {translate("upcomingOrUnderConstruction")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "600" }} align="center">
                        {translate("postedOn")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "600" }} align="center">
                        {translate("adminStatus")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "600" }} align="center">
                        {translate("projectStatus")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "600" }} align="center">
                        {translate("action")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          {/* Centered loader */}
                          <div>
                            <Loader />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : getProjects && getProjects.length > 0 ? (
                      getProjects.map((elem, index) => (
                        <TableRow key={index}>
                          <TableCell component="th" scope="row" align="center">
                            <div className="property-cell">
                              <div className="property-image">
                                <Image
                                  src={elem.image}
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
                              </div>
                              <div className="property-info">
                                <div className="property-title">
                                  {truncate(elem.title, 40)}
                                </div>
                                {elem?.is_promoted ? (
                                  <span className="feature_tag">
                                    {translate("featured")}
                                  </span>
                                ) : null}
                                <div className="property-location">
                                  <span>
                                    {elem.city}, {elem.state}, {elem.country}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell align="center">
                            {elem?.category?.category}
                          </TableCell>
                          <TableCell align="center">
                            {elem?.type === "upcoming"
                              ? translate("upcoming")
                              : translate("underconstruction")}
                          </TableCell>

                          <TableCell align="center">
                            {elem.created_at}
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
                            <div className="action-buttons">
                              <Button
                                className="view-btn"
                                onClick={() =>
                                  router.push(`/my-project/${elem.slug_id}`)
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
                                   {elem.request_status !== "pending" ? (
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
                                    ) : null}
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
                                    <Menu.Item
                                      key="delete"
                                      onClick={() =>
                                        handleClickDelete(elem?.id)
                                      }
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
                        <TableCell colSpan={6} align="center">
                          <p>{translate("noDataAvailable")}</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {total > limit ? (
                <div className="col-12">
                  <ReactPagination
                    pageCount={Math.ceil(total / limit)}
                    onPageChange={handlePageChange}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    total={total}
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

export default withAuth(UserProjects);
