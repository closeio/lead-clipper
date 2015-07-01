$(document).ready(function() {
    var i, postedData;

    var checkDupeOrgs = function () {
        var orgId = $('.org-list').val(),
            dupe = false;
        if (postedData) {
            for (var i = 0; i < postedData.length; i++) {
                if (postedData[i].organization_id === orgId) {
                    $('.dupe-lead-url').attr('href', postedData[i].lead_url);
                    $('.dupe-org-alert').slideDown();
                    dupe = true;
                    break;
                }
            }
            if (!dupe) {
                $('.dupe-org-alert').slideUp();
            }
        }
    };

    var render = function(data) {

        // render top bar
        var fullName = (data.first_name || '') + ' ' + (data.last_name || '');
        $('.full-name').text(fullName);
        if (data.image) {
            $('.profile-pic').empty().append($('<img>', { src: data.image, alt: '' }));
        }

        if (data.organizations && data.organizations.length === 1 && data.organizations[0].status === 'trial_expired') {
            $('.lead-data').remove();
            $('.submit').remove();
            $('.trial-expired').show();
        } else {
            // render orgs dropdown
            if (data.organizations && data.organizations.length > 1) {
                var orgList = $('.org-list');
                $.each(data.organizations, function(idx) {
                    var org = data.organizations[idx];
                    if (org.status !== 'trial_expired' && org.status !== 'canceled') {
                        var opt = $('<option>', { value: org.id }).text(org.name);
                        orgList.append(opt);
                        orgList.val(data.currentOrg.id);
                    }
                });
            } else {
                $('.org-row').hide();
            }
        }
    };

    var renderLead = function($el, data) {
        var item;

        if (data) {
            if (data.url && data.url.indexOf('http') !== 0) {
                data.url = 'http://' + data.url;
            }
            $el.find('#name').val(data.name || '');
            $el.find('#url').val(data.url || '');
            $el.find('#description').val(data.description || '');
            if (data.contacts && data.contacts.length) {
                $('#contact_name').val(data.contacts[0].name);
                $('#contact_title').val(data.contacts[0].title);
                var emails = data.contacts[0].emails;
                var phones = data.contacts[0].phones;
                var urls = data.contacts[0].urls;
                if (emails && emails.length) {
                    for (i = 0; i < emails.length; i++) {
                        item = $('<li>');
                        item.append($('<input>', { type: 'text' }).val(emails[i].email));
                        item.append($('<i>', { 'class': 'trash' }));
                        $el.find('.emails').append(item);
                    }
                }
                if (phones && phones.length) {
                    for (i = 0; i < phones.length; i++) {
                        item = $('<li>');
                        item.append($('<input>', { type: 'text' }).val(phones[i].phone));
                        item.append($('<i>', { 'class': 'trash' }));
                        $el.find('.phones').append(item);
                    }
                }
                if (urls && urls.length) {
                    for (i = 0; i < urls.length; i++) {
                        item = $('<li>');
                        item.append($('<input>', { type: 'text' }).val(urls[i].url));
                        item.append($('<i>', { 'class': 'trash' }));
                        $el.find('.urls').append(item);
                    }
                }
            }
            if (data.addresses && data.addresses.length) {
                var address = data.addresses[0];
                $el.find('#address_1').val(address.address_1);
                $el.find('#address_2').val(address.address_2);
                $el.find('#city').val(address.city);
                $el.find('#state').val(address.state);
                $el.find('#zipcode').val(address.zipcode);
                $el.find('#country').val(address.country);
            }

            $.each(data.custom, function(key, val) {
                var keyEl = $('<input>', { 'class': 'custom-key', 'type': 'text', 'placeholder': 'Click to edit' });
                var valEl = $('<input>', { 'class': 'custom-value', 'type': 'text', 'placeholder': 'Click to edit' });
                keyEl.val(key);
                valEl.val(val);
                var keyCell = $('<td>').append(keyEl);
                var valCell = $('<td>').append(valEl);
                valCell.append($('<i>', { 'class': 'trash remove-custom' }));
                var row = $('<tr>', { 'class': 'custom-field' }).append(keyCell).append(valCell);
                $('.add-custom').closest('tr').before(row);
            });
        }
        $el.find('.emails').append($('<li>').append($('<a>', { 'class': 'add add-email' }).text('Add Email')));
        $el.find('.phones').append($('<li>').append($('<a>', { 'class': 'add add-phone' }).text('Add Phone')));
        $el.find('.urls').append($('<li>').append($('<a>', { 'class': 'add add-url' }).text('Add URL')));

        checkDupeOrgs();
    };

    function formToLead() {
        var url = $('#url').val() || null;
        if (url && url.indexOf('http') !== 0) {
            url = 'http://' + url;
        }
        var lead = {
            organization_id: $('.org-list').val(),
            name: $('#name').val() || null,
            url: url,
            description: $('#description').val() || null,
            addresses: [],
            contacts: [
                {
                    'name': $('#contact_name').val() || null,
                    'title': $('#contact_title').val() || null,
                    'emails': [],
                    'phones': [],
                    'urls': []
                }
            ],
            custom: {},
            creation_source: 'clipper'
        };
        $('.emails input').each(function() {
            var $el = $(this);
            if ($el.val()) {
                lead.contacts[0].emails.push({ email: $el.val(), type: 'office' });
            }
        });
        $('.phones input').each(function() {
            var $el = $(this);
            if ($el.val()) {
                lead.contacts[0].phones.push({ phone: $el.val(), type: 'office' });
            }
        });
        $('.urls input').each(function() {
            var $el = $(this);
            if ($el.val()) {
                url = $el.val();
                if (url.indexOf('http') !== 0) {
                    url = 'http://' + url;
                }
                lead.contacts[0].urls.push({ url: url, type: 'url' });
            }
        });
        $('.custom-field').each(function() {
            var key = $(this).find('.custom-key').val(),
                val = $(this).find('.custom-value').val();

            if (key && val) {
                lead.custom[key] = val;
            }
        });

        // make sure we don't send empty contact data
        if (lead.contacts) {
            var c = lead.contacts[0];
            if (!c.name && !c.title && c.emails.length === 0 && c.phones.length === 0 && c.urls.length === 0) {
                delete lead.contacts;
            }
        }

        var address = {};
        address.address_1 = $('#address_1').val();
        address.address_2 = $('#address_2').val();
        address.city = $('#city').val();
        address.state = $('#state').val();
        address.zipcode = $('#zipcode').val();
        address.country = $('#country').val();
        if (address.address_1 || address.address_2 || address.city || address.state || address.zipcode || address.country) {
            lead.addresses.push(address);
        }
        return lead;
    }

    // get the /me/ data stored locally
    chrome.extension.sendRequest({type: "getUserDetails"}, function(response) {
        render(response.data);
    });

    // scrape the lead data off of the active tab
    chrome.extension.sendRequest({type: "getCurrentLead"}, function(response) {
        postedData = response.postedData;

        renderLead($('.lead-data'), response.lead);
    });

    $(document).on('click', '.add', function(ev) {
        var $el = $(this),
            placeholder;
        if ($el.hasClass('add-email')) {
            placeholder = 'Email';
        } else if ($el.hasClass('add-url')) {
            placeholder = 'URL';
        }else {
            placeholder = 'Phone';
        }
        var item = $('<li>');
        var input = $('<input>', { type: 'text', placeholder: placeholder });
        item.append(input);
        item.append($('<i>', { 'class': 'trash' }));
        $el.parent().before(item);
        input.focus();
    });

    $(document).on('click', '.add-custom', function(ev) {
        ev.preventDefault();
        var keyCell = $('<td>').append($('<input>', { 'class': 'custom-key', 'type': 'text', 'placeholder': 'Click to edit' }));
        var valCell = $('<td>').append($('<input>', { 'class': 'custom-value', 'type': 'text', 'placeholder': 'Click to edit' }));
        valCell.append($('<i>', { 'class': 'trash remove-custom' }));
        var row = $('<tr>', { 'class': 'custom-field' }).append(keyCell).append(valCell);
        $(this).closest('tr').before(row);
    });

    $(document).on('click', '.trash', function(ev) {
        var $el = $(this).parent();
        if ($(this).hasClass('remove-custom')) $el = $el.parent();
        $el.remove();
    });

    $('.save-lead').click(function() {
        var lead = formToLead();

        $('.overlay').addClass('loading').show();

        chrome.extension.sendRequest({type: "postLead", lead: lead}, function(response) {
            if (response.success) {
                $('.overlay').removeClass('loading');
                $('.lead-url').attr('href', response.url);
                $('.post-success').show();
                setTimeout(function() {
                    $('.post-info').fadeOut();
                    $('.overlay').fadeOut(function() {
                        window.close();
                    });
                }, 3000);
            } else {
                $('.validation-errors').html('');
                $('.overlay').removeClass('loading');
                if (response.xhr.status === 400) {
                    var err = $.parseJSON(response.xhr.responseText);
                    var fieldErrors = err['field-errors'];
                    var msg = '<br><br>';
                    var errorKeys = Object.keys(fieldErrors);
                    var customErrorKeys = [];
                    for (var i = 0; i < errorKeys.length; i++) {
                        if (errorKeys[i].indexOf('custom.') === 0) {
                            customErrorKeys.push(errorKeys[i]);
                        }
                    }
                    if (customErrorKeys.length) {
                        msg += 'Invalid custom fields: ' + customErrorKeys.join(', ');
                    } else if (fieldErrors.addresses) {
                        // wrong country code
                        msg += 'The country code has to be a 2-letter abbreviation.';
                    } else if (fieldErrors.phones) {
                        msg += 'Some phone numbers are invalid.';
                    } else if (fieldErrors.url) {
                        // invalid lead url
                        msg += 'The lead URL is invalid';
                    } else if (fieldErrors.contacts && fieldErrors.contacts.errors) {
                        if (fieldErrors.contacts.errors.emails) {
                            // invalid email
                            msg += 'Some email addresses are invalid.';
                        }
                        if (fieldErrors.contacts.errors.urls) {
                            // invalid contact url
                            msg += "Some of the contact's URLs are invalid.";
                        }
                    }
                    msg += '<br><br>';
                    $('.validation-errors').html(msg);
                }

                $('.post-error').show();

                // Fix the position of the error info (needs a small delay to compute outerHeight correctly)
                setTimeout(function() {
                    var offset = (-1 / 2 * $('.validation-errors').outerHeight()) + 'px';
                    $('.post-error').css('margin-top', offset);
                }, 10);

                var ackBtn = $('<button>', { 'class': 'btn' }).text('Go back');
                $('.post-error').append(ackBtn);
                ackBtn.click(function() {
                    $('.overlay').fadeOut(function() {
                        ackBtn.remove();
                    });
                    $('.post-info').fadeOut();
                });
            }
        });
    });

    $('.change-org').click(function() {
        $(this).toggleClass('active');
        $('.orgs').slideToggle();
    });

    $('.org-list').change(function() {
        var id = $(this).val();
        chrome.extension.sendRequest({type: "changeOrg", id: id});
        $('body').focus();

        checkDupeOrgs();
    });

    $('.sign-out').click(function() {
        chrome.extension.sendRequest({ type: "logout" }, function(response) {
            window.close();
        });
    });

    // workaround to defocus the first anchor (for some reason, it gets the focus automatically)
    var body = $('body');
    var timer = setInterval(function() {
        body.focus();
        if(body.is(':focus')) {
            clearInterval(timer);
        }
    }, 300);

    // lose the focus on enter
    $(document).on('keydown', 'input', function(ev) {
        if (ev.keyCode === 13) {
            $('body').focus();
        }
    });

});

