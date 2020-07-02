import {Column, Entity, PrimaryColumn} from "typeorm";
import {BaseEntry} from "../BaseEntry";

type Alphabets = `a` | `b` | `c` | `d` | `e` | `f` | `g` | `h` | `i` | `j` | `k` | `l` | `m` | `n` | `o` | `p` | `q` | `r` | `s` | `t` | `u` | `v` | `w` | `x` | `y` | `z`;

@Entity()
export class SimilarCharacter extends BaseEntry<SimilarCharacter> {

  @PrimaryColumn()
  readonly letter: Alphabets;

  @Column({ type: `simple-array` })
  readonly characters: string[]
}
