# maheshauti.com

Personal site. Facts live in `content/site.mjs`. `npm run build` writes `docs/` for GitHub Pages.

## Build

```sh
npm run build
```

## Add a blog post

Add an entry to `writing` in `content/site.mjs`:

```js
{
  title: "Your article title",
  href: "https://www.linkedin.com/pulse/your-published-article",
  date: "2026-09-26", // Publication date, YYYY-MM-DD.
  dek: "A short summary of the article.",
},
```

Run `npm run build`. The `/blog/` page lists every entry, newest first, and
highlights the latest post. The homepage shows the three newest posts. Both
update from this one list; no template changes are needed for the next post.
Article links open the original publication. Commit the generated `docs/`
changes when publishing through GitHub Pages.

## GitHub Pages

Repo settings, Pages:

1. Source: Deploy from a branch.
2. Branch: `main`, folder `/docs`.
3. Custom domain: `maheshauti.com`.
4. Turn on Enforce HTTPS after DNS settles.

`docs/CNAME` already contains `maheshauti.com`.

## Spaceship DNS

Keep the domain at Spaceship. Point it at GitHub Pages.

Apex `maheshauti.com`, A records (replace the parking IPs):

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

`www`, CNAME to `maheshauti96.github.io`.

Optional AAAA for IPv6, from GitHub's Pages docs:

- `2606:50c0:8000::153`
- `2606:50c0:8001::153`
- `2606:50c0:8002::153`
- `2606:50c0:8003::153`

Do not keep Spaceship parking A records next to these.
