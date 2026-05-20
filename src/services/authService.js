import api from "../api/axios";

export const loginUser=(data)=>{
    return api.post("auth/login/",data);
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