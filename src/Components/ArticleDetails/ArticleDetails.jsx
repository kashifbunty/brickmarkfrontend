"use client";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

import Image from "next/image";
import { IoMdArrowDropright } from "react-icons/io";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import Loader from "@/Components/Loader/Loader";
import Skeleton from "react-loading-skeleton";
import { placeholderImage, translate } from "@/utils/helper";
import { languageData } from "@/store/reducer/languageSlice";
import { GetAllArticlesApi } from "@/store/actions/campaign";
import { store } from "@/store/store";
import ArticleCard from "@/Components/Cards/ArticleCard";
import { categoriesCacheData, getArticleId } from "@/store/reducer/momentSlice";
import Layout from "../Layout/Layout";
import { settingsData } from "@/store/reducer/settingsSlice";
import ReactShare from "@/Components/ShareUrl/ReactShare";
import toast from "react-hot-toast";

const ArticleDetails = () => {
  const router = useRouter();
  const currentUrl = `${process.env.NEXT_PUBLIC_WEB_URL}${router.asPath}`;

  const articleId = router.query;
  const Categorydata = useSelector(categoriesCacheData);
  const settings = useSelector(settingsData);
  const CompanyName = settings && settings.company_name;
  const [isLoading, setIsLoading] = useState(false);
  const [articleData, setArticleData] = useState();
  const [similerArticles, setSimilerArticles] = useState([]);
  const [expandedStates, setExpandedStates] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    GetAllArticlesApi({
      slug_id: articleId.slug,
      onSuccess: (response) => {
        const AData = response.data[0];
        setIsLoading(false);
        setArticleData(AData);
        setSimilerArticles(response.similar_articles);
      },
      onError: (error) => {
        console.log(error);
        setIsLoading(true);
      },
    });
  }, [articleId]);

  const getArticlesByCategory = (cateId) => {
    getArticleId(cateId);
    router.push("/articles");
  };
  const lang = useSelector(languageData);

  useEffect(() => {}, [lang]);

  const breakpoints = {
    320: {
      slidesPerView: 1,
    },
    375: {
      slidesPerView: 1.5,
    },
    576: {
      slidesPerView: 1.5,
    },
    768: {
      slidesPerView: 2,
    },
    992: {
      slidesPerView: 2,
    },
    1200: {
      slidesPerView: 3,
    },
    1400: {
      slidesPerView: 4,
    },
  };
  const language = store.getState().Language.languages;


  const handleCopyUrl = async (e) => {
    e.preventDefault();

    // Get the current URL from the router

    try {
      // Use the Clipboard API to copy the URL to the clipboard
      await navigator.clipboard.writeText(currentUrl);
      toast.success(translate("copuyclipboard"));
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      // toast.error("Failed to copy URL to clipboard.");
    }
  };

  return (
    <Layout>
      <Breadcrumb title={translate("articleDetails")} />
      <div className="all-articles">
        <div id="all-articles-deatil-content">
          <div className="container">
            <div className="row" id="main-content">
              <div className="col-12 col-md-6 col-lg-9">
                <div className="all-article-rightside">
                  <div className="article_all_deatil_card">
                    <div className="card">
                      {isLoading ? (
                        // Show skeleton loading when data is being fetched
                        <div className="col-12 loading_data">
                          <Skeleton height={20} count={20} />
                        </div>
                      ) : (
                        <>
                          <div className="container">
                            <div className="article_img_div">
                              <Image
                                loading="lazy"
                                src={articleData && articleData.image}
                                alt="no_img"
                                className="article_title_img"
                                width={200}
                                height={200}
                                onError={placeholderImage}
                              />
                            </div>

                            <div className="article_title">
                              {articleData && articleData.title}
                            </div>
                            {/* // Render the privacy policy data when not loading */}
                            <div
                              className="article_deatils_description"
                              dangerouslySetInnerHTML={{
                                __html:
                                  (articleData && articleData.description) ||
                                  "",
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <div className="all-articles-leftside">
                  <div className="cate-card">
                    <div className="card">
                      <div className="card-header">
                        {translate("categories")}
                      </div>
                      <div className="card-body">
                        {Categorydata &&
                          Categorydata.map((elem, index) => (
                            <div className="cate-list" key={index}>
                              <span>{elem.category}</span>
                              <IoMdArrowDropright
                                size={25}
                                className="cate_list_arrow"
                                style={{
                                  transform: `rotate(${language.rtl === 1 ? "180deg" : "0deg"})`,
                                }}
                                onClick={() => getArticlesByCategory(elem.id)}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                  {/* {process.env.NEXT_PUBLIC_SEO === "true" ? ( */}
                  <div className="share-card">
                    <ReactShare
                      CompanyName={CompanyName}
                      data={articleData?.title}
                      handleCopyUrl={handleCopyUrl}
                      currentUrl={currentUrl}
                    />
                  </div>
                  {/* ) : null} */}
                </div>
              </div>
            </div>
            {similerArticles?.length > 0 && (
              <div id="related_articles_section">
                <div className="related-headline">
                  <span className="headline">
                    {translate("related")}{" "}
                    <span>
                      <span className=""> {translate("articles")}</span>
                    </span>
                  </span>
                </div>
                <div className="related_articles_slider">
                  <Swiper
                    key={language.rtl}
                    dir={language.rtl === 1 ? "rtl" : "ltr"}
                    slidesPerView={4}
                    spaceBetween={30}
                    freeMode={true}
                    pagination={{
                      clickable: true,
                    }}
                    modules={[FreeMode, Pagination]}
                    className="related-swiper"
                    breakpoints={breakpoints}
                  >
                    {isLoading ? (
                      // Show skeleton loading when data is being fetched

                      <Loader />
                    ) : (
                      similerArticles?.map((ele, index) => (
                        <SwiperSlide id="related-swiper-slider" key={ele.id}>
                          <ArticleCard
                            ele={ele}
                            expandedStates={expandedStates}
                            language={lang}
                          />
                        </SwiperSlide>
                      ))
                    )}
                  </Swiper>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ArticleDetails;
