// language=JavaScript
export const executor = `var MFS_requests = {};

async function execute(message, body = null) {
    return new Promise((resolve, reject) => {
        const requestId = 'MFS_response_' + Math.round(Math.random() * 10000000000 + 1000000000);
        MFS_requests[requestId] = {resolve, reject};
        window.ReactNativeWebView.postMessage(JSON.stringify({source: 'WEB', requestId, message, body}))
    })
}

function onMessage(data) {
    const request = MFS_requests[data.requestId];
    if (!request) return;
    delete MFS_requests[data.requestId];

    if (data.error) request.reject(new Error(data.error));
    else request.resolve(data.result);
}
`
