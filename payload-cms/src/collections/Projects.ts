import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true, // allow public read access
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'projectUrl',
      type: 'text',
      required: false,
      label: 'Learn More URL',
    },
  ],
}
