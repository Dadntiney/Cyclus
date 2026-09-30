-- Enrich kennisartikelen: iets meer diepte, zelfde zachte toon, geen diagnose.
-- Idempotent UPDATEs op bestaande slugs.

UPDATE public.knowledge_articles
SET
  summary = 'Slechte slaap versterkt vaak andere klachten. Een stabiel ritme en zachte slaaphygiëne helpen je lichaam herstellen — zonder perfecte nachten te eisen.',
  body = E'Tijdens de slaap reguleert je lichaam herstel- en stresshormonen. Rondom je cyclus en zeker rondom de overgang slapen veel vrouwen lichter, of wakker worden ze vaker — soms door nachtelijk zweten, soms zonder duidelijke reden.

Dat zegt niet dat je ''slecht slaapt als persoon''. Het zegt vaker iets over schommelende hormonen, temperatuurregulatie en een zenuwstelsel dat ''s avonds nog wakker staat.

**Praktische slaaphygiëne (kies wat past, niet alles tegelijk):**
• Probeer vaste bed- en opstaatijden — ook in het weekend zo veel mogelijk.
• Dim licht en schermen in het uur voor slapen; helder blauw licht houdt je alert.
• Cafeïne na de middag laten staan helpt veel vrouwen sneller inslapen.
• Slaapkamer wat koeler en donkerder; bij nachtelijk zweten: lichte lagen, katoen, eventueel een koelere dekensituatie.
• Een kort ritueel (douche, thee zonder cafeïne, adem of een paar bladzijden) geeft je lichaam een ''ik mag nu rusten''-signaal.
• Alcohol kan inslapen makkelijker maken, maar doorslapen vaak juist verstoren.

In GoFiev kun je slaap meenemen in je check-in. Zie je een patroon met klachten of energie? Neem dat gerust mee naar je arts — jij houdt de regie, de app denkt mee.'
WHERE slug = 'slaap-en-hormonen';

UPDATE public.knowledge_articles
SET
  summary = 'Voeding is geen kuur, wél steun. Kleine, fase-passende keuzes — plus genoeg vocht — maken vaak meer verschil dan strenge regels.',
  body = E'Rondom hormonale schommelingen en de cyclus profiteren veel vrouwen van een stevige, haalbare voedingsbasis — geen wonderkuur, wél concrete keuzes.

Eiwitten (elke fase)
Denk aan: eieren, Griekse yoghurt, kwark, kip, zalm, tofu, linzen of kikkererwten. Eiwit bij maaltijden helpt verzadiging en herstel.

Magnesium
Vaak genoemd rondom de luteale fase en bij spierspanning. Goede bronnen: pompoenpitten, amandelen, cashewnoten, spinazie, quinoa, zwarte bonen en een stukje pure chocolade (70%+).

IJzer (+ vitamine C)
Past vooral goed tijdens de menstruatie. Plantaardig ijzer zit in linzen, spinazie, bonen en tofu — combineer met paprika, kiwi of citrus zodat je lichaam het beter kan opnemen.

Vezels & stabiele energie
Havermout, quinoa, zoete aardappel, peulvruchten en volkoren brood geven rustigere energie dan alleen snelle suikers.

Vocht
Een flesje in zicht, thee tussendoor of water bij elke maaltijd helpt sneller dan je denkt — vooral bij vermoeidheid, hoofdpijn of warm weer. Bij een opgeblazen gevoel mag je vaak wél blijven drinken.

Per fase (globaal)
• Menstruatie: ijzer, eiwit, warmte, vocht
• Folliculair: eiwit, vezels, complexe koolhydraten
• Ovulatie: kleurrijke groenten/fruit, omega-3, eiwit
• Luteaal: magnesium, eiwit, vezels

In GoFiev zie je dit concreter terug op je cyclusdag en in je weekplan. Geen medisch advies — kies wat bij jou past. Een rommelige dag mag; morgen mag weer zachter. Bij twijfel of tekorten: overleg met een arts of diëtist.',
  tags = array['voeding','energie','magnesium','eiwit','vocht']
WHERE slug = 'voeding-als-steun';

UPDATE public.knowledge_articles
SET
  summary = 'Beweging mag steunen zonder dat het een afvinklijst wordt. Passend bij je energie vandaag — niet bij een ideaalweek.',
  body = E'Beweging ondersteunt botten, stemming, slaap en energie. Op zware dagen is zachte mobiliteit of een korte wandeling genoeg — en dat telt.

In de menstruatie of late luteale fase kiezen veel vrouwen iets zachters. Rondom de folliculaire fase of ovulatie voelt opbouwen soms makkelijker. Dat zijn richtingen, geen regels.

Drink genoeg als je actiever beweegt. Sla een dag over zonder schuld: ''niet bewegen vandaag'' is ook een keuze met regie. GoFiev doet suggesties; jij beslist.'
WHERE slug = 'beweging-die-past';
