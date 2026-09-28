import {
    Table,
    Column,
    PrimaryKey,
    ForeignKey,
} from "../src/index.js";

@Table("posts")
export class Post {
    @PrimaryKey()
    @Column("uuid")
    id!: string;

    @Column("varchar", {
        length: 255,
    })
    title!: string;

    @Column("text")
    body!: string;

    @Column("uuid")
    @ForeignKey({
        table: "users",
        column: "id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    userId!: string;
}
