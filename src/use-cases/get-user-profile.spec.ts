import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { beforeEach, describe, expect, it } from 'vitest'
import { GetUserProfileUseCase } from './get-user-profile'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resouce-not-fount'

let usersRepository: InMemoryUsersRepository
let sut: GetUserProfileUseCase

describe('Get User Profile Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new GetUserProfileUseCase(usersRepository)
  })

  it('should be able to get user profile', async () => {
    const { id: createdUserId } = await usersRepository.create({
      name: 'Jhon Doe',
      email: 'jhondoe@exemple.com',
      password_hash: await hash('123456', 6),
    })

    const { user } = await sut.execute({ userId: createdUserId })

    expect(user.name).toEqual('Jhon Doe')
  })

  it('should not be able to get user profile with wrong id', async () => {
    await expect(() =>
      sut.execute({ userId: 'non-existing-id' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
