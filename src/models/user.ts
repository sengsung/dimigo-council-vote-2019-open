import { DataType, Model, Column, Table, PrimaryKey, AutoIncrement, AllowNull } from "sequelize-typescript";

@Table
export default class User extends Model<User> {

  @AllowNull(false)
  @PrimaryKey
  @Column(DataType.INTEGER.UNSIGNED)
  id!: number;

  @AllowNull(false)
  @PrimaryKey
  @Column(DataType.INTEGER.UNSIGNED)
  serial!: number;

  @AllowNull(false)
  @PrimaryKey
  @Column(DataType.STRING(6))
  hash!: string;
}
