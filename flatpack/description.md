**Statamic's flat files, compiled at deploy. Flatpack turns your content into plain PHP files that OPcache keeps in memory, so builds and big sites stop waiting on thousands of YAML files. Your Markdown and YAML stay the source of truth. Free and open source.**

On a 9,000-entry site with nested page builders, a deploy's content build went from 59 seconds to 15, and its memory from 2.2 GB to 241 MB. Measured with the free [Dog-ear Books demo](https://github.com/1994limited/flatpack-statamic-demo), which you can run on your own machine.

## Nothing to migrate

No database, no new storage, no content changes. Flatpack replaces only the cache Statamic keeps of your content (the Stache). Switch it off with one environment variable and Statamic is back as it was.

## Builds in a fraction of the time

`php please flatpack:build` replaces `stache:warm` in your deploy. The bigger the site and the deeper its page builders, the bigger the gain: 1.8x faster with fixed fields, 2.5x with a page builder, 4x with nested page builders.

## A fraction of the memory

Page builders and long Bard fields are left unparsed until a page actually reads them. Listings, navs, URLs and queries never need them, so a build that needed 2.2 GB fits in 241 MB.

## Saving works as it always has

Saving in the Control Panel writes exactly the same file Statamic writes, then updates only what changed in the compiled copy. Saves take about as long as they do without Flatpack, in less memory.

## Refreshes that are actually right

After a `git pull`, `php please flatpack:refresh` re-reads only the files that changed, including deleted files, renamed files and reordered page trees, which Statamic's own file watcher can miss.

## In the Control Panel

Utilities > Flatpack shows what's compiled, which content files have changed on disk since, and builds or refreshes with a click.

## Honest about page loads

Flatpack speeds up getting content out of Statamic. It doesn't make your templates render faster, so page loads improve less: 12 to 17% in the demo. Sites with many entries, many languages or heavy page builders gain the most.

## Stache on Redis?

Flatpack takes the Stache's place wherever it was kept, Redis included, and puts it on the server's own disk. Redis carries on as your cache, session and static caching store. On the demo's largest site a Stache kept in Redis was slower than Statamic's file Stache on every page, and Flatpack was faster than both: the build took 66 seconds with Redis and 15 with Flatpack, and pages loaded 18 to 27% faster.

## One server, or several

Flatpack keeps its compiled copy on each server. That suits a single server, and several servers whose content is edited locally and deployed. It isn't a good fit for several servers whose content is edited in the live Control Panel, because an edit made on one isn't seen by the others.

## Runs where you do

Laravel Forge and Laravel Cloud, with no PHP extensions beyond what they ship. On Laravel Cloud it goes in build commands, so every replica starts with the same build.

## Tested against Statamic

Every change runs a parity suite on Statamic 5 and 6: a three-language site with structured pages, page builders, taxonomies, navs and globals, run on plain Statamic and with Flatpack. Reads, saves (byte for byte), rebuilds and files changed on disk must all match.

## Safe across Statamic updates

Flatpack checks at boot that the parts of Statamic it relies on are still there. If a Statamic release changes one, Flatpack pauses itself and the site runs on Statamic's own Stache, as it would without Flatpack, until a Flatpack update catches up. `flatpack:status` and the Control Panel say why. The parity suite also runs daily against Statamic's unreleased branch, so changes are usually caught before they ship.

## Requirements

Statamic 5.11 or later, or Statamic 6. PHP 8.2 or later. OPcache on for web requests (the default on Forge and Laravel Cloud). Content in files: Flatpack does nothing for content stored with the Eloquent driver.
