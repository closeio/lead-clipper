$(document).ready(function() {

    var emailInput = $('#user_email');
    var passwordInput = $('#user_password');

    $('#login_form').submit(function() {
        $('#loading').show();
        $("#error").hide();
        $('#login_form').hide();
        $('#h1_text').hide();

        var email = emailInput.val();
        var password = passwordInput.val();

        chrome.extension.sendRequest({
                type: "login",
                email: email,
                password: password
            }, 
            function(response) {
                if (response.success) {
                    $('#loading').hide();
                    $("#success").show();
                    
                    chrome.extension.sendRequest({ type: "loadMenu" }, 
                        function(response) {
                            setTimeout(function(){
                                window.close();
                            }, 1000);
                        }
                    );
                } else {
                    $('#loading').hide();
                    $('#login_form').show();
                    $('#h1_text').show();
                    $("#error").show();
                }
            }
        );

        return false;
        
    });

    // workaround to focus the email input field
    var timer = setInterval(function() {
        emailInput.focus();
        if(emailInput.is(':focus')) {
            clearInterval(timer);
        }
    }, 300);
  
});

