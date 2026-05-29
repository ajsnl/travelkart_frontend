import api from "../api/axios";


export const loginUser = async (data) => {
  try {
    const res = await api.post("auth/login/", data);

    console.log(" Login success");

    return res;

  } catch (err) {
    console.log(" Login failed", err);
    throw err;
  }
};

export const signupUser = (data)=>{
    return api.post("auth/signup/",data);
};

export const getProfile = () => {
  return api.get("auth/profile/");
};
export const getCurrentUser = async () => {
  const res = await api.get("auth/user/me/");
  return res.data;
};

export const logoutUser = async (navigate) => {
  try {
    await api.get("auth/csrf/"); // 🔥 force cookie

    await api.post("auth/logout/");

    navigate("/");

  } catch (error) {
    console.error("Logout failed", error);
    navigate("/");
  }
};

export const googleLogin = async (token) => {
  return api.post("auth/google/", {
    access_token: token,
    id_token: token,
  });
};

export const getAddresses = () => {
  return api.get("auth/addresses/");
};

export const addAddress = (data) => {
  return api.post("auth/addresses/", data);
};

export const deleteAddress = (id) => {
  return api.delete(`auth/addresses/${id}/`);
};

export const updateAddress = (id, data) => {
  return api.put(`auth/addresses/${id}/`, data);
};

export const setDefaultAddress = (id) => {
  return api.patch(`auth/addresses/${id}/set_default/`);
};

export const updateProfile = (data) => {
  return api.patch("auth/profile/", data);
};

export const sendEmailOTP = (email = null) => {
  const payload = email ? { email } : {};
  return api.post("auth/send-email-otp/", payload);
};

export const verifyEmailOTP = (otp) => {
  return api.post("auth/verify-email-otp/", { otp });
};

export const resendEmailOTP = () => {
  return api.post("auth/resend-otp/");
};

export const changePassword = (data) => {
  return api.post("auth/change-password/", data);
};


