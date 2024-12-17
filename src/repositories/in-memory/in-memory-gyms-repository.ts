import { Gym, Prisma } from '@prisma/client'
import { FindManyNearbyParams, GymsRepository } from '../gyms-repository'
import { randomUUID } from 'crypto'
import { getDistanceBetweenCoordinates } from '@/utils/get-distance-between-coordinates'

export class InMemoryGymsRepository implements GymsRepository {
  public items: Gym[] = []

  async findById(id: string) {
    const gym = this.items.find((item) => item.id === id)

    if (!gym) {
      return null
    }

    return gym
  }

  async findManyNearby({ latitude, longitude }: FindManyNearbyParams) {
    return this.items.filter(
      (item) =>
        getDistanceBetweenCoordinates(
          { latitude, longitude },
          { latitude: Number(item.latitude), longitude: Number(item.longitude) }
        ) < 10
    )
  }

  async searchMany(query: string, page: number) {
    return this.items
      .filter((item) => item.title.includes(query))
      .slice((page - 1) * 20, page * 20)
  }

  async create(data: Prisma.GymCreateInput) {
    const gym = {
      id: randomUUID() as string,
      title: data.title,
      description: data.description ?? null,
      phone: data.phone ?? null,
      latitude: new Prisma.Decimal(data.latitude.toString()),
      longitude: new Prisma.Decimal(data.longitude.toString()),
    }

    this.items.push(gym)

    return gym
  }
}
