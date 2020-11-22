import * as express from "express/index";

const app = express();

app.use(express.static("public"));
app.get("/", (_request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});


export function startApp(): AppState {
  const appListener: AppState["appListener"] = app.listen(
    process.env.PORT,
    () => console.log(`Your app is listening on port ${process.env.PORT as string}`)
  );

  return { app, appListener };
}

export interface AppState {
  readonly app: typeof app;
  readonly appListener: ReturnType<typeof app.listen>;
}