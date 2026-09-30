# Calendar
## The App
The website is a WordPresss site where some links are cickable and reveal 2 blog posts where you can comment (in one of them).

## Exploring
`?p=1` has a blog post page where you can comment. First, I tried to create a comment aaannnd ... nothing? Interestingly, the URL is now `http://01.linux.challenges.ctf.thefewchosen.com:51490/?p=1&unapproved=2&moderation-hash=11d64a466de22952e34eaae54f57abc3#comment-2`. Seems like comments need to be approved or something.

Then I tried XSS but it does not really seem to work. The `<script>` tags seem to be removed and sometimes the commen isn't even listed.

Then I decided to look more closely at the source code of the page. I downloaded it from the "save all" menu in the browser and look at it in an IDE.

Then I found something suspicious. Some JavaScript named `mec-frontend` and some settings for some sort of calendar?

```html
<script id="mec-frontend-script-js-extra">
var mecdata = {
    "day": "day",
    "days": "days",
    "hour": "hour",
    "hours": "hours",
    "minute": "minute",
    "minutes": "minutes",
    "second": "second",
    "seconds": "seconds",
    "elementor_edit_mode": "no",
    "recapcha_key": "",
    "ajax_url": "http:\/\/01.linux.challenges.ctf.thefewchosen.com:51490\/wp-admin\/admin-ajax.php",
    "fes_nonce": "8f115b79dc",
    "current_year": "2022",
    "current_month": "07",
    "datepicker_format": "yy-mm-dd"
};
</script>
<script src="Hello%20world!%20%E2%80%93%20Reminder-Dateien/frontend.js" id="mec-frontend-script-js"></script>
<script src="Hello%20world!%20%E2%80%93%20Reminder-Dateien/events.js" id="mec-events-script-js"></script>
```

This looked suspicious, especially because the challange was called "Calendar" and had "Are online calendars trusty?" as a description.

Also, 2 other lines with a `<link>` Tag seemed weird:

```html
<link rel="alternate" type="application/json+oembed" href="http://01.linux.challenges.ctf.thefewchosen.com:51490/index.php?rest_route=%2Foembed%2F1.0%2Fembed&amp;url=http%3A%2F%2F01.linux.challenges.ctf.thefewchosen.com%3A51490%2F%3Fp%3D1">
<link rel="alternate" type="text/xml+oembed" href="http://01.linux.challenges.ctf.thefewchosen.com:51490/index.php?rest_route=%2Foembed%2F1.0%2Fembed&amp;url=http%3A%2F%2F01.linux.challenges.ctf.thefewchosen.com%3A51490%2F%3Fp%3D1&amp;format=xml">
```

Mec seems o relate to a WordPress Plugin "Modern events calendar" (https://webnus.net/modern-events-calendar/). The used version has 2 entries in the explort database:

- https://www.exploit-db.com/exploits/50084
- https://www.exploit-db.com/exploits/50082

The firs one seems to need authentication so it does not work in our case. But the second one did not seem to work, too.