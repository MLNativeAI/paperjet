import { Hono } from 'hono'
import { z } from 'zod'
import { s3 } from '@/lib/s3'
import { db } from '@/db'
import { file } from '@/db/schema'
import { uploadFileSchema, type FileDataWithPresignedUrl } from '@/db/types'
import { inArray, eq } from 'drizzle-orm'
import { getUser } from '@/lib/auth'

const app = new Hono()

const router = app
    .get('/', async (c) => {
        const user = await getUser(c)
        const files = await db.select().from(file).where(eq(file.ownerId, user.id))
        const filesWithPresignedUrl: FileDataWithPresignedUrl[] = await Promise.all(files.map(async (file) => {
            const presignedUrl = await s3.presign(`${file.filename}`)
            return {
                ...file,
                presignedUrl
            }
        }))
        return c.json(filesWithPresignedUrl)
    })
    .post('/', async (c) => {
        try {
            const user = await getUser(c)
            const body = await c.req.formData()
            const fileParam = body.get('file') as File
            const nameParam = body.get('name') as string

            if (!fileParam || !nameParam) {
                return c.json({ error: 'File and name are required' }, 400)
            }

            const validatedData = uploadFileSchema.parse({
                file: fileParam,
                name: nameParam
            })

            const id = crypto.randomUUID()

            await db.insert(file).values({
                id,
                filename: validatedData.name,
                createdAt: new Date(),
                ownerId: user.id
            })

            const fileBuffer = await fileParam.arrayBuffer()

            await s3.file(`${validatedData.name}`).write(fileBuffer)

            return c.json({
                message: 'File uploaded successfully',
                id
            }, 201)
        } catch (error) {
            console.error('Upload error:', error)
            if (error instanceof z.ZodError) {
                return c.json({ error: 'Invalid file data' }, 400)
            }
            return c.json({ error: 'Internal server error' }, 500)
        }
    })
    .delete('/', async (c) => {
        try {
            const fileIds = c.req.query('ids')?.split(',')

            if (!fileIds || fileIds.length === 0) {
                return c.json({ error: 'File IDs are required' }, 400)
            }

            console.log('Deleting files:', fileIds)
            await db.delete(file).where(inArray(file.id, fileIds))
            return c.json({ message: 'Files deleted successfully' }, 200)
        } catch (error) {
            console.error('Delete error:', error)
            return c.json({ error: 'Internal server error' }, 500)
        }
    })

export default router

export type FileRouteType = typeof router
