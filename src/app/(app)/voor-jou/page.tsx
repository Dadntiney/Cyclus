import { redirect } from "next/navigation"

/**
 * /voor-jou was a module directory without its own job — daily picks live on
 * Vandaag, week plans on Deze week, libraries open from those contexts,
 * settings on Profiel → Wat ik gebruik. Keep the URL as a soft landing.
 */
export default function VoorJouRedirect() {
  redirect("/vandaag")
}
