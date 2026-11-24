**A Captcha field for Statamic's forms. Drag it into a form in the forms builder and visitors see Cloudflare Turnstile, hCaptcha or Google reCAPTCHA. Your server checks the token when the form is sent, and a submission without a valid one is refused, like any other field that doesn't validate.**

Free and open source, under the MIT licence. Built for Statamic 6.44's forms.

## A field, like any other

Set your provider and its keys once, in `.env`. Then drag Captcha into any form in the forms builder, from Structure. Each field has its own theme (auto, light or dark) and size (normal or compact, and full width with Turnstile).

## Four providers, one field

Cloudflare Turnstile, hCaptcha, Google reCAPTCHA v2 (the "I'm not a robot" checkbox) and reCAPTCHA v3 (no checkbox, a score). Change provider later without touching a form or a template. Add your own with `Captcha::extend()`.

## Checked on your server

The check is a validation rule on the field, so a failed one is an error under the field, like any other. Missing, forged, reused and expired tokens fail, and so does a provider that can't be reached within the timeout (5 seconds unless you change it). The token is never saved with the submission. On multi-page forms, the Captcha's page can't be skipped.

## Low scores, kept as spam

reCAPTCHA v3 scores each visit from 0.0 to 1.0. Each field chooses what a low score does: show an error, or keep the submission as spam for you to review. Spam is kept with Statamic's spam status, and no emails or connections are sent for it.

## Works with your templates

Statamic's own field rendering shows the widget with the rest of the form. Templates that write their own inputs place it with `{{ forms_captcha }}`, and Blade with `<s:forms_captcha :fields="$fields" />`. Publish the field's view to change its markup.

## Forms sent with JavaScript

Forms posted with `fetch()` or axios reset their widget after each response, so the next try gets a fresh token. reCAPTCHA v3 gets its token before your own submit handler runs. Precognition never uses a token up.

## Safe by default

Without keys, or with no provider set, every submission with a Captcha field is refused, so a form is never left open by mistake. The script loads each provider from its own address, and takes your Content Security Policy nonce.

## Coming from another captcha addon

The docs show how to move a site over from aryehraber/statamic-captcha: the same providers and keys, a field instead of a tag.

## Requirements

- Statamic 6.44 or later (its forms builder)
- PHP 8.3 or later
- An account with Cloudflare Turnstile, hCaptcha or Google reCAPTCHA (each has free plans)
