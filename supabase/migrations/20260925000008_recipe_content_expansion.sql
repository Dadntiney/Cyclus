-- Expand existing recipes with servings/difficulty/step-by-step/low-carb
-- variant/storage+meal-prep tips, and add a budget-friendly recipe collection.

update public.recipes set
  servings = 2,
  difficulty = 'gemiddeld',
  steps = '["Verwarm de oven voor op 200°C.","Snijd de zoete aardappel in blokjes van ongeveer 2 cm.","Verdeel de blokjes op een bakplaat, besprenkel met olijfolie, peper en zout.","Rooster 20 minuten in de oven.","Leg de zalmfilet en de broccoli erbij op de plaat.","Gaar nog 12-15 minuten, tot de zalm gaar is en makkelijk uiteenvalt.","Besprenkel met citroensap en serveer direct."]',
  optional_ingredients = '["Extra kruiden zoals dille of peterselie","Knoflookpoeder"]',
  low_carb_variant = 'Vervang de zoete aardappel door extra broccoli of bloemkoolrijst om de koolhydraten flink te verlagen, terwijl je nog steeds een volwaardige, verzadigende maaltijd houdt.',
  storage_tip = 'Maximaal 2 dagen afgedekt in de koelkast. Warm rustig op zodat de zalm niet droog wordt.',
  meal_prep_tip = 'Rooster de zoete aardappel vooraf in een grote batch; bak de zalm het liefst vers vlak voor het eten voor de beste textuur.'
where title = 'Zalm met zoete aardappel en groenten';

update public.recipes set
  servings = 1,
  difficulty = 'makkelijk',
  steps = '["Meng de havermout, plantaardige melk en chiazaad in een pot of bakje.","Roer goed door zodat er geen klontjes ontstaan.","Dek af en laat minimaal een nacht in de koelkast staan.","Top de volgende ochtend af met bessen en een beetje honing."]',
  optional_ingredients = '["Kaneel","Een schep notenpasta","Extra zaden zoals lijnzaad"]',
  low_carb_variant = 'Vervang een deel van de havermout door extra chiazaad en lijnzaad, en kies voor minder zoet fruit zoals bessen in plaats van banaan.',
  storage_tip = 'Tot 3 dagen goed in een afgesloten pot in de koelkast — ideaal om vooraf te maken.',
  meal_prep_tip = 'Maak in één keer 3-4 potjes voor de hele week, zodat je ontbijt altijd klaarstaat.'
where title = 'Overnight oats met bessen';

update public.recipes set
  servings = 2,
  difficulty = 'makkelijk',
  steps = '["Laat de linzen uitlekken als je ze uit blik gebruikt, of kook ze volgens de verpakking.","Was de rucola en halveer de cherrytomaatjes.","Meng de linzen met de rucola en cherrytomaatjes in een kom.","Verkruimel de feta erover.","Besprenkel met olijfolie en balsamicoazijn en meng voorzichtig."]',
  optional_ingredients = '["Geroosterde pijnboompitten","Rode ui in dunne ringen"]',
  low_carb_variant = 'Gebruik iets minder linzen en vul aan met extra rucola en andere groene bladgroenten voor volume zonder extra koolhydraten.',
  storage_tip = 'Bewaar de dressing apart en meng pas vlak voor het eten, dan blijft de salade tot 2 dagen goed.',
  meal_prep_tip = 'Kook een grote batch linzen en vries ze in porties in — zo heb je altijd snel een basis voor een salade.'
where title = 'Linzensalade met feta';

update public.recipes set
  servings = 3,
  difficulty = 'gemiddeld',
  steps = '["Snipper de ui en hak de knoflook fijn.","Fruit ui en knoflook aan in een scheutje olie tot ze glazig zijn.","Voeg de kerriepasta toe en bak 1 minuut mee tot het gaat geuren.","Voeg de kikkererwten en kokosmelk toe.","Laat 15 minuten zachtjes sudderen, af en toe roeren.","Roer de spinazie erdoor tot deze net geslonken is.","Proef en breng op smaak met zout en peper."]',
  optional_ingredients = '["Verse koriander","Chilivlokken voor extra pit","Partjes limoen"]',
  low_carb_variant = 'Serveer met bloemkoolrijst in plaats van gewone rijst, en gebruik iets minder kikkererwten met wat extra spinazie of andere groene groenten.',
  storage_tip = 'Tot 3 dagen in de koelkast. Ook goed in te vriezen in porties.',
  meal_prep_tip = 'Maak een dubbele portie en vries de helft in — kerriegerechten smaken vaak nog beter opgewarmd.'
where title = 'Kikkererwtencurry';

update public.recipes set
  servings = 1,
  difficulty = 'makkelijk',
  steps = '["Schep de Griekse yoghurt in een kom.","Hak de walnoten grof.","Top de yoghurt met de walnoten.","Besprenkel met honing en een snufje kaneel."]',
  optional_ingredients = '["Extra bessen","Een schep granola voor crunch"]',
  low_carb_variant = 'Gebruik iets minder honing en vervang deze deels door kaneel voor zoetheid zonder extra suiker.',
  storage_tip = 'Het lekkerst direct na bereiding; bewaar noten apart zodat ze krokant blijven.',
  meal_prep_tip = 'Zet yoghurtporties vooraf klaar in bakjes en voeg noten en honing pas toe vlak voor het eten.'
where title = 'Griekse yoghurt met noten en honing';

update public.recipes set
  servings = 2,
  difficulty = 'gemiddeld',
  steps = '["Kook de quinoa volgens de aanwijzingen op de verpakking.","Kruid de kipfilet naar smaak en grill of bak deze gaar.","Bak de gemengde groenten kort in een scheutje olijfolie.","Snijd de kip in reepjes.","Verdeel quinoa, groenten en kip over de borden en meng eventueel losjes door elkaar."]',
  optional_ingredients = '["Avocado","Fetakaas","Een handje geroosterde noten"]',
  low_carb_variant = 'Vervang de quinoa door extra gemengde groenten of bloemkoolrijst voor een flink lagere koolhydraatinname.',
  storage_tip = 'Tot 3 dagen in een afgesloten bakje in de koelkast — prima als lunch de volgende dag.',
  meal_prep_tip = 'Maak in het weekend een grote batch quinoa en kip, en verdeel over bakjes voor meerdere dagen.'
where title = 'Gegrilde kip met quinoa en groenten';

update public.recipes set
  servings = 1,
  difficulty = 'makkelijk',
  steps = '["Doe de bevroren banaan, bevroren bessen en plantaardige melk in een blender.","Blend tot een dikke, gladde smoothie.","Giet de smoothie in een kom.","Top af met granola en kokosrasp."]',
  optional_ingredients = '["Chiazaad","Notenpasta","Extra vers fruit"]',
  low_carb_variant = 'Gebruik minder banaan en meer bessen, en kies voor ongezoete amandelmelk om de koolhydraten te verlagen.',
  storage_tip = 'Het lekkerst direct na bereiding — smoothiebowls worden snel waterig als ze blijven staan.',
  meal_prep_tip = 'Vries fruit vooraf in porties in zakjes in, zodat je in de ochtend alleen nog hoeft te blenden.'
where title = 'Veganistische smoothiebowl';

update public.recipes set
  servings = 4,
  difficulty = 'makkelijk',
  steps = '["Snipper de ui en snijd de pompoen in grove stukken.","Fruit de ui aan in een scheutje olie.","Voeg de pompoen en groentebouillon toe.","Laat 20 minuten sudderen tot de pompoen zacht is.","Blend de soep glad met een staafmixer.","Werk af met een scheutje kokosmelk en chilivlokken naar smaak."]',
  optional_ingredients = '["Geroosterde pompoenpitten","Verse koriander of bieslook"]',
  low_carb_variant = 'Deze soep is van nature al koolhydraatarm — voeg voor extra vetten en romigheid gerust wat extra kokosmelk toe.',
  storage_tip = 'Tot 4 dagen in de koelkast, en uitstekend in te vriezen in porties.',
  meal_prep_tip = 'Maak een dubbele batch en vries in losse porties in voor snelle lunches later in de week.'
where title = 'Pittige pompoensoep';

-- =========================================================
-- Budget-friendly base recipes
-- =========================================================
do $$
begin
  if (select count(*) from public.recipes where is_budget = true) > 0 then
    return;
  end if;

  insert into public.recipes (
    title, description, ingredients, optional_ingredients, instructions, steps,
    preparation_time, servings, difficulty, nutrition_information, category,
    low_carb_variant, storage_tip, meal_prep_tip, is_budget
  ) values
  (
    'Budget kip-rijst bowl',
    'Een betaalbare, vullende bowl met ingrediënten die je bij elke supermarkt vindt.',
    '["150g kipfilet", "80g rijst", "150g diepvriesgroenten", "1 el olijfolie", "kruiden naar smaak"]',
    '["Avocado", "Feta", "Noten", "Extra groenten", "Chilisaus"]',
    'Kook de rijst, bak de kip en de groenten, en meng alles samen.',
    '["Kook de rijst volgens de verpakking.","Kruid de kipfilet en bak deze gaar in een scheutje olie.","Bak de diepvriesgroenten kort mee in dezelfde pan.","Snijd de kip in reepjes.","Verdeel rijst, groenten en kip over kommen."]',
    25, 2, 'makkelijk',
    '{"calorieen": 460, "eiwit": "34g", "koolhydraten": "48g", "vet": "12g"}',
    array['Diner', 'Meal prep', 'Eiwitrijk'],
    'Vervang de rijst door extra diepvriesgroenten of bloemkoolrijst.',
    'Tot 3 dagen in de koelkast.',
    'Kook een grote pan rijst en kip tegelijk en verdeel over bakjes voor de week.',
    true
  ),
  (
    'Tonijnsalade met ei en aardappel',
    'Een klassieke, betaalbare salade vol eiwitten, gemaakt met voorraadkast-ingrediënten.',
    '["300g aardappelen", "1 blik tonijn op water", "2 eieren", "1 el olijfolie", "scheutje azijn"]',
    '["Kappertjes", "Rode ui", "Extra groenten zoals radijs of komkommer"]',
    'Kook de aardappelen en eieren, meng met tonijn en dressing.',
    '["Kook de aardappelen in ongeveer 15 minuten gaar.","Kook de eieren in 8-9 minuten hard.","Laat de tonijn uitlekken.","Snijd de aardappelen en eieren in stukken.","Meng alles met olijfolie en een scheutje azijn."]',
    25, 2, 'makkelijk',
    '{"calorieen": 380, "eiwit": "28g", "koolhydraten": "32g", "vet": "14g"}',
    array['Lunch', 'Eiwitrijk'],
    'Gebruik minder aardappel en vul aan met extra groenten zoals komkommer of radijs.',
    'Tot 2 dagen afgedekt in de koelkast.',
    'Kook aardappelen en eieren in het weekend vooraf voor snelle lunches doordeweeks.',
    true
  ),
  (
    'Kwark met havermout en fruit',
    'Een goedkoop, eiwitrijk ontbijt dat in twee minuten klaar staat.',
    '["200g kwark", "40g havermout", "1 stuk seizoensfruit (bv. appel)", "1 tl honing"]',
    '["Kaneel", "Handje noten", "Extra fruit"]',
    'Meng kwark met havermout en top af met fruit.',
    '["Schep de kwark in een kom.","Roer de havermout erdoor.","Snijd het fruit in stukjes en verdeel erover.","Besprenkel met honing."]',
    5, 1, 'makkelijk',
    '{"calorieen": 310, "eiwit": "26g", "koolhydraten": "34g", "vet": "6g"}',
    array['Ontbijt', 'Snel', 'Vegetarisch', 'Eiwitrijk'],
    'Laat de honing weg of vervang door kaneel voor minder koolhydraten.',
    'Het lekkerst vers, maar de kwark-havermoutmix is 1 dag vooraf te maken.',
    'Meng grote porties kwark en havermout vooraf, voeg vers fruit pas toe bij het eten.',
    true
  ),
  (
    'Bonen-groentestoof',
    'Een goedkope, vullende stoof op basis van bonen en groenten uit het diepvries.',
    '["1 blik bruine of witte bonen", "300g diepvriesgroenten", "1 ui", "1 blik tomatenblokjes", "kruiden naar smaak"]',
    '["Feta", "Brood erbij", "Chilivlokken"]',
    'Fruit de ui, voeg bonen, groenten en tomaat toe en laat sudderen.',
    '["Snipper de ui en fruit deze aan in een scheutje olie.","Voeg de tomatenblokjes toe en laat 5 minuten sudderen.","Voeg de bonen en diepvriesgroenten toe.","Laat 15 minuten zachtjes sudderen tot alles gaar is.","Breng op smaak met kruiden naar keuze."]',
    30, 3, 'makkelijk',
    '{"calorieen": 290, "eiwit": "16g", "koolhydraten": "38g", "vet": "6g"}',
    array['Diner', 'Veganistisch', 'Meal prep'],
    'Vervang een deel van de bonen door extra groenten om de koolhydraten te verlagen.',
    'Tot 4 dagen in de koelkast en goed in te vriezen.',
    'Maak een dubbele portie — stoofgerechten smaken vaak nog beter de volgende dag.',
    true
  ),
  (
    'Gebakken ei met volkoren brood en groente',
    'Een snel, betaalbaar ontbijt of lunch met wat je meestal al in huis hebt.',
    '["2 eieren", "2 sneetjes volkoren brood", "1 tomaat", "een stuk komkommer"]',
    '["Avocado", "Kaas", "Sriracha of chilisaus"]',
    'Bak de eieren en serveer met brood en verse groente.',
    '["Snijd de tomaat en komkommer in plakjes.","Bak de eieren in een scheutje olie naar wens.","Rooster het brood indien gewenst.","Serveer de eieren op het brood met de groente ernaast."]',
    10, 1, 'makkelijk',
    '{"calorieen": 340, "eiwit": "20g", "koolhydraten": "28g", "vet": "16g"}',
    array['Ontbijt', 'Lunch', 'Snel', 'Vegetarisch'],
    'Laat één sneetje brood weg en vul aan met extra groente voor minder koolhydraten.',
    'Het lekkerst vers bereid en direct gegeten.',
    'Snijd groente vooraf in porties zodat dit ontbijt echt in enkele minuten klaar staat.',
    true
  ),
  (
    'Linzen-aardappel curry',
    'Een goedkope, voedzame curry op basis van linzen en aardappelen.',
    '["200g rode linzen (droog)", "300g aardappelen", "1 ui", "1 el kerriepasta of kerriepoeder"]',
    '["Kokosmelk", "Spinazie", "Rijst erbij"]',
    'Fruit de ui, voeg kerrie, linzen en aardappel toe en laat garen in bouillon of water.',
    '["Snipper de ui en fruit deze aan in een scheutje olie.","Voeg de kerriepasta toe en bak kort mee.","Voeg de linzen, aardappelblokjes en voldoende water of bouillon toe.","Laat 20-25 minuten sudderen tot linzen en aardappel gaar zijn.","Breng op smaak met zout en peper."]',
    35, 3, 'makkelijk',
    '{"calorieen": 320, "eiwit": "16g", "koolhydraten": "50g", "vet": "5g"}',
    array['Diner', 'Veganistisch', 'Meal prep'],
    'Gebruik minder aardappel en linzen en vul aan met extra spinazie of andere groene groenten.',
    'Tot 4 dagen in de koelkast en goed in te vriezen.',
    'Maak een grote pan en vries in losse porties in voor drukke avonden.',
    true
  );
end $$;
