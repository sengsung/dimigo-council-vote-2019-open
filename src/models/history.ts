import { DataType, Model, Column, Table, PrimaryKey, AutoIncrement, AllowNull, Default } from "sequelize-typescript";

@Table
export default class History extends Model<History> {

  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER.UNSIGNED)
  id!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  uid!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  lid!: number;

  @Default(0)
  @Column(DataType.TINYINT.UNSIGNED)
  overlap!: number;
}
