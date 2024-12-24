import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'

import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'

describe('Create Check-in (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a check-in', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const createdGym = await prisma.gym.create({
      data: {
        title: 'Javascript Gym',
        latitude: -23.3505271,
        longitude: -51.1901696,
      },
    })

    const response = await request(app.server)
      .post(`/gyms/${createdGym.id}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        latitude: -23.3505271,
        longitude: -51.1901696,
      })

    expect(response.statusCode).toEqual(201)
  })
})
