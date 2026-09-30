-- Fix typo in seeded overgang knowledge article (speel → spelen).
update public.knowledge_articles
set body = replace(body, 'klachten al speel kunnen zijn', 'klachten al kunnen spelen')
where slug = 'wat-verandert-er-rondom-de-overgang'
  and body like '%klachten al speel kunnen zijn%';
