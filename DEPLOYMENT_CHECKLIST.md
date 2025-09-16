# Deployment Checklist

## Pre-deployment

*   [ ] Verify that all tests are passing.
*   [ ] Verify that the `.env` file contains the correct Supabase credentials for the production environment.
*   [ ] Verify that the Supabase function `fetch-rss-feeds` is deployed and the cron job is configured to run at least once a day.

## Deployment

*   [ ] Build the application for production using `npm run build`.
*   [ ] Deploy the contents of the `dist` directory to the production server.

## Post-deployment

*   [ ] Verify that the application is running correctly in the production environment.
*   [ ] Monitor the Supabase function logs to ensure that the RSS feed is being updated regularly.
