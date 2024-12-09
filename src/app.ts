import fastify from 'fastify'
import { usersRoutes } from './http/routes/users'
import { ZodError } from 'zod'
import { env } from './env'

export const app = fastify()

app.register(usersRoutes)

app.setErrorHandler((error, _request, reply) => {
  console.log(error)

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error.',
      issues: error.format(),
    })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO: here should log to on external tool like DataDog/NewRelic/Sentry
  }

  return reply.status(500).send({ message: 'Internal Server Error.' })
})
