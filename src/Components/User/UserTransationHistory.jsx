"use client"

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useEffect, useState } from "react";
import { getPaymentDetialsApi, getPaymentReceiptApi } from "@/store/actions/campaign";
import toast from "react-hot-toast";
import { settingsData } from "@/store/reducer/settingsSlice";
import { useSelector } from "react-redux";
import Pagination from "@/Components/Pagination/ReactPagination";
import { translate } from "@/utils/helper.js";
import { languageData } from "@/store/reducer/languageSlice.js";
import Loader from "@/Components/Loader/Loader";
import dynamic from "next/dynamic.js";
import withAuth from "../Layout/withAuth.jsx";
import { FaDownload, FaUpload, FaQuestionCircle } from "react-icons/fa";
import { Button, Select, Spin, Tooltip, Popover } from "antd";
import { TbFileInvoice } from "react-icons/tb";
import html2pdf from 'html2pdf.js';
import UploadReceiptModal from './UploadReceiptModal';
import CustomPopoverTooltip from "../Breadcrumb/CustomPopoverTooltip.jsx";
const VerticleLayout = dynamic(() => import('../../../src/Components/AdminLayout/VerticleLayout.jsx'), { ssr: false })

const { Option } = Select;


const UserTransationHistory = () => {
    const systemsettings = useSelector(settingsData);
    const currency = systemsettings?.currency_symbol;
    const lang = useSelector(languageData);
    const [Data, setData] = useState([]);
    const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');

    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const limit = 10;

    useEffect(() => { }, [lang]);

    // Load data function
    const loadData = async (isLoadMore = false, filterValue = paymentTypeFilter) => {
        if (isLoadMore) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
        }

        getPaymentDetialsApi({
            offset: offset.toString(),
            limit: limit.toString(),
            payment_type: filterValue === 'all' ? "" : filterValue,
            onSuccess: (res) => {
                setTotal(res.total);
                if (isLoadMore) {
                    setData(prevData => [...prevData, ...res.data]);
                } else {
                    setData(res.data);
                }
                setIsLoading(false);
                setIsLoadingMore(false);
            },
            onError: (err) => {
                toast.error(err.message);
                setIsLoading(false);
                setIsLoadingMore(false);
            },
        });
    };

    // Handle load more
    const handleLoadMore = () => {
        const newOffset = offset + limit;
        setOffset(newOffset);
        loadData(true);
    };

    // Reset filters and reload data
    const handleFilterChange = (value) => {
        setOffset(0);
        setData([]);
        setPaymentTypeFilter(value);
        loadData(false, value);
    };

    // Initial load
    useEffect(() => {
        loadData();
    }, []);

    // format date
    function formatDate(dateString) {
        const options = { year: "numeric", month: "long", day: "numeric" };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    }

    const handleDownloadInvoice = (transactionData) => {
        getPaymentReceiptApi({
            payment_transaction_id: transactionData.id,
            onSuccess: (res) => {
                // Create a temporary div to hold the HTML content
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = res;

                // Configure html2pdf options
                const opt = {
                    margin: 0.5,
                    filename: `invoice-${transactionData.id}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                };

                // Generate and download PDF
                html2pdf().set(opt).from(tempDiv).save().then(() => {
                    // Clean up
                    tempDiv.remove();
                }).catch(error => {
                    console.error('PDF generation error:', error);
                    toast.error('Error generating PDF');
                });
            },
            onError: (err) => {
                toast.error(err.message);
            },
        });
    };

    const handleUploadReceipt = (transactionId) => {
        setSelectedTransactionId(transactionId);
        setIsUploadModalOpen(true);
    };

    const handleCloseUploadModal = () => {
        setSelectedTransactionId(null);
        setIsUploadModalOpen(false);
    };

    const refreshTransactions = () => {
        // Refresh the transaction list
        getPaymentDetialsApi({
            onSuccess: (response) => {
                setData(response.data);
            },
            onError: () => {
                toast.error(translate("errorFetchingTransactions"));
            }
        });
    };

    useEffect(() => {
    }, [paymentTypeFilter]);

    return (
        <VerticleLayout>
            <div className="container">
                <div className="tranction_title d-flex align-items-center justify-content-between mb-4">
                    <h1>{translate("transactionHistory")}</h1>
                    <div className="payment-type-filter" style={{ width: '250px' }}>
                        <Select
                            value={paymentTypeFilter}
                            onChange={handleFilterChange}
                            style={{ width: '100%' }}
                            className="filter-select"
                            placeholder={translate("paymentType")}
                        >
                            <Option value="all">{translate("allPaymentTypes")}</Option>
                            <Option value="free">Free</Option>
                            <Option value="online payment">Online Payment</Option>
                        </Select>
                    </div>
                </div>

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
                                    background: "#f5f5f4",
                                    borderRadius: "12px",
                                }}
                            >
                                <TableRow
                                    sx={{
                                        background: "#f5f5f5",
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: "600" }} align="center">
                                        {translate("ID")}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "600" }} align="center">
                                        {translate("transactionId")}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "600" }} align="center">
                                        {translate("orderId")}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "600" }} align="center">
                                        {translate("packageName")}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "600" }} align="center">
                                        {translate("date")}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "600" }} align="center">
                                        {translate("price")}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "600" }} align="center">
                                        {translate("paymentType")}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "600" }} align="center">
                                        {translate("paymentMethod")}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "600" }} align="center">
                                        {translate("status")}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "600" }} align="center">
                                        {translate("invoice")}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">
                                            <div>
                                                <Loader />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : Data.length > 0 ? (
                                    <>
                                        {Data.map((elem, index) => (
                                            <TableRow key={index}>
                                                <TableCell align="center">{elem?.id}</TableCell>
                                                <TableCell align="center">{elem?.transaction_id ? elem?.transaction_id : "-"}</TableCell>
                                                <TableCell align="center">{elem?.order_id ? elem?.order_id : "-"}</TableCell>
                                                <TableCell align="center">{elem?.package?.name ? elem?.package?.name : "-"}</TableCell>
                                                <TableCell align="center">{formatDate(elem?.created_at)}</TableCell>
                                                <TableCell align="center">
                                                    {currency}
                                                    {elem?.amount}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {elem?.payment_type || "-"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {elem?.payment_gateway || "-"}
                                                </TableCell>
                                                {elem?.payment_status === "success" ? (
                                                    <TableCell sx={{ fontWeight: "600" }} align="center">
                                                        <span className="success"> {translate("success")}</span>
                                                    </TableCell>
                                                ) : elem?.payment_status === "pending" ? (
                                                    <TableCell sx={{ fontWeight: "600" }} align="center">
                                                        <span className="pending"> {translate("pending")}</span>
                                                    </TableCell>
                                                ) : elem?.payment_status === "review" ? (
                                                    <TableCell sx={{ fontWeight: "600" }} align="center">
                                                        <span className="review"> {translate("review")}</span>
                                                    </TableCell>
                                                ) : elem?.payment_status === "rejected" ? (
                                                    <TableCell sx={{ fontWeight: "600" }} align="center">
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                gap: "10px",
                                                            }}
                                                        >
                                                            <span
                                                                className={`status-tag rejected`}
                                                            >
                                                                {translate("rejected")}
                                                            </span>
                                                            {elem?.reject_reason && (
                                                                <CustomPopoverTooltip
                                                                    text={elem?.reject_reason}
                                                                />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                ) : elem?.payment_status === "failed" ? (
                                                    <TableCell sx={{ fontWeight: "600" }} align="center">
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                gap: "10px",
                                                            }}
                                                        >
                                                            <span
                                                                className={`status-tag fail`}
                                                            >
                                                                {translate("failed")}
                                                            </span>
                                                            {elem?.reject_reason && (
                                                                <CustomPopoverTooltip
                                                                    text={elem?.reject_reason}
                                                                />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                ) : (
                                                    <TableCell sx={{ fontWeight: "600" }} align="center">
                                                        <span className="fail"> {translate("fail")}</span>
                                                    </TableCell>
                                                )}
                                                <TableCell align="center">
                                                    {elem?.payment_status === "success" ? (
                                                        <Tooltip title={translate("downloadInvoice")} placement="left">
                                                            <button
                                                                onClick={() => handleDownloadInvoice(elem)}
                                                                className="download-invoice-btn"
                                                            >
                                                                <TbFileInvoice size={20} />
                                                            </button>
                                                        </Tooltip>
                                                    ) : elem?.payment_type === "bank transfer" && (elem?.payment_status === "pending" || elem?.payment_status === "rejected") ? (
                                                        <Tooltip title={elem?.payment_status === "pending" ? translate("uploadReceipt") : translate("reuploadReceipt")} placement="top">
                                                            <button
                                                                onClick={() => handleUploadReceipt(elem.id)}
                                                                className="upload-receipt-btn"
                                                            >
                                                                <FaUpload size={18} />
                                                            </button>
                                                        </Tooltip>
                                                    ) : (
                                                        <span className="text-muted"> - </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {Data.length < total && (
                                            <TableRow>
                                                <TableCell colSpan={9} align="center">
                                                    <div className="load-more-container">
                                                        <Button
                                                            onClick={handleLoadMore}
                                                            className="load-more-btn"
                                                            disabled={isLoadingMore}
                                                        >
                                                            {isLoadingMore ? (
                                                                <div className="loading-wrapper">
                                                                    <Spin size="small" />
                                                                    <span className="ml-2">{translate("loading")}</span>
                                                                </div>
                                                            ) : (
                                                                translate("loadMore")
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">
                                            <p>{translate("noDataAvailable")}</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>

            <UploadReceiptModal
                isOpen={isUploadModalOpen}
                onClose={handleCloseUploadModal}
                transactionId={selectedTransactionId}
                onSuccess={refreshTransactions}
            />
        </VerticleLayout>
    );
};

export default withAuth(UserTransationHistory);
