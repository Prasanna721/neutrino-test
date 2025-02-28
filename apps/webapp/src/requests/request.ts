import CryptoJS from 'crypto-js';
import { getSecret } from './s_env';

export enum RequestType {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
}

function getHeaders(addAuth: boolean, token: string = '') {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (addAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function getDatatoHash(requestType: RequestType, data: any) {
  const API_SECRET = await getSecret();

  if (!API_SECRET) {
    throw new Error('Missing api_secret!');
  }
  
  let dataToHash: string;
  if (requestType === RequestType.GET) {
    const urlObj = new URL(data);
    const queryParams = new URLSearchParams(urlObj.search);
    const sortedParams = [...queryParams.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    dataToHash = new URLSearchParams(sortedParams).toString(); 
  } else {
    dataToHash = JSON.stringify(data || {});
  }

  const hashFromServer = CryptoJS.HmacSHA256(dataToHash, API_SECRET).toString(CryptoJS.enc.Hex);

  return hashFromServer;
}

export const Requests = {
  async post(endpoint: string, data: any = {}, addAuth = true) {
    try {
      let token = '';
      if (addAuth) {
        token = await getDatatoHash(RequestType.POST, data);
      }
      const headers = getHeaders(addAuth, token);

      const response = await fetch(endpoint, {
        method: RequestType.POST,
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error making POST request:', error);
      throw error;
    }
  },

  async get(endpoint: string, addAuth = true) {
    try {
      let token = '';
      if (addAuth) {
        token = await getDatatoHash(RequestType.GET, endpoint);
      }
      const headers = getHeaders(addAuth, token);

      const response = await fetch(endpoint, {
        method: RequestType.GET,
        headers,
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error making GET request:', error);
      throw error;
    }
  },

  async delete(endpoint: string, addAuth = true) {
    try {
      let token = '';
      if (addAuth) {
        token = await getDatatoHash(RequestType.DELETE, {});
      }
      const headers = getHeaders(addAuth, token);

      const response = await fetch(endpoint, {
        method: RequestType.DELETE,
        headers,
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error making DELETE request:', error);
      throw error;
    }
  },
};