import { Router } from 'express';
import {
  GalleryService,
  IdService,
  LoggerService,
  MongoService,
  SecurityService,
} from '../Services';
import { Context } from '../context';
import { WhpptConfig } from '../Config';
const { join, map } = require('lodash');

const router = Router();

const draft = process.env.DRAFT === 'true';
const baseUrl = process.env.BASE_URL;

const sitemapStart = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

const sitemapEnd = `</urlset>`;

export type SeoRouterConstructor = (
  $id: IdService,
  $logger: LoggerService,
  $security: SecurityService,
  $mongo: Promise<MongoService>,
  $gallery: GalleryService,
  config: WhpptConfig
) => Router;

export const SeoRouter: SeoRouterConstructor = function (
  $id,
  $logger,
  $security,
  $mongo,
  $gallery, // TODO: This dependency should not be required.
  config
) {
  router.get(`/sitemap.xml`, (_, res) => {
    Context($id, $logger, $security, $mongo, $gallery, { ...config }).then(
      ({ $sitemap }) => {
        return $sitemap
          .filter()
          .then(({ sitemap }: any) => {
            const indexablePages = sitemap.filter((p: any) => !p.hideFromSitemap);
            return join(
              map(indexablePages, (page: any) => {
                return `<url>
                      <loc>${page.url}</loc>
                      ${
                        page.updatedAt
                          ? `<lastmod>${new Date(page.updatedAt).toISOString()}</lastmod>`
                          : `<lastmod>${new Date(page.createdAt).toISOString()}</lastmod>`
                      }
                      ${
                        page.frequency
                          ? `<changefreq>${page.frequency}</changefreq>`
                          : `<changefreq>yearly</changefreq>`
                      }
                      ${
                        page.priority
                          ? `<priority>${page.priority}</priority>`
                          : `<priority>0.5</priority>`
                      }
                    </url>
                  `;
              }),
              '\n'
            );
          })
          .then((sitemapData: any) =>
            res.type('text/xml').send(`${sitemapStart}${sitemapData}${sitemapEnd}`)
          )
          .catch((err: any) => res.status(500).send(err));
      }
    );
  });

  router.get('/robots.txt', function (_, res) {
    res.type('text/plain');

    if (draft || process.env.DISABLE_ROBOTS === 'true')
      return res.send('User-agent: *\nDisallow: /');

    res.send(`User-agent: *
                    Disallow: /login
                    Disallow: /health
                    Sitemap: ${baseUrl}/sitemap.xml
   `);
  });

  return router;
};
