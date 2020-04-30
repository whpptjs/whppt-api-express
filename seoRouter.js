const router = require('express').Router();
const { join, map } = require('lodash');
const Context = require('@whppt/api-express/context');

const draft = process.env.DRAFT === 'true';

const baseUrl = process.env.BASE_URL;
const sitemapStart = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
const sitemapEnd = `</urlset>`;

router.get(`/sitemap.xml`, (req, res) => {
  Context()
    .then(context => {
      const {
        $mongo: { $db },
      } = context;
      return $db
        .collection('pages')
        .find({}, { template: true, slug: true, updatedAt: true })
        .toArray()
        .then(pages => {
          const urls = join(
            map(
              pages,
              p =>
                `<url><loc>${baseUrl}/${p.slug}</loc>${p.updatedAt ? `<lastmod>${p.updatedAt.toISOString()}</lastmod>` : `<lastmod>${p.createdAt.toISOString()}</lastmod>`} ${
                  p.frequency ? `<changefreq>${p.frequency}</changefreq>` : `<changefreq>yearly</changefreq>`
                } ${p.priority ? `<priority>${p.priority}</priority>` : `<priority>0.5</priority>`}
                  </url>`
            ),
            '\n'
          );
          const sitemap = `${sitemapStart}${urls}${sitemapEnd}`;
          return res.type('text/xml').send(sitemap);
        });
    })
    .catch(err => res.status(500).send(err));
});

router.get('/robots.txt', function(req, res) {
  res.type('text/plain');
  if (draft) return res.send('User-agent: *\nDisallow: /');
  res.send(`User-agent: *
 Disallow: /login
 Disallow: /health
 Sitemap: ${baseUrl}/sitemap.xml
 `);
});

module.exports = router;
