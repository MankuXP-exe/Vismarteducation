import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://vismartlearning.in";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/legal/refund`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/legal/cookie`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/legal/disclaimer`,
      lastModified: new Date(),
    },
  ]
}
