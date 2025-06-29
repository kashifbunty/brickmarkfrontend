import React, { useState } from 'react';
import { Select, Button } from 'antd';
import { IoIosArrowDown } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { settingsData } from '@/store/reducer/settingsSlice';
import { changePropertyTypeStatusApi, updatePropertyStatusApi } from '@/store/actions/campaign';
import { translate } from '@/utils/helper';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const { Option } = Select;

const ChangePropertyTypeStatusCard = ({ id, propertyType, onStatusChange }) => {
    const [status, setStatus] = useState(propertyType || '');
    const SettingsData = useSelector(settingsData);

    // Get available options based on current property type
    const getStatusOptions = () => {
        switch (propertyType) {
            case 'sell':
                return [{ value: '2', label: translate("sold") }];
            case 'rent':
                return [{ value: '3', label: translate("rented") }];
            case 'rented':
                return [{ value: '1', label: translate("rent") }];
            case 'sold':
                return [{ value: '0', label: translate("sell") }];
            default:
                return [];
        }
    };

    const handleSave = () => {
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

        updatePropertyStatusApi({
            property_id: id,
            status: status,
            onSuccess: () => {
                toast.success(translate("statusUpdatedSuccessfully"));
                onStatusChange && onStatusChange();
            },
            onError: (error) => {
                toast.error(error || translate("failedToUpdateStatus"));
            }
        });
    };


    // Only render the card if there are available options
    const statusOptions = getStatusOptions();
    if (statusOptions.length === 0) return null;

    return (
        <div className="status-change-card card">
            <div className="card_header">
            <h2>{translate("changePropertyType")}</h2>
            </div>

            <div className="status-field">
                <label>{translate("status")}</label>
                <Select
                    value={status}
                    onChange={setStatus}
                    className="status-select"
                    suffixIcon={<IoIosArrowDown />}
                >
                    {statusOptions.map(option => (
                        <Option key={option.value} value={option.value}>
                            {translate(option.label)}
                        </Option>
                    ))}
                </Select>
            </div>
            <div className="card-footer">
                <button
                    onClick={handleSave}
                    className="save-button"
                >
                    {translate("save")}
                </button>
            </div>
        </div>
    );
};

export default ChangePropertyTypeStatusCard;