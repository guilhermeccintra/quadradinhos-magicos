const axios = require('axios');
const crypto = require('crypto');

function hashData(data) {
    if (!data) return null;
    return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { eventName, eventId, eventSourceUrl, clientUserAgent, userEmail, userPhone } = req.body;
        
        // Vercel populates 'x-forwarded-for' with the client's IP address
        const clientIpAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const currentTimestamp = Math.floor(Date.now() / 1000);

        const userData = {
            client_ip_address: clientIpAddress,
            client_user_agent: clientUserAgent,
        };

        if (userEmail) userData.em = [hashData(userEmail)];
        if (userPhone) userData.ph = [hashData(userPhone)];

        const payload = {
            data: [
                {
                    event_name: eventName || 'PageView',
                    event_time: currentTimestamp,
                    action_source: 'website',
                    event_id: eventId,
                    event_source_url: eventSourceUrl,
                    user_data: userData,
                }
            ]
        };

        const PIXEL_ID = process.env.META_PIXEL_ID;
        const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

        if (!PIXEL_ID || !ACCESS_TOKEN) {
            console.error('Missing Meta credentials');
            return res.status(500).json({ error: 'Missing Meta credentials' });
        }

        const response = await axios.post(
            `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
            payload
        );

        res.status(200).json({ success: true, message: 'Event sent to Conversions API', metaResponse: response.data });
    } catch (error) {
        console.error('Error sending event to Meta Conversions API:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, error: 'Failed to send event' });
    }
};
