// src/services/api.ts

const API_BASE_URL = ""; // Base URL for Django API

export const uploadKeys = async (publicKey: string, encryptedPrivateKey: string) => {
  try {
    // FIXED URL: Matches your Django structure 'api/auth/keys/upload/'
    const response = await fetch(`${API_BASE_URL}/api/auth/keys/upload/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_key: publicKey,
        encrypted_private_key: encryptedPrivateKey,
      }),
    });

    if (!response.ok) {
      // Helper to debug HTML (404/500) errors
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        const text = await response.text();
        console.error("Server Error HTML:", text); // Check console if this happens
        throw new Error("Server returned HTML (404 Not Found or 500 Error). Check URL path.");
      }

      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to upload keys");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};