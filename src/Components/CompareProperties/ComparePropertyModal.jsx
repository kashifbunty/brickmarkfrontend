import Link from "next/link";
import { Modal } from "react-bootstrap";
import { FaSearch, FaCheck, FaTimes } from "react-icons/fa";
import { debounce } from "lodash";
import { useRouter } from "next/router";
import { useState } from "react";
import { formatPriceAbbreviated, isThemeEnabled } from "@/utils/helper";
import { getAllSimilarPropertiesApi } from "@/store/actions/campaign";
import { PackageTypes } from "@/utils/checkPackages/packageTypes";
import { checkPackageAvailable } from "@/utils/checkPackages/checkPackage";
import toast from "react-hot-toast";
import { translate } from "@/utils/helper";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { SlLocationPin } from "react-icons/sl";
import { ImageToSvg } from "../Cards/ImageToSvg";
import { placeholderImage } from "@/utils/helper";
import { Tooltip } from "antd";
import Image from "next/image";
import premiumIcon from "../../assets/premium.svg";

const ComparePropertyModal = ({ show, handleClose, similarProperties, currentPropertyId }) => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const themeEnabled = isThemeEnabled();

    // Handle search input changes - only update the query value
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
    };

    // Handle search button click
    const handleSearchClick = () => {
        if (searchQuery.length > 2) {
            setIsLoading(true);
            performSearch(searchQuery);
        } else {
            setSearchResults([]);
        }
    };

    // Perform the search - no debounce needed since it's triggered by button click
    const performSearch = (query) => {
        getAllSimilarPropertiesApi({
            property_id: currentPropertyId,
            limit: 10,
            offset: 0,
            search: query,
            onSuccess: (res) => {
                setSearchResults(res.data);
                setIsLoading(false);
            },
            onError: (err) => {
                console.log(err);
                setIsLoading(false);
            },
            onStart: () => {
                setIsLoading(true);
            },
        });
    };

    // Handle key press in search input
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    const handleCompare = (property) => {

        const isPremiumProperty = property.is_premium;
        if (isPremiumProperty) {
            checkPackageAvailable(PackageTypes.PREMIUM_PROPERTIES).then((isAvailable) => {
                if (isAvailable) {
                    handleClose();
                    router.push(`/compare-properties/${currentPropertyId}-vs-${property.id}`);
                } else {
                    toast.error(translate("premiumPropertyCompare"));
                }
            });
        } else {
            handleClose();
            router.push(`/compare-properties/${currentPropertyId}-vs-${property.id}`);
        }
    };


    return (
        <Modal show={show} onHide={handleClose} size="lg" centered className="property-compare-modal">
            <Modal.Header closeButton>
                <Modal.Title>{translate("selectPropertyToCompare")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <button className="search-icon" onClick={handleSearchClick} disabled={!searchQuery}>
                            <FaSearch size={20} />
                        </button>
                        <input
                            type="text"
                            placeholder={translate("searchProperties")}
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyPress={handleKeyPress}
                            className="search-input"
                        />

                    </div>
                </div>

                <div className="properties-list">
                    {isLoading ? (
                        <div className="loading-spinner">Loading...</div>
                    ) : (
                        (searchQuery && searchResults.length > 0 ? searchResults : similarProperties)
                            .map(property => (
                                <div key={property.id} className="property-item">
                                    <div className="property-image">
                                        <img src={property.title_image} alt={property.title} />
                                        {property.is_premium && <Tooltip title={translate("premiumProperty")} placement="top">
                                            <Image
                                                loading="lazy"
                                                src={premiumIcon.src}
                                                alt="no_img"
                                                width={35}
                                                height={35}
                                                onError={placeholderImage}
                                            />
                                        </Tooltip>}
                                    </div>
                                    <div className="property-details">
                                        <h5>{property.title}</h5>
                                        <p className="property-location">
                                            <span><SlLocationPin size={16} />
                                            </span>
                                            <span>  {`${property?.city ? property?.city + ", " : ""}${property?.state ? property?.state + ", " : ""
                                                }${property?.country || ""}`}</span>
                                        </p>
                                        <div className="property-specs">
                                            {property?.parameters?.length > 0 ? (
                                                property?.parameters?.slice(0, 3).map((elem, index) => (
                                                    <div key={index} className="property-spec-item">
                                                        {themeEnabled ?

                                                            <ImageToSvg
                                                                imageUrl={elem?.image}
                                                                className="custom-svg"
                                                            />
                                                            : <Image src={elem?.image} alt={elem?.name} width={20} height={20} />}
                                                        <span>{elem?.name}</span>
                                                    </div>
                                                ))
                                            ) : null}
                                        </div>
                                        <p className="property-price">{formatPriceAbbreviated(property.price)}</p>
                                    </div>
                                    <button
                                        className="compare-btn"
                                        onClick={() => handleCompare(property)}
                                    >
                                        <FaArrowRightArrowLeft />     {translate("compare")}
                                    </button>
                                </div>
                            ))
                    )}
                </div>
            </Modal.Body>

        </Modal>
    );
};

export default ComparePropertyModal;