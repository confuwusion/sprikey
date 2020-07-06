import {PrimaryColumn, Entity, Column, OneToOne, JoinColumn, OneToMany, ManyToOne} from "typeorm";
import {WatchEntry} from "./Watcher";
import {Channel} from "discord.js";

const CENSOR_BYPASS = "[^a-zA-Z]*?";

const typeRegistries = {
  censor: [
    { actionName: "log", actionCode: 1 },
    { actionName: "delete", actionCode: 2 },
    { actionName: "warn", actionCode: 3 }
  ],
  watch: [
    { actionName: "log", actionCode: 9 }
  ]
};

class CensorWordBase {

  /**
   * The censored word
   *
   * @readonly
   **/
  @PrimaryColumn()
  readonly word: string;

  /**
   * The watcher entry that defines the watcher pattern of this censor word
   *
   * @readonly
   **/
  @OneToOne(
    () => WatchEntry,
    {
      cascade: [ `insert` ],
      eager: true,
      nullable: false,
      onDelete: `CASCADE`
    }
  )
  @JoinColumn()
  readonly watchEntry: WatchEntry;

  constructor(word: string, channels: string[]) {
    this.word = word;
    this.watchEntry = new WatchEntry({
      pattern: [ word, `i` ],
      criteria: {
        targets: { channels },
        include: { channels: false }
      },
      options: {
        actions: [],
        clean: true,
        tags: { censorWord: word }
      }
    });
  }

}

@Entity()
class CensorWordSynonym extends CensorWordBase {

  /**
   * The censored word this synonym belongs to.
   * Added automatically when created with {@link:CensorWord#addSynonyms}
   *
   * @readonly
   **/
  @ManyToOne(
    () => CensorWord,
    censorWord => censorWord.synonyms,
    { nullable: false }
  )
  readonly parentWord: CensorWord;

  constructor(
    baseWord: CensorWordBase,
    parentWord: CensorWord
  ) {
    super(baseWord.word, baseWord.watchEntry.criteria.targets.channels);

    this.parentWord = parentWord;
  }
}

@Entity()
export class CensorWord extends CensorWordBase {

  /**
   * List of associated words.
   * Added via {@link CensorWord#addSynonyms}
   *
   * @readonly
   **/
  @OneToMany(
    () => CensorWordSynonym,
    synonym => synonym.parentWord,
    { onDelete: `CASCADE` }
  )
  readonly synonyms: CensorWordSynonym[] = [];

  constructor(word: string, channels: Channel[] = []) {
    super(word, channels.map(channel => channel.id));
  }

  /**
   * Takes in an array of BaseWords to make them a synonym of the current word.
   *
   * @param baseSynonyms - An array of { words: string, watchEntry: WatchEntry } that represent synonyms being added
   * @returns - List of added synonyms
   *
   * @example <caption>Creating a censor on word "noot" and adding "pingu" as its synonym.</caption>
   *
   *   ```typescript
   *   const censoredNoot = new CensorWord(`noot`);
   *
   *   censoredNoot.addSynonyms([ `pingu` ]);
   *
   *   censorWord.save();
   *   ```
   **/
  addSynonyms(baseSynonyms: CensorWordBase[]): CensorWordSynonym[] {
    return baseSynonyms
      .map(baseSynonym => new CensorWordSynonym(baseSynonym, this));
  }

  // Create a source string formatted for watcher testing
  formatSource(source: string): string {
    const charDict = this.cache.characterDictionary;

    const formattedSource = source.split(``)
      .map(char => `(?:${char}${
        (/\w/).test(char) && charDict.has(char)
          ? `|${charDict.get(char).join(`|`)}`
          : ``
      })+`)
      .join(CENSOR_BYPASS);

    return formattedSource;
  }

  // Create pattern according to its word and synonyms
  createPattern(sources: string[]): WatchEntry["pattern"] {
    const classThis = this;
    const formattedSources = `(?<![a-zA-Z])(?:${
      sources
        .map(classThis.formatSource.bind(classThis))
        .join("|")
    })(?![a-zA-Z])`;

    return [ formattedSources, "i" ];
  }

  rebaseCensor(censorWord) {
    const { censorID, synonyms } = this.get(censorWord);
    const rebasedPattern = this.createPattern([ censorWord, ...synonyms ]);

    const watcherData = this.cache.watchPatterns.get(censorID);
    this.cache.watchPatterns.edit(censorID, {
      ...watcherData,
      pattern: rebasedPattern
    });

    return true;
  }


}


class CensorWordData {
  constructor(censorID, censorWord, censorType, synonyms) {
    this.censorID = censorID;
    this.censorWord = censorWord;
    this.censorType = censorType;
    this.synonyms = synonyms || [];
  }
}

class WordCensor extends CacheMap {
  constructor(data, cache) {
    super(data, cache);
  }
  
  createCensor(censorWord, censorType) {
    const censorPattern = this.createPattern([censorWord]);
    const censorWordData = new CensorWatcherData(censorWord, censorPattern, typeRegistries[censorType]);
 
    const censorID = this.cache.watchPatterns.register(censorWordData);
    const censorData = new CensorWordData(censorID, censorWord, censorType);
    return this.set(censorWord, censorData);
  }
  
  }

