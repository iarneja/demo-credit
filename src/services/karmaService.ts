import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const checkKarmaBlacklist = async (email: string): Promise<boolean> => {
  try {
    const response = await axios.get(
      `${process.env.ADJUTOR_BASE_URL}/verification/karma/${email}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ADJUTOR_API_KEY}`,
        },
      }
    );

    const data = response.data?.data;
    // Only blacklisted if data exists AND has actual content
    if (!data || Object.keys(data).length === 0) {
      return false;
    }
    return true;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return false;
    }
    console.error('Karma error:', error.response?.data || error.message);
    // Don't block registration if karma service is down
    return false;
  }
};