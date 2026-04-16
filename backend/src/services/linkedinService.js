/**
 * @fileoverview LinkedIn Integration Service.
 * Fetches user profile data from LinkedIn using an OAuth 2.0 Access Token.
 * Extends CareerPilot capability with real professional context.
 */

const axios = require('axios');

/**
 * Fetches LinkedIn profile data (Headline, Summary, Experience).
 * Uses the provided AQ.Ab8... token format.
 * @param {string} accessToken - LinkedIn OAuth token
 * @returns {Promise<Object>} Formatted career data
 */
async function fetchLinkedInProfile(accessToken) {
  try {
    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
    };

    // 1. Basic Profile (First name, Last name, Profile picture)
    // endpoint: 'https://api.linkedin.com/v2/userinfo'
    const profileRes = await axios.get('https://api.linkedin.com/v2/userinfo', config);
    const { given_name, family_name, picture, sub: uid } = profileRes.data;

    // 2. Fetch Detailed Profile (v2/me for headline/summary)
    // Note: This requires specific scopes ('r_basicprofile', 'r_fullprofile')
    // We attempt generic v2/me first.
    const meRes = await axios.get('https://api.linkedin.com/v2/me', config);

    return {
      uid,
      displayName: `${given_name} ${family_name}`,
      profilePicture: picture,
      headline: meRes.data.localizedHeadline || '',
      summary: meRes.data.localizedSummary || 'Job seeker synced from LinkedIn',
      vanityName: meRes.data.vanityName,
    };
  } catch (err) {
    console.error('LinkedIn Sync Error:', err.response?.data || err.message);
    throw new Error('Failed to fetch LinkedIn profile. Please check your access token.');
  }
}

module.exports = { fetchLinkedInProfile };
