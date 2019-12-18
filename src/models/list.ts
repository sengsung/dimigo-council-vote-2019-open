import { DataType, Model, Column, Table, PrimaryKey, Default, AllowNull, AutoIncrement } from "sequelize-typescript";

@Table
export default class List extends Model<List> {

  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER.UNSIGNED)
  id!: number;

  @AllowNull(false)
  @PrimaryKey
  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  img!: string;

  @Default(0)
  @Column(DataType.SMALLINT.UNSIGNED)
  cnt!: number;
}
