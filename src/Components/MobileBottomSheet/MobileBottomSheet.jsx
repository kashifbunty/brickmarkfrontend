import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { settingsData } from '@/store/reducer/settingsSlice';
import { translate } from '@/utils/helper';
import { usePathname } from 'next/navigation';

const MobileBottomSheet = ({ isOpen = true }) => {
    const [isVisible, setIsVisible] = useState(isOpen);
    const [hasClosedOnce, setHasClosedOnce] = useState(false);
    const [showAppNotInstalledPopup, setShowAppNotInstalledPopup] = useState(false);
    const settings = useSelector(settingsData);

    const path = usePathname();

    // Get app links from settings data
    const androidAppLink = settings?.playstore_id;
    const iosAppLink = settings?.appstore_id;
    const appName = settings?.company_name || 'eBroker';

    const appScheme = settings?.schema_for_deeplink || 'ebroker';

    // Detect device type
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const currentStoreLink = isAndroid ? androidAppLink : isIOS ? iosAppLink : androidAppLink;

    // Update visibility when isOpen prop changes
    useEffect(() => {
        setIsVisible(isOpen);
    }, [isOpen]);

    useEffect(() => {
        // Check if user has already closed the sheet in this session
        const hasClosedSheet = sessionStorage.getItem('hasClosedBottomSheet');
        if (hasClosedSheet) {
            setIsVisible(false);
        }

        // Handle app visibility changes to detect if the app opened
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Only clear popup if it was opened less than 1 second ago
                // This prevents clearing the popup when user returns to the browser
                // after seeing "no handler" error
                if (Date.now() - window.lastDeepLinkAttempt < 1000) {
                    setShowAppNotInstalledPopup(false);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setHasClosedOnce(true);
        // Store in session storage to prevent showing again during this session
        sessionStorage.setItem('hasClosedBottomSheet', 'true');
    };

    const handleOpenApp = () => {
        // Create the deep link properly
        const sanitizedAppName = appScheme.trim().toLowerCase();
        
        // Use the full path from navigation
        const currentPath = path;
        // Get the hostname
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        
        // Different formats for Android and iOS for better compatibility
        let deepLink = `${sanitizedAppName}://${hostname}${currentPath}`;
        
        // Store timestamp of attempt for better visibility change detection
        window.lastDeepLinkAttempt = Date.now();
        
        // Set up app detection before attempting to open the app
        // This ensures we catch the app not installed scenario
        const start = Date.now();
        
        // Pre-emptive timeout - will trigger if app doesn't open
        const appCheckTimeout = setTimeout(() => {
            // Only show popup if we're still in the browser (app didn't open)
            if (!document.hidden) {
                console.log("App not installed, showing popup");
                setShowAppNotInstalledPopup(true);
            }
        }, 2000); // Increased to 2000ms for more reliability
        
        // For iOS: Try using iframe method first (better compatibility)
        if (isIOS) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = deepLink;
            document.body.appendChild(iframe);
            
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 100);
        }

        // For Android specifically, handle intent failures
        if (isAndroid) {
            // Add a more reliable fallback for Android
            // This will catch the "Failed to launch intent" error
            window.onerror = function(message, source, lineno, colno, error) {
                if (message.includes('Failed to launch') && message.includes('intent://')) {
                    clearTimeout(appCheckTimeout);

                    setShowAppNotInstalledPopup(true);
                    
                    // Reset error handler after handling this error
                    window.onerror = null;
                    return true; // Prevents the error from showing in console
                }
            };
        }
        
        try {
            // Attempt to open the app via deep link
            window.location.href = deepLink;
        } catch (e) {
            console.error("Error opening app:", e);
            clearTimeout(appCheckTimeout);
            // Immediately show popup if there's an error
            setShowAppNotInstalledPopup(true);
        }
    };

    const handleDownloadApp = () => {
        // Close popup and open appropriate store
        setShowAppNotInstalledPopup(false);
        
        if (currentStoreLink) {
            window.location.href = currentStoreLink;
        } else {
            // Fallback to generic app stores if specific links are not available
            if (isAndroid) {
                window.location.href = `https://play.google.com/store/search?q=${appName}&c=apps`;
            } else if (isIOS) {
                window.location.href = `https://apps.apple.com/search?term=${appName}`;
            }
        }
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Blurred white overlay */}
            <div className="mobile-sheet-overlay" onClick={handleClose}></div>

            <div className="mobile-bottom-sheet">
                <div className="mobile-bottom-sheet-content">

                    <div className="app-promotion">
                        <div className="app-info">
                            <h4>{appName}</h4>
                            <p>{translate("betterExperienceInApp")}</p>
                        </div>
                    </div>

                    <div className="sheet-button-container">
                        <button className="open-app-button" onClick={handleOpenApp}>
                            <span>{translate("openInApp")}</span>
                        </button>

                        <button className="cancel-button" onClick={handleClose}>
                            <span>{translate("cancel")}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* App Not Installed Popup */}
            {showAppNotInstalledPopup && (
                <div className="app-not-installed-overlay">
                    <div className="app-not-installed-popup">
                        <h3>{translate("appNotInstalled", { appName: appName })}</h3>
                        <p>
                            {isAndroid
                                ? translate("downloadPromptPlayStore")
                                : translate("downloadPromptAppStore")}
                        </p>

                        <div className="popup-buttons">
                            <button
                                className="download-app-button"
                                onClick={handleDownloadApp}
                            >
                                {isAndroid ? 'Play Store' : 'App Store'}
                            </button>
                            <button
                                className="cancel-button"
                                onClick={() => setShowAppNotInstalledPopup(false)}
                            >
                                {translate("cancel")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MobileBottomSheet; 