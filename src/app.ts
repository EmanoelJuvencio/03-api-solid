import fastify from 'fastify'
import { usersRoutes } from './http/routes/users'

export const app = fastify()

app.register(usersRoutes)
