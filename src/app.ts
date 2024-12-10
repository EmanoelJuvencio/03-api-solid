import fastify from 'fastify'
import { ZodError } from 'zod'
import { env } from './env'
import { appRoutes } from './http/routes'

export const app = fastify()

app.register(appRoutes, { prefix: 'users' })

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
