import environment from "config/environment";

export async function queryEnhetsregisteretByNavn(query, maxResults) {
   const url = `${environment.API_BRREG_URL}/enheter/?navn=${query}`;

   const result = await fetch(url, {
      headers: { Accept: "application/json" },
   });

   if (!result.ok) {
      const text = await result.text();
      throw new Error(`Brreg ${result.status}: ${text}`);
   }

   const json = await result.json();

   return (json?._embedded?.enheter ?? [])
      .slice(0, maxResults)
      .map((enhet) => ({
         navn: enhet.navn,
         organisasjonsnummer: enhet.organisasjonsnummer,
      }));
}
