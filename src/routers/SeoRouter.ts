import { Response, Router } from 'express';
import { WhpptRequest } from '../';
const { join, map } = require('lodash');

const router = Router();

// const draft = process.env.DRAFT === 'true';
const baseUrl = process.env.BASE_URL;

const sitemapStart = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

const sitemapEnd = `</urlset>`;

export type SeoRouterConstructor = () => Router;

export const SeoRouter: SeoRouterConstructor = function () {
  router.get(`/sitemap.xml`, (req: any, res: Response) => {
    return (req as WhpptRequest).moduleContext
      .then(({ $sitemap }) => {
        return $sitemap.filter().then(({ sitemap }: any) => {
          const indexablePages = sitemap.filter((p: any) => {
            return !p.hideFromSitemap;
          });
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
        });
      })
      .then((sitemapData: any) =>
        res.type('text/xml').send(`${sitemapStart}${sitemapData}${sitemapEnd}`)
      )
      .catch((err: any) => res.status(500).send(err));
  });

  router.get('/robots.txt', (req: any, res: Response) => {
    // if (draft || process.env.DISABLE_ROBOTS === 'true')
    //   return res.type('text/plain').send('User-agent: *\nDisallow: /');

    return (req as WhpptRequest).moduleContext
      .then(({ $sitemap }) => {
        return $sitemap.filter().then(({ sitemap }: any) => {
          const hiddenPages = sitemap.filter((p: any) => p.hideFromRobots) as any[];

          const allAgents = 'User-agent: *';
          const disallowLogin = 'Disallow: /login';
          const disallowHealth = 'Disallow: /health';
          const sitemapPath = `Sitemap: ${baseUrl}/sitemap.xml`;
          const emptyLine = ``;

          const lines = [allAgents, disallowLogin, disallowHealth];
          lines.push(emptyLine);
          hiddenPages.forEach(page => {
            page.slug.startsWith('/')
              ? lines.push(page.slug)
              : lines.push(`/${page.slug}`);
          });
          lines.push(emptyLine);
          lines.push(sitemapPath);
          return lines;
        });
      })
      .then((lines: string[]) => res.type('text/plain').send(lines.join('\n')))
      .catch((err: any) => res.status(500).send(err));
  });

  return router;
};
