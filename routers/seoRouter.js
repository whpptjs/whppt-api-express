const router = require('express').Router();
const { join, map } = require('lodash');
const Context = require('../context');

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
        .then(({ sitemap }) => {
          return join(
            map(sitemap, page => {
              return `<url>
                      <loc>${page.url}</loc>
                      ${page.updatedAt ? `<lastmod>${new Date(page.updatedAt).toISOString()}</lastmod>` : `<lastmod>${new Date(page.createdAt).toISOString()}</lastmod>`}
                      ${page.frequency ? `<changefreq>${page.frequency}</changefreq>` : `<changefreq>yearly</changefreq>`}
                      ${page.priority ? `<priority>${page.priority}</priority>` : `<priority>0.5</priority>`}
                    </url>
                  `;
            }),
            '\n'
          );
        })
        .then(sitemapData => res.type('text/xml').send(`${sitemapStart}${sitemapData}${sitemapEnd}`))
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
