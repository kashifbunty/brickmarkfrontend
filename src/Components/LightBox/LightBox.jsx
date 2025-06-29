"use client"
import React from "react";
import Lightbox from 'react-spring-lightbox';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { store } from "@/store/store";

const LightBox = ({ photos, viewerIsOpen, currentImage, setCurrentImage, onClose, title_image }) => {

    const language = store.getState().Language.languages;
    const isRtl = language.rtl === 1;

    if (!photos || photos.length === 0) {
        return null;
    }

    const lightboxPhotos = title_image ? [{ image_url: title_image, alt: 'Title Image' }, ...photos] : photos;

    // Fixed navigation logic for RTL
    const gotoPrevious = () => {
        if (isRtl) {
            // In RTL, "previous" means going to the next index
            if (currentImage < lightboxPhotos.length - 1) {
                setCurrentImage(currentImage + 1);
            }
        } else {
            // In LTR, "previous" means going to the previous index
            if (currentImage > 0) {
                setCurrentImage(currentImage - 1);
            }
        }
    };
    
    const gotoNext = () => {
        if (isRtl) {
            // In RTL, "next" means going to the previous index
            if (currentImage > 0) {
                setCurrentImage(currentImage - 1);
            }
        } else {
            // In LTR, "next" means going to the next index
            if (currentImage < lightboxPhotos.length - 1) {
                setCurrentImage(currentImage + 1);
            }
        }
    };
    
    const isPrevDisabled = isRtl ? currentImage >= lightboxPhotos.length - 1 : currentImage <= 0;
    const isNextDisabled = isRtl ? currentImage <= 0 : currentImage >= lightboxPhotos.length - 1;
    
    return (
        <Lightbox
            images={lightboxPhotos.map(photo => ({ src: photo.image_url, alt: photo.alt }))}
            currentIndex={currentImage}
            isOpen={viewerIsOpen}
            onClose={onClose}
            onPrev={gotoPrevious}
            onNext={gotoNext}
            renderPrevButton={({ canPrev }) => (
                <button
                    onClick={gotoPrevious}
                    disabled={isPrevDisabled}
                    className={`gallarybox_prevButton ${isRtl ? 'rtl' : ''} ${isPrevDisabled ? 'disabled' : ''}`}
                    style={{
                        cursor: isPrevDisabled ? 'not-allowed' : 'pointer',
                        opacity: isPrevDisabled ? 0.5 : 1,
                    }}
                >
                    <FaChevronLeft />
                    {/* {isRtl ? <FaChevronRight /> : <FaChevronLeft />} */}
                </button>
            )}
            renderNextButton={({ canNext }) => (
                <button
                    onClick={gotoNext}
                    disabled={isNextDisabled}
                    className={`gallarybox_nextButton ${isRtl ? 'rtl' : ''} ${isNextDisabled ? 'disabled' : ''}`}
                    style={{
                        cursor: isNextDisabled ? 'not-allowed' : 'pointer',
                        opacity: isNextDisabled ? 0.5 : 1,
                    }}
                >
                    <FaChevronRight />
                    {/* {isRtl ? <FaChevronLeft /> : <FaChevronRight />} */}
                </button>
            )}
            className="cool-class"
            style={{ background: "#000000b3" }}
            singleClickToZoom={true}
            pageTransitionConfig={{
                from: { opacity: 0, transform: 'scale(0.5)' },
                enter: { opacity: 1, transform: 'scale(1)' },
                leave: { opacity: 0, transform: 'scale(0.5)' },
            }}
        />
    );
};

export default LightBox;
