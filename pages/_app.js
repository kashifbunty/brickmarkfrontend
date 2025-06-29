"use client";
import React, { Suspense, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "../src/store/store";
import { Fragment } from "react";

import { Router } from "next/router";
import NProgress from "nprogress";

import { Toaster } from "react-hot-toast";
import PushNotificationLayout from "@/Components/firebaseNotification/PushNotificationLayout";
import InspectElement from "@/Components/InspectElement/InspectElement";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "../public/css/style.css";
import "../public/css/responsive.css";
import "@/Components/Cards/subscriptioncard.css";
import "bootstrap/dist/css/bootstrap.css";
import "react-loading-skeleton/dist/skeleton.css";
import "nprogress/nprogress.css";
import Loader from "@/Components/Loader/Loader";
import { getCurrentLocationData } from "@/utils/locationHelper";
import Head from "next/head";

// provide the default query function to your app with defaultOptions
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 600000,
      refetchOnWindowFocus: false, // default: true
    },
  },
});

function MyApp({ Component, pageProps, data }) {
  Router.events.on("routeChangeStart", () => {
    NProgress.start();
  });
  Router.events.on("routeChangeError", () => {
    NProgress.done();
  });
  Router.events.on("routeChangeComplete", () => {
    NProgress.done();
  });



  // Function to request location permission
  const requestLocationPermission = async () => {
    if ("geolocation" in navigator) {

      // Use getCurrentLocationData with proper callbacks
      getCurrentLocationData(
        (locationData) => {
          // Success callback
          console.log("Location successfully retrieved:", locationData);
        },
        (error) => {
          // Error callback
          console.error("Error getting location:", error);
        }
      );
    } else {
      // Geolocation is not supported
      console.error("Geolocation is not supported by this browser");
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const settingsData = store.getState().Settings?.data;
  const favicon = settingsData?.web_favicon;

  return (
    <Fragment>
      <Head>
        <link
          rel="shortcut icon"
          href={favicon ? favicon : "/favicon.ico"}
          sizes="32x32"
          type="image/png"
        />
      </Head>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <InspectElement>
            <PushNotificationLayout>
              <Suspense fallback={<Loader />}>
                <Component {...pageProps} data={data} />
              </Suspense>
            </PushNotificationLayout>
          </InspectElement>
          <Toaster />
        </Provider>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </Fragment>
  );
}

export default MyApp;
