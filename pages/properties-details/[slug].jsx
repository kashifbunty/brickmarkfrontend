import React from 'react';
import axios from 'axios';
import Meta from '@/Components/Seo/Meta';
import dynamic from 'next/dynamic';
import { GET_PROPETRES } from '@/utils/api';

const PropertyDetails = dynamic(
  () => import('@/Components/PropertyDetails/PropertyDetails'),
  { ssr: false }
);

const fetchDataFromSeo = async (slug) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_PROPETRES}?slug_id=${slug}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching SEO data:", error);
    return null;
  }
};

export async function getStaticPaths() {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-property-list`
    );

    const paths = (response.data?.data || []).map((property) => ({
      params: { slug: property.slug_id },
    }));

    return {
      paths,
      fallback: false, // Pre-render all pages at build time
    };
  } catch (error) {
    console.error('Error in getStaticPaths:', error);
    return { paths: [], fallback: false };
  }
}

export async function getStaticProps({ params }) {
  const slug = params.slug;
  const seoData = await fetchDataFromSeo(slug);
  const currentURL = `${process.env.NEXT_PUBLIC_WEB_URL}/properties-details/${slug}/`;

  return {
    props: {
      seoData,
      currentURL,
    },
  };
}

const PropertyPage = ({ seoData, currentURL }) => {
  return (
    <>
      <Meta
        title={seoData?.data?.[0]?.meta_title || ''}
        description={seoData?.data?.[0]?.meta_description || ''}
        keywords={seoData?.data?.[0]?.meta_keywords || ''}
        ogImage={seoData?.data?.[0]?.meta_image || ''}
        pathName={currentURL}
      />
      <PropertyDetails />
    </>
  );
};

export default PropertyPage;
