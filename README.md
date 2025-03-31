# woof

## Run locally
```bash
deno install --allow-scripts
```

#### create .env file
```bash
nano .env
```

#### run the server http://localhost:3001
```bash
deno task dev:api
```

#### run the client http://localhost:5001
```bash
deno task dev:ui
```


## Good to know

go to api folder and run https://orm.drizzle.team/docs/kit-overview
```bash
deno run -A npm:drizzle-kit generate
```