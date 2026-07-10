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
      name: 'imageUrl',
      type: 'text',
      required: false,
      label: 'Image URL',
      admin: {
        description: 'Paste a public image link here (e.g. from Google Drive, Imgur, or Dropbox).',
      },
    },
    {
      name: 'projectUrl',
      type: 'text',
      required: false,
      label: 'Learn More URL',
    },
  ],
}
