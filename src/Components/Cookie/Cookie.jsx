'use client'
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Image from 'next/image';
import cookiesIconLightTheme from '../../assets/Images/CookieIcon.svg'
import { useSelector } from 'react-redux';
import { userSignUpData } from '@/store/reducer/authSlice';

const CookieComponent = () => {

  const [showPopup, setShowPopup] = useState(false);

  const [isCookiesAccept, setIsCookiesAccept] = useState(false)
  
  const userData = useSelector(userSignUpData);
  const data = userData?.data

  const isLogin = data?.token

  const expirationDays = 7;

  const handleAccept = () => {
    Cookies.set('cookie-consent', 'accepted', { expires: expirationDays });

    setShowPopup(false);
    setIsCookiesAccept(true)
    handleSaveData()
  };

  const handleDecline = () => {
    Cookies.set('cookie-consent', 'declined', { expires: expirationDays });
    setShowPopup(false);
  };

  const handleSaveData = () => {
    Cookies.set('user-name', data?.data?.name, { expires: expirationDays })
    Cookies.set('user-email', data?.data?.email, { expires: expirationDays })
    Cookies.set('user-number', data?.data?.mobile, { expires: expirationDays })
    Cookies.set('user-token', data?.token, { expires: expirationDays })
    Cookies.set('user-fcmId', data?.data?.fcm_id, { expires: expirationDays })
    Cookies.set('user-loginType', data?.data?.logintype, { expires: expirationDays })
  }


  useEffect(() => {
    const consent = Cookies.get('cookie-consent');
    if (!consent) {
      setShowPopup(true);
    }
  }, []);

  useEffect(() => {
    if (isLogin && isCookiesAccept) {
      handleSaveData()
    }
  }, [isLogin, showPopup, userData]);

  if (!showPopup) return null;




  return (
    <div className='cookiesComponent'>
      <div className="imgWrapper">
        <Image src={cookiesIconLightTheme} height={0} width={0} alt='cookiesImg' />
      </div>

      <div className='content'>
        <span>Do you allow us to use cookies?</span>
        <span>We use cookies to learn where you struggle when you're navigating our website and fix them for your future visit.</span>
      </div>

      <div className="btnsWrapper">
        <button onClick={handleDecline}>Decline Cookies</button>
        <button onClick={handleAccept}>Accept Cookies</button>
      </div>
    </div>
  );
};

export default CookieComponent