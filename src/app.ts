import * as express from "express/index";

export const app = express();

app.use(express.static(`public`));
app.get(`/`, (_request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

export const appListener: ReturnType<typeof app.listen> = app.listen(
  process.env.PORT,
  () => console.log(`Your app is listening on port ${process.env.PORT as string}`)
);