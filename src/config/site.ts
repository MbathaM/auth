/**
 * Configuration object for the site including metadata and author information.
 */
export const siteConfig = {
  url: "http://localhost:3000",
  name: "Auth",
  version: "1.0.0",
  description: "A lightweight, extensible authentication server",
  license: "MIT",
  author: {
    name: "Mbatha Melusi",
    email: "mbathamelusi@gmail.com",
    url: "https://mbathamelusi.co.za",
  },
  social: {
    github: "https://github.com/mbathamelusi",
    twitter: "https://twitter.com/mbathamelusi",
  },
  contact: {
    supportEmail: "support@mbathamelusi.co.za",
    issuesUrl: "https://github.com/mbathamelusi/auth/issues",
  },
} as const;

/**
 * The type of the site configuration object.
 */
export type SiteConfig = typeof siteConfig;
