import { redirect } from "next/navigation"
import { RECIPE_FAVORITES_HREF } from "@/components/nutrition/recipe-format"

/**
 * The old recipe-favourites page. Saved recipes now live on the one
 * Favorieten page with its Recepten filter (ontwerpvisie §4.5). next.config.ts
 * already redirects this URL (307) before it reaches the app; this page is
 * the fallback, so old links, bookmarks and notifications always land there.
 */
export default function VoedingFavorietenRedirect() {
  redirect(RECIPE_FAVORITES_HREF)
}
