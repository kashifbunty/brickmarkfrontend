import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Layout from '../Layout/Layout';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import { SlLocationPin } from "react-icons/sl";
import { formatPriceAbbreviated, translate } from '@/utils/helper';
import { comparePropertiesApi } from '@/store/actions/campaign';
import { settingsData } from '@/store/reducer/settingsSlice';

const CompareProperties = () => {
    const router = useRouter();
    const { slug } = router.query;

    const slugString = Array.isArray(slug) ? slug[0] : slug || "";
    const [sourcePropertyId, targetPropertyId] = slugString.split("-vs-");

    const [properties, setProperties] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const systemSettingsData = useSelector(settingsData);
    const DistanceSymbol = systemSettingsData?.distance_option;

    useEffect(() => {
        if (sourcePropertyId && targetPropertyId) {
            fetchPropertiesData();
        }
    }, [sourcePropertyId, targetPropertyId]);

    const fetchPropertiesData = async () => {
        try {
            comparePropertiesApi({
                source_property_id: sourcePropertyId,
                target_property_id: targetPropertyId,
                onSuccess: (response) => {
                    setProperties(response.data);
                    setLoading(false);
                },
                onError: (err) => {
                    setError(err);
                    setLoading(false);
                }
            });
        } catch (err) {
            setError("Failed to fetch properties");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <Breadcrumb title={translate("compareProperties")} />
                <div className="container py-5">Loading...</div>
            </Layout>
        );
    }

    if (error || !properties?.source_property || !properties?.target_property) {
        return (
            <Layout>
                <Breadcrumb title={translate("compareProperties")} />
                <div className="container py-5 text-center">
                    <h3>{error || "Properties not found"}</h3>
                    <button className="btn btn-primary mt-3" onClick={() => router.back()}>
                        Go Back
                    </button>
                </div>
            </Layout>
        );
    }

    const sourceProperty = properties.source_property;
    const targetProperty = properties.target_property;

    const getFacilityValue = (property, facilityName, defaultValue = "N/A") => {
        const facility = property.facilities?.find(f => f.name === facilityName);
        if (!facility) return defaultValue;
        let value = facility.value;

        if (Array.isArray(value)) {
            return <>{value.join(", ")}</>;
        }

        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return <>{parsed.join(", ")}</>;
            } else if (typeof parsed === 'object') {
                return <>{Object.values(parsed).join(", ")}</>;
            }
        } catch (e) {
            // Not JSON
        }

        if (typeof value === 'string') {
            value = value.replace(/^"|"$/g, '');
        }

        return value;
    };

    const formatListingDate = (dateString) => {
        if (!dateString) return "Recently Added";
        const date = new Date(dateString);
        const now = new Date();
        const months = Math.floor((now - date) / (1000 * 60 * 60 * 24 * 30));
        return `${months} Months Ago`;
    };

    const getPlaceDistance = (places, placeName) => {
        const place = places.find(p => p.name === placeName);
        return place ? `${place.distance} ${DistanceSymbol}` : "N/A";
    };

    return (
        <Layout>
            <Breadcrumb title={translate("compareProperties")} />
            <div id="compare-properties">
                <div className="container py-5">

                    {/* ✅ Image block placed properly */}
                    <div className="compare-images" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <h4>{sourceProperty.title}</h4>
                            <img
                                src={sourceProperty.title_image_url}
                                alt={sourceProperty.title}
                                style={{ width: '300px', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                        </div>
                        <div>
                            <h4>{targetProperty.title}</h4>
                            <img
                                src={targetProperty.title_image_url}
                                alt={targetProperty.title}
                                style={{ width: '300px', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                        </div>
                    </div>

                    {/* ✅ Comparison Table */}
                    <div className="comparison-table-container mt-5">
                        <div className="table-responsive-wrapper">
                            <table className="comparison-table">
                                <thead>
                                    <tr>
                                        <th>{translate("comparisonDetails")}</th>
                                        <th>{translate("propertyA")}</th>
                                        <th>{translate("propertyB")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{translate("propertyName")}</td>
                                        <td>{sourceProperty.title}</td>
                                        <td>{targetProperty.title}</td>
                                    </tr>
                                    <tr>
                                        <td>{translate("locationName")}</td>
                                        <td>{`${sourceProperty.city || ""}, ${sourceProperty.state || ""}, ${sourceProperty.country || ""}`}</td>
                                        <td>{`${targetProperty.city || ""}, ${targetProperty.state || ""}, ${targetProperty.country || ""}`}</td>
                                    </tr>
                                    <tr>
                                        <td>{translate("listingDate")}</td>
                                        <td>{formatListingDate(sourceProperty.created_at)}</td>
                                        <td>{formatListingDate(targetProperty.created_at)}</td>
                                    </tr>
                                    <tr>
                                        <td>{translate("price")}</td>
                                        <td>${Number(sourceProperty.price || 0).toLocaleString()}</td>
                                        <td>${Number(targetProperty.price || 0).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td>{translate("propertyViews")}</td>
                                        <td>{sourceProperty.total_views || 0}</td>
                                        <td>{targetProperty.total_views || 0}</td>
                                    </tr>
                                    <tr>
                                        <td>{translate("propertyLikes")}</td>
                                        <td>{sourceProperty.total_likes || 0}</td>
                                        <td>{targetProperty.total_likes || 0}</td>
                                    </tr>

                                    {/* Facilities */}
                                    {(() => {
                                        const allNames = new Set([
                                            ...(sourceProperty.facilities || []).map(f => f.name),
                                            ...(targetProperty.facilities || []).map(f => f.name),
                                        ]);
                                        const names = Array.from(allNames).sort();
                                        return names.map((name, idx) => (
                                            <tr key={name}>
                                                <td>{name}</td>
                                                <td>{getFacilityValue(sourceProperty, name)}</td>
                                                <td>{getFacilityValue(targetProperty, name)}</td>
                                            </tr>
                                        ));
                                    })()}

                                    {/* Nearby Places */}
                                    {(() => {
                                        const sourcePlaces = sourceProperty.near_by_places || [];
                                        const targetPlaces = targetProperty.near_by_places || [];
                                        const allPlaces = new Set([
                                            ...sourcePlaces.map(p => p.name),
                                            ...targetPlaces.map(p => p.name)
                                        ]);
                                        const placeNames = Array.from(allPlaces).sort();
                                        return placeNames.map((placeName, idx) => (
                                            <tr key={placeName}>
                                                <td>{placeName}</td>
                                                <td>{getPlaceDistance(sourcePlaces, placeName)}</td>
                                                <td>{getPlaceDistance(targetPlaces, placeName)}</td>
                                            </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CompareProperties;