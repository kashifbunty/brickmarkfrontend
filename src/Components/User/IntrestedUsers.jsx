"use client";
import Image from "next/image";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useEffect, useState } from "react";
import { getIntrestedUserApi } from "@/store/actions/campaign";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import Pagination from "@/Components/Pagination/ReactPagination";
import { placeholderImage, translate } from "@/utils/helper.js";
import { languageData } from "@/store/reducer/languageSlice.js";
import Loader from "@/Components/Loader/Loader";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import withAuth from "../Layout/withAuth.jsx";

const VerticleLayout = dynamic(
  () => import("../../../src/Components/AdminLayout/VerticleLayout.jsx"),
  { ssr: false }
);

const InterestedUsers = () => {
  const router = useRouter();
  const slug_id = router?.query?.slug;

  const lang = useSelector(languageData);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const limit = 10;

  useEffect(() => {}, [lang]);

  useEffect(() => {
    if (!router.isReady) return;
    setIsLoading(true);

    getIntrestedUserApi({
      slug_id,
      offset: offset.toString(),
      limit: limit.toString(),
      onSuccess: (res) => {
        setData(res.data.length > 0 ? res?.data : []);
        setTotal(res.total || 0);
        setIsLoading(false);
      },
      onError: (err) => {
        console.log("err",err)
        // toast.error(err.message);
        setData([]);
        setTotal(0);
        setIsLoading(false);
      },
    });
  }, [router.isReady, offset]);

  const handlePageChange = (selectedPage) => {
    const newOffset = selectedPage.selected * limit;
    setOffset(newOffset);
    window.scrollTo(0, 0);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

  const renderTableRows = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={5} align="center">
            <Loader />
          </TableCell>
        </TableRow>
      );
    }

    if (data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} align="center">
            {translate("noDataAvailable")}
          </TableCell>
        </TableRow>
      );
    }

    return data.map((user, index) => (
      <TableRow key={index}>
        <TableCell align="left">{index + 1}</TableCell>
        <TableCell align="left">
          <Image
            src={user?.profile}
            width={40}
            height={40}
            alt={user?.name || "User Profile"}
            onError={placeholderImage}
            loading="lazy"
          />
        </TableCell>
        <TableCell align="left">{user?.name || "-"}</TableCell>
        <TableCell align="left">
          <a href={`mailto:${user?.email}`} className="intrested_contact" target="_blank">
            {user?.email || "-"}
          </a>
        </TableCell>
        <TableCell align="left">
          <a href={`tel:${user?.mobile}`} className="intrested_contact">
            {user?.mobile || "-"}
          </a>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <VerticleLayout>
      <div className="container">
        <div className="tranction_title">
          <h1>{translate("intresteduserDetails")}</h1>
        </div>

        <div className="table_content card bg-white">
          <TableContainer
            component={Paper}
            sx={{ background: "#fff", padding: "10px" }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="Interested Users Table">
              <TableHead sx={{ background: "#f5f5f4", borderRadius: "12px" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {translate("ID")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {translate("Profile")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {translate("Name")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {translate("email")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {translate("mobileno")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{renderTableRows()}</TableBody>
            </Table>
          </TableContainer>

          {total > limit && (
            <div id="pagination_div" className="row">
              <div className="col-12">
                <Pagination
                  pageCount={Math.ceil(total / limit)}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </VerticleLayout>
  );
};

export default withAuth(InterestedUsers);
