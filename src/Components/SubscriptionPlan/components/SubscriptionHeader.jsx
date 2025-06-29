import React from 'react';
import { translate } from '@/utils/helper';

const SubscriptionHeader = () => {
  return (
    <div>
      <span className="headline">
        {translate("chooseA")}{" "}
        <span>
          <span className=""> {translate("plan")}</span>
        </span>{" "}
        {translate("thatsRightForYou")}
      </span>
    </div>
  );
};

export default SubscriptionHeader; 