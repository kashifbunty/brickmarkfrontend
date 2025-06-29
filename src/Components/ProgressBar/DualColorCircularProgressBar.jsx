"use client";
import { translate } from "@/utils/helper";
import React from "react";

const DualColorCircularProgressBar = ({
    ele,
    propertyUsed,
    projectUsed,
    propertyLimit,
    projectLimit,
    isPropertyUnlimited,
    isProjectUnlimited,
    isPropertyIncluded,
    isProjectIncluded
}) => {
    const radius = 45;

    // ==============================
    // CASE 4 & 5 - One Not Included OR One Unlimited & One Limited (show only the limited one)
    // ==============================
    if (
        !isPropertyIncluded || !isProjectIncluded || 
        (isPropertyUnlimited !== isProjectUnlimited) // One unlimited, the other limited
    ) {
        const showProperty = isPropertyIncluded && !isPropertyUnlimited;
        const showProject = isProjectIncluded && !isProjectUnlimited;

        return (
            <SingleArc
                radius={radius}
                used={showProperty ? propertyUsed : projectUsed}
                limit={showProperty ? propertyLimit : projectLimit}
                isUnlimited={false} // We only show the limited one in this case
                color={showProperty ? "#FF008A" : "#0754FC"}
                caseNumber="4/5"
            />
        );
    }

    // ==============================
    // CASE 2 - Both Unlimited
    // ==============================
    if (isPropertyUnlimited && isProjectUnlimited) {
        return <FullCircleUnlimited radius={radius} caseNumber="2" />;
    }

    // ==============================
    // CASE 3 - One Unlimited, One Limited (only if both are visible and you want to show both)
    // Note: This case is now optional, depending on your product decision.
    // ==============================
    if (isPropertyUnlimited || isProjectUnlimited) {
        return (
            <HalfHalfSplit
                radius={radius}
                propertyUsed={propertyUsed}
                projectUsed={projectUsed}
                propertyLimit={propertyLimit}
                projectLimit={projectLimit}
                isPropertyUnlimited={isPropertyUnlimited}
                isProjectUnlimited={isProjectUnlimited}
                caseNumber="3"
            />
        );
    }

    // ==============================
    // CASE 1 - Both Limited
    // ==============================
    return (
        <ProportionalSplit
            radius={radius}
            propertyUsed={propertyUsed}
            projectUsed={projectUsed}
            propertyLimit={propertyLimit}
            projectLimit={projectLimit}
            caseNumber="1"
        />
    );
};

// ==============================
// Case 2 - Both Unlimited
// ==============================
const FullCircleUnlimited = ({ radius, caseNumber }) => (
    <SvgBase radius={radius} centerText={translate("unlimited")} caseNumber={caseNumber}>
        <ColoredArc radius={radius} color="#FF008A" />
        <ColoredArc radius={radius} color="#0754FC" rotate />
    </SvgBase>
);

// ==============================
// Case 3 - One Unlimited, One Limited (optional visual)
// ==============================
const HalfHalfSplit = ({
    radius,
    propertyUsed,
    projectUsed,
    propertyLimit,
    projectLimit,
    isPropertyUnlimited,
    isProjectUnlimited,
    caseNumber,
}) => {
    const halfCircumference = Math.PI * radius;

    const propertyUnusedPercent = isPropertyUnlimited
        ? 100
        : 100 - (propertyUsed / propertyLimit) * 100;

    const projectUnusedPercent = isProjectUnlimited
        ? 100
        : 100 - (projectUsed / projectLimit) * 100;

    const propertyText = isPropertyUnlimited
        ? translate("unlimited")
        : `${propertyUsed}/${propertyLimit}`;
    const projectText = isProjectUnlimited
        ? translate("unlimited")
        : `${projectUsed}/${projectLimit}`;

    return (
        <SvgBase radius={radius} centerText={`${propertyText} | ${projectText}`} caseNumber={caseNumber}>
            <HalfArc radius={radius} color="#FF008A" percent={propertyUnusedPercent} offset={0} />
            <HalfArc radius={radius} color="#0754FC" percent={projectUnusedPercent} offset={halfCircumference} />
        </SvgBase>
    );
};

// ==============================
// Case 1 - Both Limited
// ==============================
const ProportionalSplit = ({
    radius,
    propertyUsed,
    projectUsed,
    propertyLimit,
    projectLimit,
    caseNumber,
  }) => {
    const totalLimit = propertyLimit + projectLimit;
    const totalUsed = propertyUsed + projectUsed;
    const propertyUnused = propertyLimit - propertyUsed;
    const projectUnused = projectLimit - projectUsed;
  
    // Check if both property and project are fully unused
    const bothUnused = propertyUsed === 0 && projectUsed === 0;
  
    if (bothUnused) {
      return (
        <SvgBase radius={radius} centerText={`${totalUsed}/${totalLimit}`} caseNumber={caseNumber}>
          {/* Property Unused - Pink - 180° */}
          <ArcSection radius={radius} color="#FF008A" percent={50} offset={0} />
          {/* Project Unused - Blue - 180° */}
          <ArcSection radius={radius} color="#0754FC" percent={50} offset={50} />
        </SvgBase>
      );
    }
  
    const propertyUnusedPercent = (propertyUnused / totalLimit) * 100;
    const projectUnusedPercent = (projectUnused / totalLimit) * 100;
    const totalUsedPercent = (totalUsed / totalLimit) * 100;
  
    return (
      <SvgBase radius={radius} centerText={`${totalUsed}/${totalLimit}`} caseNumber={caseNumber}>
        {/* Property Unused - Pink */}
        <ArcSection radius={radius} color="#FF008A" percent={propertyUnusedPercent} offset={0} />
        {/* Project Unused - Blue */}
        <ArcSection radius={radius} color="#0754FC" percent={projectUnusedPercent} offset={propertyUnusedPercent} />
        {/* Total Used - Gray */}
        <ArcSection radius={radius} color="#D3D3D3" percent={totalUsedPercent} offset={propertyUnusedPercent + projectUnusedPercent} />
      </SvgBase>
    );
  };
  
  

// ==============================
// Case 4 & 5 - Show Only Limited One
// ==============================
const SingleArc = ({ radius, used, limit, color, caseNumber }) => {
    const unusedPercent = 100 - (used / limit) * 100;
    const centerText = `${used}/${limit}`;

    return (
        <SvgBase radius={radius} centerText={centerText} caseNumber={caseNumber}>
            <ArcSection radius={radius} color={color} percent={unusedPercent} offset={0} />
            <ArcSection radius={radius} color="#f0f0f0" percent={100 - unusedPercent} offset={unusedPercent} />
        </SvgBase>
    );
};

// ==============================
// Shared Components
// ==============================
const SvgBase = ({ radius, children, centerText, caseNumber }) => (
    <svg width="100" height="100" viewBox="0 0 100 100">
        {children}
        <text x="50" y="54" textAnchor="middle" fontWeight="bold" fontSize="12px" fill="black">
            {centerText}
        </text>
        {/* <CaseNumberText caseNumber={caseNumber} /> */}
    </svg>
);


const ColoredArc = ({ radius, color, rotate = false }) => (
    <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${Math.PI * radius} ${Math.PI * radius}`}
        strokeDashoffset={rotate ? -Math.PI * radius : 0}
        transform="rotate(-90 50 50)"
    />
);

const HalfArc = ({ radius, color, percent, offset }) => {
    const halfCircumference = Math.PI * radius;
    const unusedLength = (percent / 100) * halfCircumference;

    return (
        <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${unusedLength} ${halfCircumference}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 50 50)"
        />
    );
};

const ArcSection = ({ radius, color, percent, offset }) => {
    const circumference = 2 * Math.PI * radius;
    return (
        <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
            strokeDashoffset={-(offset / 100) * circumference}
            transform="rotate(-90 50 50)"
        />
    );
};

export default DualColorCircularProgressBar;
