**Collect newsletter subscribers on your own Statamic site. Add `{{ newsletter }}` to a template; people who sign up get an email to confirm (double opt-in), and only then join the list. The list is in the Control Panel, ready to download as a CSV for Mailchimp, Brevo, Campaign Monitor or whatever you send with.**

Newsletter doesn't send newsletters. It keeps a clean, consented list, and hands it over.

## A form in one tag

`{{ newsletter }}` gives you an accessible sign-up form that works without JavaScript. Wrap your own fields in `{{ newsletter }}...{{ /newsletter }}`, or publish the views and make them yours. Post with `fetch()` and get the answer as JSON.

## Double opt-in, done properly

Each sign-up is emailed a signed link that lasts 72 hours. The link opens a page with a button, so mail scanners that open links can't confirm anyone by themselves.

## A record of consent

The wording next to the tick box is saved with each sign-up, with when they signed up, when they confirmed and the page the form was on.

## The list in the Control Panel

Tools > Newsletter: how many are waiting to confirm, subscribed and unsubscribed, with search, a filter by status, and delete. Permissions to see the list, download it, and delete subscribers.

## Download it as a CSV

The confirmed list, or whatever the page is showing. Each row carries the subscriber's own unsubscribe link, to merge into the emails you send. It opens cleanly in Excel, and no cell can run as a spreadsheet formula.

## Unsubscribe in one click

Every subscriber has an unsubscribe link that works with mail apps' one-click unsubscribe (the `List-Unsubscribe` header).

## No leaks, little spam

The form says the same thing whether an address is new or already subscribed, so it can't be used to find out who is on your list. A hidden honeypot field, a limit on sign-ups per visitor and a limit on confirmation emails per address. And a captcha if you want one: Cloudflare Turnstile, hCaptcha, Google reCAPTCHA v2 or v3, or your own. No IP addresses are kept.

## Tidy

Sign-ups nobody confirmed are deleted after 30 days, by Laravel's scheduler.

## Your wording

The confirmation email's subject, heading, text, button and colour in the addon's settings, in each site's language when left empty. Your own pages after confirming or unsubscribing, if you like. Anyone can be told about new subscribers by email.

## Events

`Subscribing` (turn a sign-up away), `Confirmed` (send them on to your email platform) and `Unsubscribed`.

## Requirements

- Statamic 6.35 or later
- PHP 8.3 or later
- A database: subscribers are kept in a table, whichever way Statamic keeps your content
- Laravel's mail set up
