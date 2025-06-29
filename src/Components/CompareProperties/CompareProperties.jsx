import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Layout from '../Layout/Layout';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import { FaMapMarkerAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { formatPriceAbbreviated, translate } from '@/utils/helper';
import { comparePropertiesApi } from '@/store/actions/campaign';
import { getComparePropertyData } from '@/store/reducer/momentSlice';
import { SlLocationPin } from "react-icons/sl";
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
    const DistanceSymbol =
    systemSettingsData && systemSettingsData?.distance_option;

    useEffect(() => {
        if (sourcePropertyId && targetPropertyId) {
            fetchPropertiesData();
        }
    }, [sourcePropertyId, targetPropertyId]);

    // Fetch property data using IDs from Redux
    const fetchPropertiesData = async () => {
        try {
            comparePropertiesApi({
                source_property_id: sourcePropertyId,
                target_property_id: targetPropertyId,
                onSuccess: (response) => {
                    const data = response.data;
                    setProperties(data);
                    setLoading(false);
                },
                onError: (error) => {
                    setError(error);
                    setLoading(false);
                }
            });
        } catch (error) {
            console.error("Error fetching properties:", error);
            setError("Failed to fetch properties");
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <Layout>
                <Breadcrumb title={translate("compareProperties")} />
                <div id="compare-properties">
                    <div className="container py-5">
                        {/* Skeleton for Property Cards */}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="compare-property-card skeleton-card">
                                    <div className="compare-property-image skeleton-image"></div>
                                    <div className="compare-property-details">
                                        <div className="proeprtyTag skeleton-tag"></div>
                                        <div className="main-details skeleton-details">
                                            <div className="property-location skeleton-location"></div>
                                            <div className="property-title skeleton-title"></div>
                                            <div className="price-and-type">
                                                <span className="price skeleton-price"></span>
                                                <span className="property-type skeleton-type"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="compare-property-card skeleton-card">
                                    <div className="compare-property-image skeleton-image"></div>
                                    <div className="compare-property-details">
                                        <div className="proeprtyTag skeleton-tag"></div>
                                        <div className="main-details skeleton-details">
                                            <div className="property-location skeleton-location"></div>
                                            <div className="property-title skeleton-title"></div>
                                            <div className="price-and-type">
                                                <span className="price skeleton-price"></span>
                                                <span className="property-type skeleton-type"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Skeleton for Comparison Table */}
                        <div className="comparison-table-container mt-5">
                            <div className="table-responsive-wrapper">
                                <table className="comparison-table">
                                    <thead>
                                        <tr>
                                            <th className="skeleton-header"></th>
                                            <th className="skeleton-header"></th>
                                            <th className="skeleton-header"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array(8).fill().map((_, index) => (
                                            <tr key={index} className={index % 2 === 1 ? 'even-row' : ''}>
                                                <td className="skeleton-cell"></td>
                                                <td className="skeleton-cell"></td>
                                                <td className="skeleton-cell"></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error || !properties || !properties.source_property || !properties.target_property) {
        return (
            <Layout>
                <Breadcrumb title="Compare Properties" />
                <div className="container py-5">
                    <div className="row">
                        <div className="col-12 text-center">
                            <h3>{error}</h3>
                            <button
                                className="btn btn-primary mt-3"
                                onClick={() => router.back()}
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    const sourceProperty = properties.source_property;
    const targetProperty = properties.target_property;
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


    // Helper function to get facility value by name
    const getFacilityValue = (property, facilityName, defaultValue = "N/A") => {
        const facility = property.facilities?.find(f => f.name === facilityName);
        if (!facility) return defaultValue;
        
        // Clean the value if it has extra quotes from double JSON encoding
        let value = facility.value;
        
        // Handle array values (directly return comma-separated values)
        if (Array.isArray(value)) {
            return (
                <div className="facility-tags">
                    {value.map((item, idx) => (
                        <span key={idx} className="facility-tag">{item}</span>
                    ))}
                </div>
            );
        }
        
        // Check if value is a stringified array or object
        if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
            try {
                const parsedValue = JSON.parse(value);
                if (Array.isArray(parsedValue)) {
                    return (
                        <div className="facility-tags">
                            {parsedValue.map((item, idx) => (
                                <span key={idx} className="facility-tag">{item}</span>
                            ))}
                        </div>
                    );
                }
                // If it's an object with meaningful values, convert to string
                if (typeof parsedValue === 'object') {
                    const values = Object.values(parsedValue).filter(Boolean);
                    return (
                        <div className="facility-tags">
                            {values.map((item, idx) => (
                                <span key={idx} className="facility-tag">{item}</span>
                            ))}
                        </div>
                    );
                }
                // Use the parsed value if it's simpler
                value = parsedValue;
            } catch (e) {
                // If not a valid JSON, continue with string processing
            }
        }
        
        // Check if the value is a string with escaped quotes (like "\"3+\"" or "\"Yes\"")
        if (typeof value === 'string' && value.startsWith('"\\') && value.endsWith('\\"')) {
            // Strip the extra quotes
            value = value.replace(/^"\\"|\\""$/g, '').replace(/\\"/g, '"');
        }
        // Also handle simpler case of just extra quotes (like "\"3+\"")
        else if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
            try {
                // Try to parse it as JSON to remove the extra quotes
                value = JSON.parse(value);
            } catch (e) {
                // If parsing fails, just remove quotes manually
                if (value.length > 2) {
                    value = value.substring(1, value.length - 1);
                }
            }
        }
        
        // Format multiple values with commas (for checkbox type facilities)
        if (typeof value === 'string') {
            // Check if the value contains multiple words without separators
            if (value.match(/[A-Z][a-z]+[A-Z]/) || value.match(/[a-z][A-Z]/)) {
                // Add spaces before capital letters within words
                value = value.replace(/([a-z])([A-Z])/g, '$1 $2');
                
                // Handle common compound words by joining them with spaces first
                value = value.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
                
                // Split by spaces and join with commas for better readability
                const parts = value.split(' ').filter(Boolean);
                
                // Check if any part should be combined with the next part
                const combinedParts = [];
                for (let i = 0; i < parts.length; i++) {
                    // If this part is capitalized and short (likely an article or preposition)
                    if (i < parts.length - 1 && 
                        (parts[i].length <= 3 || 
                         ['and', 'with', 'for', 'of', 'in', 'on'].includes(parts[i].toLowerCase()))) {
                        combinedParts.push(parts[i] + ' ' + parts[i + 1]);
                        i++; // Skip the next part as it's been combined
                    } else {
                        combinedParts.push(parts[i]);
                    }
                }
                
                // Return tags for combined parts
                return (
                    <div className="facility-tags">
                        {combinedParts.map((item, idx) => (
                            <span key={idx} className="facility-tag">{item}</span>
                        ))}
                    </div>
                );
            }
    
        
        // // For simple values (Yes, No, numbers, etc.), return as single tag if they seem like features
        // if (typeof value === 'string' && ['Yes', 'No', 'Available', 'Not Available'].includes(value)) {
        //     return <span className="facility-tag">{value}</span>;
        // }
        
        // Return the regular value for non-tag items
        return value;
    };

    // Helper function to format date
    const formatListingDate = (dateString) => {
        if (!dateString) return "Recently Added";
        const date = new Date(dateString);
        const now = new Date();
        const months = Math.floor((now - date) / (1000 * 60 * 60 * 24 * 30));
        return `${months} Months Ago`;
    };

    return (
        <Layout>
            <Breadcrumb title={translate("compareProperties")} />
            <div id="compare-properties">
                <div className="container py-5">
                    {/* Property Cards */}
                <div className="row">
                        <div className="col-md-6">
                            <div className="compare-property-card">
                                <div className="compare-property-image">
                                    <img src={sourceProperty?.title_image_url} alt={sourceProperty.title} className='prop_img' />
                                </div>
                                <div className="compare-property-details">
                                    <div className="proeprtyTag">
                                        {translate("propertyA")}
                                    </div>
                                    <div className="main-details">
                                        <div className="property-location">
                                            <span><SlLocationPin size={16} />
                                            </span>
                                            <span>  {`${sourceProperty?.city ? sourceProperty?.city + ", " : ""}${sourceProperty?.state ? sourceProperty?.state + ", " : ""
                                                }${sourceProperty?.country || ""}`}</span>
                                        </div>
                                        <div className="property-title">{sourceProperty.title}</div>
                                        <div className="price-and-type">
                                            <span className="price">{formatPriceAbbreviated(sourceProperty.price)}</span>
                                            <span className={`property-type ${sourceProperty.property_type === "sell" ? "property-type-sell" : "property-type-rent"}`}>{sourceProperty.property_type}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="compare-property-card">
                                <div className="compare-property-image">
                                    <img src={targetProperty?.title_image_url} alt={targetProperty.title} className='prop_img'/>
                                </div>
                                <div className="compare-property-details">
                                    <div className="proeprtyTag">
                                        {translate("propertyB")}
                                    </div>
                                    <div className="main-details">
                                        <div className="property-location">
                                            <span><SlLocationPin size={16} />
                                            </span>
                                            <span>  {`${targetProperty?.city ? targetProperty?.city + ", " : ""}${targetProperty?.state ? targetProperty?.state + ", " : ""
                                                }${targetProperty?.country || ""}`}</span>
                                        </div>
                                        <div className="property-title">{targetProperty.title}</div>
                                        <div className="price-and-type">
                                            <span className="price">{formatPriceAbbreviated(targetProperty.price)}</span>
                                            <span className={`property-type ${targetProperty.property_type === "sell" ? "property-type-sell" : "property-type-rent"}`}>{targetProperty.property_type}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Comparison Table */}
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
                                    {/* Basic property information */}
                                    <tr>
                                        <td>{translate("propertyName")}</td>
                                        <td>{sourceProperty.title || "N/A"}</td>
                                        <td>{targetProperty.title || "N/A"}</td>
                                    </tr>
                                    <tr className="even-row">
                                        <td>{translate("locationName")}</td>
                                        <td>{`${sourceProperty?.city || "N/A"}, ${sourceProperty?.state || ""}, ${sourceProperty?.country || ""}`}</td>
                                        <td>{`${targetProperty?.city || "N/A"}, ${targetProperty?.state || ""}, ${targetProperty?.country || ""}`}</td>
                                    </tr>
                                    <tr>
                                        <td>{translate("listingDate")}</td>
                                        <td>{formatListingDate(sourceProperty.created_at)}</td>
                                        <td>{formatListingDate(targetProperty.created_at)}</td>
                                    </tr>
                                    <tr className="even-row">
                                        <td>{translate("price")}</td>
                                        <td>${Number(sourceProperty.price || 0).toLocaleString()}</td>
                                        <td>${Number(targetProperty.price || 0).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td>{translate("propertyViews")}</td>
                                        <td>{sourceProperty.total_views || "0"}</td>
                                        <td>{targetProperty.total_views || "0"}</td>
                                    </tr>
                                    <tr className="even-row">
                                        <td>{translate("propertyLikes")}</td>
                                        <td>{sourceProperty.total_likes || "0"}</td>
                                        <td>{targetProperty.total_likes || "0"}</td>
                                    </tr>
                                    
                                  
                                    
                                    {/* Dynamically render all facilities */}
                                    {(() => {
                                        // Collect all unique facility names from both properties
                                        const allFacilityNames = new Set([
                                            ...(sourceProperty.facilities || []).map(f => f.name),
                                            ...(targetProperty.facilities || []).map(f => f.name)
                                        ]);
                                        
                                        // Convert to array and sort alphabetically
                                        const facilityNames = Array.from(allFacilityNames).sort();
                                        
                                        // Return mapped rows
                                        return facilityNames.map((facilityName, index) => {
                                            // Calculate if this row should be even (accounting for previous rows)
                                            const baseRowCount = 6; // Basic property rows
                                            
                                            
                                            const isEven = (baseRowCount  + index) % 2 === 1;
                                            
                                            return (
                                                <tr key={facilityName} className={isEven ? "even-row" : ""}>
                                                    <td>{facilityName}</td>
                                                    <td>{getFacilityValue(sourceProperty, facilityName, "N/A")}</td>
                                                    <td>{getFacilityValue(targetProperty, facilityName, "N/A")}</td>
                                                </tr>
                                            );
                                        });
                                    })()}
                                    
                                    {/* Render nearby places if available */}
                                    {(() => {
                                        // Get all unique nearby places from both properties
                                        const sourceNearbyPlaces = sourceProperty.near_by_places || [];
                                        const targetNearbyPlaces = targetProperty.near_by_places || [];
                                        
                                        // If neither property has nearby places, don't render this section
                                        if (sourceNearbyPlaces.length === 0 && targetNearbyPlaces.length === 0) {
                                            return null;
                                        }
                                        
                                        // Collect all unique place names
                                        const allPlaceNames = new Set([
                                            ...sourceNearbyPlaces.map(place => place.name),
                                            ...targetNearbyPlaces.map(place => place.name)
                                        ]);
                                        
                                        // Convert to array and sort alphabetically
                                        const placeNames = Array.from(allPlaceNames).sort();
                                        
                                        // Calculate starting row count for even/odd alternation
                                        const baseRowCount = 6; // Basic property rows

                                        const facilityRowCount = new Set([
                                            ...(sourceProperty.facilities || []).map(f => f.name),
                                            ...(targetProperty.facilities || []).map(f => f.name)
                                        ]).size;
                                        
                                        // Helper function to get distance for a place
                                        const getPlaceDistance = (places, placeName) => {
                                            const place = places.find(p => p.name === placeName);
                                            return place ? `${place.distance} ${DistanceSymbol}` : "N/A";
                                        };
                                        
                                        // Render each unique nearby place
                                        return placeNames.map((placeName, index) => {
                                            const isEven = (baseRowCount + facilityRowCount + index) % 2 === 1;
                                            
 <tbody>
                                    {Object.keys(placeNamesMap).map((placeName, index) => {
                                        const isEven = index % 2 === 0;
                                        return (
                                            <tr key={`place-${placeName}`} className={isEven ? "even-row" : ""}>
                                                <td>{placeName}</td>
                                                <td>{getPlaceDistance(sourceNearbyPlaces, placeName)}</td>
                                                <td>{getPlaceDistance(targetNearbyPlaces, placeName)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div> {/* .compare-table */}
                    </div> {/* .compare-container */}
                </div> {/* .compare-wrapper */}
            </div> {/* .main-wrapper */}
        </Layout>
    );
};

export default CompareProperties;