import { hash } from 'bcryptjs'
import { UsersRepository } from '@/repositories/usersRepository'
import { UserAlreadyExistsError } from './errors/user-already-exists'

interface IRegisterUseCaseRequest {
  name: string
  email: string
  password: string
}

export class RegisterUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ email, name, password }: IRegisterUseCaseRequest) {
    const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError()
    }

    const password_hash = await hash(password, 6)

    this.usersRepository.create({ name, email, password_hash })
  }
}
