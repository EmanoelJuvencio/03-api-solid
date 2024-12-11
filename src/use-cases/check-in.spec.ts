import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckInUseCase } from './check-in'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Gym } from '@prisma/client'
import { MaxDistanceError } from './errors/max-distance-error'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase
let gym: Gym

describe('Check-in Use Case', () => {
  beforeEach(async () => {
    vi.useFakeTimers()

    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)
    gym = await gymsRepository.create({
      title: 'Academia do Código',
      description: '',
      phone: '43999999999',
      latitude: -23.3483796,
      longitude: -51.1798974,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    vi.setSystemTime(new Date(2024, 11, 10, 9, 0, 0))
    const { checkIn } = await sut.execute({
      gymId: gym.id,
      userId: 'user-01',
      userLatitude: -23.3478105,
      userLongitude: -51.179848,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2024, 11, 10, 9, 0, 0))

    await sut.execute({
      gymId: gym.id,
      userId: 'user-01',
      userLatitude: -23.3478105,
      userLongitude: -51.179848,
    })

    await expect(() =>
      sut.execute({
        gymId: gym.id,
        userId: 'user-01',
        userLatitude: -23.3478105,
        userLongitude: -51.179848,
      })
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
  })

  it('should be able to check in twice but in different days', async () => {
    vi.setSystemTime(new Date(2024, 11, 10, 9, 0, 0))

    await sut.execute({
      gymId: gym.id,
      userId: 'user-01',
      userLatitude: -23.3478105,
      userLongitude: -51.179848,
    })

    vi.setSystemTime(new Date(2024, 11, 13, 9, 0, 0))

    const { checkIn } = await sut.execute({
      gymId: gym.id,
      userId: 'user-01',
      userLatitude: -23.3478105,
      userLongitude: -51.179848,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in on distant gym', async () => {
    vi.setSystemTime(new Date(2024, 11, 10, 9, 0, 0))

    const newGym = await gymsRepository.create({
      title: 'Academia do Código - Filial',
      description: '',
      phone: '44999999999',
      latitude: -23.34818,
      longitude: -51.1797013,
    })

    await expect(() =>
      sut.execute({
        gymId: newGym.id,
        userId: 'user-01',
        userLatitude: -23.3144477,
        userLongitude: -51.1422593,
      })
    ).rejects.toBeInstanceOf(MaxDistanceError)
  })
})
