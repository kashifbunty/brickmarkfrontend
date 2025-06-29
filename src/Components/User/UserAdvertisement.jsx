"use client";
import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  getFeaturedDataApi,
} from "@/store/actions/campaign";
import ReactPagination from "@/Components/Pagination/ReactPagination.jsx";
import Loader from "@/Components/Loader/Loader";
import Image from "next/image";
import { useRouter } from "next/router.js";
import withAuth from "../Layout/withAuth.jsx";
import { Tab, Tabs } from "@mui/material";
import { RemoveRedEye } from "@mui/icons-material";
import dynamic from "next/dynamic.js";
import { translate } from "@/utils/helper.js";
import Link from "next/link.js";

const VerticleLayout = dynamic(
  () => import("../AdminLayout/VerticleLayout.jsx"),
  { ssr: false }
);

const UserAdvertisement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 5;
  const router = useRouter();

  const fetchFeatureData = () => {
    try {
      setIsLoading(true);

      getFeaturedDataApi({
        type: tabValue === 0 ? "property" : "project",
        offset: offset.toString(),
        limit: limit.toString(),
        onSuccess: (response) => {
          setTotal(response.total);
          setData(response.data);
          setIsLoading(false);
        },
        onError: (error) => {
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Error while Fetching Feature Data", error);
    }
  };

  useEffect(() => {
    fetchFeatureData();
  }, [tabValue, offset]);

  const handlePageChange = (selectedPage) => {
    setOffset(selectedPage.selected * limit);
    window.scrollTo(0, 0);
  };

  const formatDate = (date) => {
    // dd-mm-yyyy
    const formattedDate = new Date(date).toLocaleDateString('en-GB');
    return formattedDate;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 0:
        return "status-approved"; // Approved
      case 1:
        return "status-pending"; // Pending
      case 2:
        return "status-rejected"; // Rejected
      case 3:
        return "status-expired"; // Expired
      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return translate("approved");
      case 1:
        return translate("pending");
      case 2:
        return translate("rejected");
      case 3:
        return translate("expired");
      default:
        return "";
    }
  };

  return (
    <VerticleLayout>
      <div className="container">
        <h1 className="user-ad-title">{translate("myAdvertisement")}</h1>
        <div className="user-ad-container">
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => {
              setTabValue(newValue);
              setOffset(0); // Reset offset to 0 when tab changes
            }}
            className="user-ad-tabs"
          >
            <Tab label={translate("my_properties")} className="user-ad-tab" />
            <Tab label={translate("my_projects")} className="user-ad-tab" />
          </Tabs>

          <div className="user-ad-table-container">
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{translate("listing_title")}</TableCell>
                    <TableCell align="center">
                      {translate("admin_status")}
                    </TableCell>
                    <TableCell align="center">
                      {translate("featured_on")}
                    </TableCell>
                    <TableCell align="center">
                      {translate("expiry_date")}
                    </TableCell>
                    <TableCell align="center">{translate("action")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Loader />
                      </TableCell>
                    </TableRow>
                  ) : data.length > 0 ? (
                    data.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {tabValue === 0 ? (
                            <div className="user-ad-listing">
                              <Image
                                src={item?.property?.title_image}
                                alt="listing"
                                width={50}
                                height={50}
                                className="user-ad-img"
                              />
                              <div>
                                <div className="user-ad-title">
                                  {item?.property?.title}
                                </div>
                                <div className="user-ad-location">
                                  {item?.property?.city},{" "}
                                  {item?.property?.country}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="user-ad-listing">
                              <Image
                                src={item?.project?.image}
                                alt="listing"
                                width={50}
                                height={50}
                                className="user-ad-img"
                              />
                              <div>
                                <div className="user-ad-title">
                                  {item?.project?.title}
                                </div>
                                <div className="user-ad-location">
                                  {item?.project?.city},{" "}
                                  {item?.project?.country}
                                </div>
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <span
                            className={`status-label ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {getStatusText(item.status)}
                          </span>
                        </TableCell>

                        <TableCell align="center">{formatDate(item.start_date)}</TableCell>
                        <TableCell align="center">{formatDate(item.end_date)}</TableCell>
                        <TableCell align="center">
                          <Link
                            href={
                              tabValue === 0
                                ? `/properties-details/${item?.property?.slug_id}`
                                : `/project-details/${item?.project?.slug_id}`
                            }
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <span className="user-ad-view-icon">
                              <RemoveRedEye size={24} />
                            </span>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {translate("noDataAvailable")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {total > limit && (
              <ReactPagination
                pageCount={Math.ceil(total / limit)}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </VerticleLayout>
  );
};

export default withAuth(UserAdvertisement);
