import toast from "react-hot-toast";

/**
 * ✅ Handle backend responses consistently
 * @param {object} res - Axios response object
 * @param {string} successMessage - Fallback success message if backend doesn't send one
 */
export const handleResponseToast = (res, successMessage = "Success") => {
  if (res?.status >= 200 && res?.status < 300) {
    toast.success(res.data?.message || successMessage);
  } else if (res?.status >= 400 && res?.status < 500) {
    toast.error(res.data?.message || "Client error occurred.");
  } else if (res?.status >= 500) {
    toast.error(res.data?.message || "Server error occurred.");
  } else {
    toast.error("Something went wrong.");
  }
};

/**
 * ❌ Handle Axios or network errors gracefully
 * @param {object} error - Error object from Axios catch block
 * @param {string} fallbackMessage - Default message if backend doesn't send one
 */
export const handleErrorToast = (
  error,
  fallbackMessage = "An unexpected error occurred."
) => {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage ||
    "An unexpected error occurred.";
  toast.error(message);
};
