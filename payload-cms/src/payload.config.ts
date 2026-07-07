import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Projects],
  globals: [SiteSettings],
  cors: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://oakbayfirefighterscharitable.com', 'https://www.oakbayfirefighterscharitable.com', process.env.FRONTEND_URL].filter(Boolean) as string[],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: (process.env.POSTGRES_URL || (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')))
    ? postgresAdapter({
        pool: {
          connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL || '',
        },
        push: true,
      })
    : sqliteAdapter({
        client: {
          url: process.env.DATABASE_URL || 'file:./payload-cms.db',
        },
      }),
  sharp,
  plugins: [],
})
