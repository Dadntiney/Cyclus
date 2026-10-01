-- Rebrand knowledge copy: app name Cyclus → GoFiev (tab "Cyclus" stays for the cycle hub).

update public.knowledge_articles
set body = replace(body, 'Wat jij bijhoudt in Cyclus helpt je patronen te herkennen', 'Wat jij bijhoudt in GoFiev helpt je patronen te herkennen')
where slug = 'wat-verandert-er-rondom-de-overgang';

update public.knowledge_articles
set body = replace(
  body,
  'Cyclus is geen medische test. Wél een plek om je verhaal scherp te krijgen.',
  'GoFiev is geen medische test. Wél een plek om je verhaal scherp te krijgen.'
)
where slug = 'veelvoorkomende-klachten';

update public.knowledge_articles
set body = replace(
  body,
  'In Cyclus vind je daarvoor een samenvatting onder Cyclus.',
  'In GoFiev vind je daarvoor een samenvatting onder Cyclus.'
)
where slug = 'wanneer-naar-de-arts';

update public.knowledge_articles
set body = replace(
  body,
  'Cyclus geeft geen medisch advies en schrijft niets voor.',
  'GoFiev geeft geen medisch advies en schrijft niets voor.'
)
where slug = 'hormoontherapie-hoog-niveau';
