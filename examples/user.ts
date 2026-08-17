import {
    Table,
    Column,
    PrimaryKey,
    Index,
    registry,
} from "../src/index.js";

@Table("users")
@Index({
    columns: ["email"],
    unique: true,
})
@Index({
    columns: ["firstName", "lastName"],
})
export class User {

    @PrimaryKey()
    @Column("uuid")
    id!: string;

    @Column("varchar", {
        length: 100,
    })
    firstName!: string;

    @Column("varchar", {
        length: 100,
    })
    lastName!: string;

    @Column("varchar", {
        length: 255,
    })
    email!: string;

    @Column("datetime")
    createdAt!: Date;
}

console.dir(
    registry.getSchema(),
    {
        depth: null,
    },
);