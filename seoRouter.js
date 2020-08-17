const router = require('express').Router();
const { join, map } = require('lodash');
const Context = require('./context');

const draft = process.env.DRAFT === 'true';

const baseUrl = process.env.BASE_URL;
const sitemapStart = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
const sitemapEnd = `</urlset>`;

module.exports = function(options) {
  router.get(`/sitemap.xml`, (req, res) => {
    Context(options).then(context => {
      const {
        $mongo: { $db },
      } = context;
      const pageTypesSitemapDataPromises = map(options.module, module => {
        return module.queries && module.queries.getSitemapData && module.queries.getSitemapData.exec(context);
      });
      const pagesSitemapDataPromise = $db
        .collection('pages')
        .find({}, { template: true, slug: true, updatedAt: true, createdAt: true, frequency: true, priority: true })
        .toArray()
        .then(pages =>
          join(
            map(
              pages,
              p =>
                `<url><loc>${baseUrl}/${p.slug}</loc>${p.updatedAt ? `<lastmod>${p.updatedAt.toISOString()}</lastmod>` : `<lastmod>${p.createdAt.toISOString()}</lastmod>`} ${
                  p.frequency ? `<changefreq>${p.frequency}</changefreq>` : `<changefreq>yearly</changefreq>`
                } ${p.priority ? `<priority>${p.priority}</priority>` : `<priority>0.5</priority>`}
                  </url>`
            ),
            '\n'
          )
        );
      return Promise.all([pagesSitemapDataPromise, ...pageTypesSitemapDataPromises])
        .then(sitemapData => {
          const sitemap = `${sitemapStart}${join(sitemapData, '\n')}${sitemapEnd}`;
          return res.type('text/xml').send(sitemap);
        })
        .catch(err => res.status(500).send(err));
    });
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

  return router;
};
