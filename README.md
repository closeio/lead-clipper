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
Only the Close.io team can publish a new release. If you wish to
publish your changes, send a Pull Request our way and we'll take care of the
rest.

Release instructions for Close.io team:
-------------------------
You'll need `key.pem` in the root of your local repo to publish the update. Ask your co-workers for it.

```
grunt build:prod
zip dist.zip -r dist
```

1. Go to http://chrome.google.com/webstore/ and log in as support@close.io (ask co-workers for credentials).
1. Click the gear icon in the top-right corner and go to "Developer Dashboard".
1. Click "Edit" in the "Close.io Lead Clipper" section.
1. Click "Upload Updated Package" and choose the zip file generated in point 2.
1. Click "Publish changes" after the package is uploaded.
