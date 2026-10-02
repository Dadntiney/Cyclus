-- Enrich the "voeding-als-steun" knowledge article with concrete basics
-- (magnesium products, protein, iron + vitamin C) without medical claims.
update public.knowledge_articles
set
  summary = 'Eiwit, magnesium, ijzer en vezels: de praktische basis — met voorbeelden van producten, zonder dieetdwang.',
  body = E'Rondom hormonale schommelingen en de cyclus profiteren veel vrouwen van een stevige, haalbare voedingsbasis — geen wonderkuur, wél concrete keuzes.

Eiwitten (elke fase)
Denk aan: eieren, Griekse yoghurt, kwark, kip, zalm, tofu, linzen of kikkererwten. Eiwit bij maaltijden helpt verzadiging en herstel.

Magnesium
Vaak genoemd rondom de luteale fase en bij spierspanning. Goede bronnen: pompoenpitten, amandelen, cashewnoten, spinazie, quinoa, zwarte bonen en een stukje pure chocolade (70%+).

IJzer (+ vitamine C)
Past vooral goed tijdens de menstruatie. Plantaardig ijzer zit in linzen, spinazie, bonen en tofu — combineer met paprika, kiwi of citrus zodat je lichaam het beter kan opnemen.

Vezels & stabiele energie
Havermout, quinoa, zoete aardappel, peulvruchten en volkoren brood geven rustigere energie dan alleen snelle suikers.

Per fase (globaal)
• Menstruatie: ijzer, eiwit, warmte, vocht
• Folliculair: eiwit, vezels, complexe koolhydraten
• Ovulatie: kleurrijke groenten/fruit, omega-3, eiwit
• Luteaal: magnesium, eiwit, vezels

In Cyclus zie je dit concreter terug op je cyclusdag en in je weekplan. Geen medisch advies — kies wat bij jou past. Bij twijfel of tekorten: overleg met een arts of diëtist.',
  tags = array['voeding','energie','magnesium','eiwit']
where slug = 'voeding-als-steun';
