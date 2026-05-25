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
export const logoutUser = async () => {
  await api.post("auth/logout/", {}, {
    withCredentials: true,
  });
};

