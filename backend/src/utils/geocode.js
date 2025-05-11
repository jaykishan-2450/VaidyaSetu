async function extractLatLngFromUrl(url) {
    // Dynamically import node-fetch for ESM compatibility
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

    // If it's a short URL, resolve it
    if (/^https:\/\/maps\.app\.goo\.gl\//.test(url)) {
        try {
            const response = await fetch(url, { method: 'GET', redirect: 'follow' });
            url = response.url; // Final redirected URL
        } catch (err) {
            return null;
        }
    }

    // Try ?q=lat,lng
    let match = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    // Try /@lat,lng
    match = url.match(/\/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    // Try /place/lat,lng
    match = url.match(/\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    // Try data=!3m1!4b1!4m5!3m4!1s0x...!8m2!3dLAT!4dLNG
    match = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    return null;
}

module.exports = { extractLatLngFromUrl };