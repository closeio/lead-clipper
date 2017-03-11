// This file contains handlers for all the websites that we want to support
// explicitly plus the default handler we use everywhere else.

String.prototype.host = function() {
    var parser = document.createElement('a');
    parser.href = this;
    return parser.hostname;
};

String.prototype.path = function() {
    var parser = document.createElement('a');
    parser.href = this;
    return parser.pathname;
};

String.prototype.hash = function() {
    var parser = document.createElement('a');
    parser.href = this;
    return parser.hash;
};

String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
};

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.reverse = function() {
    return this.split("").reverse().join("");
};


// Taken from http://rosskendall.com/files/rfc822validemail.js.txt
// under a Creative Commons Attribution-ShareAlike 2.5 License
function isRFC822ValidEmail(sEmail) {
    var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
    var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
    var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
    var sQuotedPair = '\\x5c[\\x00-\\x7f]';
    var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
    var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
    var sDomain_ref = sAtom;
    var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
    var sWord = '(' + sAtom + '|' + sQuotedString + ')';
    var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
    var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
    var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
    var sValidEmail = '^' + sAddrSpec + '$'; // as whole string
    
    var reValidEmail = new RegExp(sValidEmail);
    
    if (reValidEmail.test(sEmail)) {
      return true;
    }
    
    return false;
}

// Taken from http://www.kevinleary.net/jquery-parse-url/
function getQueryParam(href, query) {
    query = query.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var expr = "[\\?&]"+query+"=([^&#]*)";
    var regex = new RegExp(expr);
    var results = regex.exec(href);
    if (results !== null) {
        return decodeURIComponent(results[1].replace(/\+/g, " "));
    } else {
        return false;
    }
}

function isInUS(location)
{

//Is a location in the US? Used to choose State Vs. Country in Address fields with 1 comma on LinkedIn.

 array = ['Alabama','Alaska','American Samoa','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Federated States of Micronesia','Florida','Georgia','Guam','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Marshall Islands','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Northern Mariana Islands','Ohio','Oklahoma','Oregon','Palau','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];
  for(var i = 0; i < array.length; i++) 
  {
    if(array[i] === location)
    {
      return true;
    }
  }

  return false; 
}

function handleFacebook() {
    // Sample pages to test:
    // https://www.facebook.com/gnrlassembly/info
    // https://www.facebook.com/lemonstand/info
    // https://www.facebook.com/flagstaffhouserestaurant/info
    var lead = {},
        url = window.location.href;

    lead.name = $('#fbProfileCover h2').text();

    if (url.path().match(/\/info$/i)) { // About page

        var pageInfoListEl = $('div[data-id="page_info"] ul.uiList');

        var j = 0;
        pageInfoListEl.find('li').each(function() {
            var title = $($(this).find('div.clearfix').find('div')[0]).text().trim();
            var value = $($(this).find('div.clearfix').find('div')[2]).text().trim();
            j += 1;

            if (value) {
                if (title === 'Short Description') {
                    lead.description = value;
                } else if (title ==='Email') {
                    if (!lead.contacts) {
                        lead.contacts = [{}];
                    }
                    lead.contacts[0].emails = [ { email: value } ];
                } else if (title === 'Website') {
                    lead.url = value.split(' ')[0];
                } else if (title === 'Phone') {
                    if (!lead.contacts) {
                        lead.contacts = [{}];
                    }
                    lead.contacts[0].phones = [ { phone: value } ];
                } else if (title === 'Address') {
                    var parts = value.split(',');
                    if (parts.length === 3) {
                        lead.addresses = [
                            {
                                address_1: parts[0].trim(),
                                city: parts[1].trim(),
                                state: parts[2].trim().split(' ')[0].trim(),
                                zipcode: parts[2].trim().split(' ')[1].trim()
                            }
                        ];
                    } else {
                        lead.addresses = [
                            {
                                address_1: parts[0].trim()
                            }
                        ];
                    }
                }
            }
        });
    } else {  // Profile page
        var website = $('div[id^="PageStructuredContentPagelet"] a[rel="nofollow"]');
        if (website.length) {
            lead.url = website.text();
        }
    }

    return lead;
}

function handleLinkedIn() {

    //open contact panel for contact data
    //note: Due to a weird linkedin bug, for the panel to be opened via code on successive linkedin leads, without refreshing the browser, the button must be clicked twice. 
    if($("button.contact-see-more-less.link-without-visited-state").attr("data-control-name") === "contact_see_more")
    {
        $("button.contact-see-more-less.link-without-visited-state").click();
        
        if($("button.contact-see-more-less.link-without-visited-state").attr("data-control-name") === "contact_see_more")
            $("button.contact-see-more-less.link-without-visited-state").click();
    }    

    //Company and position
    var posatcom = $("div.pv-top-card-section__information.mt3").find("h2").first().text().trim().split(" at ");

    //Name of Contact
    var name = $("div.pv-top-card-section__information.mt3").find("h1").first().text();

    //*******Description Stuff **************\\
    //When description is truncated, get full description
    var description = $("div.truncate-multiline--truncation-target").find("span").first().text().trim() + " " + $("div.truncate-multiline--truncation-target").find("span").last().text().trim();
    //When the description is not truncated, get full description 
    if(description === " ")
    {
        description = $("div.pv-top-card-section__rich-content.ph2").find("p").first().text().trim();
        //remove show less from description text
        description = description.slice(0, -16);

    }

    //For extremely short descriptions
    else if ($("div.truncate-multiline--truncation-target").find("span").first().text().trim() === $("div.truncate-multiline--truncation-target").find("span").last().text().trim())
        description = $("div.truncate-multiline--truncation-target").find("span").first().text();


   //Get Phone Number from Contact Details
    var phone = $("section.pv-contact-info__contact-type.ci-phone").find("li").first().text().match(/[\+\d\s\-\.]+/);
    if (phone && phone.length > 0) {
        phone = $.trim(phone[0]);
    }

    phone = phone || "";

    //Get Email Address From Contact Details
    var email = $("section.pv-contact-info__contact-type.ci-email").find("span").last().text().trim();

    //parse addresses on linkedin
    var address_full = document.getElementsByClassName("pv-top-card-section__location Sans-15px-black-55% mb1 inline-block")[0].innerHTML|| "" ;
    address_full = address_full.replace('Area', '');
    address_full = address_full.replace('Greater', '');
    address_full = address_full.trim();
    var city = "", state = "", country = "", address_1 = "";
    var address = address_full.split(',');

    if(address.length === 3)
    {
        city = address[0];
        state = address [1];
        country = address [2];
    }

    else if(address.length == 2)
    {
        if(isInUS(address[1].trim()))
        {
            city = address[0];
            state = address[1]; 
        }

        else
        {
            city = address[0];
            country = address[1]; 
        }
    }

    else
        address_1 = address[0];

    //get all website urls
    var website_urls = $("section.pv-contact-info__contact-type.ci-websites").find("li").toArray();

    //for skype in the future. 
    //var im_names = $("section.pv-contact-info__contact-type.ci-ims").find("li").toArray();
   
   //get twitter handle for contact
    var twitterHandle = $("section.pv-contact-info__contact-type.ci-twitter").find('a').first().attr("href") || "";


    var lead = {};

    if (posatcom[1]) 
        lead.name = posatcom[1];

    lead.contacts = [
        {
            name: name ? name : null,
            emails: email ? [{ 'email': email, 'type': 'office' }] : [],
            title: posatcom[0] ? posatcom [0] : null,
            phones: phone ? [{ 'phone': phone, 'type': 'office' }]: [],
            urls: []
        }
    ];
    
    //url for this lead being created defaults to the linkedin-url if no company website is in contact details
    lead.url = window.location.href;

    //description of lead taken from linkedin profile 
    if (description) 
        lead.description = description;

    //push address to lead
    if (address) 
        lead.addresses = [{ 'state': state.trim(), 'city': city.trim(), 'country' : country.trim(), 'address_1': address_1.trim() }];

    lead.custom = {
        source: 'LinkedIn'
    };

    var twitter =  twitterHandle || "";
    var websites = website_urls || "";
    
    //push twitter handle to lead
    if (twitter) {
        lead.contacts[0].urls.push({ 'url': twitter, 'type': 'url' });
    }

    //push website url to lead
    if (websites) {
        for (var i=0,  len=website_urls.length; i < len; i++) 
        {
            var website_link = $(website_urls[i]).find('a').first().attr("href");
            var website_type = $(website_urls[i]).find('span').first().text().trim();
            //if it's a company website, change the url of the main lead
            if(website_type === "(Company Website)")
                lead.url = website_link;
            else
                lead.contacts[0].urls.push({ 'url': website_link, 'type': 'url' });
        }
    }

    //push skype urls to lead (for the future)
    // if(im_names)
    // {
    //     for (var k=0,  leng=im_names.length; k < leng; k++) 
    //     {
    //         var handle = $(im_names[k]).find("span").text();
    //         var str_open_paren = handle.split('(')[1];
    //         var platform = str_open_paren.split(')')[0].trim();
    //         if(platform === "Skype")
    //         {
    //             var skype_handle = handle.split('(')[0].trim();
    //             //lead.contacts[0].urls.push({ 'url': "skype://" + skype_handle, 'type': 'url' });
    //         }
            
    //     }
    // }

    return lead;
}

function handleGitHub() {
    var lead = {};
    if ($('body').hasClass('org-profile')) {
        lead.name = $('span[itemprop="name"]').text();
    } else {
        lead.name = $('dd[itemprop="worksFor"]').text();
        lead.contacts = [{
            name: $('span[itemprop="name"]').text().trim()
        }];
        if ($('.email').length) {
            lead.contacts[0].emails = [{ email: $('.email').text().trim(), type: 'office' }];
        }
    }
    lead.addresses = [
        {
            city: $('dd[itemprop="homeLocation"]').text().trim()
        }
    ];
    lead.url = $('dd[itemprop="url"]').text();
    return lead;
}

function handleYelp() {
    var url = getQueryParam($('.biz-website a').attr('href'), 'url');
    var lead = {
        name: $('h1[itemprop="name"]').text().trim(),
        url: url,
        addresses: [],
        contacts: [
            {
                emails: [],
                phones: []
            }
        ],
        custom: {}
    };

    var address = $('span[itemprop="streetAddress"]').html();
    if (address) {
        address = address.split('<br>');

        if (address.length === 1) {
            address = {
                'address_1': address[0].trim()
            };
        } else if (address.length >= 2) {
            address = {
                'address_1': address[0].trim(),
                'address_2': address[1].trim()
            };
        }

        address.city = $('span[itemprop="addressLocality"]').text().trim();
        address.state = $('span[itemprop="addressRegion"]').text().trim();
        address.zipcode = $('span[itemprop="postalCode"]').text().trim();
        address.country = $('span[itemprop="addressCountry"]').text().trim();
        lead.addresses.push(address);
    }


    var phone = $('span[itemprop="telephone"]').text().trim();
    if (phone) {
        lead.contacts[0].phones = [{ phone: phone, type: 'office' }];
    }

    return lead;
}

function handleCrunchBase() {
    var i;
    
    var name = $('h1.h1_first').clone();
    name.find('.right').remove();
    name = name.text().trim();

    var lead = {
        name: name,
        contacts: [{
            phones: [],
            emails: [],
            urls: []
        }],
        addresses: [{}],
        custom: {}
    };

    var dataRows = $('#col1 table tr');
    for (i = 0; i < dataRows.length; i++) {
        var row = $(dataRows[i]),
            label = row.find('.td_left').text().trim(),
            value = row.find('.td_right').text().trim(),
            href = row.find('.td_right a').attr('href');

        if (href) {
            if (href.indexOf('mailto:') === 0) {
                href = unescape(href.substring(7));
            } else if (href.indexOf('http') !== 0) {
                href = 'http://' + href;
            }
        }

        switch (label) {
            case 'Website':
                lead.url = href;
                break;
            case 'Blog':
                lead.contacts[0].urls.push({ url: href, type: 'url' });
                break;
            case 'Twitter':
                lead.contacts[0].urls.push({ url: href, type: 'url' });
                break;
            case 'Phone':
                lead.contacts[0].phones = [{ phone: value, type: 'office' }];
                break;
            case 'Email':
                lead.contacts[0].emails = [{ email: href, type: 'office' }];
                break;
            case 'Employees':
                lead.custom.employees = value;
                break;
            case 'Founded':
                lead.custom.founded = value;
                break;
            case 'Description':
                lead.description = value;
        }
    }

    var addressEl = $('.col1_office_address');
    if (addressEl.length) {
        addressEl = $(addressEl[0]);
        var address = addressEl.clone();
        address.find('a').remove();
        address = address.html().split('<br>');
        if (address.length === 1) {
            lead.addresses[0].address_1 = address[0].trim();
        } else if (address.length >= 2) {
            lead.addresses[0].address_1 = address[0].trim();
            lead.addresses[0].address_2 = address[1].trim();
        }

        // dont include the addresses that have only spaces and colons
        if (lead.addresses[0].address_1.match(/^[ ,]*$/g)) {
            lead.addresses[0].address_1 = '';
        }
        if (lead.addresses[0].address_2.match(/^[ ,]*$/g)) {
            lead.addresses[0].address_2 = '';
        }

        var links = addressEl.find('a');
        links.each(function() {
            var link = $(this);
            if (link.attr('href').indexOf('/maps/city/') === 0) {
                lead.addresses[0].city = link.text().trim();
            } else if (link.attr('href').indexOf('/maps/state/') === 0) {
                lead.addresses[0].state = link.text().trim();
            } else if (link.attr('href').indexOf('/maps/zip/') === 0) {
                lead.addresses[0].zipcode = link.text().trim();
            } else if (link.attr('href').indexOf('/maps/country/') === 0) {
                lead.addresses[0].country = link.text().trim();
            }
        });
    }

    return lead;
}

function handleGmail() {
    var lead = {},
        name,
        email;

    // Get contact data of the first uncollapsed email
    var contacts = $('.gE:not(.hI)');
    if (contacts.length) {
        contacts.each(function() {
            var el = $(this).find('.gD');

            // check if it's not the account owner's email
            if (el.attr('email') !== $('#gbi4t').text()) {
                name = el.text().trim();
                email = el.attr('email');
            }
        });
    }

    if (name && email) {
        lead.contacts = [{ name: name, emails: [{ email: email, type: 'office' }] }];
    }

    return lead;
}

function handleJigsaw() {
    // works great with Jigsaw Unlimited plan
    var lead = {
        name: $('#companyname').text().trim(),
        addresses: [
            {
                address_1: $('#address').text().trim(),
                address_2: $('#address2').text().trim(),
                city: $('#city').text().trim(),
                state: $('#state').text().trim(),
                zipcode: $('#zip').text().trim(),
                country: $('#country').text().trim()
            }
        ],
        contacts: [
            {
                name: ($('#firstname').text().trim() + ' ' + $('#lastname').text().trim()).trim(),
                title: $('#title').text().trim()
            }
        ]
    };

    if ($('#phone').length) {
        lead.contacts[0].phones = [{ phone: $('#phone').text().trim(), type: 'office' }];
    }
    if ($('#email').length) {
        lead.contacts[0].emails = [{ email: $('#email').text().trim(), type: 'office' }];
    }

    return lead;
}

function handleQuora() {
    var lead = {
        contacts: [
            {
                urls: []
            }
        ]
    };

    var nameAndTitle = $('.profile_name_sig').text().trim().split(',');
    lead.contacts[0].name = nameAndTitle[0];
    if (nameAndTitle.length > 2) {
        lead.contacts[0].title = nameAndTitle[1];
    }
    var socialIcons = $('.sn_icon_stack a');
    socialIcons.each(function() {
        var url = $(this).attr('href');
        lead.contacts[0].urls.push({ url: url, type: 'url' });
    });

    return lead;
}

function handleAngelList() {
    var lead = {
        name: $($('.name')[0]).text().trim(),
        description: $('.high_concept').text().trim(),
        addresses: [{
        }],
        contacts: [{
            urls: []
        }]
    };

    var addr = $('.location-tag').text().split(',');
    if (addr.length === 1) {
        lead.city = addr[0].trim();
    } else if (addr.length === 2) {
        lead.city = addr[0].trim();
        lead.state = addr[1].trim();
    }
    $('.tags').next().find('a').each(function() {
        var url = $(this).attr('href');
        if ($(this).hasClass('website-link')) {
            lead.url = url;
        } else {
            lead.contacts[0].urls.push({ url: url, type: 'url' });
        }
    });

    return lead;
}

function handleZoominfo() {
    // test cases:
    // http://subscriber.zoominfo.com/zoominfo/#!search/profile/person?personId=389873122&targetid=profile
    // http://subscriber.zoominfo.com/zoominfo/#!search/profile/company?companyId=79659434&targetid=profile

    var zoominfoAddress = function(addr) {
        addr = addr.split('<br>');
        var stateZip = addr[1].split(',')[1].split(' ');
        return {
            address_1: addr[0].trim(),
            city: addr[1].split(',')[0].trim(),
            state: stateZip.slice(0, stateZip.length - 1).join(' ').trim(),
            zipcode: stateZip[stateZip.length - 1].trim(),
            country: addr[2].trim()
        };
    };

    var lead = {};

    if (window.location.href.hash().startsWith('#!search/profile/person/')) {
        lead.name = $('.personCompanyName').text().trim();
        lead.contacts = [
            {
                name: $('.personSummary h1').text().trim(),
                title: $('#personContact #title').text().trim()
            }
        ];

        if ($('.detailContactInfo .phoneNumber').length) {
            var phone = $('.detailContactInfo .phoneNumber').text().trim();
            phone = phone.replace('Phone:', '').trim();
            lead.contacts[0].phones = [
                {
                    phone: phone,
                    type: 'office'
                }
            ];
        }

        if ($('.detailContactInfo .personEmail').length) {
            var email = $('.detailContactInfo .personEmail').text().trim();
            email = email.replace('Email:', '').trim();
            lead.contacts[0].emails = [
                {
                    email: email,
                    type: 'office'
                }
            ];
        }

        if ($('.companyAddress').length) {
            lead.addresses = [
                zoominfoAddress(jQuery('.companyAddress').html())
            ];
        }

        if ($('.companyBackgroundDescription').length) {
            lead.description = $('.companyBackgroundDescription').text().replace('Company Description: ', '').trim();
        }
        if (lead.description.endsWith('more')) {
            lead.description = lead.description.substr(0, lead.description.length - 4).trim() + '...';
        }



        return lead;
    } else if (window.location.href.hash().startsWith('#!search/profile/company')) {
        lead.name = $('.companyName').text().trim();

        if ($('.companyAddress').length) {
            lead.addresses = [
                zoominfoAddress(jQuery('.companyAddress').html())
            ];
        }

        if ($('.companyContact a').length) {
            lead.url = $('.companyContact a').attr('href');
        }

        return lead;
    }
}

function handleWlw() {
    var lead = {
        name: $('.profile-company-name').text().trim()
    };

    if ($('a[itemprop="telephone"].btn').length) {
        if (!lead.contacts) {
            lead.contacts = [{}];
        }
        var phone = $('a[itemprop="telephone"].btn').attr('href').trim();
        phone = phone.replace('tel:', '').trim();
        lead.contacts[0].phones = [{ phone: phone, type: 'office' }];
    }
    if ($('a[itemprop="email"].btn').length) {
        if (!lead.contacts) {
            lead.contacts = [{}];
        }
        var email = $('a[itemprop="email"].btn').attr('href').trim();
        email = email.replace('mailto:', '').reverse();
        lead.contacts[0].emails = [{ email: email, type: 'office' }];
    }
    if ($('a[itemprop="url"].btn').length) {
        lead.url = $($('a[itemprop="url"].btn')[0]).attr('href').trim();
    }

    return lead;
}

function handleDefault() {
    var usPhoneRegex = /((?:\+?1[\-. ]?)?\(?[0-9]{3}\)?[\-. ]?[0-9]{3}[\-. ]?[0-9]{4})+/ig,
        intlPhoneRegex = /(\+(?:[0-9] ?){6,14}[0-9])+/ig,
        body = $('body').clone(),
        phones = [],
        emails = [],
        i;

    body.find('script').remove();
    body = body.text().trim();

    // US Phones
    phones = body.match(usPhoneRegex) || [];

    // International Phones
    phones = phones.concat(body.match(intlPhoneRegex) || []);

    // Dedupe phones
    var p = [].concat(phones);
    phones = [];

    for (i = 0; i < p.length; i++) {
        var normalized = p[i].replace(/[\- ]/g, '');
        if (-1 === phones.indexOf(normalized)) {
            phones.push(normalized);
        }
    }

    // Emails
    var potentialEmails = [];
    var words = body.match(/\S+/g);
    for (i = 0; i < words.length; i++) {
        var w = words[i].trim();
        if (w.indexOf('@') !== -1) {
            potentialEmails.push(w);
        }
    }

    for (i = 0; i < potentialEmails.length; i++) {
        var e = potentialEmails[i];
        if (isRFC822ValidEmail(e) && emails.indexOf(e.toLowerCase()) === -1) {
            emails.push(e);
        }
    }


    // Transform scraped data into a lead obj
    var lead = {
        contacts: [],
        custom: {}
    };

    var contact = {
        emails: [],
        phones: []
    };

    for (i = 0; i < phones.length; i++) {
        contact.phones.push({ phone: phones[i], type: 'office' });
    }

    for (i = 0; i < emails.length; i++) {
        contact.emails.push({ email: emails[i], type: 'office' });
    }

    lead.contacts.push(contact);
    return lead;
}

function getLead(callback) {
    var hostname = window.location.href.host();
    var lead = null;

    switch (hostname) {
        case "www.facebook.com":
            lead = handleFacebook();
            break;
        case "www.linkedin.com":
            lead = handleLinkedIn();
            break;
        case "github.com":
            lead = handleGitHub();
            break;
        case "www.yelp.com":
            lead = handleYelp();
            break;
        case "www.crunchbase.com":
            lead = handleCrunchBase();
            break;
        case "mail.google.com":
            lead = handleGmail();
            break;
        case "www.jigsaw.com":
            lead = handleJigsaw();
            break;
        case "www.quora.com":
            lead = handleQuora();
            break;
        case "angel.co":
            lead = handleAngelList();
            break;
        case "subscriber.zoominfo.com":
            lead = handleZoominfo();
            break;
        case "www.wlw.de":
            lead = handleWlw();
            break;
        default:
            lead = handleDefault();
    }

    if (lead) {
        if (lead.url && lead.url.indexOf('http') !== 0) {
            lead.url = 'http://' + lead.url;
        }
        if (!lead.custom) {
            lead.custom = {};
        }
        if (!lead.custom.original_url) {
            lead.custom.original_url = window.location.href;
        }
        callback(lead);
    } else {
        callback(null);
    }
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.type === 'getLead') {
        getLead(sendResponse);
    }
});

