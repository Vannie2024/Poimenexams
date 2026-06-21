import { API_URL } from "@/config";
import axios from "axios";

export const loginUser = async (
  username: string,
  password: string
) => {
  const response = await axios.post(
    `${API_URL}/api/auth/login`,
    {
      username,
      password,
    }
  );

  return response.data;
};