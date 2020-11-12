const router = require('express').Router();
const { join, map } = require('lodash');
const Context = require('../context');

// process.env might not be the best idea here
const draft = process.env.DRAFT === 'true';
const baseUrl = process.env.BASE_URL;

const sitemapStart = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

const sitemapEnd = `</urlset>`;

module.exports = function (options) {
  router.get(`/sitemap.xml`, (req, res) => {
    Context(options).then(({ $sitemap }) => {
      return $sitemap
        .filter()
        .then(sitemap => {
          return join(
            map(
              sitemap,
              page =>
                `<url>
                      <loc>${page.url}</loc>
                      ${page.updatedAt ? `<lastmod>${page.updatedAt.toISOString()}</lastmod>` : `<lastmod>${page.createdAt.toISOString()}</lastmod>`}
                      ${page.frequency ? `<changefreq>${page.frequency}</changefreq>` : `<changefreq>yearly</changefreq>`}
                      ${page.priority ? `<priority>${page.priority}</priority>` : `<priority>0.5</priority>`}
                    </url>
                  `
            ),
            '\n'
          );
        })
        .then(sitemapData => {
          const sitemap = `${sitemapStart}${sitemapData}${sitemapEnd}`;

          return res.type('text/xml').send(sitemap);
        })
        .catch(err => res.status(500).send(err));
    });
  });

  router.get('/robots.txt', function (req, res) {
    res.type('text/plain');
    if (draft || process.env.DISABLE_ROBOTS === 'true') return res.send('User-agent: *\nDisallow: /');
    res.send(`User-agent: *
                    Disallow: /login
                    Disallow: /health
                    Sitemap: ${baseUrl}/sitemap.xml
   `);
  });

  return router;
};
