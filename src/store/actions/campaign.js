import {
  getCategorieApi,
  getAllProperties,
  getSliderApi,
  update_profile,
  getArticlesApi,
  getCountByCitys,
  addFavourite,
  ContactUs,
  getFav,
  getPackages,
  getPaymentSettings,
  createPaymentIntent,
  confirmPayment,
  getFacilities,
  postProperty,
  postProject,
  getAllProjects,
  getLimits,
  getPaymentDetials,
  updatePostProperty,
  deleteProperty,
  deleteProject,
  featureProperty,
  intrestedProperty,
  getNotificationList,
  assignFreePackage,
  getChatList,
  getChatMessages,
  sendMessage,
  deleteChatMessages,
  deleteUser,
  getReportReasons,
  addReport,
  getNearbyProperties,
  setPropertyTotalClicks,
  getIntretsedUsers,
  AddUserIntrest,
  getUserRecommendation,
  GetUserIntrest,
  DeleteUserIntrest,
  getAddedProperties,
  getHomePage,
  getAgentList,
  getAgentProperties,
  getWebSettings,
  getFAQS,
  paypal,
  beforeLogout,
  getOtp,
  verifyOTP,
  deletAdvertisement,
  getPropertyList,
  getAgentVerificationFormFiels,
  ApplayAgentVerification,
  getAgentVerificationFormValue,
  MortgageCal,
  getProjectDetails,
  getAddedProjects,
  flutterwave,
  blockUser,
  unblockUser,
  getFacilitiesForFilter,
  userRegister,
  updatePropertyStatus,
  changePropertyStatus,
  forgotPassword,
  generateRazorpayOrderId,
  changeProjectStatus,
  createAllPaymentIntent,
  checkPackageLimit,
  getFeaturedData,
  paymentTransactionFail,
  getPaymentReceipt,
  initiateBankTransfer,
  uploadBankReceiptFile,
  getAllSimilarProperties,
  compareProperties,
} from "@/utils/api";
import { store } from "../store";
import { apiCallBegan } from "./apiActions";

// system setings api

export const SystemSettingsApi = ({
  type = "",
  // user_id = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getWebSettings(type),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// update profile
export const UpdateProfileApi = ({
  userid = "",
  name = "",
  email = "",
  mobile = "",
  type = "",
  address = "",
  firebase_id = "",
  logintype = "",
  profile = "",
  latitude = "",
  longitude = "",
  about_me = "",
  facebook_id = "",
  twiiter_id = "",
  instagram_id = "",
  youtube_id = "",
  fcm_id = "",
  notification = "",
  city = "",
  state = "",
  country = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...update_profile(
        userid,
        name,
        email,
        mobile,
        address,
        firebase_id,
        profile,
        latitude,
        longitude,
        about_me,
        facebook_id,
        twiiter_id,
        instagram_id,
        youtube_id,
        fcm_id,
        notification,
        city,
        state,
        country
      ),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// GET CATEGORIES
export const GetAllCategorieApi = ({
  limit = "",
  offset = "",
  search = "",
  has_property = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getCategorieApi(limit, offset, search, has_property),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// GET PROPERTIES
export const getPropertyDetailsApi = ({
  promoted = "",
  top_rated = "",
  id = "",
  category_id = "",
  most_liked = "",
  city = "",
  get_simiilar = "",
  offset = "",
  limit = "",
  current_user = "",
  property_type = "",
  max_price = "",
  min_price = "",
  posted_since = "",
  state = "",
  country = "",
  search = "",
  userid = "",
  users_promoted = "",
  slug_id = "",
  category_slug_id = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getAllProperties(
        promoted,
        top_rated,
        id,
        category_id,
        most_liked,
        city,
        get_simiilar,
        offset,
        limit,
        current_user,
        property_type,
        max_price,
        min_price,
        posted_since,
        state,
        country,
        search,
        userid,
        users_promoted,
        slug_id,
        category_slug_id
      ),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// GET_ARTICLES
export const GetAllArticlesApi = ({
  id = "",
  category_id = "",
  slug_id = "",
  limit = "",
  offset = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getArticlesApi(id, category_id, slug_id, limit, offset),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// GET_COUNT_BY_CITIES_CATEGORIS
export const GetCountByCitysApi = ({
  offset = "",
  limit = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getCountByCitys(offset, limit),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// // ADD_FAVOURITE
export const AddFavourite = (
  property_id,
  type,
  onSuccess,
  onError,
  onStart
) => {
  store.dispatch(
    apiCallBegan({
      ...addFavourite(property_id, type),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// contact us
export const ContactUsApi = (
  first_name,
  last_name,
  email,
  subject,
  message,
  onSuccess,
  onError,
  onStart
) => {
  store.dispatch(
    apiCallBegan({
      ...ContactUs(first_name, last_name, email, subject, message),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// // GET_FAV_PROPERTY
export const GetFavPropertyApi = (
  offset,
  limit,
  onSuccess,
  onError,
  onStart
) => {
  store.dispatch(
    apiCallBegan({
      ...getFav(offset, limit),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// get packages
export const getPackagesApi = (onSuccess, onError, onStart) => {
  store.dispatch(
    apiCallBegan({
      ...getPackages(),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// get payement settings

export const getPaymentSettingsApi = (onSuccess, onError, onStart) => {
  store.dispatch(
    apiCallBegan({
      ...getPaymentSettings(),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// createPaymentIntent
export const createPaymentIntentApi = ({
  description = "",
  name = "",
  address1 = "",
  postalcode = "",
  city = "",
  state = "",
  country = "",
  amount = "",
  currency = "",
  card = "",
  packageID = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...createPaymentIntent(
        description,
        name,
        address1,
        postalcode,
        city,
        state,
        country,
        amount,
        currency,
        card,
        packageID
      ),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

//confirmPayment
export const confirmPaymentApi = (
  paymentIntentId,
  onSuccess,
  onError,
  onStart
) => {
  store.dispatch(
    apiCallBegan({
      ...confirmPayment(paymentIntentId),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// GET FACILITIES API
export const GetFacilitiesApi = (onSuccess, onError, onStart) => {
  store.dispatch(
    apiCallBegan({
      ...getFacilities(),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

export const PostProperty = ({
  userid = "",
  title = "",
  description = "",
  city = "",
  state = "",
  country = "",
  latitude = "",
  longitude = "",
  address = "",
  price = "",
  category_id = "",
  property_type = "",
  video_link = "",
  parameters = [],
  facilities = [],
  title_image = "",
  three_d_image = "",
  gallery_images = [],
  meta_title = "",
  meta_description = "",
  meta_keywords = "",
  meta_image = "",
  rentduration = "",
  is_premium = "",
  client_address = "",
  slug_id = "",
  documents = [],
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...postProperty(
        userid,
        title,
        description,
        city,
        state,
        country,
        latitude,
        longitude,
        address,
        price,
        category_id,
        property_type,
        video_link,
        parameters,
        facilities,
        title_image,
        three_d_image,
        gallery_images,
        meta_title,
        meta_description,
        meta_keywords,
        meta_image,
        rentduration,
        is_premium,
        client_address,
        slug_id,
        documents
      ),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// GET LIMITS API
export const GetLimitsApi = (package_type, onSuccess, onError, onStart) => {
  store.dispatch(
    apiCallBegan({
      ...getLimits(package_type),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// get payment detials
export const getPaymentDetialsApi = ({
  offset = "",
  limit = "",
  payment_type = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getPaymentDetials(offset, limit, payment_type),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

export const UpdatePostProperty = ({
  action_type = "",
  id = "",
  title = "",
  description = "",
  city = "",
  state = "",
  country = "",
  latitude = "",
  longitude = "",
  address = "",
  price = "",
  category_id = "",
  property_type = "",
  video_link = "",
  parameters = [],
  facilities = [],
  title_image = "",
  three_d_image = "",
  gallery_images = [],
  slug_id = "",
  meta_title = "",
  meta_description = "",
  meta_keywords = "",
  meta_image = "",
  rentduration = "",
  is_premium = "",
  client_address = "",
  remove_gallery_images = "",
  remove_documents = "",
  documents = [],
  remove_three_d_image,
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...updatePostProperty(
        action_type,
        id,
        title,
        description,
        city,
        state,
        country,
        latitude,
        longitude,
        address,
        price,
        category_id,
        property_type,
        video_link,
        parameters,
        facilities,
        title_image,
        three_d_image,
        gallery_images,
        slug_id,
        meta_title,
        meta_description,
        meta_keywords,
        meta_image,
        rentduration,
        is_premium,
        client_address,
        remove_gallery_images,
        documents,
        remove_documents,
        remove_three_d_image
      ),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// Delete Property
export const deletePropertyApi = (id, onSuccess, onError, onStart) => {
  store.dispatch(
    apiCallBegan({
      ...deleteProperty(id),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// Delete Property
export const deleteProjectApi = (id, onSuccess, onError, onStart) => {
  store.dispatch(
    apiCallBegan({
      ...deleteProject(id),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// FETAURE PROPERY
export const featurePropertyApi = ({
  feature_for = "",
  property_id = "",
  project_id = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...featureProperty(feature_for, property_id, project_id),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// intrested propery
export const intrestedPropertyApi = (
  property_id,
  type,
  onSuccess,
  onError,
  onStart
) => {
  store.dispatch(
    apiCallBegan({
      ...intrestedProperty(property_id, type),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// intrested propery
export const getNotificationListApi = ({
  offset = "",
  limit = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getNotificationList(offset, limit),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// intrested propery
export const assignFreePackageApi = (
  package_id,
  onSuccess,
  onError,
  onStart
) => {
  store.dispatch(
    apiCallBegan({
      ...assignFreePackage(package_id),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// GET CHATS API
export const getChatsListApi = ({
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getChatList(),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// GET FACILITIES API
export const getChatsMessagesApi = ({
  user_id = "",
  property_id = "",
  page = "",
  per_page = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getChatMessages(user_id, property_id, page, per_page),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// SEND MESSAGE API
export const sendMessageApi = (
  sender_id,
  receiver_id,
  message,
  property_id,
  file,
  audio,
  onSuccess,
  onError,
  onStart
) => {
  store.dispatch(
    apiCallBegan({
      ...sendMessage(sender_id, receiver_id, message, property_id, file, audio),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// DELETE CHAT  MESSAGE API
export const deleteChatMessagesApi = ({
  message_id = "",
  sender_id = "",
  receiver_id = "",
  property_id = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...deleteChatMessages(message_id, sender_id, receiver_id, property_id),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// Delete user Api
export const deleteUserApi = ({
  userid = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...deleteUser(userid),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// GET REPORT rEASONS  API
export const GetReportReasonsApi = (onSuccess, onError, onStart) => {
  store.dispatch(
    apiCallBegan({
      ...getReportReasons(),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// GET REPORT rEASONS  API
export const addReportApi = ({
  reason_id = "",
  property_id = "",
  other_message = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...addReport(reason_id, property_id, other_message),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// getNearbyProperties  API
export const getNearbyPropertiesApi = ({
  city = "",
  state = "",
  type = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getNearbyProperties(city, state, type),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// setPropertyTotalClicks  API
export const setPropertyTotalClicksApi = ({
  project_slug_id = "",
  property_slug_id = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...setPropertyTotalClicks(project_slug_id, property_slug_id),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// check properties status   API
export const updatePropertyStatusApi = ({
  property_id = "",
  status = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...updatePropertyStatus(property_id, status),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// get intrested users   API
export const getIntrestedUserApi = ({
  property_id = "",
  slug_id = "",
  limit = "",
  offset = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getIntretsedUsers(property_id, slug_id, limit, offset),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// post project api

export const PostProjectApi = ({
  id = "",
  title = "",
  description = "",
  category_id = "",
  type = "",
  meta_title = "",
  meta_description = "",
  meta_keywords = "",
  meta_image = "",
  city = "",
  state = "",
  country = "",
  latitude = "",
  longitude = "",
  location = "",
  video_link = "",
  image = "",
  plans = "",
  documents = "",
  gallery_images = "",
  remove_documents = "",
  remove_gallery_images = "",
  remove_plans = "",
  slug_id = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...postProject(
        id,
        title,
        description,
        category_id,
        type,
        meta_title,
        meta_description,
        meta_keywords,
        meta_image,
        city,
        state,
        country,
        latitude,
        longitude,
        location,
        video_link,
        image,
        plans,
        documents,
        gallery_images,
        remove_documents,
        remove_gallery_images,
        remove_plans,
        slug_id
      ),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// GET PROJECTS

export const getAllprojectsApi = ({
  userid = "",
  id = "",
  slug_id = "",
  search = "",
  get_similar = "",
  category_id = "",
  city = "",
  state = "",
  country = "",
  posted_since = "",
  offset = "",
  limit = "",
  get_featured = "",
  latitude = "",
  longitude = "",
  radius = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getAllProjects(
        userid,
        id,
        slug_id,
        search,
        get_similar,
        category_id,
        city,
        state,
        country,
        posted_since,
        offset,
        limit,
        get_featured,
        latitude,
        longitude,
        radius
      ),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

export const getProjectDetailsApi = ({
  slug_id = "",
  get_similar = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getProjectDetails(slug_id, get_similar),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
export const getAddedProjectApi = ({
  slug_id = "",
  get_similar = "",
  limit = "",
  offset = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getAddedProjects(slug_id, get_similar, offset, limit),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

// AddUserIntrestApi
export const AddUserIntrestApi = ({
  category_ids = "",
  outdoor_facilitiy_ids = "",
  price_range = "",
  property_type = "",
  city = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...AddUserIntrest(
        category_ids,
        outdoor_facilitiy_ids,
        price_range,
        property_type,
        city
      ),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// get user intrest
export const GetUserIntrestApi = ({
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...GetUserIntrest(),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// Delete user intrest
export const DeleteUserIntrestApi = ({
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...DeleteUserIntrest(),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// getUserRecommendation
export const getUserRecommendationApi = ({
  offset = "",
  limit = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getUserRecommendation(offset, limit),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// getUserRecommendation
export const getAddedPropertiesApi = ({
  slug_id = "",
  is_promoted = "",
  offset = "",
  limit = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getAddedProperties(slug_id, is_promoted, offset, limit),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// home page api
export const getHomePageApi = ({
  latitude = "",
  longitude = "",
  radius = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getHomePage(latitude, longitude, radius),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// home page api
export const getAgentListApi = ({
  limit = "",
  offset = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getAgentList(limit, offset),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
export const getAgentPropertyApi = ({
  is_admin = "",
  slug_id = "",
  is_projects = "",
  limit = "",
  offset = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getAgentProperties(is_admin, slug_id, is_projects, limit, offset),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

export const getFAQSApi = ({
  limit = "",
  offset = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getFAQS(limit, offset),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
export const paypalApi = ({
  amount = "",
  package_id = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...paypal(amount, package_id),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
export const flutterwaveApi = ({
  package_id = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...flutterwave(package_id),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

export const beforeLogoutApi = ({
  fcm_id,
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...beforeLogout(fcm_id),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
export const GetOTPApi = ({
  number = "",
  email = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getOtp(number, email),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
export const verifyOTPApi = ({
  number = "",
  email = "",
  otp = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...verifyOTP(number, email, otp),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
export const deleteAdvertisementApi = ({
  id,
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...deletAdvertisement(id),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
export const getPropertyListApi = ({
  property_type = "",
  category_id = "",
  category_slug_id = "",
  city = "",
  state = "",
  country = "",
  min_price = "",
  max_price = "",
  posted_since = "",
  most_viewed = "",
  most_liked = "",
  promoted = "",
  limit = "",
  offset = "",
  search = "",
  parameter_id = "",
  get_all_premium_properties = "",
  latitude = "",
  longitude = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getPropertyList(
        property_type,
        category_id,
        category_slug_id,
        city,
        state,
        country,
        min_price,
        max_price,
        posted_since,
        most_viewed,
        most_liked,
        promoted,
        limit,
        offset,
        search,
        parameter_id,
        get_all_premium_properties,
        latitude,
        longitude
      ),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
export const getAgentVerificationFormFielsApi = ({
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getAgentVerificationFormFiels(),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
export const ApplyAgentVerificationApi = ({
  form_fields = [],
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...ApplayAgentVerification(form_fields),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
export const getAgentVerificationFormValuesApi = ({
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getAgentVerificationFormValue(),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// Function to dispatch API call for mortgage calculation
export const MortgagegetAllProjectsLoanCalApi = ({
  loan_amount = "",
  down_payment = "",
  interest_rate = "",
  loan_term_years = "",
  show_all_details = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      // API call configuration
      ...MortgageCal(
        loan_amount,
        down_payment,
        interest_rate,
        loan_term_years,
        show_all_details
      ),
      displayToast: false, // Optional: suppress toast notifications
      onStart, // Callback when API call starts
      onSuccess, // Callback on successful response
      onError, // Callback on error response
    })
  );
};

// block user api
export const blockUserApi = ({
  to_user_id = "",
  to_admin = "",
  reason = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      // API call configuration
      ...blockUser(to_user_id, to_admin, reason),
      displayToast: false, // Optional: suppress toast notifications
      onStart, // Callback when API call starts
      onSuccess, // Callback on successful response
      onError, // Callback on error response
    })
  );
};
export const unblockUserApi = ({
  to_user_id = "",
  to_admin = "",
  reason = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      // API call configuration
      ...unblockUser(to_user_id, to_admin, reason),
      displayToast: false, // Optional: suppress toast notifications
      onStart, // Callback when API call starts
      onSuccess, // Callback on successful response
      onError, // Callback on error response
    })
  );
};
export const getFacilitiesForFilterApi = ({
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      // API call configuration
      ...getFacilitiesForFilter(),
      displayToast: false, // Optional: suppress toast notifications
      onStart, // Callback when API call starts
      onSuccess, // Callback on successful response
      onError, // Callback on error response
    })
  );
};
export const userRegisterApi = ({
  name = "",
  email = "",
  mobile = "",
  password = "",
  re_password = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      // API call configuration
      ...userRegister(name, email, mobile, password, re_password),
      displayToast: false, // Optional: suppress toast notifications
      onStart, // Callback when API call starts
      onSuccess, // Callback on successful response
      onError, // Callback on error response
    })
  );
};

export const changePropertyStatusApi = ({
  property_id = "",
  status = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...changePropertyStatus(property_id, status),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
export const changeProjectStatusApi = ({
  project_id = "",
  status = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...changeProjectStatus(project_id, status),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};
// forgot password api
export const forgotPasswordApi = ({
  email = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...forgotPassword(email),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

export const generateRazorpayOrderIdApi = ({
  package_id = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...generateRazorpayOrderId(package_id),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

export const createAllPaymentIntentApi = ({
  package_id = "",
  platform_type = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...createAllPaymentIntent(package_id, platform_type),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

export const checkPackageLimitApi = ({ type = "" }) => {
  return new Promise((resolve, reject) => {
    store.dispatch(
      apiCallBegan({
        ...checkPackageLimit(type),
        displayToast: false,
        onSuccess: (res) => resolve(res),
        onError: (err) => reject(err),
      })
    );
  });
};

export const getFeaturedDataApi = ({
  type = "",
  offset = "",
  limit = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getFeaturedData(type, offset, limit),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};


export const paymentTransactionFailApi = ({
  payment_transaction_id = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...paymentTransactionFail(payment_transaction_id),
      displayToast: false,
    })
  );
};  

export const getPaymentReceiptApi = ({
  payment_transaction_id = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getPaymentReceipt(payment_transaction_id),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

export const initiateBankTransferApi = ({
  package_id = "",
  file = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...initiateBankTransfer(package_id, file),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

export const uploadBankReceiptFileApi = ({
  payment_transaction_id = "",
  file = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...uploadBankReceiptFile(payment_transaction_id, file),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

export const getAllSimilarPropertiesApi = ({
  property_id = "",
  limit = "",
  offset = "",
  search = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => {
  store.dispatch(
    apiCallBegan({
      ...getAllSimilarProperties(property_id, limit, offset, search),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};

export const comparePropertiesApi = ({
  source_property_id = "",
  target_property_id = "",
  onSuccess = () => {},
  onError = () => {},
  onStart = () => {},
}) => { 
  store.dispatch(
    apiCallBegan({
      ...compareProperties(source_property_id, target_property_id),
      displayToast: false,
      onStart,
      onSuccess,
      onError,
    })
  );
};