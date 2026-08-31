# Geonorge.Forvaltning.Client

React/Vite-frontend for **Geonorge Forvaltning** – et kartbasert verktøy der organisasjoner definerer egne datasett ("forvaltningsobjekter") og forvalter (oppretter, redigerer, deler) geografiske objekter i dem, med sanntids samskriving. Backend-API-et ligger i et eget repo: [Geonorge.Forvaltning](https://github.com/kartverket/Geonorge.Forvaltning) (se `catalog-info.yaml` for system-kobling).

## Arkitektur i korte trekk

Klienten snakker med **to** backend-tjenester, med ulikt ansvar:

- **Supabase** (Postgres + Auth + Realtime), kalt direkte fra klienten via `@supabase/supabase-js` (`src/store/services/supabase/`): innlogging, samt lesing/skriving av selve datasett-innholdet (radene i de dynamiske `t_{datasetId}`-tabellene) – beskyttet av Row Level Security i databasen.
- **Geonorge.Forvaltning API** (.NET), kalt via RTK Query (`src/store/services/api.js`) med bearer-token + apikey-headere: opprettelse/endring av datasett-*definisjoner* (`admin/object`), objektoppslag som trenger serverlogikk, organisasjons-/stedsnavnsøk, og geografisk analyse.

I tillegg kobler klienten seg til API-ets SignalR-hub (`VITE_SIGNAL_R_HUB_URL`, se `src/context/SignalRProvider`) for sanntidsoppdateringer: når flere brukere redigerer samme datasett samtidig, kringkastes pekerposisjoner og objektendringer (opprettet/oppdatert/slettet) mellom klientene (`src/config/messageHandlers.js`), og relevante RTK Query-cacher invalideres fortløpende.

## Prosjektstruktur

```
src/
  App.jsx                 Rot-komponent: AuthProvider → SignalRProvider → ModalProvider
  config/                 router, environment-variabler, meldingshåndtering, kartkonfig
  context/
    AuthProvider/          Supabase-sesjon/innlogging
    DatasetProvider/        Aktivt datasett + tilhørende state
    MapProvider/             OpenLayers-kartinstans og lag
    ModalProvider/           Modal-håndtering
    SignalRProvider/         Sanntidstilkobling
  features/
    Home/                   Hovedvisning (kart + datasett)
    Map/                    Kartkomponenter og -verktøy
    Dataset/                Datasett-liste, skjema-/egenskapsredigering
    FeatureInfo/             Info-/redigeringspanel for enkeltobjekter
    AnalysisResult/          Visning av rute-/nærhetsanalyse
    Login/, NotFound/, ErrorBoundary/
  components/
    Form/                   Gjenbrukbare skjemakomponenter (dnd-kit for sortering av egenskaper m.m.)
    Map/, Modals/, RemoteEditor/, Spinner/, MainNavigationContainer/
  store/
    services/api.js         RTK Query mot .NET-API-et
    services/supabase/       Klient, spørringer og mutasjoner direkte mot Supabase
    slices/                  Redux-slices (app, map, geomEditor, object)
```

## Nøkkelbiblioteker

- **React 18 + Vite** (SWC-plugin), **Redux Toolkit / RTK Query** for state og datahenting
- **OpenLayers** (`ol`, `ol-ext`, `proj4`, `reproject`) for kartvisning og projeksjonshåndtering
- **Turf.js** (`@turf/*`) for geometrioperasjoner (kombinere, union, sentroid, avstand, selvskjæring)
- **@microsoft/signalr** for sanntidssamarbeid
- **@supabase/supabase-js** for autentisering og direkte datatilgang
- **react-hook-form**, **@dnd-kit** (dra-og-slipp sortering av felter), **@table-library/react-table-library** (tabellvisning), **react-select**, **react-datepicker**, **react-toastify**
- **@react-pdf/renderer** og **file-saver** for eksport
- **@kartverket/geonorge-web-components** for felles Geonorge-header/footer

## Kjøre lokalt

### Forutsetninger
- Node.js + Yarn (Yarn Berry, se `packageManager` i `package.json`) – kjør `corepack enable` om nødvendig
- Et kjørende backend-API (se serverrepoet) og et Supabase-prosjekt

### Oppsett
1. Installer avhengigheter:
   ```bash
   yarn install
   ```
2. Opprett en `.env` i rotmappen (leses av Vite, se `src/config/environment.js`) med minst:

   | Variabel | Beskrivelse |
   |---|---|
   | `PORT`, `HTTPS` | Lokal dev-server (default port `44389`, se `vite.config.js`) |
   | `VITE_ENVIRONMENT` | Miljønavn |
   | `VITE_URL_GEONORGE_ROOT` | Lenke til geonorge.no for topp-/bunntekst |
   | `VITE_BUILD_VERSION_NUMBER` | Vises i footer |
   | `VITE_API_BASE_URL` | Base-URL til `Geonorge.Forvaltning`-API-et |
   | `VITE_AUTH_REDIRECT_TO` | Redirect-URL etter Supabase-innlogging |
   | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Supabase-prosjektet |
   | `VITE_SIGNAL_R_HUB_URL` | URL til API-ets `/hubs/message` |
   | `VITE_TAG_DATASET_ID` | ID til et spesielt "tag"-datasett brukt i klienten |
   | `VITE_COUNTY_GOVERNORS` | Kommaseparert liste over statsforvalternes organisasjonsnumre (særbehandles i UI) |
   | `VITE_API_BRREG_URL` | Brønnøysundregistrenes API (brukes bl.a. i `src/utils/brreg.js`) |

3. Start dev-server:
   ```bash
   yarn dev
   ```
   Kjører på `https://localhost:44389` (selvsignert sertifikat via `@vitejs/plugin-basic-ssl`).

### Andre kommandoer
```bash
yarn build     # Produksjonsbygg til build/
yarn preview   # Forhåndsvis produksjonsbygg
yarn lint      # ESLint (0 warnings tillatt)
```

## Autentisering

Innlogging skjer mot Supabase Auth (`context/AuthProvider`, `store/services/supabase/client.js`). `router.jsx` har en `authGuard`-loader på hovedsiden som redirecter til `/logg-inn` dersom brukeren ikke er innlogget. Etter innlogging sendes Supabase-tokenet og anon-nøkkelen som headere (`Authorization: Bearer ...`, `Apikey: ...`) på alle kall til det .NET-baserte API-et.

## Relatert repo

- **API/backend:** `Geonorge.Forvaltning` (.NET 8) – eier datasett-/egenskapsdefinisjoner, autorisasjon, sanntidshub, søk mot eksterne registre og geoanalyse. Se dets README for detaljer om datamodell og endepunkter.
