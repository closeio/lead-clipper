Close.io Lead Clipper
-------------------------
See the description at https://chrome.google.com/webstore/detail/closeio-lead-clipper/aigklicpjppgjmkjdebbnbddadnhdiop.

Test the extension locally
-------------------------
1. `grunt build`
1. Go to `chrome://extensions`, check the "Developer mode" (top-right corner)
   and click on the "Load unpacked extension" button.
1. Choose the `dist/` directory.

Contribution
-------------------------
To add a custom support for a specific website, add its domain to `getLead`
in `js/contentscript.js` and write a `handleDomainName()` function.

Release
-------------------------
Only the Close.io team is allowed to publish a new release. If you wish to
publish your changes, send a Pull Request our way and we'll take care of the
rest.
