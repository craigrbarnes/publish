
function ensureTrailingSlash(url) {
    const u = new URL(url);
    u.pathname += u.pathname.endsWith('/') ? '' : '/';
    u.hash = '';
    u.search = '';
    return u.href;
}

function buildConfig(opts) {

    const hostnameValue = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const hostnameParts = hostnameValue.split('.');
    const hLen = hostnameParts.length;
    const hostnameNoSubdomain = (hLen > 2) ? hostnameParts.splice(hLen - 2).join('.') : hostnameValue;

    const defaults = {
        dev: !!(process.env.NODE_ENV && process.env.NODE_ENV === 'dev'),
        mockStore: !!(process.env.MOCK_STORE && process.env.MOCK_STORE === 'true'),
        app: process.env.APP || 'generic',
        basename: process.env.BASENAME || '/',
        protocol: typeof window !== 'undefined' ? `${window.location.protocol}` : 'http:',
        hostnameOnly: typeof window !== 'undefined' ? hostnameNoSubdomain : 'localhost',
        hostname: typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}/` : 'http://localhost/',
        fenceURL: process.env.FENCE_URL,
        mdsURL: process.env.MDS_URL,
        apiKey: process.env.API_KEY,
        keyID: process.env.KEY_ID
    };



    const {
        apiKey,
        keyID,
        hostname,
        fenceURL,
        mdsURL,
    } = Object.assign({}, defaults, opts);

    let userapiPath = typeof fenceURL === 'undefined' ? `${hostname}user/` : ensureTrailingSlash(fenceURL);
    let mdsapiPath = typeof mdsURL === 'undefined' ? `${hostname}mds/` : ensureTrailingSlash(mdsURL);
    return {
        apiKey,
        keyID,
        userapiPath,
        mdsapiPath
    };
}

const defaultConf = buildConfig();

module.exports = defaultConf;
