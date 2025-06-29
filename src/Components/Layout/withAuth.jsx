"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { isLogin, translate } from "@/utils/helper";
import Loader from "../Loader/Loader";
import Swal from "sweetalert2";
import { store } from "@/store/store";

const withAuth = (WrappedComponent) => {
  const Wrapper = (props) => {
    const router = useRouter();
    const isLoggedIn = isLogin();


    const userData = store.getState()?.user?.data;
    const hasSubscription = store.getState().Settings?.data?.subscription;
    const isPremiumUser = store.getState().Settings?.data?.features_available || {};

    const allowedProjectAccess = isPremiumUser.project_access;
    const allowedPremiumPropertyAccess = isPremiumUser.premium_properties;

    const [isAuthorized, setIsAuthorized] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
      const privateRoutes = [
        "/user/advertisement",
        "/user/chat",
        "/user/dashboard",
        "/user/profile",
        "/user/edit-property",
        "/user/edit-project",
        "/user/favorites-properties",
        "/user/personalize-feed",
        "/user/subscription",
        "/user/notifications",
        "/user/transaction-history",
        "/user/interested",
        "/user/projects",
        "/user/verification-form",
        "/my-property",
        "/user-register",
        "/my-project"
      ];

      const subscriptionRoutes = ["/user/properties", "/user/add-project"];

      const currentPath = router.asPath;

      const isPrivateRoute = privateRoutes.some((route) =>
        currentPath.startsWith(route)
      );
      
      const isSubscriptionRoute = subscriptionRoutes.some((route) =>
        currentPath.startsWith(route)
      );

      const isProjectDetailsRoute = currentPath.startsWith("/project-details");

      if (isPrivateRoute && !isLoggedIn) {
        router.push("/");
      }
      // else if (isSubscriptionRoute && !hasSubscription) {
      //   Swal.fire({
      //     title: translate("opps"),
      //     text: translate("subscriptionRequired") || "A subscription is required to access this feature.",
      //     icon: "warning",
      //     allowOutsideClick: false,
      //     showCancelButton: false,
      //     customClass: {
      //       confirmButton: "Swal-confirm-buttons",
      //       cancelButton: "Swal-cancel-buttons",
      //     },
      //     confirmButtonText: translate("ok"),
      //   }).then((result) => {
      //     if (result.isConfirmed) {
      //       router.push("/subscription-plan");
      //     }
      //   });
      // }
      else if (isProjectDetailsRoute && !allowedProjectAccess) {
        Swal.fire({
          title: translate("opps"),
          text: translate("projectAccessLimitOrPackageNotAvailable") || "You don't have access to project details",
          icon: "warning",
          allowOutsideClick: false,
          showCancelButton: false,
          customClass: {
            confirmButton: "Swal-confirm-buttons",
            cancelButton: "Swal-cancel-buttons",
          },
          confirmButtonText: translate("ok"),
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/subscription-plan");
          }
        });
      }
      else {
        setIsAuthorized(true);
      }

      setAuthChecked(true);
    }, [userData, router, hasSubscription, isPremiumUser]);

    if (!authChecked) {
      return <Loader />;
    }

    return isAuthorized ? <WrappedComponent {...props} /> : null;
  };

  return Wrapper;
};

export default withAuth;
