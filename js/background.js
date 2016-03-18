// CIOClipper initialized in settings.js
// settings.js is merged with this file in `grunt build`

// Little helper to easily extract the hostname out of a string that holds a URL
String.prototype.host = function() {
    var parser = document.createElement('a');
    parser.href = this;
    return parser.hostname;
};

CIOClipper.Main = function() {

    var appUrl = CIOClipper.Settings.appUrl,
        csrfToken = null;

    function setSignedIn(val) {
        if (val) {
            window.localStorage.setItem("cio-signed-in", val);
        } else {
            window.localStorage.removeItem("cio-signed-in");
        }
    }

    function getSignedIn() {
        return window.localStorage.getItem("cio-signed-in");
    }

    function setPostedData(url, leadId, orgId) {
        // Store the url from which the lead was extracted to avoid duplicates.
        // Posted data format: [ { organization_id: o, lead_id: l, lead_url: u }, ... ]

        var key = 'data (' + url + ')',
            existingData = window.localStorage.getItem(key),
            leadUrl = appUrl + '/lead/' + leadId + '/';

        if (existingData) {
            var found = false,
                i = 0;

            existingData = $.parseJSON(existingData);
            for (i = 0; i < existingData.length; i++) {
                if (existingData[i].organization_id === orgId) {
                    existingData[i].lead_id = leadId;
                    existingData[i].lead_url = leadUrl;
                    found = true;
                    break;
                }
            }
            if (!found) {
                existingData.push({
                    organization_id: orgId,
                    lead_id: leadId,
                    lead_url: leadUrl
                });
            }
        } else {
            existingData = [{
                organization_id: orgId,
                lead_id: leadId,
                lead_url: leadUrl
            }];
        }

        window.localStorage.setItem(key, JSON.stringify(existingData));
    }

    function getPostedData(url) {
        var key = 'data (' + url + ')',
            postedData = window.localStorage.getItem(key);

        if (!postedData) return [];

        return $.parseJSON(postedData);
    }

    function login(options) {
        $.ajax({
            type: 'POST',
            url: appUrl + '/api/v1/auth/login/',
            data: {
                email: options.email,
                password: options.password
            },
            success: function(response, textStatus, request) {

                // Save CSRF locally
                chrome.cookies.get({ url: appUrl, name: '_csrf_token' }, function(cookie) { 
                    csrfToken = cookie.value;
                });

                loadUserDetails({
                    success: options.success,
                    error: options.error
                });
            },
            error: function(xhr) {
                setSignedIn(false);
                options.error(xhr);
            }
        });
    }

    function logout(options) {
        var ajax = function() {
            $.ajax({
                type: 'POST',
                url: appUrl + '/api/v1/auth/logout/',
                beforeSend: function(xhr, settings) {
                    xhr.setRequestHeader("X-CSRFToken", csrfToken);
                },
                success: function(response) {
                    options.success(response);
                }
            });
        };
        if (!csrfToken) {
            chrome.cookies.get({ url: appUrl, name: '_csrf_token' }, function(cookie) { 
                csrfToken = cookie.value;
                ajax();
            });
        } else {
            ajax();
        }
    }

    function loadUserDetails(options) {

        $.ajax({
            url: appUrl + '/api/v1/me/',
            success: function(response) {
                setSignedIn(true);
                setUserDetails(response);
                options.success(response);
            },
            error: function(xhr) {
                setSignedIn(false);
                options.error(xhr);
            }
        });
    }

    function setUserDetails(data) {
        if (data) {
            localStorage.setItem('cio-me', JSON.stringify(data));
        } else {
            localStorage.removeItem('cio-me');
        }
    }

    function getUserDetails() {
        var data = $.parseJSON(localStorage.getItem('cio-me'));
        if (!data.currentOrg && data.organizations) {
            data.currentOrg = data.organizations[0];
        }
        return data;
    }

    function postLead(options) {

        var lead = options.lead;
        lead.organization_id = getUserDetails().currentOrg.id;

        var ajax = function() {
            $.ajax({
                url: appUrl + '/api/v1/lead/',
                type: "POST",
                beforeSend: function(xhr, settings) {
                    xhr.setRequestHeader("X-CSRFToken", csrfToken);
                },
                data: JSON.stringify(lead),
                contentType: "application/json",
                success: function(response) {
                    options.success(response);
                },
                error: function(xhr) {
                    console.log(xhr);
                    options.error(xhr);
                }
            });
        };

        if (!csrfToken) {
            chrome.cookies.get({ url: appUrl, name: '_csrf_token' }, function(cookie) { 
                csrfToken = cookie.value;
                ajax();
            });
        } else {
            ajax();
        }

    }

    return {
        init: function() {

            // Modify the Referer (to avoid CORS) and Origin (to properly validate the CSRF token)
            chrome.webRequest.onBeforeSendHeaders.addListener(
                function(details) {
                    var setHeader = function(name, value) {
                        var found = false;
                        for (var i = 0; i < details.requestHeaders.length; i++) {
                            if (details.requestHeaders[i].name === name) {
                                found = true;
                                details.requestHeaders[i].value = value;
                                break;
                            }
                        }
                        if (!found) {
                            details.requestHeaders.push({ name: name, value: value });
                        }
                    };
                    setHeader('Referer', CIOClipper.Settings.appUrl);
                    setHeader('Origin', CIOClipper.Settings.appUrl);
                    return { requestHeaders: details.requestHeaders };
                },
                {urls: ["<all_urls>"]},
                ["requestHeaders", "blocking"]
            );

            // Whenever the session cookie is changed, check if the user is logged in by trying to get the /me/ data
            chrome.cookies.onChanged.addListener(function(c) {
                if(c.cause === 'explicit' && (c.cookie.name === 'session' || c.cookie.name === '_csrf_token') && appUrl.host() === c.cookie.domain) {
                    if (c.cookie.value !== localStorage.getItem('cio-' + c.cookie.name + '-cookie')) {
                        localStorage.setItem('cio-' + c.cookie.name + '-cookie', c.cookie.value);
                        loadUserDetails({
                            success: function(resp) {
                                // Save the CSRF token locally
                                chrome.cookies.get({ url: appUrl, name: '_csrf_token' }, function(cookie) { 
                                    csrfToken = cookie.value;
                                });
                                chrome.browserAction.setPopup({ popup: 'templates/menu.html'});
                            },
                            error: function(xhr) {
                                chrome.browserAction.setPopup({ popup: 'templates/sign_in.html'});
                            }
                        });
                    }
                }
            });

            // Set the popup template depending on whether we're signed in or not
            if (getSignedIn()) {
                chrome.browserAction.setPopup({ popup: 'templates/menu.html' });
            } else {
                chrome.browserAction.setPopup({ popup: 'templates/sign_in.html'});
            }

            // Load user details (i.e. /me/) and set the popup template to the menu
            // (upon success) or to the sign-in page (upon failure)
            loadUserDetails({
                success: function() {
                    chrome.browserAction.setPopup({ popup: 'templates/menu.html' });
                },
                error: function() {
                    chrome.browserAction.setPopup({ popup: 'templates/sign_in.html' });
                }
            });

            chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
                if (request.type === 'login') {
                    login({
                        email: request.email,
                        password: request.password,
                        success: function(response, textStatus, request) {
                            sendResponse({
                                success: true
                            });
                        },
                        error: function(xhr) {
                            sendResponse({
                                statusCode: xhr.status,
                                message: xhr.statusText
                            });
                        }
                    });
                } else if (request.type === 'logout') {
                    logout({
                        success: function(response) {
                            setSignedIn(false);
                            setUserDetails(false);
                            chrome.browserAction.setPopup({
                                popup: 'templates/sign_in.html'
                            });
                            sendResponse({
                                success: true
                            });
                        }
                    });
                } else if (request.type === 'loadMenu') {
                    chrome.browserAction.setPopup({
                        popup: 'templates/menu.html'
                    });
                    sendResponse({ success: true });
                } else if (request.type === 'getUserDetails') {
                    var resp = getUserDetails();
                    sendResponse({
                        data: resp
                    });
                } else if (request.type === 'changeOrg') {
                    var data = getUserDetails();
                    $.each(data.organizations, function(idx) {
                        if(data.organizations[idx].id === request.id) {
                            data.currentOrg = data.organizations[idx];
                        }
                    });
                    setUserDetails(data);
                    sendResponse(data);
                } else if (request.type === 'postLead') {
                    var lead = request.lead,
                        url = lead.custom.original_url;

                    postLead({
                        lead: lead,
                        success: function(response) {
                            setPostedData(url, response.id, response.organization_id);

                            sendResponse({
                                success: true,
                                data: response,
                                url: appUrl + '/lead/' + response.id + '/'
                            });
                        },
                        error: function(xhr) {
                            sendResponse({
                                error: true,
                                xhr: xhr
                            });
                        }
                    });
                } else if (request.type === 'getCurrentLead') {
                    // Scrape the data from the last open window's active tab
                    chrome.windows.getLastFocused(function(win) {
                        chrome.tabs.query({ active: true, windowId: win.id }, function(tabs) {
                            if (tabs.length) {
                                chrome.tabs.sendRequest(tabs[0].id, {type: 'getLead'}, function(lead) {
                                    // send back the lead data and info if given url has been saved for any orgs
                                    sendResponse({
                                        lead: lead,
                                        postedData: getPostedData(tabs[0].url)
                                    });
                                });
                            }
                        });
                    });
                }
            });

        }
    };

}();

$(document).ready(function() {
    CIOClipper.Main.init();
});

