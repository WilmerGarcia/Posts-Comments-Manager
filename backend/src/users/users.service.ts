import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto, hashedPassword: string): Promise<User> {
    const existing = await this.userModel.findOne({ email: createUserDto.email }).exec();
    if (existing) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }
    const user = new this.userModel({
      email: createUserDto.email,
      password: hashedPassword,
      name: createUserDto.name ?? '',
    });
    const saved = await user.save();
    return this.toPublic(saved);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).lean().exec();
    return user ? this.toPublic(user as UserDocument) : null;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    if (dto.email !== undefined) {
      const existing = await this.userModel.findOne({ email: dto.email, _id: { $ne: id } }).exec();
      if (existing) throw new ConflictException('Ya existe un usuario con ese email');
    }
    const update: Record<string, unknown> = {};
    if (dto.name !== undefined) update.name = dto.name;
    if (dto.email !== undefined) update.email = dto.email;
    const updated = await this.userModel
      .findByIdAndUpdate(id, update, { new: true })
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.toPublic(updated as UserDocument);
  }

  /** Devuelve usuario sin password para respuestas */
  toPublic(user: UserDocument | (User & { password?: string })): User {
    const doc = user as UserDocument;
    const u = typeof doc.toObject === 'function' ? doc.toObject() : { ...user };
    delete (u as Record<string, unknown>).password;
    return u as User;
  }
}
