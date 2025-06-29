"use client"
import { translate } from "@/utils/helper";
import { Popover } from "antd";
import React from "react";
import { BsFillQuestionCircleFill } from "react-icons/bs";

const CustomPopoverTooltip = ({ text }) => {
  const content = (
    <div
      style={{
        maxWidth: "250px", // Set max width
        whiteSpace: "normal", // Allow text wrapping
        wordWrap: "break-word", // Break long words
        overflowWrap: "break-word", // Ensure wrapping for long words
      }}
    >
      {text || translate("noReasonProvided")}
    </div>
  );

  return (
    <Popover
      content={content}
      title={translate("rejectReason")}
      placement="top"
      trigger="hover"
    >
      <BsFillQuestionCircleFill size={20} />
    </Popover>
  );
};

export default CustomPopoverTooltip;
