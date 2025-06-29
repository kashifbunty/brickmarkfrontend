import React from 'react';
import Image from 'next/image';

const PropertyGallery = ({ galleryPhotos, titleImage, onImageClick, translate, placeholderImage, PlaceHolderImg }) => {
    return (
        <>
            {galleryPhotos && galleryPhotos.length > 0 ? (
                <div className={`property-gallery ${galleryPhotos.length < 2 ? 'property-gallery--two' : ''}`}>
                    {galleryPhotos.length < 2 ? (
                        <>
                            <div className="property-gallery__item--half">
                                <Image
                                    onError={placeholderImage}
                                    loading="lazy"
                                    src={titleImage || PlaceHolderImg}
                                    className="property-gallery__image property-gallary-right-side"
                                    alt="Main Image"
                                    width={0}
                                    height={0}
                                    onClick={() => onImageClick(0)}
                                />
                            </div>
                            <div className="property-gallery__item--half">
                                <Image
                                    onError={placeholderImage}
                                    loading="lazy"
                                    src={galleryPhotos[0]?.image_url || PlaceHolderImg}
                                    className="property-gallery__image property-gallary-left-side"
                                    alt="Gallery Image"
                                    width={0}
                                    height={0}
                                    onClick={() => onImageClick(1)}
                                />
                                <div className="property-gallery__see-all">
                                    <button onClick={() => onImageClick(0)}>
                                        {translate("seeAllPhotos")}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="property-gallery__side">
                                <Image
                                    onError={placeholderImage}
                                    loading="lazy"
                                    src={galleryPhotos[0]?.image_url || PlaceHolderImg}
                                    className="property-gallery__image property-gallery__image--side property-gallary--side-top"
                                    alt="Gallery Image 1"
                                    width={0}
                                    height={0}
                                    onClick={() => onImageClick(1)}
                                />
                                <Image
                                    onError={placeholderImage}
                                    loading="lazy"
                                    src={galleryPhotos[1]?.image_url || PlaceHolderImg}
                                    className="property-gallery__image property-gallery__image--side property-gallary--side-bottom"
                                    alt="Gallery Image 2"
                                    width={0}
                                    height={0}
                                    onClick={() => onImageClick(2)}
                                />
                            </div>
                            <div className="property-gallery__main">
                                <Image
                                    onError={placeholderImage}
                                    loading="lazy"
                                    src={titleImage || PlaceHolderImg}
                                    className="property-gallery__image property-gallery__image--main"
                                    alt="Main Image"
                                    width={0}
                                    height={0}
                                    onClick={() => onImageClick(0)}
                                />
                                <div className="property-gallery__see-all">
                                    <button onClick={() => onImageClick(0)}>
                                        {translate("seeAllPhotos")}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="property-gallery property-gallery--single">
                    <div className="property-gallery__item--full">
                        <Image
                            onError={placeholderImage}
                            loading="lazy"
                            src={titleImage || PlaceHolderImg}
                            className="property-gallery__image"
                            alt="Main Image"
                            width={0}
                            height={0}
                            onClick={() => onImageClick(0)}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default PropertyGallery;
