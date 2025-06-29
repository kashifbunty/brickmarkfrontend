import React, { useCallback, useState } from 'react';
import { Modal, Button } from 'antd';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaFileAlt, FaTimesCircle } from 'react-icons/fa';
import { translate } from '@/utils/helper';
import { uploadBankReceiptFileApi } from '@/store/actions/campaign';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

const ACCEPTED_FILE_TYPES = {
    'image/jpeg': ['.jpeg', '.jpg'],
    'image/png': ['.png'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
};

const UploadReceiptModal = ({ isOpen, onClose, transactionId, onSuccess }) => {
    const router = useRouter();

    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
            setError(translate("fileTypeError"));
            return;
        }

        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setError('');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPTED_FILE_TYPES,
        // maxSize: MAX_FILE_SIZE,
        multiple: false
    });

    const handleSubmit = () => {
        if (!file) {
            setError(translate("pleaseSelectFile"));
            return;
        }
        setIsUploading(true);
        try {
            uploadBankReceiptFileApi({
                payment_transaction_id: transactionId,
                file: file,
                onSuccess: () => {
                    setFile(null);
                    setError('');
                    setIsUploading(false);
                    toast.success(translate("receiptUploadSuccess"));
                    router.push("/user/transaction-history");
                    onSuccess && onSuccess();
                    onClose();
                },
                onError: (error) => {
                    setError(translate("uploadReceiptError"));
                    setIsUploading(false);
                    toast.error(error?.message || translate("uploadReceiptError"));
                }
            });
        } catch (error) {
            console.error(error);
            setIsUploading(false);
            setError(translate("uploadReceiptError"));
            toast.error(error?.message || translate("uploadReceiptError"));
        }
    };

    const removeFile = () => {
        setFile(null);
        setError('');
    };

    return (
        <Modal
            title={translate("reuploadTransactionReceipt")}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={500}
            className="upload-receipt-modal"
        >
            <div className="upload-container">
                {!file ? (
                    <div 
                        {...getRootProps()} 
                        className={`dropzone ${isDragActive ? 'active' : ''} ${error ? 'error' : ''}`}
                    >
                        <input {...getInputProps()} />
                        <FaCloudUploadAlt size={40} className="upload-icon" />
                        <p className="upload-text">{translate("dragDropFile")}</p>
                        {/* <p className="upload-hint">{translate("allowedFileTypes")}</p>
                        <p className="upload-hint">{translate("maxFileSize")}</p> */}
                    </div>
                ) : (
                    <div className="selected-file">
                        <div className="file-info">
                            <FaFileAlt className="file-icon" />
                            <span className="file-name">{file.name}</span>
                        </div>
                        <button 
                            className="remove-file-btn"
                            onClick={removeFile}
                        >
                            <FaTimesCircle />
                        </button>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="modal-footer">
                    <Button onClick={onClose} disabled={isUploading}>
                        {translate("cancel")}
                    </Button>
                    <button
                        className="upload-receipt-submit"
                        onClick={handleSubmit}
                        disabled={!file || isUploading}
                    >
                        {isUploading ? translate("uploading") : translate("reupload")}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default UploadReceiptModal; 