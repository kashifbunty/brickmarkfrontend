import React, { useState } from "react";
import { Select, Button } from "antd";
import { IoIosArrowDown } from "react-icons/io";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/reducer/settingsSlice";
import { changeProjectStatusApi, changePropertyStatusApi } from "@/store/actions/campaign";
import { translate } from "@/utils/helper";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const { Option } = Select;

const ChangeStatusCard = ({
  id,
  currentStatus,
  onStatusChange,
  fetchDetails,
  isProject,
}) => {
  
  // States and Selectors
  const [status, setStatus] = useState(
    currentStatus === 1 ? "Active" : "Deactive"
  );
  const SettingsData = useSelector(settingsData);

  // Status Options
  const statusOptions = [
    { value: "Active", label: translate("active") },
    { value: "Deactive", label: translate("deactive") },
  ];

  // Check for demo mode
  const checkDemoMode = () => {
    if (SettingsData?.demo_mode) {
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
      return true;
    }
    return false;
  };

  // Handle status change
  const handleSave = () => {
    if (checkDemoMode()) return;

    const newStatus = status === "Active" ? 1 : 0;
    if (isProject) {
      changeProjectStatusApi({
        project_id: id,
        status: newStatus,
        onSuccess: () => {
          toast.success(translate("statusUpdatedSuccessfully"));
          onStatusChange?.();
          fetchDetails();
        },
        onError: (error) => {
          toast.error(error || translate("failedToUpdateStatus"));
        },
      });
    } else {
      changePropertyStatusApi({
        property_id: id,
        status: newStatus,
        onSuccess: () => {
          toast.success(translate("statusUpdatedSuccessfully"));
          onStatusChange?.();
          fetchDetails();
        },
        onError: (error) => {
          toast.error(error || translate("failedToUpdateStatus"));
        },
      });
    }
  };

  return (
    <div className="status-change-card card">
      <div className="card_header">
        <h2>
          {translate(
            isProject ? "changeProjectStatus" : "changePropertyStatus"
          )}
        </h2>
      </div>

      <div className="status-field">
        <label>{translate("status")}</label>
        <Select
          value={status}
          onChange={setStatus}
          className="status-select"
          suffixIcon={<IoIosArrowDown />}
        >
          {statusOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {translate(option?.label)}
            </Option>
          ))}
        </Select>
      </div>
      <div className="card-footer">
        <button onClick={handleSave} className="save-button">
          {translate("save")}
        </button>
      </div>
    </div>
  );
};

export default ChangeStatusCard;
