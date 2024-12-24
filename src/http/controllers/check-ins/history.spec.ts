import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'

import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'

describe('Check-in History (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to list the history of check-ins', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const user = await prisma.user.findFirstOrThrow()

    const createdGym = await prisma.gym.create({
      data: {
        title: 'Javascript Gym',
        latitude: -23.3505271,
        longitude: -51.1901696,
      },
    })

    await prisma.checkIn.createMany({
      data: [
        { gym_id: createdGym.id, user_id: user.id },
        { gym_id: createdGym.id, user_id: user.id },
      ],
    })

    const response = await request(app.server)
      .get('/check-ins/history')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(200)
    expect(response.body.checkIns).toEqual([
      expect.objectContaining({ gym_id: createdGym.id, user_id: user.id }),
      expect.objectContaining({ gym_id: createdGym.id, user_id: user.id }),
    ])
  })
})
