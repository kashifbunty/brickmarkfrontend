"use client";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import React, { useEffect, useState } from "react";

import AgentCard from "@/Components/Cards/AgentCard";
import AgentCardSkeleton from "@/Components/Skeleton/AgentCardSkeleton";
import { translate } from "@/utils/helper";
import { useSelector } from "react-redux";
import { languageData } from "@/store/reducer/languageSlice";
import Layout from "@/Components/Layout/Layout";
import { getAgentListApi } from "@/store/actions/campaign";
import Swal from "sweetalert2";
import { settingsData } from "@/store/reducer/settingsSlice";
import LoginModal from "../LoginModal/LoginModal";
import { useRouter } from "next/router";
import { saveIsProject } from "@/store/reducer/momentSlice";

const AllAgents = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [agentsList, setAgentsList] = useState([]);
  const lang = useSelector(languageData);
  const [offsetdata, setOffsetdata] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true); // Track if there's more data to load
  const limit = 8;

  const [showModal, setShowModal] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
  };
  useEffect(() => {}, [lang]);

  const fetchAgentList = () => {
    try {
      if (offsetdata === 0) {
        setIsLoading(true);
      }
      getAgentListApi({
        offset: offsetdata.toString(),
        limit: limit.toString(),
        onSuccess: (res) => {
          setIsLoading(false);
          setAgentsList((prevListings) => {
            // Deduplicate by checking for unique IDs
            const newAgents = res?.data.filter(
              (newAgent) =>
                !prevListings.some(
                  (existingAgent) => existingAgent.id === newAgent.id
                )
            );
            return [...prevListings, ...newAgents];
          });
          setHasMoreData(res?.data.length === limit);
        },
        onError: (err) => {
          console.log(err);
          setIsLoading(true);
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAgentList();
  }, [offsetdata]);
  const handleLoadMore = () => {
    const newOffset = offsetdata + limit;
    setOffsetdata(newOffset);
  };

  const handlecheckPremiumUserAgent = (e, ele) => {
    e.preventDefault();
    if (ele?.property_count === 0 && ele?.projects_count !== 0) {
      router.push(
        `/agent-details/${ele?.slug_id}${ele?.is_admin ? "?is_admin=1" : ""}`
      );
      saveIsProject(true);
    } else {
      router.push(
        `/agent-details/${ele?.slug_id}${ele?.is_admin ? "?is_admin=1" : ""}`
      );
      saveIsProject(false);
    }
  };
  
  return (
    <Layout>
      <Breadcrumb title={translate("allAgents")} />
      <section id="all_agents_section">
        <div className="container">
          <div id="feature_cards" className="row">
            {isLoading
              ? Array.from({ length: agentsList ? agentsList.length : 12 }).map(
                  (_, index) => (
                    <div
                      className="col-sm-12 col-md-6 col-lg-3 loading_data"
                      key={index}
                    >
                      <AgentCardSkeleton />
                    </div>
                  )
                )
              : agentsList?.map((ele) => (
                  <div className="col-sm-12 col-md-6 col-lg-3" key={ele.id}>
                    <AgentCard
                      ele={ele}
                      handlecheckPremiumUserAgent={handlecheckPremiumUserAgent}
                    />
                  </div>
                ))}

            {agentsList && agentsList.length > 0 && hasMoreData ? (
              <div className="col-12 loadMoreDiv" id="loadMoreDiv">
                <button className="loadMore" onClick={handleLoadMore}>
                  {translate("loadmore")}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
      {showModal && (
        <LoginModal isOpen={showModal} onClose={handleCloseModal} />
      )}
    </Layout>
  );
};

export default AllAgents;
