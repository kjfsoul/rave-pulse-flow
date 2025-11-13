# Deployment Checklist

## Pre-deployment

*   [ ] Verify that all tests are passing.
*   [ ] Verify that the `.env` file contains the required environment variables.
*   [ ] Confirm GitHub Action `Update EDM News Feed` has run successfully within the last 24 hours.

## Deployment

*   [ ] Build the application for production using `npm run build`.
*   [ ] Deploy the contents of the `dist` directory to the production server.

## Post-deployment

*   [ ] Verify that the application is running correctly in the production environment.
*   [ ] Check the deployed site to confirm `/data/edm-news.json` served with current timestamp.
