# Investment helper (phone app)

## 1. Put it on GitHub Pages
1. Make a new GitHub repository (example name: investment-helper).
2. Upload all files from this folder (index.html, manifest.json, sw.js, drive-config.js, icon-192.png, icon-512.png).
3. Repo Settings > Pages > Deploy from branch "main", folder "/ (root)". Your address will be https://YOURNAME.github.io/investment-helper/

## 2. Turn on Google Drive sync
1. Use the same Google Cloud OAuth Client ID as your Ledger app. The address is the same site (YOURNAME.github.io), so nothing new is needed in the console.
2. Paste the Client ID into drive-config.js and save the file on GitHub.
3. Open the app > Settings > Your data > Sync now > sign in. It makes a private file in your Drive app folder.
4. On another device, open the app and tap Sync now too.

## 3. Move your data from the claude.ai version
1. In the old app: Settings > Save a backup file.
2. In the new app: Settings > choose the file > Restore this backup.

## 4. Install on your phone
Open the address in Chrome > menu > Add to Home screen (or Install app).

## 5. Automatic prices
Holdings > each fund > type words > Find fund code > pick the fund. Link the price once. After that, prices update when you open the app, or tap Update all prices now.
