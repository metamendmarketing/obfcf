import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true, // allow public read access
  },
  fields: [
    {
      name: 'aboutUsText',
      type: 'textarea',
      required: true,
      label: 'About Us Text',
    },
  ],
}
