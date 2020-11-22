import { SprikeyClient } from "@structs/SprikeyClient";
import { SprikeyCommand } from "@structs/SprikeyCommand";
import { Argument, ArgumentOptions, FailureData, Flag } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

const aliasedActions: (string[])[] = [
  [ "view", "list", "all" ],
  [ "add" ],
  [ "set" ],
  [ "delete", "remove" ]
];

export class ActionCommand extends SprikeyCommand {

  readonly actions: string[];

  readonly errorData: ErrorData;

  readonly typeResolver: Function;

  readonly typeInputResolvers: { [K: string]: object };

  constructor(
    commandName: CommandParameters[0],
    { actions, ...metadata }: ActionCommandMetadata,
    { errorData, typeResolver, ...givenOptions }: ActionCommandOptions,
    permissions?: CommandParameters[3]
  ) {
    super(commandName, metadata, {
      ...givenOptions,
      * args(message: Message) {
        const client = message.client as SprikeyClient;
        const command = client.handlers.command.findCommand(commandName) as ActionCommand;
        const parserGenerator = command.parser(client, command, message);
        const action = (yield command.getActionType())! as string;

        parserGenerator.next();

        let generatorYield = parserGenerator.next(action);

        if (!generatorYield.done) {
          const actionInputResolver = command.typeInputResolvers[action];

          generatorYield = parserGenerator.next(yield actionInputResolver);
        }

        while (!generatorYield.done) {
          generatorYield = parserGenerator.next(yield generatorYield.value as Flag);
        }

        return generatorYield.value as object;
      }
    }, permissions);

    this.actions = actions;
    this.errorData = errorData;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.typeResolver = Argument.withInput((_, input) => typeResolver(input));
    this.typeInputResolvers = this.getActionInputTypes();
  }

  actionType(providedAction: string): string | undefined {
    const trimmedAction = providedAction.toLowerCase().trim();
    const selectedActionAliases = aliasedActions.find(actionAliases => actionAliases.includes(trimmedAction));
    if (!selectedActionAliases) return;

    const selectedAction = selectedActionAliases[0];
    if (!this.actions.includes(selectedAction)) return;

    return selectedAction;
  }

  async exec(message: Message, args: ActionArg): Promise<void> {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this[args.action](this.client, message, args as never);
  }

  // eslint-disable-next-line
  async view(_client: SprikeyClient, _message: Message, _args: ActionArgs["view"]): Promise<void> {
    throw new Error(`[Command Error]: View action not implemented in command '${this.name}'!`);
  }

  // eslint-disable-next-line
  * parser(_client: SprikeyClient, _command: ActionCommand, _message: Message): Generator<unknown> {
    throw new Error(`[Command Error]: args constructor was not implemented in command '${this.name}'!`);
  }

  private getActionInputTypes() {
    return {
      set: {
        // @ts-ignore
        type: Argument.composeWithFailure(this.typeResolver, (_, { value }: Flag & {
          value: { input?: string; value?: unknown };
        }) => {
          if (value.input && !value.value) return value.input;
        }),
        otherwise: (_: Message, failureData?: FailureData): MessageEmbed => {
          return this.embeds.error(failureData?.phrase
            ? `${this.errorData.reference} "${failureData.phrase}" ${this.errorData.states[0]}!`
            : `You did not provide the ${this.errorData.missing[0]} you want to ${this.errorData.missing[1] || "set"}!`
          );
        }
      },
      delete: {
        // @ts-ignore 2345
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        type: Argument.compose(this.typeResolver, (_, { value }: { value: LogChannel }) => value),
        otherwise: (_: Message, failureData?: FailureData): MessageEmbed => {
          return this.embeds.error(failureData?.phrase
            ? `${this.errorData.reference} "${failureData.phrase}" ${this.errorData.states[1]}!`
            : `You did not provide the ${this.errorData.missing[0]} you want to ${this.errorData.missing[1] || "delete"}!`
          );
        }
      }
    };
  }

  private getActionType(): ArgumentOptions | Flag {
    return {
      type: (_, givenAction): string | undefined => this.actionType(givenAction),
      otherwise: (_: Message, failureData: FailureData): MessageEmbed => {
        return this.embeds.error(failureData.phrase
          ? `The action "${failureData.phrase}" does not exist!`
          : "You did not provide the action you want me to perform!"
        );
      },
      modifyOtherwise: (_: Message, otherwiseContent: string): MessageEmbed => {
        const returningEmbed = otherwiseContent as unknown as MessageEmbed;

        returningEmbed.description = `${returningEmbed.description!}\n\nPlease select one of the following actions:\n${this.actions.join(", ")}`;

        return returningEmbed;
      }
    };
  }

  static createTypeResolver(func: Function): unknown {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await
    return Argument.withInput(async(_: Message, ...args: unknown[]) => func(...args));
  }

}

type CommandParameters = ConstructorParameters<typeof SprikeyCommand>;

type ActionCommandMetadata = CommandParameters[1] & { actions: string[] };
type ActionCommandOptions = CommandParameters[2] & {
  typeResolver: ActionCommand["typeResolver"];
  errorData: ErrorData;
};

interface ErrorData {
  reference: string;
  states: [string, string];
  missing: [string, string?];
}

type ActionArg = ActionArgs[keyof ActionArgs];

interface ActionArgs {
  view: { readonly action: string };
}
