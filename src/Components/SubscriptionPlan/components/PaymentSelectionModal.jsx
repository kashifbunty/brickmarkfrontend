import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Spin } from 'antd';
import { translate } from '@/utils/helper';
import { FaUniversity, FaArrowLeft, FaCheckCircle, FaCopy, FaCloudUploadAlt, FaFileAlt, FaTimesCircle } from 'react-icons/fa';
import Image from 'next/image';
import toast from 'react-hot-toast';
import stripe from '@/assets/Images/paymentIcons/stripe.png';
import razorpay from '@/assets/Images/paymentIcons/razorpay.png';
import paypal from '@/assets/Images/paymentIcons/paypal.png';
import paystack from '@/assets/Images/paymentIcons/paystack.png';
import flutterwave from '@/assets/Images/paymentIcons/flutterwave.png';
import card from '@/assets/Images/paymentIcons/card.jpg';
import { useDropzone } from 'react-dropzone';
import { initiateBankTransferApi, uploadBankReceiptFileApi } from '@/store/actions/campaign';
import { useRouter } from 'next/router';

const PaymentSelectionModal = ({
  isOpen,
  onClose,
  onOnlinePayment,
  onBankTransfer,
  activePaymentGateway,
  bankDetails,
  bankTransferActive,
  hasOnlinePayment,
  packageId
}) => {
  const router = useRouter();

  const [showBankDetails, setShowBankDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Auto-show bank details if only bank transfer is active
  useEffect(() => {
    if (isOpen && bankTransferActive && !hasOnlinePayment) {
      setShowBankDetails(true);
    }
  }, [isOpen, bankTransferActive, hasOnlinePayment]);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowBankDetails(false);
      setError(null);
      setTransactionId(null);
      setShowUploadSection(false);
      setFile(null);
    }
  }, [isOpen]);

  const onClosePaymentSelectionModal = () => {
    onClose();
    setShowBankDetails(false);
    setError(null);
    setTransactionId(null);
    setShowUploadSection(false);
    setFile(null);
  };

  const handleBankTransfer = () => {
    setShowBankDetails(true);
    setError(null);
  };

  const handleBack = () => {
    if (showUploadSection) {
      setShowUploadSection(false);
      setFile(null);
      setFileError("");
    } else {
      setShowBankDetails(false);
    }
    setError(null);
  };

  // Validate file upload
  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setFileError("Invalid file type. Please upload JPG, PNG, or PDF.");
      return false;
    }

    if (file.size > maxSize) {
      setFileError("File size exceeds 5MB. Please upload a smaller file.");
      return false;
    }

    setFileError("");
    return true;
  };
  const showUploadReceipt = () => { 
    setShowUploadSection(true);
  }
  // Initiate bank transfer and get transaction ID
  const handleInitiateBankTransfer = async () => {
    setIsUploading(true);
    setError(null);

    try {
      initiateBankTransferApi({
        package_id: packageId,
        file: file,
        onSuccess: () => {
          setIsUploading(false)
          toast.success(translate("receiptUploadedSuccessfully"));
          onClose();
          router.push("/user/transaction-history");
          
        },
        onError: (error) => {
          setIsUploading(false)
          toast.error(error?.message || translate("receiptUploadFailed"));
          setError(error?.message || translate("receiptUploadFailed"));
        }
      });
    } catch (error) {
      console.error('Bank transfer initiation error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Upload receipt after bank transfer
  const handleUploadReceipt = async () => {
    if (!file) {
      setFileError(translate("pleaseSelectFile"));
      return;
    }

    if (!transactionId) {
      setError(translate("transactionIdMissing"));
      return;
    }

    setIsUploading(true);

    try {

      uploadBankReceiptFileApi({
        payment_transaction_id: transactionId,
        file: file,
        onSuccess: () => {
          toast.success(translate("receiptUploadedSuccessfully"));
          onClose();
          router.push("/user/transaction-history");
        },
        onError: (error) => {
          setError(error?.message || translate("receiptUploadFailed"));
        }
      });

    } catch (error) {
      console.error('Receipt upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(translate("copiedToClipboard"));
  };

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        if (rejectedFiles[0].errors[0].code === 'file-too-large') {
          setFileError(translate("fileSizeTooLarge"));
        } else if (rejectedFiles[0].errors[0].code === 'file-invalid-type') {
          setFileError(translate("invalidFileType"));
        } else {
          setFileError(translate("invalidFileType"));
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        if (validateFile(selectedFile)) {
          setFile(selectedFile);
        }
      }
    }
  });

  // Function to get payment gateway info with image paths
  const getPaymentGatewayInfo = () => {
    switch (activePaymentGateway) {
      case 'stripe':
        return {
          imagePath: stripe,
          name: 'Stripe',
          description: translate("payWithStripe")
        };
      case 'razorpay':
        return {
          imagePath: razorpay,
          name: 'Razorpay',
          description: translate("payWithRazorpay")
        };
      case 'paypal':
        return {
          imagePath: paypal,
          name: 'PayPal',
          description: translate("payWithPaypal")
        };
      case 'paystack':
        return {
          imagePath: paystack,
          name: 'Paystack',
          description: translate("payWithPaystack")
        };
      case 'flutterwave':
        return {
          imagePath: flutterwave,
          name: 'Flutterwave',
          description: translate("payWithFlutterwave")
        };
      default:
        return {
          imagePath: card,
          name: translate("onlinePayment"),
          description: translate("payWithCard")
        };
    }
  };

  // Styles for the upload section
  const uploadStyles = {
    uploadSection: {
      background: '#f7f9fc',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '15px',
      animation: 'slideDown 0.3s ease-out forwards',
    },
    dropzone: {
      border: '2px dashed #d9d9d9',
      borderRadius: '8px',
      padding: '20px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: '#fafafa',
      marginTop: '15px',
    },
    dropzoneActive: {
      borderColor: '#1890ff',
      backgroundColor: '#e6f7ff',
    },
    dropzoneError: {
      borderColor: '#ff4d4f',
      backgroundColor: '#fff1f0',
    },
    uploadIcon: {
      color: '#1890ff',
      marginBottom: '8px',
      fontSize: '36px',
    },
    fileInfo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 15px',
      backgroundColor: '#f0f5ff',
      borderRadius: '6px',
      border: '1px solid #d6e4ff',
      marginTop: '15px',
    },
    fileWrapper: {
      display: 'flex',
      alignItems: 'center',
    },
    fileIcon: {
      color: '#1890ff',
      marginRight: '8px',
    },
    fileName: {
      wordBreak: 'break-all',
      maxWidth: '300px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    removeBtn: {
      background: 'none',
      border: 'none',
      color: '#ff4d4f',
      cursor: 'pointer',
    },
    errorMessage: {
      color: '#ff4d4f',
      marginTop: '8px',
      fontSize: '12px',
    }
  };

  const paymentInfo = getPaymentGatewayInfo();

  // Render upload section
  const renderUploadSection = () => {
    if (!showUploadSection) return null;

    return (
      <div className="e-bank-upload-wrapper">
        <h3 className="e-bank-upload-title">{translate("uploadPaymentReceipt")}</h3>

        {!file ? (
          <div
            {...getRootProps()}
            className={`e-bank-dropzone ${isDragActive ? 'active' : ''} ${fileError ? 'error' : ''}`}
          >
            <input {...getInputProps()} />
            <span className="e-bank-upload-icon-container">
              <FaCloudUploadAlt className="e-bank-upload-icon" />
            </span>
            <p className="e-bank-upload-text">
              Drag & drop here or <strong>click to choose a file.</strong>
            </p>
          </div>
        ) : (
          <div className="e-bank-selected-file">
            <div className="e-bank-file-info">
              <FaFileAlt className="e-bank-file-icon" />
              <span className="e-bank-file-name">{file.name}</span>
            </div>
            <button
              className="e-bank-remove-file"
              onClick={() => setFile(null)}
              aria-label="Remove file"
            >
              <FaTimesCircle />
            </button>
          </div>
        )}

        {fileError && <p className="e-bank-error-message">{fileError}</p>}
      </div>
    );
  };

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={onClosePaymentSelectionModal}
      footer={null}
      width={500}
      className="bank-transfer-modal"
      centered
    >
      {!showBankDetails ? (
        <div className="bt-payment-selection">
          <div className="bt-header">
            <h2>{translate("selectPaymentMethod")}</h2>
            <p>{translate("chooseYourPreferredPaymentMethod")}</p>
          </div>
          <div className="bt-payment-options">
            {hasOnlinePayment && (
              <div
                className="bt-option-card"
                onClick={onOnlinePayment}
              >
                <div className="bt-option-icon bt-razorpay overflow-hidden">
                  <Image
                    src={paymentInfo.imagePath}
                    alt={paymentInfo.name}
                    width={80}
                    height={40}
                    objectFit="contain"
                  />
                </div>
                <div className="bt-option-content">
                  <h3>{paymentInfo.name}</h3>
                  <p>{paymentInfo.description}</p>
                </div>
              </div>
            )}

            {bankTransferActive && (
              <div
                className="bt-option-card"
                onClick={handleBankTransfer}
              >
                <div className="bt-option-icon bt-bank">
                  <FaUniversity size={28} />
                </div>
                <div className="bt-option-content">
                  <h3>{translate("bankTransfer")}</h3>
                  <p>{translate("payViaBank")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bt-details-container">
          <div className="bt-details-header">
            {hasOnlinePayment &&
              <button
                className="bt-back-btn"
                onClick={handleBack}
              >
                <FaArrowLeft /> {translate("back")}
              </button>
            }
            <h2>{translate("bankTransferDetails")}</h2>
          </div>


          <>
            <div className="bt-details-content">
              {bankDetails && bankDetails.map((detail, index) => (
                <div key={index} className="bt-detail-row">
                  <span className="bt-detail-label">{detail.title}</span>
                  <div className="bt-detail-value-wrapper">
                    <span className="bt-detail-value">{detail.value}</span>
                    <FaCopy
                      className="bt-copy-icon"
                      onClick={() => copyToClipboard(detail.value)}
                    />
                  </div>
                </div>
              ))}
            </div>


          </>


          {showUploadSection && renderUploadSection()}
          <div className="bt-note-box">
            <div className="bt-note-content">
              <FaCheckCircle className="bt-check-icon" />
              <p>{translate("bankTransferNote")}</p>
            </div>
          </div>
          {/* {error && (
            <div className="bt-error-message">
              <span>{error}</span>
            </div>
          )} */}

          {!showUploadSection ? (
            <button
              className={`bt-confirm-button ${isSubmitting ? 'submitting' : ''}`}
              onClick={showUploadReceipt}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spin size="small" />
                  <span>{translate("processingPayment")}</span>
                </>
              ) : (
                translate("uploadReceipt")
              )}
            </button>
          ) : (
            <button
              className={`bt-confirm-button ${isUploading ? 'submitting' : ''}`}
              onClick={handleInitiateBankTransfer}
              disabled={isUploading || !file}
            >
              {isUploading ? (
                <>
                  <Spin size="small" />
                  <span>{translate("uploadingReceipt")}</span>
                </>
              ) : (
                translate("confirmPayment")
              )}
            </button>
          )}
        </div>
      )}
    </Modal>
  );
};

export default PaymentSelectionModal; 